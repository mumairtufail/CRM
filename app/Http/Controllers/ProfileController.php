<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\AiProviderSetting;
use App\Models\EmailTemplate;
use App\Models\Tag;
use App\Models\TenantWhatsappSettings;
use App\Models\WhatsappUsageMonthly;
use App\Services\LeadProviders\ApolloProvider;
use App\Services\LeadProviders\PeopleDataLabsProvider;
use App\Support\LeadsCache;
use App\Support\TenantContext;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    private function currentOrg(Request $request)
    {
        return app(TenantContext::class)->get() ?? $request->user()?->organization;
    }

    public function edit(Request $request): Response
    {
        $user = $request->user();

        // Built-in templates only — custom templates are not supported
        $allTemplates = EmailTemplate::whereNull('user_id')->where('is_system', true)->get()
            ->map(fn ($t) => [
                'id'              => $t->id,
                'name'            => $t->name,
                'description'     => $t->description,
                'thumbnail_color' => $t->thumbnail_color,
                'is_system'       => $t->is_system,
            ]);

        $org         = $this->currentOrg($request);
        $orgSettings = $org?->settings ?? [];

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail'    => $user instanceof MustVerifyEmail,
            'status'             => session('status'),
            'canManageWorkspace' => $user->isOwner() || $user->hasPermission('team.manage'),
            'leadGenSettings'    => [
                'provider' => $orgSettings['lead_generation_provider'] ?? null,
                'enabled'  => $orgSettings['lead_generation_enabled'] ?? false,
                'hasKey'   => !empty($orgSettings['lead_generation_api_key']),
            ],
            'orgDefaultSmtp'     => (function () use ($user) {
                if ($user->activeSmtpCredential) return null;
                $ownerCred = $user->organization?->owner?->activeSmtpCredential;
                return $ownerCred ? ['name' => $ownerCred->name, 'from_email' => $ownerCred->from_email] : null;
            })(),
            'smtpCredentials'    => $user->smtpCredentials()->get()->map(function ($c) {
                try {
                    $password = $c->password; // decrypted by the model cast
                } catch (\Throwable) {
                    $password = ''; // undecryptable (e.g. APP_KEY changed)
                }

                return [
                    'id'              => $c->id,
                    'name'            => $c->name,
                    'host'            => $c->host,
                    'port'            => $c->port,
                    'encryption'      => $c->encryption,
                    'username'        => $c->username,
                    'password'        => $password,
                    'from_name'       => $c->from_name,
                    'from_email'      => $c->from_email,
                    'is_active'       => $c->is_active,
                    'imap_host'       => $c->imap_host,
                    'imap_port'       => $c->imap_port,
                    'imap_encryption' => $c->imap_encryption,
                    'last_fetched_at' => $c->last_fetched_at?->toISOString(),
                ];
            }),
            'mailSettings'          => [
                'batch_size'  => $user->mail_batch_size  ?? 10,
                'batch_delay' => $user->mail_batch_delay ?? 5,
            ],
            'orgFollowupEnabled'    => (bool) ($orgSettings['followup_enabled'] ?? false),
            'emailTemplates'        => $allTemplates->values(),
            'activeTemplateId'      => $user->active_template_id,
            'smtpSuccess'           => session('smtp_success'),
            'aiSetting'             => (function () use ($user) {
                $s = AiProviderSetting::where('organization_id', $user->organization_id)->first();
                if (!$s) return null;
                return [
                    'provider'     => $s->provider,
                    'model'        => $s->model,
                    'base_url'     => $s->base_url,
                    'is_active'    => $s->is_active,
                    'is_validated' => $s->isValidated(),
                    'validated_at' => $s->validated_at?->toISOString(),
                ];
            })(),
            'whatsappStatus'        => (function () use ($user) {
                $settings = TenantWhatsappSettings::forOrganization($user->organization_id);
                $usage    = WhatsappUsageMonthly::currentMonthFor($user->organization_id);

                return [
                    'enabled'    => (bool) $settings?->isUsableForSend(),
                    'planType'   => $settings?->plan_type,
                    'quota'      => $settings?->monthly_message_quota,
                    'usedThisMonth' => $usage?->sent_count ?? 0,
                ];
            })(),
            'twilioSetting'         => (function () use ($user) {
                $s = \App\Models\TwilioSetting::where('organization_id', $user->organization_id)->first();
                if (!$s) return null;
                try {
                    $authToken = $s->auth_token;
                    $apiSecret = $s->api_secret;
                } catch (\Throwable) {
                    $authToken = '';
                    $apiSecret = '';
                }
                return [
                    'account_sid'   => $s->account_sid,
                    'auth_token'    => $authToken,
                    'phone_number'  => $s->phone_number,
                    'twiml_app_sid' => $s->twiml_app_sid,
                    'api_key'       => $s->api_key,
                    'api_secret'    => $apiSecret,
                    'is_active'     => $s->is_active,
                    'is_validated'  => $s->isValidated(),
                    'validated_at'  => $s->validated_at?->toISOString(),
                ];
            })(),
            'tags'                  => Tag::withCount('leads')->orderBy('name')->get(),
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    public function updateWorkspace(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isOwner() || $user->hasPermission('team.manage'), 403, 'Only workspace admins can edit these settings.');

        $request->validate([
            'company_name'    => 'nullable|string|max:150',
            'company_website' => 'nullable|string|max:255',
            'company_phone'   => 'nullable|string|max:50',
            'company_email'   => 'nullable|email|max:255',
            'company_linkedin' => 'nullable|string|max:255',
            'logo'            => 'nullable|image|mimes:jpg,jpeg,png,gif,webp,svg|max:2048',
        ]);

        $user->company_name     = $request->input('company_name', $user->company_name);
        $user->company_website  = $request->input('company_website', $user->company_website);
        $user->company_phone    = $request->input('company_phone', $user->company_phone);
        $user->company_email    = $request->input('company_email', $user->company_email);
        $user->company_linkedin = $request->input('company_linkedin', $user->company_linkedin);

        if ($request->hasFile('logo')) {
            if ($user->company_logo) {
                Storage::disk('public')->delete($user->company_logo);
            }
            $path = $request->file('logo')->store('logos', 'public');
            $user->company_logo = $path;
        }

        $user->save();

        return Redirect::route('profile.edit')->with('status', 'workspace-updated');
    }

    public function removeLogo(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->isOwner() || $user->hasPermission('team.manage'), 403, 'Only workspace admins can edit these settings.');

        if ($user->company_logo) {
            Storage::disk('public')->delete($user->company_logo);
            $user->company_logo = null;
            $user->save();
        }

        return Redirect::route('profile.edit');
    }

    /**
     * Personal callback number for Twilio click-to-call bridging — unlike
     * workspace branding, this stays per-agent, so any user may set their own.
     */
    public function updateCallbackPhone(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'callback_phone' => 'nullable|string|max:50',
        ]);

        $request->user()->update($validated);

        return Redirect::route('profile.edit')->with('status', 'callback-phone-updated');
    }

    public function saveLeadProvider(Request $request): JsonResponse
    {
        $request->validate([
            'provider' => 'required|in:apollo,pdl',
            'api_key'  => 'required|string|min:5',
        ]);

        $org = $this->currentOrg($request);

        if (!$org) {
            return response()->json(['success' => false, 'message' => 'No workspace found.'], 422);
        }

        $settings = $org->settings ?? [];
        $settings['lead_generation_provider'] = $request->input('provider');
        $settings['lead_generation_api_key']  = encrypt($request->input('api_key'));
        $settings['lead_generation_enabled']  = true;
        $org->settings = $settings;
        $org->save();

        Log::channel('aileadsearch')->info("[SETTINGS:saved] Lead provider saved: {$request->input('provider')}.", ['provider' => $request->input('provider')]);

        return response()->json([
            'success'  => true,
            'message'  => 'Lead generation provider saved successfully.',
            'provider' => $request->input('provider'),
        ]);
    }

    public function testLeadProvider(Request $request): JsonResponse
    {
        $request->validate([
            'provider' => 'required|in:apollo,pdl',
            'api_key'  => 'required|string|min:5',
        ]);

        $apiKey   = $request->input('api_key');
        $provider = $request->input('provider') === 'pdl'
            ? new PeopleDataLabsProvider($apiKey)
            : new ApolloProvider($apiKey);

        Log::channel('aileadsearch')->info("[SETTINGS:test] Testing connection to {$request->input('provider')}.", ['provider' => $request->input('provider')]);

        $ok = $provider->testConnection();

        if ($ok) {
            Log::channel('aileadsearch')->info("[SETTINGS:test-ok] Connection to {$provider->getProviderName()} succeeded.", ['provider' => $provider->getProviderName()]);
            return response()->json([
                'success'  => true,
                'provider' => $provider->getProviderName(),
                'message'  => 'Connection successful',
            ]);
        }

        Log::channel('aileadsearch')->warning("[SETTINGS:test-fail] Connection to {$provider->getProviderName()} failed — invalid API key or unreachable.", ['provider' => $provider->getProviderName()]);
        return response()->json([
            'success' => false,
            'message' => 'Invalid API key or connection failed',
        ], 422);
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate(['password' => ['required', 'current_password']]);

        $user = $request->user();
        Auth::logout();
        $user->delete();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    public function clearLeadsCache(): JsonResponse
    {
        $orgId = auth()->user()->organization_id;
        LeadsCache::bust($orgId);

        return response()->json(['ok' => true, 'message' => 'Leads cache cleared.']);
    }
}
