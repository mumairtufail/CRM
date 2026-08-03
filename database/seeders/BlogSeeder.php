<?php

namespace Database\Seeders;

use App\Models\Blog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogSeeder extends Seeder
{
    public function run(): void
    {
        $posts = [
            [
                'title'       => 'Built-In Dialer: Call Leads Straight From Your CRM',
                'subtitle'    => 'Click to call, log every conversation automatically, and stop losing call notes in a separate app.',
                'description' => 'How Lumenia CRM\'s built-in Dialer lets you call leads directly from their profile, with every call, recording, and SMS logged automatically to the lead timeline.',
                'tags'        => ['Dialer', 'Sales Calls', 'Twilio', 'CRM Features'],
                'image_path'  => 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80',
                'body' => <<<HTML
<p>Sales teams lose more deals to bad follow-up logistics than to bad pitches. A rep finds a promising lead, calls them from a personal phone or a separate dialer app, and then has to remember to go back into the CRM later and write up what happened. Half the time, that note never gets written. The context is gone by the next call.</p>

<p>Lumenia CRM's built-in Dialer removes that gap entirely. Every call happens from inside the lead's own profile, and every call, in or out, is logged automatically the moment it ends.</p>

<h2>Call a lead without leaving their profile</h2>
<p>Open any lead, click <strong>Call</strong>, and the CRM bridges your phone with theirs. No dialing a number by hand, no switching to a separate app, no losing your place in the pipeline. You can also quick-dial by searching any lead's name, company, or number directly from the Dialer page if you're working through a list rather than a single record.</p>

<h2>Every call writes its own record</h2>
<p>The Dialer is bring-your-own-Twilio: connect your own Twilio account once from Settings, and from then on every inbound and outbound call is matched to the right lead automatically by phone number. Each call log captures:</p>
<ul>
  <li>Direction (inbound or outbound), duration, and status</li>
  <li>A recording, playable right from the call log, where available</li>
  <li>Voicemail transcripts, so you can scan what was said without listening to the whole message</li>
</ul>
<p>Every logged call also lands on the lead's <strong>activity timeline</strong>, sitting right alongside their emails and, once WhatsApp launches, their chat history too. Anyone on the team who opens that lead later sees the whole story in one place, not scattered across a phone log, a separate app, and a handful of sticky notes.</p>

<h2>Text without switching tools either</h2>
<p>The same connected Twilio number handles SMS. Send a one-off text to a lead directly from their profile, and both sent and received messages are logged the same way calls are — no separate texting app, no copy-pasting a number out of the CRM to text someone from your phone.</p>

<h2>Who has access to it</h2>
<p>Dialer is included on every paid Lumenia CRM plan, starting with Starter. You supply your own Twilio credentials and pay Twilio directly for call and SMS usage, so there's no markup on your calling costs — you're only ever paying for the CRM subscription and whatever Twilio actually bills you for.</p>

<p>If you're currently juggling a CRM, a separate dialer, and a notebook full of call notes, connecting a Twilio account and turning on the Dialer is usually a fifteen-minute setup that removes all three extra steps at once.</p>
HTML,
            ],
            [
                'title'       => 'AI Lead Search: Find Verified Prospects in Plain English',
                'subtitle'    => 'Describe who you\'re looking for the way you\'d describe it to a colleague, and get real, verified contacts back.',
                'description' => 'How Lumenia CRM\'s AI-powered lead search turns a plain-English description of your ideal customer into a list of verified, importable contacts, with no manual list-building.',
                'tags'        => ['AI Lead Search', 'Prospecting', 'Lead Generation', 'CRM Features'],
                'image_path'  => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
                'body' => <<<HTML
<p>Building a prospect list the old way means exporting from a directory, cross-referencing job titles by hand, and cleaning out the contacts with dead emails before you can even start reaching out. It's hours of work before a single message goes out.</p>

<p>Lumenia CRM's AI Lead Search skips straight to the list. Type who you're looking for the way you'd describe it to a colleague, and it searches verified data providers, ranks results by fit, and imports matching people directly into your workspace.</p>

<h2>Describe your ideal customer, not a filter form</h2>
<p>Instead of clicking through a dozen dropdown filters, you write a sentence: industry, title, company size, location, whatever matters for your business. The AI parses that description into the underlying search criteria and returns a ranked list of people who actually match it — not a rough approximation.</p>

<h2>Built on real, verified data</h2>
<p>Results come from established people-data providers, so contacts come with real verified emails rather than guessed addresses. You can review the list before importing anything, and only bring in the people you actually want to reach out to.</p>

<h2>From search result to working lead in one click</h2>
<p>Once you import a contact, it's not a separate export file sitting on your desktop — it's a real lead in your CRM, on your pipeline, with its own timeline, ready for an email, a call through the Dialer, or a campaign. There's no second step of re-importing a CSV into a different tool.</p>

<h2>Available on every plan, including Free</h2>
<p>AI Lead Search isn't locked behind a paid tier. It's available on the Free plan alongside core lead and pipeline management, so you can build your first prospect list without a credit card. If you outgrow the Free plan's 200-lead cap, every paid tier removes that limit entirely.</p>

<p>For teams that spend real hours every week just assembling a call list before the actual selling starts, replacing that process with a plain-English search is usually the single biggest time reclaim in the whole toolkit.</p>
HTML,
            ],
            [
                'title'       => 'Automated Follow-Up Emails: Recover Deals That Went Quiet',
                'subtitle'    => 'Build a multi-step follow-up sequence once per campaign, and let it chase down anyone who never opened the first email.',
                'description' => 'How Lumenia CRM\'s automated, AI-assisted follow-up sequences re-engage leads who never opened your first email, without any manual re-sending.',
                'tags'        => ['Email Campaigns', 'Follow-Ups', 'Sales Automation', 'CRM Features'],
                'image_path'  => 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=1200&q=80',
                'body' => <<<HTML
<p>Most leads don't say no. They just don't open the first email. A single send, with no follow-up, leaves a lot of real interest sitting untouched in an inbox nobody checked that week.</p>

<p>Lumenia CRM's Email Campaigns feature builds a follow-up sequence directly into every campaign, so the leads who missed your first message get a second, third, or fourth chance automatically, without anyone manually re-sending anything.</p>

<h2>A sequence that only reaches the people who need it</h2>
<p>Each campaign has its own <strong>Automated Follow-Up Sequence</strong> toggle, right on the create page. Turn it on, and you can add up to ten follow-up steps, each with its own delay and its own subject and body. Every step only sends to a lead who <strong>hasn't opened or clicked</strong> anything earlier in that same campaign — the moment someone engages, the sequence stops for them. Nobody gets three follow-ups after they've already replied.</p>

<h2>Let AI draft the whole sequence</h2>
<p>Writing four or five follow-up emails by hand, each with a slightly different angle, is its own time sink. The <strong>Generate with AI</strong> option drafts a complete sequence for you based on your campaign, ready to review and adjust before it goes live rather than starting from a blank page every time.</p>

<h2>Personalize at scale, not one email at a time</h2>
<p>Every campaign, original send or follow-up, supports personalization tokens like first name, company, and status, swapped in per recipient. Combined with the campaign page's live stats — sent, open rate, click rate, bounced, failed — you can see exactly which step in the sequence is doing the work and which one isn't, instead of guessing.</p>

<h2>Included on Pro and Premium</h2>
<p>Email Campaigns, including the automated follow-up sequences and AI-generated content, are part of the Pro and Premium plans. Starter and Free include the rest of the core CRM — leads, pipeline, invoicing, projects — without bulk email campaigns.</p>

<p>If your current process for following up is a recurring reminder to "check who hasn't replied," a sequence that does that check automatically, every day, without you opening a spreadsheet, tends to pay for the plan upgrade within the first recovered deal.</p>
HTML,
            ],
            [
                'title'       => 'Kanban or Timeline: Two Ways to See Your Sales Pipeline',
                'subtitle'    => 'A drag-and-drop board for the big picture, and a chronological view for exactly what happened and when.',
                'description' => 'Why Lumenia CRM gives you both a Kanban board and a Timeline view of your sales pipeline, and when to use each one.',
                'tags'        => ['Pipeline', 'Kanban', 'Sales Process', 'CRM Features'],
                'image_path'  => 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
                'body' => <<<HTML
<p>Every deal needs two different questions answered at different times: "where does everything stand right now?" and "what actually happened on this specific deal, in order?" A single view rarely answers both well, which is why Lumenia CRM's pipeline gives you two.</p>

<h2>Kanban: the whole pipeline at a glance</h2>
<p>The Kanban board is a column-per-stage view of every deal in flight. Drag a card between stages as a deal moves forward, filter by tag or status to focus on a segment of the pipeline, and see instantly what's stuck in one place too long. It's the view for a Monday pipeline review, or for a manager who wants the shape of the whole pipeline without reading a report.</p>

<h2>Timeline: the story of one lead</h2>
<p>Open any individual lead and the Timeline shows every logged event in order — emails sent and opened, calls made with their recordings, WhatsApp messages once that's live, notes, and stage changes, all on one chronological thread. When you're prepping for a call, this is what you read first: not a summary, but exactly what was said and when, so you're never starting a conversation without the context of everything that came before it.</p>

<h2>Why both matter</h2>
<p>A board without a timeline tells you a deal is "stuck in Proposal" but not why. A timeline without a board tells you everything about one lead but nothing about the twenty others waiting behind it. Lumenia CRM keeps both views a click apart, so switching between "what's the state of everything" and "what's the story of this one thing" doesn't mean switching tools.</p>

<h2>Included on every plan</h2>
<p>Both the Kanban board and the per-lead Timeline are core CRM features, included on the Free plan and every paid tier above it — they're not something you have to upgrade to unlock. What changes as you move up the plans is how many leads and team members you can run through them, and which additional channels (Dialer, Email Campaigns) feed activity into that timeline.</p>
HTML,
            ],
            [
                'title'       => 'Free, Starter, Pro, or Premium: Which Lumenia CRM Plan Fits Your Team?',
                'subtitle'    => 'A plain-language breakdown of what each tier actually includes, so you can pick the right one the first time.',
                'description' => 'A breakdown of Lumenia CRM\'s Free, Starter, Pro, and Premium plans — what each tier includes, who each one is built for, and what changes as you move up.',
                'tags'        => ['Pricing', 'Plans', 'CRM Features'],
                'image_path'  => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
                'body' => <<<HTML
<p>Picking a CRM plan shouldn't require a spreadsheet of your own. Here's what each Lumenia CRM tier actually includes, in plain language, so you can pick the right one without a sales call.</p>

<h2>Free — everything you need to get organized</h2>
<p>The Free plan is free forever, not a trial. It includes core lead and pipeline management, the Kanban board and Timeline view, AI-powered lead search, projects, client invoicing, CSV and Google Sheets import/export, reporting, and roles and permissions for your team — capped at 200 leads and 20 team members. It's built for a team that wants to get organized before deciding whether to pay for anything at all.</p>

<h2>Starter — add the Dialer</h2>
<p>Starter includes everything in Free, removes the lead and team-member caps entirely, and adds the built-in Dialer — bring-your-own Twilio calling with automatic call logging, recordings, and SMS, all landing on the lead timeline. It's the right tier for a team that's outgrown Free's limits and calls leads directly as part of their process.</p>

<h2>Pro — add Email Campaigns</h2>
<p>Pro includes everything in Starter, plus Email Campaigns: bulk sends with personalization tokens, open and click tracking, and automated, AI-generated follow-up sequences that re-engage anyone who didn't open the first email. It's built for teams running structured outreach at volume, not just one-to-one calls and manual emails.</p>

<h2>Premium — ready for what's next</h2>
<p>Premium includes everything in Pro. It's also the plan that will unlock WhatsApp Campaigns and an automated WhatsApp bot the moment that feature launches publicly, so Premium subscribers are set up to get it first, with nothing extra to configure.</p>

<h2>Picking between them</h2>
<p>A simple way to think about it: start on Free if you're still deciding. Move to Starter the moment calling leads directly becomes part of your daily process. Move to Pro when one-to-one outreach isn't enough volume anymore and you need real campaigns. Premium is for teams that want to be first in line for WhatsApp once it ships, with everything else Pro offers already included.</p>

<p>Every plan, including Free, includes the same core CRM — leads, pipeline, projects, invoicing, reporting, and role-based permissions. What changes between tiers is capacity and which outreach channels are switched on, not whether you get the actual CRM.</p>
HTML,
            ],
        ];

        foreach ($posts as $i => $post) {
            $slug = Str::slug($post['title']);

            Blog::updateOrCreate(
                ['slug' => $slug],
                [
                    'title'        => $post['title'],
                    'subtitle'     => $post['subtitle'],
                    'description'  => $post['description'],
                    'body'         => $post['body'],
                    'image_path'   => $post['image_path'],
                    'tags'         => $post['tags'],
                    'is_published' => true,
                    'published_at' => now()->subDays(count($posts) - $i),
                    'created_by'   => null,
                ]
            );
        }
    }
}
