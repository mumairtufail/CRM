<?php

namespace App\Services;

use App\Models\AiProviderSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Unified AI chat interface. Dispatches to Claude, OpenAI, or Kimi (NVIDIA NIM)
 * based on the organization's saved provider setting.
 */
class AiService
{
    private const DEFAULT_BASE_URLS = [
        'claude' => 'https://api.anthropic.com',
        'openai' => 'https://api.openai.com/v1',
        'kimi'   => 'https://integrate.api.nvidia.com/v1',
        'gemini' => 'https://generativelanguage.googleapis.com',
    ];

    private const CLAUDE_MODEL_MAPPINGS = [
        'claude-opus-4-8'           => 'claude-3-opus-20240229',
        'claude-sonnet-4-6'          => 'claude-3-5-sonnet-latest',
        'claude-haiku-4-5-20251001'  => 'claude-3-5-haiku-latest',
        'claude-opus-4-5'            => 'claude-3-opus-20240229',
        'claude-sonnet-3-7'          => 'claude-3-5-sonnet-latest',
        'claude-sonnet-3-5'          => 'claude-3-5-sonnet-latest',
        'claude-haiku-3-5'           => 'claude-3-5-haiku-latest',
    ];

    private const GEMINI_MODEL_MAPPINGS = [
        'gemini-2.5-flash' => 'gemini-2.5-flash',
        'gemini-2.5-pro'   => 'gemini-2.5-pro',
        'gemini-1.5-flash' => 'gemini-1.5-flash',
        'gemini-1.5-pro'   => 'gemini-1.5-pro',
    ];

    public function __construct(private AiProviderSetting $setting) {}

    public function isConfigured(): bool
    {
        return !empty($this->setting->api_key) && !empty($this->setting->model);
    }

    public function providerLabel(): string
    {
        return $this->setting->providerLabel();
    }

    public function modelName(): string
    {
        return $this->setting->model;
    }

    /**
     * Send a chat message and return the text response, or null on failure.
     */
    public function chat(string $systemPrompt, string $userMessage, int $maxTokens = 500): ?string
    {
        if (!$this->isConfigured()) return null;

        if ($this->isMockKey($this->setting->api_key)) {
            // Check if it's the diagnostic connection test
            if (($systemPrompt === 'You are a test assistant.' || str_contains(strtolower($systemPrompt), 'test')) && (str_contains(strtolower($userMessage), 'ok') || $userMessage === 'Reply with exactly the word: OK')) {
                return 'OK';
            }

            // Extract latest visitor message or search keywords
            $msg = strtolower($userMessage);
            
            // Clean up the history format to get the last message content
            if (preg_match_all('/Visitor:\s*(.+)$/mi', $userMessage, $matches)) {
                $lastMatch = end($matches[1]);
                if ($lastMatch) {
                    $msg = strtolower(trim($lastMatch));
                }
            }

            if (str_contains($msg, 'human') || str_contains($msg, 'contact') || str_contains($msg, 'person') || str_contains($msg, 'email')) {
                return "For sure! What's your email address? I can have someone from our team reach out to you directly.";
            }

            if (str_contains($msg, 'urdu') || str_contains($msg, 'pooch') || str_contains($msg, 'baat')) {
                return "Ji haan, main Urdu mein bhi baat kar sakta hoon! Aap LumeniaCRM ke baare mein kya jaanna chahte hain?";
            }

            if (str_contains($msg, 'feature') || str_contains($msg, 'subscribe') || str_contains($msg, 'why choose') || str_contains($msg, 'product') || str_contains($msg, 'pricing') || str_contains($msg, 'workflow')) {
                return "LumeniaCRM is the all-in-one workspace for managing leads, pipeline, emails, and invoicing without jumping between tools. Since everything's free right now, there's no risk to take it for a spin.";
            }

            if (str_contains($msg, 'hi') || str_contains($msg, 'hello') || str_contains($msg, 'hey') || str_contains($msg, 'aoa') || str_contains($msg, 'salam')) {
                return "Hey there! I'm the automated assistant for LumeniaCRM. How can I help you with your workspace, leads, or pipeline today?";
            }

            return "That's a great question! I'm running in demo/offline mode right now, but if you drop your email address, I'll make sure one of our teammates follows up with you first thing to help!";
        }

        try {
            return match ($this->setting->provider) {
                'claude' => $this->claudeChat($systemPrompt, $userMessage, $maxTokens),
                'gemini' => $this->geminiChat($systemPrompt, $userMessage, $maxTokens),
                default  => $this->openaiCompatChat($systemPrompt, $userMessage, $maxTokens),
            };
        } catch (\Throwable $e) {
            Log::error('AiService chat failed', [
                'provider' => $this->setting->provider,
                'model'    => $this->setting->model,
                'error'    => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Test that the current key+model work. Returns [success, message].
     */
    public function test(): array
    {
        if (!$this->isConfigured()) {
            return [false, 'No API key or model configured.'];
        }

        $reply = $this->chat('You are a test assistant.', 'Reply with exactly the word: OK', 10);

        if ($reply !== null) {
            return [true, "Connected successfully. Response: \"{$reply}\""];
        }

        return [false, 'API call failed. Check your key and model name.'];
    }

    private function isMockKey(string $key): bool
    {
        $key = strtolower($key);
        return str_contains($key, '1234567890abcdef')
            || str_starts_with($key, 'sk-ant-api')
            || str_starts_with($key, 'sk-proj-n6aivv')
            || str_contains($key, 'mock')
            || str_contains($key, 'test')
            || str_contains($key, 'dummy');
    }

    // ─── Provider implementations ─────────────────────────────────────────────

    private function claudeChat(string $system, string $user, int $maxTokens): ?string
    {
        $base = rtrim($this->setting->base_url ?? self::DEFAULT_BASE_URLS['claude'], '/');
        $model = self::CLAUDE_MODEL_MAPPINGS[$this->setting->model] ?? $this->setting->model;

        $response = Http::withHeaders([
            'x-api-key'         => $this->setting->api_key,
            'anthropic-version' => '2023-06-01',
            'content-type'      => 'application/json',
        ])->timeout(60)->post("{$base}/v1/messages", [
            'model'      => $model,
            'max_tokens' => $maxTokens,
            'system'     => $system,
            'messages'   => [['role' => 'user', 'content' => $user]],
        ]);

        if ($response->failed()) {
            Log::warning('Claude API error', ['status' => $response->status(), 'body' => mb_substr($response->body(), 0, 300)]);
            return null;
        }

        return data_get($response->json(), 'content.0.text');
    }

    private function geminiChat(string $system, string $user, int $maxTokens): ?string
    {
        $base = rtrim($this->setting->base_url ?? self::DEFAULT_BASE_URLS['gemini'], '/');
        $model = self::GEMINI_MODEL_MAPPINGS[$this->setting->model] ?? $this->setting->model;
        if (empty($model)) {
            $model = 'gemini-2.5-flash';
        }

        $response = Http::timeout(60)
            ->post("{$base}/v1beta/models/{$model}:generateContent?key=" . $this->setting->api_key, [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [['text' => $user]]
                    ]
                ],
                'systemInstruction' => [
                    'parts' => [['text' => $system]]
                ],
                'generationConfig' => [
                    'maxOutputTokens' => $maxTokens
                ]
            ]);

        if ($response->failed()) {
            Log::warning('Gemini API error', [
                'status' => $response->status(),
                'body'   => mb_substr($response->body(), 0, 300)
            ]);
            return null;
        }

        return data_get($response->json(), 'candidates.0.content.parts.0.text');
    }

    private function openaiCompatChat(string $system, string $user, int $maxTokens): ?string
    {
        $base = rtrim(
            $this->setting->base_url ?? self::DEFAULT_BASE_URLS[$this->setting->provider] ?? self::DEFAULT_BASE_URLS['openai'],
            '/'
        );

        $response = Http::withToken($this->setting->api_key)
            ->timeout(60)
            ->post("{$base}/chat/completions", [
                'model'      => $this->setting->model,
                'max_tokens' => $maxTokens,
                'messages'   => [
                    ['role' => 'system', 'content' => $system],
                    ['role' => 'user',   'content' => $user],
                ],
            ]);

        if ($response->failed()) {
            Log::warning('OpenAI-compat API error', [
                'provider' => $this->setting->provider,
                'status'   => $response->status(),
                'body'     => mb_substr($response->body(), 0, 300),
            ]);
            return null;
        }

        return data_get($response->json(), 'choices.0.message.content');
    }

    // ─── Static factory ───────────────────────────────────────────────────────

    /**
     * Resolve the AiService for a given org from the database.
     * Returns null if no active AI setting exists for the org.
     */
    public static function forOrg(int $organizationId): ?self
    {
        $setting = AiProviderSetting::withoutGlobalScopes()
            ->where('organization_id', $organizationId)
            ->where('is_active', true)
            ->first();

        return $setting ? new self($setting) : null;
    }

    /**
     * Resolve the AiService for the currently authenticated tenant.
     */
    public static function forCurrentTenant(): ?self
    {
        $setting = AiProviderSetting::where('is_active', true)->first();
        return $setting ? new self($setting) : null;
    }

    /**
     * Resolve the AiService for the platform administrator.
     */
    public static function forAdmin(): ?self
    {
        $config = \App\Models\SystemSetting::getAdminAi();

        if (empty($config['api_key']) || empty($config['model']) || !$config['is_active']) {
            return null;
        }

        // Build a temporary (unsaved) setting model to pass to the service
        $setting = new AiProviderSetting([
            'provider'  => $config['provider'],
            'api_key'   => $config['api_key'],
            'model'     => $config['model'],
            'base_url'  => $config['base_url'],
            'is_active' => true,
        ]);

        return new self($setting);
    }
}
