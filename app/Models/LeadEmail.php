<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeadEmail extends Model
{
    protected $fillable = ['lead_id', 'email', 'type', 'is_primary', 'is_verified'];

    protected $casts = [
        'is_primary'  => 'boolean',
        'is_verified' => 'boolean',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
