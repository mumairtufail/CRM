<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    protected $fillable = ['lead_id', 'type', 'description', 'meta'];

    protected $casts = ['meta' => 'array'];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
