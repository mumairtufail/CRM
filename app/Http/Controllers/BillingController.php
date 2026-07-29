<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Services\PaddleService;
use App\Support\GeoCountry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
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

        $activeSubscription = $organization->activeSubscription();

        return Inertia::render('Billing/Index', [
            'plan' => [
                'name'   => $organization->plan?->name,
                'status' => $organization->plan_status,
            ],
            'subscription' => $activeSubscription ? [
                'status'                  => $activeSubscription->status,
                'plan_slug'               => $activeSubscription->plan_slug,
                'scheduled_change_action' => $activeSubscription->scheduled_change_action,
                'scheduled_change_at'     => $activeSubscription->scheduled_change_at?->toIso8601String(),
            ] : null,
            'transactions' => $transactions,
            'paddle' => [
                'environment' => $paddleEnvironment,
                'clientToken' => config('services.paddle.client_token'),
            ],
            'country' => GeoCountry::fromRequest($request),
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
}
