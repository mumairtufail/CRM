<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\EmailTemplate;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();

        // System templates + user's own custom templates
        $systemTemplates = EmailTemplate::whereNull('user_id')->where('is_system', true)->get();
        $userTemplates   = $user->emailTemplates()->get();
        $allTemplates    = $systemTemplates->merge($userTemplates)->map(fn ($t) => [
            'id'              => $t->id,
            'name'            => $t->name,
            'description'     => $t->description,
            'thumbnail_color' => $t->thumbnail_color,
            'is_system'       => $t->is_system,
        ]);

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail'    => $user instanceof MustVerifyEmail,
            'status'             => session('status'),
            'smtpCredentials'    => $user->smtpCredentials()->get()->map(fn ($c) => [
                'id'         => $c->id,
                'name'       => $c->name,
                'host'       => $c->host,
                'port'       => $c->port,
                'encryption' => $c->encryption,
                'username'   => $c->username,
                'from_name'  => $c->from_name,
                'from_email' => $c->from_email,
                'is_active'  => $c->is_active,
            ]),
            'mailSettings'          => [
                'batch_size'  => $user->mail_batch_size  ?? 10,
                'batch_delay' => $user->mail_batch_delay ?? 5,
            ],
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
            'company_name' => 'nullable|string|max:150',
            'logo'         => 'nullable|image|mimes:jpg,jpeg,png,gif,webp,svg|max:2048',
        ]);

        $user = $request->user();
        $user->company_name = $request->input('company_name', $user->company_name);

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
