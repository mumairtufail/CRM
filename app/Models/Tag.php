<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    use BelongsToTenant;

    /**
     * Starter tags given to every new workspace, so tagging works
     * immediately without setup. Shared by the demo seeder and the
     * registration flow — keep both in sync with this single list.
     */
    public const DEFAULTS = [
        ['name' => 'Hot Lead',   'color' => '#ef4444'],
        ['name' => 'Cold',       'color' => '#64748b'],
        ['name' => 'Follow Up',  'color' => '#f59e0b'],
        ['name' => 'VIP',        'color' => '#8b5cf6'],
        ['name' => 'Agency',     'color' => '#3b82f6'],
        ['name' => 'Startup',    'color' => '#10b981'],
        ['name' => 'Enterprise', 'color' => '#6366f1'],
        ['name' => 'Pakistan',   'color' => '#14b8a6'],
        ['name' => 'UAE',        'color' => '#ec4899'],
        ['name' => 'US',         'color' => '#0ea5e9'],
    ];

    protected $fillable = ['organization_id', 'name', 'color'];

    public function leads()
    {
        return $this->belongsToMany(Lead::class, 'lead_tag');
    }

    public static function seedDefaults(int $organizationId): void
    {
        foreach (self::DEFAULTS as $tag) {
            static::create([...$tag, 'organization_id' => $organizationId]);
        }
    }
}
