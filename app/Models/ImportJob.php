<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImportJob extends Model
{
    protected $fillable = [
        'source', 'status', 'preview_data', 'total_rows',
        'imported_rows', 'skipped_rows', 'errors', 'file_path', 'raw_input',
    ];

    protected $casts = [
        'preview_data' => 'array',
        'errors'       => 'array',
    ];
}
