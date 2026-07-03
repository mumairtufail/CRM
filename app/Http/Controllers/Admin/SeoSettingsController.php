<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SeoSettingsController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('Admin/Settings/Seo', [
            'seo' => SystemSetting::getSeo(),
            'app_url' => config('app.url'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'meta_title'       => 'required|string|max:255',
            'meta_description' => 'required|string|max:500',
            'meta_keywords'    => 'nullable|string|max:500',
            'robots_txt'       => 'nullable|string',
        ]);

        SystemSetting::saveSeo($validated);
        SystemSetting::clearSeoCache();

        // Write custom rules directly to public/robots.txt
        try {
            $path = public_path('robots.txt');
            file_put_contents($path, $validated['robots_txt'] ?? '');
        } catch (\Throwable $e) {
            return back()->with('error', 'SEO settings saved, but failed to write public/robots.txt. Please check file permissions.');
        }

        return back()->with('success', 'SEO and Indexing configuration updated successfully.');
    }
}
