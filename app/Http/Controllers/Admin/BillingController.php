<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Services\PaddleService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Paddle\SDK\Entities\Subscription\SubscriptionEffectiveFrom;
use Paddle\SDK\Entities\Subscription\SubscriptionResumeEffectiveFrom;
use Paddle\SDK\Resources\Subscriptions\Operations\PauseSubscription;
use Paddle\SDK\Resources\Subscriptions\Operations\ResumeSubscription;
use Paddle\SDK\Resources\Transactions\Operations\GetTransactionInvoice;

class BillingController extends Controller
{
    /**
     * Cross-tenant billing overview. No withoutGlobalScope needed — admin
     * requests never resolve a TenantContext (see ResolveTenant), so
     * Subscription/Transaction's BelongsToTenant scope is already a no-op
     * here, same reason the Paddle webhook controller doesn't need it either.
     */
    public function index(Request $request)
    {
        $subscriptions = Subscription::with('organization:id,name,slug')
            ->latest()
            ->paginate(20, ['*'], 'subs_page')
            ->withQueryString()
            ->through(fn (Subscription $s) => [
                'id'                      => $s->id,
                'organization'            => $s->organization ? ['id' => $s->organization->id, 'name' => $s->organization->name] : null,
                'plan_slug'               => $s->plan_slug,
                'status'                  => $s->status,
                'scheduled_change_action' => $s->scheduled_change_action,
                'created_at'              => $s->created_at->format('M j, Y'),
            ]);

        $transactions = Transaction::with('organization:id,name,slug')
            ->orderByDesc('billed_at')
            ->paginate(20, ['*'], 'txns_page')
            ->withQueryString()
            ->through(fn (Transaction $t) => [
                'id'           => $t->id,
                'organization' => $t->organization ? ['id' => $t->organization->id, 'name' => $t->organization->name] : null,
                'plan_slug'    => $t->plan_slug,
                'total'        => $t->formattedTotal(),
                'status'       => $t->status,
                'billed_at'    => $t->billed_at?->format('M j, Y'),
            ]);

        return Inertia::render('Admin/Billing', [
            'subscriptions' => $subscriptions,
            'transactions'  => $transactions,
        ]);
    }

    public function downloadInvoice(Transaction $transaction)
    {
        $invoice = PaddleService::client()->transactions->getInvoicePDF(
            $transaction->paddle_transaction_id,
            new GetTransactionInvoice(),
        );

        return redirect()->away($invoice->url);
    }

    /**
     * Merchant-side pause on any org's subscription, effective at the end of
     * their already-paid-for period — same policy as the tenant self-service
     * pause, so support staff pausing on a customer's behalf never forfeits
     * time that customer already paid for.
     */
    public function pause(Subscription $subscription): RedirectResponse
    {
        PaddleService::client()->subscriptions->pause(
            $subscription->paddle_subscription_id,
            new PauseSubscription(effectiveFrom: SubscriptionEffectiveFrom::NextBillingPeriod()),
        );

        return back()->with('success', "Subscription for {$subscription->organization?->name} will pause at the end of the current period.");
    }

    public function resume(Subscription $subscription): RedirectResponse
    {
        PaddleService::client()->subscriptions->resume(
            $subscription->paddle_subscription_id,
            new ResumeSubscription(effectiveFrom: SubscriptionResumeEffectiveFrom::Immediately()),
        );

        return back()->with('success', "Subscription for {$subscription->organization?->name} resumed.");
    }
}
