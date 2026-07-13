<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiProviderSetting;
use App\Models\SystemSetting;
use App\Services\AiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AiSettingsController extends Controller
{
    private const MODELS = [
        'claude' => [
            ['id' => 'claude-opus-4-8',           'label' => 'Claude Opus 4.8'],
            ['id' => 'claude-sonnet-4-6',          'label' => 'Claude Sonnet 4.6'],
            ['id' => 'claude-haiku-4-5-20251001',  'label' => 'Claude Haiku 4.5'],
            ['id' => 'claude-opus-4-5',            'label' => 'Claude Opus 4.5'],
            ['id' => 'claude-sonnet-3-7',          'label' => 'Claude Sonnet 3.7'],
            ['id' => 'claude-sonnet-3-5',          'label' => 'Claude Sonnet 3.5'],
            ['id' => 'claude-haiku-3-5',           'label' => 'Claude Haiku 3.5'],
        ],
        'openai' => [
            ['id' => 'gpt-4o',            'label' => 'GPT-4o'],
            ['id' => 'gpt-4o-mini',       'label' => 'GPT-4o mini'],
            ['id' => 'gpt-4-turbo',       'label' => 'GPT-4 Turbo'],
            ['id' => 'gpt-3.5-turbo',     'label' => 'GPT-3.5 Turbo'],
            ['id' => 'o3-mini',           'label' => 'o3-mini'],
            ['id' => 'o1-mini',           'label' => 'o1-mini'],
            ['id' => 'o1',                'label' => 'o1'],
        ],
        'kimi' => [
            ['id' => 'moonshotai/kimi-k2',                             'label' => 'Kimi K2'],
            ['id' => 'moonshotai/kimi-k2.6',                           'label' => 'Kimi K2.6'],
            ['id' => 'nvidia/llama-3.1-nemotron-70b-instruct',         'label' => 'Llama 3.1 Nemotron 70B'],
            ['id' => 'meta/llama-3.1-405b-instruct',                   'label' => 'Llama 3.1 405B'],
            ['id' => 'nvidia/mistral-nemo-minitron-8b-8k-instruct',    'label' => 'Mistral Nemo Minitron 8B'],
            ['id' => 'deepseek-ai/deepseek-r1',                        'label' => 'DeepSeek R1'],
        ],
        'gemini' => [
            ['id' => 'gemini-2.5-flash', 'label' => 'Gemini 2.5 Flash'],
            ['id' => 'gemini-2.5-pro',   'label' => 'Gemini 2.5 Pro'],
            ['id' => 'gemini-1.5-flash', 'label' => 'Gemini 1.5 Flash'],
            ['id' => 'gemini-1.5-pro',   'label' => 'Gemini 1.5 Pro'],
        ],
    ];

    public function edit(): Response
    {
        $setting = SystemSetting::getAdminAi();

        // Mask the API key in the frontend response
        if (!empty($setting['api_key'])) {
            $setting['api_key'] = substr($setting['api_key'], 0, 8) . str_repeat('*', 24);
        }

        return Inertia::render('Admin/Settings/Ai', [
            'setting' => $setting,
            'models'  => self::MODELS,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'provider'  => 'required|in:claude,openai,kimi,gemini',
            'api_key'   => 'required|string',
            'model'     => 'required|string|max:200',
            'base_url'  => 'nullable|url|max:500',
            'is_active' => 'required|boolean',
        ]);

        $current = SystemSetting::getAdminAi();

        // If the key is masked, keep the existing one
        if (str_contains($validated['api_key'], '*')) {
            $validated['api_key'] = $current['api_key'];
        }

        // If provider, model, or api_key changed, reset validation
        if (
            $current['provider'] !== $validated['provider'] ||
            $current['model']    !== $validated['model'] ||
            $current['api_key']  !== $validated['api_key']
        ) {
            $validated['validated_at'] = null;
        }

        SystemSetting::saveAdminAi($validated);
        SystemSetting::clearAdminAiCache();

        return back()->with('success', 'Admin AI provider saved.');
    }

    public function test(Request $request): JsonResponse
    {
        $request->validate([
            'provider' => 'required|in:claude,openai,kimi,gemini',
            'api_key'  => 'required|string',
            'model'    => 'required|string|max:200',
            'base_url' => 'nullable|url|max:500',
        ]);

        $apiKey = $request->api_key;
        if (str_contains($apiKey, '*')) {
            $current = SystemSetting::getAdminAi();
            $apiKey = $current['api_key'];
        }

        // Build a temporary setting model to pass to the service
        $tempSetting = new AiProviderSetting([
            'provider' => $request->provider,
            'api_key'  => $apiKey,
            'model'    => $request->model,
            'base_url' => $request->base_url,
        ]);

        $service = new AiService($tempSetting);
        [$ok, $message] = $service->test();

        if ($ok) {
            SystemSetting::set('admin_ai_validated_at', now()->toDateTimeString());
            SystemSetting::clearAdminAiCache();
        }

        return response()->json([
            'success' => $ok,
            'message' => $message,
        ], $ok ? 200 : 422);
    }

    public function destroy(): RedirectResponse
    {
        SystemSetting::set('admin_ai_provider', null);
        SystemSetting::set('admin_ai_api_key', null);
        SystemSetting::set('admin_ai_model', null);
        SystemSetting::set('admin_ai_base_url', null);
        SystemSetting::set('admin_ai_is_active', '0');
        SystemSetting::set('admin_ai_validated_at', null);
        SystemSetting::clearAdminAiCache();

        return back()->with('success', 'Admin AI configuration removed.');
    }
}
