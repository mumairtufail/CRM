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
}
