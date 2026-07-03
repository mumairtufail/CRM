<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use BelongsToTenant;

    protected $fillable = ['organization_id', 'lead_id', 'user_id', 'type', 'description', 'meta'];

    protected $casts = ['meta' => 'array'];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
