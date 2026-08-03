<?php

namespace Database\Seeders;

use App\Models\Module;
use Illuminate\Database\Seeder;

class ModuleSeeder extends Seeder
{
    public const CATALOG = [
        [
            'key'         => 'email_campaigns',
            'name'        => 'Email Campaigns',
            'description' => 'Bulk email campaigns with follow-up sequences, open/click tracking.',
            'sort_order'  => 1,
        ],
        [
            'key'         => 'whatsapp_campaigns',
            'name'        => 'WhatsApp Campaigns',
            'description' => 'Bulk WhatsApp broadcast campaigns to leads and groups.',
            'sort_order'  => 2,
        ],
        [
            'key'         => 'whatsapp_automation',
            'name'        => 'WhatsApp Bot & Automation',
            'description' => 'Two-way WhatsApp conversations, auto-reply bot, knowledge base, and automatic lead conversion.',
            'sort_order'  => 3,
        ],
        [
            'key'         => 'dialer',
            'name'        => 'Dialer',
            'description' => 'Bring-your-own Twilio dialer — click-to-call, inbound/outbound call logging on every lead.',
            'sort_order'  => 4,
        ],
        [
            'key'         => 'inbox',
            'name'        => 'Inbox',
            'description' => 'Connected email inbox (IMAP) — read, reply, and track email conversations with leads from inside the CRM.',
            'sort_order'  => 5,
        ],
    ];

    public function run(): void
    {
        foreach (self::CATALOG as $module) {
            Module::updateOrCreate(['key' => $module['key']], $module);
        }
    }
}
