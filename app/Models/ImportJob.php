<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class ImportJob extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'organization_id',
        'source', 'status', 'preview_data', 'total_rows',
        'imported_rows', 'skipped_rows', 'errors', 'file_path', 'raw_input',
    ];

    protected $casts = [
        'preview_data' => 'array',
        'errors'       => 'array',
    ];
}
