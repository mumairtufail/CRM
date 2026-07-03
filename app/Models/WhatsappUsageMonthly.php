<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class WhatsappUsageMonthly extends Model
{
    use BelongsToTenant;

    protected $table = 'whatsapp_usage_monthly';

    protected $fillable = [
        'organization_id',
        'year_month',
        'sent_count',
        'delivered_count',
        'failed_count',
    ];

    public static function currentMonthFor(?int $organizationId): ?self
    {
        if ($organizationId === null) {
            return null;
        }

        return static::withoutGlobalScopes()
            ->where('organization_id', $organizationId)
            ->where('year_month', now()->format('Y-m'))
            ->first();
    }

    public static function incrementFor(int $organizationId, string $field): void
    {
        $yearMonth = now()->format('Y-m');

        $row = static::withoutGlobalScopes()->firstOrCreate(
            ['organization_id' => $organizationId, 'year_month' => $yearMonth],
            ['sent_count' => 0, 'delivered_count' => 0, 'failed_count' => 0]
        );

        $row->increment($field);
    }
}
