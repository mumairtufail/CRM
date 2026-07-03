<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('Admin/Settings/Account', [
            'user' => $request->user('admin')->only('name', 'email'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:admins,email,' . $request->user('admin')->id,
        ]);

        $request->user('admin')->fill($validated)->save();

        return back()->with('success', 'Profile updated.');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $request->validate([
            'current_password' => ['required', 'current_password:admin'],
            'password'         => ['required', 'confirmed', Password::defaults()],
        ]);

        $request->user('admin')->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Password changed.');
    }

    public function editBranding(Request $request): Response
    {
        return Inertia::render('Admin/Settings/Branding', [
            'custom_logo_url' => \App\Models\SystemSetting::get('custom_logo_url'),
        ]);
    }

    public function updateBranding(Request $request): RedirectResponse
    {
        $request->validate([
            'logo' => 'required|image|max:2048', // 2MB max
        ]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('branding', 'public');
            $url = '/storage/' . $path;
            
            \App\Models\SystemSetting::set('custom_logo_url', $url);
            
            return back()->with('success', 'Branding logo updated successfully.');
        }

        return back()->with('error', 'Failed to upload logo.');
    }

    public function resetBranding(Request $request): RedirectResponse
    {
        \App\Models\SystemSetting::set('custom_logo_url', null);
        return back()->with('success', 'Branding reset to default logo.');
    }
}
