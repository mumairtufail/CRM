<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Paddle\SDK\Notifications\PaddleSignature;
use Paddle\SDK\Notifications\Secret;

class PaddleWebhookController extends Controller
{
    private const SUBSCRIPTION_EVENTS = [
        'subscription.created', 'subscription.updated', 'subscription.activated',
        'subscription.canceled', 'subscription.paused', 'subscription.resumed',
        'subscription.past_due', 'subscription.trialing',
    ];

    private const CUSTOMER_EVENTS = ['customer.created', 'customer.updated'];

    public function handle(Request $request): Response
    {
        $secret = config('services.paddle.webhook_secret');
        abort_unless($secret, 500, 'PADDLE_WEBHOOK_SECRET is not set.');

        // Verify against the RAW body — Laravel's $request->getContent() is the
        // untouched request stream, never the JSON-decoded/re-encoded version,
        // which would fail verification even for a genuine delivery.
        $signatureHeader = $request->header(PaddleSignature::HEADER);
        $verified = $signatureHeader
            && PaddleSignature::parse($signatureHeader)->verify($request->getContent(), new Secret($secret));

        if (!$verified) {
            // Deliberately not a 2xx — a 2xx tells Paddle the delivery succeeded
            // and it stops retrying, which would silently swallow real events.
            Log::warning('Paddle webhook: signature verification failed.');
            abort(401, 'Invalid signature.');
        }

        $payload = json_decode($request->getContent(), true);
        $eventType = $payload['event_type'] ?? null;
        $data = $payload['data'] ?? [];
        $occurredAt = $payload['occurred_at'] ?? null;

        match (true) {
            in_array($eventType, self::SUBSCRIPTION_EVENTS, true) => $this->handleSubscriptionEvent($data, $occurredAt),
            in_array($eventType, self::CUSTOMER_EVENTS, true)     => $this->handleCustomerEvent($data),
            $eventType === 'transaction.completed'                => $this->handleTransactionCompleted($data),
            default => Log::info("Paddle webhook: ignoring event type [{$eventType}]."),
        };

        return response('', 200);
    }

    /**
     * Mirrors Paddle's subscription state and, when the plan_slug from checkout
     * custom_data maps to a real Plan, grants/revokes that plan on the org —
     * this IS the fulfillment step; nothing else in the app updates plan_status
     * from a Paddle event.
     */
    private function handleSubscriptionEvent(array $data, ?string $occurredAt): void
    {
        $subscriptionId = $data['id'] ?? null;
        $customerId = $data['customer_id'] ?? null;
        $organizationId = $data['custom_data']['organization_id'] ?? null;

        if (!$subscriptionId || !$customerId) {
            Log::warning('Paddle webhook: subscription event missing id/customer_id, skipped.', ['data' => $data]);
            return;
        }

        // custom_data is stored on the subscription itself, so it's echoed back on
        // every event for it (not just .created) — if it's ever missing, there is
        // no safe organization to attach this row to.
        if (!$organizationId || !Organization::find($organizationId)) {
            Log::warning("Paddle webhook: subscription {$subscriptionId} has no resolvable organization_id in custom_data, skipped.", ['data' => $data]);
            return;
        }

        // Deliveries are at-least-once and can arrive out of order — if this
        // event is older than the state we already have for this subscription,
        // a retry/race delivered it late, and applying it now would clobber
        // newer, more correct state. Skip it rather than blind-write.
        $existing = Subscription::where('paddle_subscription_id', $subscriptionId)->first();
        if ($existing?->paddle_event_occurred_at && $occurredAt && $existing->paddle_event_occurred_at->gt($occurredAt)) {
            Log::info("Paddle webhook: stale subscription event for {$subscriptionId} ignored (occurred_at {$occurredAt} is older than stored " . $existing->paddle_event_occurred_at->toIso8601String() . ').');
            return;
        }

        $item = $data['items'][0] ?? [];
        $priceId = $item['price']['id'] ?? null;
        $productId = $item['price']['product_id'] ?? null;
        // custom_data.plan_slug is the real Plan.slug (Plan::paddleTiers()
        // sends it straight from the DB at checkout) — stored for display,
        // but syncOrganizationPlan() below resolves the Plan from `product_id`
        // (the subscription's current line item), not this string, since a
        // later upgrade/downgrade changes the product without custom_data
        // ever being resent.
        $planSlug = $data['custom_data']['plan_slug'] ?? null;
        $scheduledChange = $data['scheduled_change'] ?? null;

        // Idempotent upsert keyed on the Paddle subscription id — deliveries are
        // at-least-once, so this is never a blind insert.
        $subscription = Subscription::updateOrCreate(
            ['paddle_subscription_id' => $subscriptionId],
            [
                'organization_id'          => $organizationId,
                'paddle_customer_id'       => $customerId,
                'status'                   => $data['status'] ?? 'unknown',
                'paddle_event_occurred_at' => $occurredAt,
                'price_id'                 => $priceId,
                'product_id'               => $productId,
                'plan_slug'                => $planSlug,
                'scheduled_change_action'  => $scheduledChange['action'] ?? null,
                'scheduled_change_at'      => $scheduledChange['effective_at'] ?? null,
            ]
        );

        $this->syncOrganizationPlan($subscription);
    }

    /**
     * Derives the organization's plan_id/plan_status from the subscription that
     * currently grants access (if any) — a scheduled cancel/pause does NOT revoke
     * access on its own; only an actually-canceled/paused status does.
     */
    private function syncOrganizationPlan(Subscription $subscription): void
    {
        $organization = Organization::find($subscription->organization_id);
        if (!$organization) {
            return;
        }

        $active = $organization->activeSubscription();

        if (!$active) {
            // No paid subscription grants access anymore — fall back to the
            // Free plan rather than leaving plan_id stuck on their old paid
            // tier. Otherwise a canceled Pro/Premium org would keep that
            // plan's lead_limit (null = unlimited) forever, even though
            // they're no longer paying for it.
            $freePlan = Plan::where('slug', 'basic')->first();

            $organization->update([
                'plan_id'          => $freePlan?->id ?? $organization->plan_id,
                'plan_status'      => 'active',
                'plan_assigned_at' => now(),
            ]);

            if ($freePlan) {
                Plan::forgetModuleCache($freePlan->id);
            }

            return;
        }

        // Resolved by the subscription's current Paddle product — the single
        // source of truth for which tier it's actually on, since Plans now
        // own their Paddle product directly (see Admin\PlanController).
        $plan = Plan::where('paddle_product_id', $active->product_id)->first();

        if (!$plan) {
            Log::warning("Paddle webhook: no Plan linked to Paddle product [{$active->product_id}] on subscription {$active->paddle_subscription_id}.");
            return;
        }

        $organization->update([
            'plan_id'          => $plan->id,
            'plan_status'      => 'active',
            'plan_assigned_at' => now(),
        ]);
        Plan::forgetModuleCache($plan->id);
    }

    /**
     * Captures the Paddle customer id on the organization so later actions
     * (customer portal sessions) can resolve it server-side without ever
     * trusting a client-supplied id.
     */
    private function handleCustomerEvent(array $data): void
    {
        $customerId = $data['id'] ?? null;
        $organizationId = $data['custom_data']['organization_id'] ?? null;

        if (!$customerId || !$organizationId) {
            return;
        }

        Organization::where('id', $organizationId)->update(['paddle_customer_id' => $customerId]);
    }

    /**
     * transaction.completed doesn't change access on its own (subscription.*
     * events are the source of truth for status) — this persists it as an
     * invoice/receipt row for the tenant Billing page and the admin
     * cross-tenant billing view. The actual PDF is fetched on demand from
     * Paddle (BillingController::downloadInvoice) rather than stored here,
     * since Paddle's invoice URLs are short-lived signed links.
     */
    private function handleTransactionCompleted(array $data): void
    {
        $transactionId = $data['id'] ?? null;
        $organizationId = $data['custom_data']['organization_id'] ?? null;

        if (!$transactionId || !$organizationId || !Organization::find($organizationId)) {
            Log::warning('Paddle webhook: transaction.completed missing id or resolvable organization_id, skipped.', ['data' => $data]);
            return;
        }

        Transaction::updateOrCreate(
            ['paddle_transaction_id' => $transactionId],
            [
                'organization_id'         => $organizationId,
                'paddle_subscription_id'  => $data['subscription_id'] ?? null,
                'status'                  => $data['status'] ?? 'unknown',
                'currency_code'           => $data['currency_code'] ?? 'USD',
                'total'                   => (int) ($data['details']['totals']['total'] ?? 0),
                'plan_slug'               => $data['custom_data']['plan_slug'] ?? null,
                'billed_at'               => $data['billed_at'] ?? null,
            ]
        );
    }
}
