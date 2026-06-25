<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\EmailTemplate;
use App\Services\LeadProviders\ApolloProvider;
use App\Services\LeadProviders\PeopleDataLabsProvider;
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
            'leadGenSettings'    => [
                'provider' => $orgSettings['lead_generation_provider'] ?? null,
                'enabled'  => $orgSettings['lead_generation_enabled'] ?? false,
                'hasKey'   => !empty($orgSettings['lead_generation_api_key']),
            ],
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
        $request->validate([
            'company_name'    => 'nullable|string|max:150',
            'company_website' => 'nullable|string|max:255',
            'company_phone'   => 'nullable|string|max:50',
            'company_email'   => 'nullable|email|max:255',
            'company_linkedin' => 'nullable|string|max:255',
            'logo'            => 'nullable|image|mimes:jpg,jpeg,png,gif,webp,svg|max:2048',
        ]);

        $user = $request->user();
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
        if ($user->company_logo) {
            Storage::disk('public')->delete($user->company_logo);
            $user->company_logo = null;
            $user->save();
        }

        return Redirect::route('profile.edit');
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
}
