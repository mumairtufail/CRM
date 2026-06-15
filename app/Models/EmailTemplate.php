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
        $vars['signature_inline']  = self::signatureInline($vars);
        $vars['from_initials']     = self::initialsFrom($fromName);

        return $vars;
    }

    /** Uppercase initials from a display name, e.g. "Umair Tufail" -> "UT". */
    public static function initialsFrom(string $name): string
    {
        $parts = preg_split('/\s+/', trim($name), -1, PREG_SPLIT_NO_EMPTY) ?: [];
        if (empty($parts)) {
            return '';
        }
        $first  = mb_substr($parts[0], 0, 1);
        $second = count($parts) > 1 ? mb_substr($parts[count($parts) - 1], 0, 1) : '';
        return mb_strtoupper($first . $second);
    }

    /**
     * Inline " · " separated signature line (company · website · email),
     * omitting any empty fields. Used by minimal/single-line signatures.
     */
    public static function signatureInline(array $vars): string
    {
        $parts = array_filter([
            $vars['company_name']    ?? '',
            $vars['company_website'] ?? '',
            $vars['company_email']   ?? '',
        ], fn ($v) => trim((string) $v) !== '');

        return e(implode(' · ', $parts));
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
