<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * One public-site chat session. Each visitor conversation is recorded
 * separately with its full message transcript.
 */
class ChatbotConversation extends Model
{
    protected $fillable = [
        'session_id', 'visitor_name', 'visitor_email', 'page', 'ip', 'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function messages(): HasMany
    {
        return $this->hasMany(ChatbotMessage::class, 'conversation_id');
    }
}
