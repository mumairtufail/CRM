<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessMetaWebhookPayload;
use App\Models\PlatformWhatsappCredential;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MetaWebhookController extends Controller
{
    /**
     * GET /webhook/meta/whatsapp — Meta's subscription verification handshake.
     */
    public function verify(Request $request)
    {
        $credential = PlatformWhatsappCredential::active();
        $mode       = $request->query('hub.mode') ?? $request->query('hub_mode');
        $token      = $request->query('hub.verify_token') ?? $request->query('hub_verify_token');
        $challenge  = $request->query('hub.challenge') ?? $request->query('hub_challenge');

        if ($mode === 'subscribe' && $credential && hash_equals((string) $credential->webhook_verify_token, (string) $token)) {
            return response((string) $challenge, 200);
        }

        Log::warning('Meta webhook verification failed', ['ip' => $request->ip()]);

        return response('Forbidden', 403);
    }

    /**
     * POST /webhook/meta/whatsapp — inbound messages + status updates.
     */
    public function handle(Request $request)
    {
        if (!$this->validSignature($request)) {
            Log::warning('Invalid Meta webhook signature', ['ip' => $request->ip()]);
            return response('Forbidden', 403);
        }

        ProcessMetaWebhookPayload::dispatch($request->all());

        return response('EVENT_RECEIVED', 200);
    }

    private function validSignature(Request $request): bool
    {
        if (app()->environment('local', 'testing') && !$request->hasHeader('X-Hub-Signature-256')) {
            return true;
        }

        $credential = PlatformWhatsappCredential::active();
        if (!$credential || !$credential->meta_app_secret) {
            return false;
        }

        $signature = $request->header('X-Hub-Signature-256', '');
        if (!str_starts_with($signature, 'sha256=')) {
            return false;
        }

        $expected = hash_hmac('sha256', $request->getContent(), $credential->meta_app_secret);

        return hash_equals($expected, substr($signature, 7));
    }
}
