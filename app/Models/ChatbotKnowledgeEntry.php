<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Admin-owned (platform-level) knowledge base entry the public chatbot
 * answers from. Not tenant-scoped.
 */
class ChatbotKnowledgeEntry extends Model
{
    protected $fillable = ['title', 'content', 'is_active', 'sort_order'];

    protected $casts = [
        'is_active'  => 'boolean',
        'sort_order' => 'integer',
    ];
}
