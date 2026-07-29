<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\Transaction;
use App\Services\PaddleService;
use App\Support\GeoCountry;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Paddle\SDK\Entities\Subscription\SubscriptionEffectiveFrom;
use Paddle\SDK\Entities\Subscription\SubscriptionResumeEffectiveFrom;
use Paddle\SDK\Resources\Subscriptions\Operations\PauseSubscription;
use Paddle\SDK\Resources\Subscriptions\Operations\ResumeSubscription;
use Paddle\SDK\Resources\Transactions\Operations\GetTransactionInvoice;

class BillingController extends Controller
{
    public function index(Request $request): Response
    {
        $organization = $request->user()->organization;

        // Same guard as the public pricing page — never let the in-app
        // upgrade flow silently run against the wrong Paddle account.
        $paddleEnvironment = config('services.paddle.environment');
        abort_unless(
            in_array($paddleEnvironment, ['sandbox', 'production'], true),
            500,
            'PADDLE_ENVIRONMENT must be set to "sandbox" or "production".'
        );

        $transactions = Transaction::where('organization_id', $organization->id)
            ->orderByDesc('billed_at')
            ->paginate(15)
            ->through(fn (Transaction $t) => [
                'id'          => $t->id,
                'status'      => $t->status,
                'plan_slug'   => $t->plan_slug,
                'total'       => $t->formattedTotal(),
                'billed_at'   => $t->billed_at?->toIso8601String(),
            ]);

        // latestSubscription(), not activeSubscription() — a genuinely paused
        // subscription must still show up here so the page can offer a
        // Resume button; activeSubscription() deliberately excludes `paused`.
        $latestSubscription = $organization->latestSubscription();

        return Inertia::render('Billing/Index', [
            'plan' => [
                'name'   => $organization->plan?->name,
                'status' => $organization->plan_status,
            ],
            'subscription' => $latestSubscription ? [
                'status'                  => $latestSubscription->status,
                'plan_slug'               => $latestSubscription->plan_slug,
                'scheduled_change_action' => $latestSubscription->scheduled_change_action,
                'scheduled_change_at'     => $latestSubscription->scheduled_change_at?->toIso8601String(),
            ] : null,
            'transactions' => $transactions,
            'paddle' => [
                'environment' => $paddleEnvironment,
                'clientToken' => config('services.paddle.client_token'),
            ],
            'country' => GeoCountry::fromRequest($request),
            'tiers' => \App\Models\Plan::paddleTiers(),
        ]);
    }

    /**
     * Streams to a freshly-minted, short-lived Paddle invoice PDF URL — never
     * stored, since Paddle's invoice links expire. Ownership is checked
     * explicitly even though the tenant global scope already prevents
     * cross-org route-model-binding, since this touches billing documents.
     */
    public function downloadInvoice(Request $request, Transaction $transaction)
    {
        if ($transaction->organization_id !== $request->user()->organization_id) {
            abort(404);
        }

        $invoice = PaddleService::client()->transactions->getInvoicePDF(
            $transaction->paddle_transaction_id,
            new GetTransactionInvoice(),
        );

        return redirect()->away($invoice->url);
    }

    /**
     * Self-service pause, effective at the end of the period they've already
     * paid for (never mid-cycle) — so pausing never forfeits time they paid
     * for. The subscription stays `active` with a scheduled_change until
     * Paddle's webhook actually flips it, which is why the org keeps access
     * (and the AppLayout banner shows the pending change) right up to that date.
     */
    public function pause(Request $request): RedirectResponse
    {
        $subscription = $request->user()->organization->activeSubscription();
        abort_unless($subscription, 404, 'No active subscription to pause.');

        $result = PaddleService::client()->subscriptions->pause(
            $subscription->paddle_subscription_id,
            new PauseSubscription(effectiveFrom: SubscriptionEffectiveFrom::NextBillingPeriod()),
        );
        $this->applyPaddleState($subscription, $result);

        return back()->with('success', 'Your subscription will pause at the end of the current billing period.');
    }

    public function resume(Request $request): RedirectResponse
    {
        // latestSubscription(), not activeSubscription() — this needs to find
        // a subscription that's either already `paused`, or merely scheduled
        // to pause (still `active`) — activeSubscription() only covers the
        // second case, and resume() is the correct call for both: it either
        // cancels the pending pause or reactivates an already-paused one.
        $subscription = $request->user()->organization->latestSubscription();
        abort_unless($subscription, 404, 'No subscription to resume.');

        $result = PaddleService::client()->subscriptions->resume(
            $subscription->paddle_subscription_id,
            new ResumeSubscription(effectiveFrom: SubscriptionResumeEffectiveFrom::Immediately()),
        );
        $this->applyPaddleState($subscription, $result);

        return back()->with('success', 'Your subscription is active again.');
    }

    /**
     * Writes Paddle's just-returned live state onto our local mirror
     * immediately, rather than waiting for the async webhook to eventually
     * deliver the same subscription.updated event — otherwise the "pause
     * pending" / "paused" banner (AppLayout, driven by this row) would keep
     * showing the stale state for however long webhook delivery takes. The
     * webhook still lands afterward and confirms/re-applies the same values.
     */
    private function applyPaddleState(Subscription $local, $paddleSubscription): void
    {
        $local->update([
            'status'                  => $paddleSubscription->status->getValue(),
            'scheduled_change_action' => $paddleSubscription->scheduledChange?->action->getValue(),
            'scheduled_change_at'     => $paddleSubscription->scheduledChange?->effectiveAt,
        ]);
    }
}
