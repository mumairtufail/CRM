<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    use BelongsToTenant;

    /** System templates (organization_id null) are shared across all tenants. */
    protected bool $tenantIncludesGlobal = true;

    protected $fillable = [
        'organization_id', 'user_id', 'name', 'description', 'html_content', 'thumbnail_color', 'is_system',
    ];

    protected function casts(): array
    {
        return ['is_system' => 'boolean'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Render the template by replacing all {{placeholder}} tokens.
     * Required key: 'content' (the campaign body HTML).
     */
    public function render(array $vars): string
    {
        $html = $this->html_content;
        foreach ($vars as $key => $value) {
            $html = str_replace('{{' . $key . '}}', (string) $value, $html);
        }
        return $html;
    }

    /**
     * Base template variables for a sender, including the built-in
     * signature data (website / phone / email) from workspace settings.
     */
    public static function varsFor(?User $user, string $fromName): array
    {
        $website = trim((string) ($user?->company_website ?? ''));
        $websiteUrl = $website !== '' && !preg_match('#^https?://#i', $website)
            ? 'https://' . $website
            : $website;

        return [
            'company_name'        => $user?->company_name ?: $fromName,
            'from_name'           => $fromName,
            'year'                => date('Y'),
            'company_website'     => preg_replace('#^https?://#i', '', $website),
            'company_website_url' => $websiteUrl,
            'company_phone'       => $user?->company_phone ?? '',
            'company_email'       => $user?->company_email ?? '',
        ];
    }
}
