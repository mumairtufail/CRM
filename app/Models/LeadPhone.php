<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeadPhone extends Model
{
    protected $fillable = ['lead_id', 'phone', 'type', 'is_primary'];

    protected $casts = ['is_primary' => 'boolean'];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
