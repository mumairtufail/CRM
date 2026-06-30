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

        try {
            return match ($this->setting->provider) {
                'claude' => $this->claudeChat($systemPrompt, $userMessage, $maxTokens),
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

    // ─── Provider implementations ─────────────────────────────────────────────

    private function claudeChat(string $system, string $user, int $maxTokens): ?string
    {
        $base = rtrim($this->setting->base_url ?? self::DEFAULT_BASE_URLS['claude'], '/');

        $response = Http::withHeaders([
            'x-api-key'         => $this->setting->api_key,
            'anthropic-version' => '2023-06-01',
            'content-type'      => 'application/json',
        ])->timeout(60)->post("{$base}/v1/messages", [
            'model'      => $this->setting->model,
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
}
