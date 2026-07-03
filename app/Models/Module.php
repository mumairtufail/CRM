<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Module extends Model
{
    protected $fillable = ['key', 'name', 'description', 'sort_order'];

    public function plans(): BelongsToMany
    {
        return $this->belongsToMany(Plan::class, 'module_plan');
    }
}
