<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsappTemplate extends Model
{
    protected $fillable = [
        'name',
        'language',
        'category',
        'status',
        'body_preview',
        'variable_count',
        'created_by',
    ];

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }
}
