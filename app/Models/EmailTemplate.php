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
        // Display form: drop the protocol and any trailing slash (e.g. "lumenialab.com").
        $websiteDisplay = rtrim((string) preg_replace('#^https?://#i', '', $website), '/');

        $linkedin = trim((string) ($user?->company_linkedin ?? ''));
        $linkedinUrl = $linkedin !== '' && !preg_match('#^https?://#i', $linkedin)
            ? 'https://' . $linkedin
            : $linkedin;
        $linkedinDisplay = rtrim((string) preg_replace('#^https?://(www\.)?#i', '', $linkedin), '/');

        $logo = trim((string) ($user?->company_logo ?? ''));

        $vars = [
            'company_name'         => $user?->company_name ?: $fromName,
            'from_name'            => $fromName,
            'year'                 => date('Y'),
            'company_website'      => $websiteDisplay,
            'company_website_url'  => $websiteUrl,
            'company_phone'        => trim((string) ($user?->company_phone ?? '')),
            'company_email'        => trim((string) ($user?->company_email ?? '')),
            'company_linkedin'     => $linkedinDisplay,
            'company_linkedin_url' => $linkedinUrl,
            'company_logo_url'     => $logo !== '' ? url('storage/' . $logo) : '',
        ];

        $vars['signature_contact'] = self::signatureContactHtml($vars);
        $vars['signature_inline']  = self::signatureInline($vars);
        $vars['signature_stack']   = self::signatureStack($vars);
        $vars['from_initials']     = self::initialsFrom($fromName);
        $vars['header_brand']      = self::headerBrandHtml($vars);

        return $vars;
    }

    /**
     * Header brand mark: the uploaded logo image when present, otherwise the
     * company name as plain text (inheriting the surrounding cell's styling).
     */
    public static function headerBrandHtml(array $vars): string
    {
        if (!empty($vars['company_logo_url'])) {
            return '<img src="' . e($vars['company_logo_url']) . '" alt="' . e($vars['company_name'] ?? '')
                . '" height="26" style="display:block;height:26px;max-height:26px;width:auto;border:0;outline:none;text-decoration:none;">';
        }

        return e($vars['company_name'] ?? '');
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
     * Inline " · " separated signature line. Company / website / email / phone
     * render as plain text; LinkedIn renders as a clickable "LinkedIn" word.
     * Empty fields are omitted. Used by minimal/single-line signatures.
     */
    public static function signatureInline(array $vars): string
    {
        $parts = [];

        foreach (['company_name', 'company_website', 'company_email', 'company_phone'] as $key) {
            $value = trim((string) ($vars[$key] ?? ''));
            if ($value !== '') {
                $parts[] = e($value);
            }
        }

        if (!empty($vars['company_linkedin'])) {
            $href = $vars['company_linkedin_url'] ?: $vars['company_linkedin'];
            $parts[] = '<a href="' . e($href) . '" style="color:#534AB7;text-decoration:underline;">LinkedIn</a>';
        }

        return implode(' · ', $parts);
    }

    /**
     * Stacked single-column signature: company / website / email / phone / LinkedIn,
     * each on its own line. Company / website / email / phone render as plain text;
     * LinkedIn renders as a clickable "LinkedIn" word. Empty fields are omitted.
     */
    public static function signatureStack(array $vars): string
    {
        $rows = [];

        foreach (['company_name', 'company_website', 'company_email', 'company_phone'] as $key) {
            $value = trim((string) ($vars[$key] ?? ''));
            if ($value !== '') {
                $rows[] = '<div style="line-height:1.7;">' . e($value) . '</div>';
            }
        }

        if (!empty($vars['company_linkedin'])) {
            $href = $vars['company_linkedin_url'] ?: $vars['company_linkedin'];
            $rows[] = '<div style="line-height:1.7;"><a href="' . e($href)
                . '" style="color:#534AB7;text-decoration:underline;">LinkedIn</a></div>';
        }

        return implode("\n", $rows);
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
        if (!empty($vars['company_linkedin'])) {
            $href = $vars['company_linkedin_url'] ?: $vars['company_linkedin'];
            $rows[] = '<a href="' . e($href) . '">' . e($vars['company_linkedin']) . '</a>';
        }

        return implode("\n", $rows);
    }
}
