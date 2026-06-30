<?php

namespace App\Http\Controllers;

use App\Models\AiProviderSetting;
use App\Services\AiService;
use Illuminate\Http\Request;

class AiProviderController extends Controller
{
    /** Known models per provider — shown in the UI dropdown */
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
    ];

    public function show(Request $request)
    {
        $setting = AiProviderSetting::where('organization_id', $request->user()->organization_id)->first();

        return response()->json([
            'setting' => $setting ? [
                'provider'     => $setting->provider,
                'model'        => $setting->model,
                'base_url'     => $setting->base_url,
                'is_active'    => $setting->is_active,
                'is_validated' => $setting->isValidated(),
                'validated_at' => $setting->validated_at,
            ] : null,
            'models' => self::MODELS,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'provider' => 'required|in:claude,openai,kimi',
            'api_key'  => 'required|string|min:10',
            'model'    => 'required|string|max:200',
            'base_url' => 'nullable|url|max:500',
        ]);

        AiProviderSetting::updateOrCreate(
            ['organization_id' => $request->user()->organization_id],
            [
                ...$validated,
                'is_active'    => true,
                'validated_at' => null, // reset validation on key change
            ]
        );

        return back()->with('success', 'AI provider saved.');
    }

    public function validate(Request $request)
    {
        $request->validate([
            'provider' => 'required|in:claude,openai,kimi',
            'api_key'  => 'required|string|min:10',
            'model'    => 'required|string|max:200',
            'base_url' => 'nullable|url|max:500',
        ]);

        // Build a temporary (unsaved) setting to test with
        $tempSetting = new AiProviderSetting([
            'provider' => $request->provider,
            'api_key'  => $request->api_key,
            'model'    => $request->model,
            'base_url' => $request->base_url,
        ]);

        $service = new AiService($tempSetting);
        [$ok, $message] = $service->test();

        if ($ok) {
            // Mark the saved setting as validated if it exists and matches
            AiProviderSetting::where('organization_id', $request->user()->organization_id)
                ->where('provider', $request->provider)
                ->where('model', $request->model)
                ->update(['validated_at' => now()]);
        }

        return response()->json([
            'success' => $ok,
            'message' => $message,
        ], $ok ? 200 : 422);
    }

    public function models()
    {
        return response()->json(['models' => self::MODELS]);
    }

    public function destroy(Request $request)
    {
        AiProviderSetting::where('organization_id', $request->user()->organization_id)->delete();
        return back()->with('success', 'AI configuration removed.');
    }
}
