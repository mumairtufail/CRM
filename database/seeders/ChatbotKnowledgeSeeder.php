<?php

namespace Database\Seeders;

use App\Models\ChatbotKnowledgeEntry;
use Illuminate\Database\Seeder;

/**
 * Starter knowledge base for the public-site AI chatbot. Safe to re-run —
 * entries are matched and updated by title, nothing is duplicated.
 *
 * This is a starting point, not the final word: edit the content below (or
 * add more from Admin > Settings > AI Chatbot > Knowledge Base) to match
 * your actual current pricing, policies, and features. Whatever is marked
 * active in that table — seeded or hand-typed — is fed to the chatbot
 * automatically on every reply; there's no separate "publish" step.
 */
class ChatbotKnowledgeSeeder extends Seeder
{
    public function run(): void
    {
        $entries = [
            [
                'title' => 'What LumeniaCRM is',
                'content' => <<<'TXT'
LumeniaCRM is an all-in-one CRM for small and mid-size sales teams and agencies: lead management, email campaigns, a drag-and-drop sales pipeline, client invoicing, AI-powered lead prospecting, and WhatsApp automation, all in one workspace.

Each customer gets their own isolated workspace (we call it a "tenant"). Sign up, and you get a private workspace — your leads, pipeline, invoices, and team are never visible to any other customer.
TXT,
            ],
            [
                'title' => 'Plans and pricing',
                'content' => <<<'TXT'
We have three monthly plans (yearly billing is also available at a discount):

- Basic — $29/month. Up to 500 leads, 1 active sales pipeline, basic client invoicing.
- Pro — $79/month (our most popular plan). Everything in Basic, plus unlimited leads and pipelines, automated email campaigns, and advanced reports.
- Premium — $149/month. Everything in Pro, plus official WhatsApp campaigns, the interactive WhatsApp auto-response bot, and priority support.

To upgrade, downgrade, or ask about annual pricing, tell the visitor we'll have the team follow up by email — plan changes aren't self-serve checkout right now.
TXT,
            ],
            [
                'title' => 'Core features',
                'content' => <<<'TXT'
- Lead Management: add leads manually, import from a CSV, or find them with AI. Every lead has its own timeline, tags, and activity log.
- Sales Pipeline: a Kanban board for deals — drag cards between stages, filter by tag or status.
- Email Campaigns: send to a list and automatically follow up with anyone who didn't open, no extra clicks.
- Invoicing: create and send an invoice in under a minute, track whether it's paid.
- AI Prospecting: describe an ideal customer in plain English and get matching leads imported with name, email, company, and LinkedIn already filled in.
- Clients & Projects: convert a lead to a client in one click, then manage their projects, files, and tasks in the same workspace.
TXT,
            ],
            [
                'title' => 'WhatsApp automation (Premium plan)',
                'content' => <<<'TXT'
On the Premium plan, customers can connect their own WhatsApp Business number. Incoming messages get an instant automated reply drafted from that customer's own knowledge base (their FAQ, pricing, hours) — never a generic or made-up answer. When a conversation shows real buying intent, it's automatically turned into a lead on their pipeline.

This is a separate feature from the live chat widget on our own website — the WhatsApp bot is a customer-facing product feature we sell to businesses using LumeniaCRM to talk to their own customers.
TXT,
            ],
            [
                'title' => 'Data security and workspace isolation',
                'content' => <<<'TXT'
Every workspace is isolated at the database level — a user in one workspace cannot see or reach data belonging to another workspace, even if they run both. All connections are TLS-encrypted, and backups run daily.
TXT,
            ],
            [
                'title' => 'Getting started',
                'content' => <<<'TXT'
1. Sign up and create a workspace — pick a name, done in under two minutes.
2. Add your leads — import a spreadsheet, type them in by hand, or describe who you're targeting and let AI find them.
3. Work your pipeline — send emails, log calls, move deals through stages, and create invoices, all from the same tab.

No credit card is required to start a trial.
TXT,
            ],
            [
                'title' => 'Supported integrations',
                'content' => <<<'TXT'
Email campaigns work with any provider that gives out SMTP credentials: Gmail, Outlook 365, SendGrid, Mailgun, Brevo, Postmark, or a customer's own mail server. Leads can also be imported from a CSV file or a connected Google Sheet.
TXT,
            ],
            [
                'title' => 'Getting help / support',
                'content' => <<<'TXT'
If a visitor needs something this chat can't answer, offer to have a real teammate follow up — ask for their email (and name, if they're willing) so support can reach out directly. Premium plan customers also get priority support.
TXT,
            ],
        ];

        foreach ($entries as $i => $entry) {
            ChatbotKnowledgeEntry::updateOrCreate(
                ['title' => $entry['title']],
                ['content' => $entry['content'], 'is_active' => true, 'sort_order' => $i + 1]
            );
        }
    }
}
