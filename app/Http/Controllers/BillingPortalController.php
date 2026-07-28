<?php

namespace App\Http\Controllers;

use App\Services\PaddleService;
use Illuminate\Http\Request;
use Paddle\SDK\Resources\CustomerPortalSessions\Operations\CreateCustomerPortalSession;

class BillingPortalController extends Controller
{
    /**
     * Mints a Paddle customer portal session for the signed-in user's own
     * organization and redirects there. The Paddle customer id is resolved
     * server-side from the authenticated session — never accepted from the
     * client — so nobody can pass an arbitrary customer id to view someone
     * else's billing.
     */
    public function redirect(Request $request)
    {
        $organization = $request->user()->organization;

        if (!$organization?->paddle_customer_id) {
            return back()->with('error', 'No billing account found yet — subscribe to a plan first.');
        }

        $session = PaddleService::client()->customerPortalSessions->create(
            $organization->paddle_customer_id,
            new CreateCustomerPortalSession(),
        );

        return redirect()->away($session->urls->general->overview);
    }
}
