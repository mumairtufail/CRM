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
        $user = $request->user();
        abort_unless($user->isOwner() || $user->hasPermission('team.manage'), 403, 'Only workspace admins can edit these settings.');

        $request->validate([
            'name' => 'sometimes|required|string|max:150',
        ]);

        $org = app(TenantContext::class)->get() ?? $user->organization;

        if (! $org) {
            return Redirect::back()->withErrors(['org' => 'No workspace found.']);
        }

        if ($request->has('name')) {
            $org->name = $request->input('name');
        }

        $org->save();

        return Redirect::route('profile.edit')->with('status', 'organization-settings-updated');
    }
}
