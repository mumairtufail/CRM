<?php

namespace App\Http\Controllers;

use App\Support\TenantContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class OrganizationSettingsController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'followup_enabled' => 'sometimes|boolean',
            'name'             => 'sometimes|required|string|max:150',
        ]);

        $org = app(TenantContext::class)->get() ?? $request->user()?->organization;

        if (! $org) {
            return Redirect::back()->withErrors(['org' => 'No workspace found.']);
        }

        if ($request->has('followup_enabled')) {
            $settings                     = $org->settings ?? [];
            $settings['followup_enabled'] = (bool) $request->input('followup_enabled');
            $org->settings                = $settings;
        }

        if ($request->has('name')) {
            $org->name = $request->input('name');
        }

        $org->save();

        return Redirect::route('profile.edit')->with('status', 'organization-settings-updated');
    }
}
