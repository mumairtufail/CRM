<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    use BelongsToTenant;

    protected $fillable = ['organization_id', 'name', 'color'];

    public function leads()
    {
        return $this->belongsToMany(Lead::class, 'lead_tag');
    }
}
