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

        $vars = [
            'company_name'        => $user?->company_name ?: $fromName,
            'from_name'           => $fromName,
            'year'                => date('Y'),
            'company_website'     => preg_replace('#^https?://#i', '', $website),
            'company_website_url' => $websiteUrl,
            'company_phone'       => trim((string) ($user?->company_phone ?? '')),
            'company_email'       => trim((string) ($user?->company_email ?? '')),
        ];

        $vars['signature_contact'] = self::signatureContactHtml($vars);

        return $vars;
    }

    /**
     * Build the signature contact links, including only fields that are filled.
     * Empty values are omitted entirely so the signature never shows broken
     * (empty) links. Styling comes from each template's `.sig-contact a` rules.
     */
    public static function signatureContactHtml(array $vars): string
    {
        $rows = [];

        if (!empty($vars['company_website'])) {
            $href = $vars['company_website_url'] ?: $vars['company_website'];
            $rows[] = '<a href="' . e($href) . '">' . e($vars['company_website']) . '</a>';
        }
        if (!empty($vars['company_email'])) {
            $rows[] = '<a href="mailto:' . e($vars['company_email']) . '">' . e($vars['company_email']) . '</a>';
        }
        if (!empty($vars['company_phone'])) {
            $rows[] = '<a href="tel:' . e(preg_replace('/[^\d+]/', '', $vars['company_phone'])) . '">' . e($vars['company_phone']) . '</a>';
        }

        return implode("\n", $rows);
    }
}
