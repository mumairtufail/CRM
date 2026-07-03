import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Head, Link } from '@inertiajs/react'
import AppLayout from '@/Components/Layout/AppLayout'
import {
  BookOpen, Search, Rocket, LayoutDashboard, Users, UsersRound, Tag,
  Kanban, Upload, Sparkles, Mail, MousePointerClick, Inbox, Briefcase,
  FolderKanban, FileText, Bell, Settings, ShieldCheck, ChevronRight,
  Lightbulb, AlertTriangle, Info, ArrowUp,
  MessageCircle, BarChart3, LifeBuoy, Shield, ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ──────────────────────────────────────────────────────────────────────────
   Small presentational helpers — keep the long-form content readable.
   ────────────────────────────────────────────────────────────────────────── */

function Lead({ children }) {
  return <p className="text-[13.5px] text-slate-600 leading-relaxed">{children}</p>
}

function SubHead({ children }) {
  return <h3 className="text-[13px] font-semibold text-slate-800 mt-5 mb-2">{children}</h3>
}

function Steps({ items }) {
  return (
    <ol className="space-y-2 mt-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="shrink-0 w-5 h-5 rounded-full bg-violet-100 text-violet-700 text-[11px] font-bold flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          <span className="text-[13px] text-slate-600 leading-relaxed">{item}</span>
        </li>
      ))}
    </ol>
  )
}

function Bullets({ items }) {
  return (
    <ul className="space-y-1.5 mt-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-[13px] text-slate-600 leading-relaxed">
          <ChevronRight size={14} className="shrink-0 mt-0.5 text-violet-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

const CALLOUT_STYLES = {
  tip:     { wrap: 'bg-violet-50 border-violet-100 text-violet-800', icon: Lightbulb,     iconColor: 'text-violet-500' },
  note:    { wrap: 'bg-blue-50 border-blue-100 text-blue-800',       icon: Info,          iconColor: 'text-blue-500' },
  warning: { wrap: 'bg-amber-50 border-amber-100 text-amber-800',    icon: AlertTriangle, iconColor: 'text-amber-500' },
}

function Callout({ type = 'tip', children }) {
  const s = CALLOUT_STYLES[type]
  const Icon = s.icon
  return (
    <div className={cn('flex gap-2.5 rounded-xl border px-3.5 py-2.5 mt-3 text-[12.5px] leading-relaxed', s.wrap)}>
      <Icon size={15} className={cn('shrink-0 mt-0.5', s.iconColor)} />
      <div>{children}</div>
    </div>
  )
}

function Token({ children }) {
  return (
    <code className="px-1.5 py-0.5 rounded-md bg-slate-100 text-violet-700 text-[12px] font-mono border border-slate-200">
      {children}
    </code>
  )
}

function MiniTable({ head, rows }) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {head.map((h, i) => (
              <th key={i} className="text-left font-semibold text-slate-500 px-3.5 py-2">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className={cn('px-3.5 py-2 align-top', j === 0 ? 'font-medium text-slate-700 whitespace-nowrap' : 'text-slate-500')}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   Section content. Each entry becomes a navigable, searchable block.
   `keywords` powers the search box (matched against title + keywords).
   ────────────────────────────────────────────────────────────────────────── */

function buildSections() {
  return [
    {
      id: 'getting-started', title: 'Getting Started', icon: Rocket,
      keywords: 'register login account workspace password setup onboarding sign up',
      body: (
        <>
          <Lead>Create your account, sign in, and get set up in minutes. Registering automatically creates your own private <strong>workspace</strong> — your data is never visible to other companies.</Lead>
          <SubHead>Create your account</SubHead>
          <Steps items={[
            <>Click <strong>Register</strong> and enter your name, email, and a password.</>,
            <>Submit — your private workspace is created and you become its <strong>owner</strong>.</>,
            <>Open the verification email and click the link to confirm your address.</>,
          ]} />
          <SubHead>First-time setup checklist</SubHead>
          <Steps items={[
            <><strong>Connect your email</strong> in <em>Settings → SMTP Accounts</em> (needed before sending campaigns).</>,
            <><strong>Add company details &amp; logo</strong> in <em>Settings → Workspace</em> — these brand your emails and public form.</>,
            <><strong>Import your leads</strong> from a spreadsheet, or add them by hand.</>,
            <><strong>Send your first campaign</strong> once you have leads and a connected email.</>,
          ]} />
          <Callout type="tip">Forgot your password? Use <strong>Forgot your password?</strong> on the login page to get a reset link by email.</Callout>
        </>
      ),
    },
    {
      id: 'dashboard', title: 'The Dashboard', icon: LayoutDashboard,
      keywords: 'home stats charts overview metrics activity widgets agent owner performance',
      body: (
        <>
          <Lead>Your home screen — a one-glance summary of your business. Click any card or list item to jump straight to the related page.</Lead>
          <Callout type="note">What you see depends on your <strong>role</strong>. The <strong>owner</strong> (and anyone given the "View organization-wide dashboard" permission) sees the full picture below. Everyone else sees their own performance instead — see "Agent view" further down.</Callout>
          <SubHead>Stat cards</SubHead>
          <Lead>Totals with up/down trends: <strong>Total Leads, Won This Month, Emails Sent, Open Deals / Pipeline Value,</strong> and <strong>Conversion Rate</strong> (how many leads turn into wins).</Lead>
          <SubHead>Charts &amp; lists</SubHead>
          <Bullets items={[
            <><strong>Lead Sources</strong> — where leads came from (manual, import, AI, public form).</>,
            <><strong>Lead Status / Funnel</strong> — how many leads sit at each stage.</>,
            <><strong>Leads Over Time</strong> — new leads over the last 30 days.</>,
            <><strong>Recent Activity</strong> — a live feed of notes, emails, calls, and status changes.</>,
            <><strong>Follow-ups Due</strong> — leads to contact this week (overdue shown in red).</>,
          ]} />
          <SubHead>Agent view</SubHead>
          <Lead>A team member without organization-wide access sees a personal version instead, scoped only to leads assigned to them: <strong>Leads Assigned, Leads Contacted, Emails Sent, Calls Made,</strong> and <strong>Follow-ups Due</strong> — plus their own recent activity and upcoming follow-ups. Nothing from other teammates' leads shows up here.</Lead>
        </>
      ),
    },
    {
      id: 'leads', title: 'Leads', icon: Users,
      keywords: 'lead prospect contact create edit delete filter search status priority convert client emails phones assign assigned owner call channel',
      body: (
        <>
          <Lead>A <strong>lead</strong> is anyone you might do business with — the heart of the CRM. Go to <em>Leads → All Leads</em>.</Lead>
          <SubHead>Find &amp; filter</SubHead>
          <Bullets items={[
            <><strong>Search</strong> by name, email, or company.</>,
            <><strong>Filter</strong> by status and priority; click a column header to sort. 20 per page.</>,
            <>Change a lead's <strong>status right in the row</strong> using its dropdown.</>,
          ]} />
          <SubHead>Bulk actions</SubHead>
          <Steps items={[
            <>Tick the checkboxes beside leads (or the header box for the whole page).</>,
            <>Use the action bar to <strong>Delete</strong> them or <strong>Add to Group</strong>.</>,
          ]} />
          <SubHead>Create a lead</SubHead>
          <Lead>Click <strong>New Lead</strong>. Only <strong>First Name</strong> is required. You can add multiple emails and phones (each marked work/personal/other, with one primary), social profiles, pipeline fields (source, status, priority, deal value, currency), location, and notes.</Lead>
          <SubHead>The lead detail page</SubHead>
          <Bullets items={[
            <>Full contact info, pipeline details, tags, and mini-stats (emails sent, days known).</>,
            <><strong>Activity timeline</strong> — every note, email, call, WhatsApp message, and status change with timestamps.</>,
            <><strong>Mark contact channels</strong> — Email, <strong>Phone Call</strong>, LinkedIn, Instagram, Facebook, WhatsApp, Reddit, or Social — to record outreach and stamp "last contacted."</>,
            <><strong>Assigned to</strong> — if you have permission to assign leads, a dropdown on the lead page lets you hand it to a specific teammate (or leave it unassigned). New leads you create are assigned to you automatically.</>,
            <><strong>Convert to Client</strong> — turn a won lead into a customer; pick their starting status and confirm.</>,
          ]} />
          <SubHead>Statuses</SubHead>
          <Lead>New → Contacted → Qualified → Proposal → Negotiation → <strong>Won</strong> / <strong>Lost</strong> / <strong>Unqualified</strong>. Priorities are <span className="text-red-500 font-medium">High</span>, <span className="text-amber-500 font-medium">Medium</span>, and <span className="text-slate-400 font-medium">Low</span>.</Lead>
        </>
      ),
    },
    {
      id: 'groups', title: 'Lead Groups', icon: UsersRound,
      keywords: 'group segment audience bundle list members campaign',
      body: (
        <>
          <Lead>A <strong>group</strong> is a saved bundle of leads — perfect for organizing and for targeting a campaign. Go to <em>Leads → Groups</em>.</Lead>
          <Steps items={[
            <>Click <strong>New Group</strong>, give it a name, optional description, and a color.</>,
            <>Open a group and click <strong>Add Leads</strong> to search and add members (or add from the leads list using <em>Add to Group</em>).</>,
            <>When building a campaign, choose this group as the recipients.</>,
          ]} />
          <Callout type="tip">Groups stay independent of campaigns — reuse the same group for many campaigns over time.</Callout>
        </>
      ),
    },
    {
      id: 'tags', title: 'Tags', icon: Tag,
      keywords: 'tag label color category vip hot filter',
      body: (
        <>
          <Lead>Color-coded labels you attach to leads to categorize them ("VIP", "Hot lead", "Newsletter"). Go to <em>Tags</em>.</Lead>
          <Steps items={[
            <>Click <strong>New Tag</strong>, enter a name, pick a color, and save.</>,
            <>Add or remove tags on any lead's detail page. Each tag card shows how many leads use it.</>,
          ]} />
          <Callout type="note">When building a campaign with the <strong>Filter</strong> audience, you can target leads that have specific tags — a powerful way to reach exactly the right people.</Callout>
        </>
      ),
    },
    {
      id: 'pipeline', title: 'Pipeline (Kanban Board)', icon: Kanban,
      keywords: 'pipeline kanban board drag drop stage column deal value win rate',
      body: (
        <>
          <Lead>A visual board where each column is a sales stage and each lead is a card you drag between stages. Go to <em>Pipeline</em>.</Lead>
          <Bullets items={[
            <>One column per status, each showing the count, total value, and share of the pipeline.</>,
            <><strong>Drag &amp; drop</strong> a card to another column to change its status instantly.</>,
            <>Cards show name, company, deal value, and a colored border for priority; overdue follow-ups appear in red.</>,
            <>Toggle <strong>Kanban</strong> vs <strong>Table</strong> view; filter by search, priority, or source.</>,
          ]} />
        </>
      ),
    },
    {
      id: 'import', title: 'Importing Leads', icon: Upload,
      keywords: 'import csv google sheets upload spreadsheet bulk columns',
      body: (
        <>
          <Lead>Bring in many leads at once. Go to <em>Leads → Import</em>.</Lead>
          <SubHead>From a CSV file</SubHead>
          <Steps items={[
            <>Choose <strong>Upload CSV</strong> and drag in your <Token>.csv</Token> file (max 10 MB).</>,
            <>Review the preview of the first rows, then click <strong>Confirm Import</strong>.</>,
          ]} />
          <SubHead>From Google Sheets</SubHead>
          <Steps items={[
            <>In Google Sheets, set sharing to <strong>"Anyone with the link can view."</strong></>,
            <>Paste the sheet URL, click <strong>Fetch</strong> to preview, then <strong>Confirm Import</strong>.</>,
          ]} />
          <Callout type="warning"><strong>First Name is required</strong> — rows without it are skipped. Column names are matched flexibly ("First Name", "first_name", "firstname" all work). Recognized columns include name, company, job title, email, phone, website, LinkedIn, location, status, priority, and social handles.</Callout>
        </>
      ),
    },
    {
      id: 'ai-search', title: 'AI Lead Search', icon: Sparkles,
      keywords: 'ai apollo people data labs prospecting search generate find provider api key credits',
      body: (
        <>
          <Lead>Let an AI find brand-new prospects from a plain-English description, using Apollo.io or People Data Labs. Go to <em>Leads → AI Lead Search</em>.</Lead>
          <SubHead>One-time setup</SubHead>
          <Lead>In <em>Settings → Lead Generation</em>, choose your provider, paste your API key, click <strong>Test Connection</strong>, then <strong>Save</strong>.</Lead>
          <SubHead>Search &amp; import</SubHead>
          <Steps items={[
            <>Describe your ideal prospect, e.g. <em>"CTOs at SaaS companies in the US with 50–200 employees."</em></>,
            <>The AI builds filters (titles, seniority, industry, location, company size) — fine-tune them and click <strong>Run Search</strong>.</>,
            <>Tick the results you want and click <strong>Import Selected</strong>. Duplicates are skipped automatically.</>,
          ]} />
          <Callout type="note">Credits are only spent on new results — leads already in your CRM are filtered out. If you see "too many requests," wait a moment and retry.</Callout>
        </>
      ),
    },
    {
      id: 'campaigns', title: 'Email Campaigns', icon: Mail,
      keywords: 'campaign email bulk send recipients tokens personalization draft schedule stop resume retry log',
      body: (
        <>
          <Lead>Send one email to many leads at once and track who opens and clicks. Go to <em>Campaigns</em>.</Lead>
          <Callout type="warning">Connect a sending account in <em>Settings → SMTP Accounts</em> and make one <strong>active</strong> first — without it you can't send.</Callout>
          <SubHead>Create a campaign</SubHead>
          <Steps items={[
            <>Click <strong>New Campaign</strong> and give it a name (internal only).</>,
            <>Set the <strong>From</strong> account, <strong>Subject</strong>, and write the <strong>Body</strong> in the rich-text editor.</>,
            <>Choose recipients: <strong>All leads</strong>, <strong>Filter</strong> (status + tags), or a <strong>Group</strong>. A live count updates as you go.</>,
            <>Optionally apply a branded <strong>Template</strong>, then <strong>Save as draft</strong> or <strong>Send</strong>.</>,
          ]} />
          <SubHead>Personalization tokens</SubHead>
          <Lead>Drop these into the subject or body; they're swapped per recipient:</Lead>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {['{{first_name}}', '{{last_name}}', '{{name}}', '{{company}}', '{{email}}', '{{status}}'].map(t => (
              <Token key={t}>{t}</Token>
            ))}
          </div>
          <SubHead>Watch it send</SubHead>
          <Lead>The campaign page shows stat cards (sent, open rate, click rate, bounced, failed) and a live <strong>send log</strong> with status symbols. You can <strong>Stop</strong> and <strong>Resume</strong> at any time.</Lead>
          <MiniTable
            head={['Symbol', 'Meaning']}
            rows={[['⧖', 'Queued'], ['○', 'Pending'], ['✓', 'Sent'], ['◎', 'Opened'], ['◈', 'Clicked'], ['✗', 'Failed'], ['⚠', 'Bounced']]}
          />
          <Callout type="tip"><strong>Retry is safe.</strong> Re-sending a campaign only re-attempts the failures — people who already received it are skipped, so no one is emailed twice. Emails go out in batches (configurable in <em>Settings → Sending Limits</em>).</Callout>
        </>
      ),
    },
    {
      id: 'tracking', title: 'Email Tracking', icon: MousePointerClick,
      keywords: 'open click tracking pixel rate analytics measure limitations',
      body: (
        <>
          <Lead>When you send a campaign, the CRM automatically measures <strong>opens</strong> and <strong>clicks</strong>.</Lead>
          <Bullets items={[
            <><strong>Opens</strong> — a tiny invisible image records an open when the recipient's email app loads images.</>,
            <><strong>Clicks</strong> — every link is routed through the CRM, which records the click then sends the person straight to the destination.</>,
            <>See results on the campaign page: open/click rate cards and the per-person log (◎ opened, ◈ clicked).</>,
          ]} />
          <Callout type="note"><strong>Honest limits:</strong> apps that block images undercount opens; special links (mailto:, tel:, unsubscribe) aren't tracked; multiple clicks by one person count once; forwarded emails credit the original recipient.</Callout>
        </>
      ),
    },
    {
      id: 'whatsapp', title: 'WhatsApp', icon: MessageCircle,
      keywords: 'whatsapp bot automation knowledge base chat conversation campaign message qualify lead reply',
      body: (
        <>
          <Lead>WhatsApp runs on a shared, managed number — there's nothing for you to configure. If it's enabled for your workspace, go to <em>WhatsApp → Conversations</em> or <em>WhatsApp → WA Campaigns</em>.</Lead>
          <Callout type="note">Not seeing WhatsApp in your sidebar? It isn't turned on for your workspace yet — contact your account manager or support to enable it.</Callout>
          <SubHead>Knowledge base</SubHead>
          <Lead>Before the bot can answer anyone, write your <strong>knowledge base</strong> — short title-and-answer entries about your pricing, hours, what you offer, and anything customers ask often. Every automated reply is drafted <strong>only from what you've written here</strong>, so it sounds like your business, not a generic bot.</Lead>
          <SubHead>How a conversation becomes a lead</SubHead>
          <Steps items={[
            <>Someone messages your WhatsApp number.</>,
            <>The bot replies using your knowledge base, in seconds.</>,
            <>If the conversation shows real interest — asking about pricing, a demo, or booking a call — it's automatically turned into a lead and tagged, so it's waiting for you on your Leads list.</>,
            <>Every message stays on that lead's <strong>activity timeline</strong>, right next to their emails and calls.</>,
          ]} />
          <SubHead>Conversations</SubHead>
          <Lead>Open any thread to see the full back-and-forth and reply yourself at any time — your reply always overrides the bot. Message status (sent, delivered, read) is shown next to each bubble.</Lead>
          <SubHead>WA Campaigns</SubHead>
          <Lead>Send one WhatsApp message to many leads at once, the same way you would an email campaign — choose all leads, a filtered segment, or a group, personalize with tokens like <Token>{'{{first_name}}'}</Token>, and optionally add a single automatic follow-up message after a delay.</Lead>
        </>
      ),
    },
    {
      id: 'inbox', title: 'Inbox (Connected Email)', icon: Inbox,
      keywords: 'inbox imap email read reply compose sync star trash fetch',
      body: (
        <>
          <Lead>Read and reply to real email inside the CRM, with incoming mail linked to the matching lead. Go to <em>Inbox</em>.</Lead>
          <Callout type="warning">Requires an account with <strong>IMAP settings</strong> in <em>Settings → SMTP Accounts</em>. Without it, the Inbox shows a setup banner.</Callout>
          <Bullets items={[
            <>Folders: <strong>Inbox</strong>, <strong>Starred</strong>, <strong>Trash</strong>. Unread mail appears in bold.</>,
            <>Per email: mark read/unread, star, trash, restore, or delete permanently. Attachments download.</>,
            <><strong>Compose</strong> or <strong>Reply</strong> — sent through your active account.</>,
            <>Click <strong>Sync</strong> to fetch now; the CRM also checks automatically every 10 minutes.</>,
          ]} />
          <Callout type="tip">When new mail arrives from a known lead, you get a notification linking straight to that lead — replies never slip through the cracks.</Callout>
        </>
      ),
    },
    {
      id: 'clients', title: 'Clients', icon: Briefcase,
      keywords: 'client customer convert onboarding active inactive churned documents',
      body: (
        <>
          <Lead>A <strong>client</strong> is a lead who became a real customer. Go to <em>Clients</em>.</Lead>
          <Bullets items={[
            <>Status tabs: <strong>Onboarding</strong>, <strong>Active</strong>, <strong>Inactive</strong>, <strong>Churned</strong> (each with a count).</>,
            <>Create directly with <strong>New Client</strong>, or by converting a lead.</>,
            <>The detail page has inline-editable contact fields, linked projects/invoices/leads, and a <strong>Documents</strong> area to upload, download, and delete files.</>,
          ]} />
        </>
      ),
    },
    {
      id: 'projects', title: 'Projects', icon: FolderKanban,
      keywords: 'project task document deliver work planning active on hold completed budget',
      body: (
        <>
          <Lead>Work you deliver for a client, with its own tasks and files. Go to <em>Projects</em>.</Lead>
          <Steps items={[
            <>Click <strong>New Project</strong>, choose the client, set status, dates, budget, priority, and description.</>,
            <>Add <strong>Tasks</strong> with a title, priority, and due date; click to cycle Todo → In Progress → Done.</>,
            <>Upload, download, and delete project <strong>Documents</strong>.</>,
          ]} />
          <Lead>Statuses: Planning · Active · On Hold · Completed · Cancelled. The activity timeline records task and document changes.</Lead>
        </>
      ),
    },
    {
      id: 'invoices', title: 'Invoices', icon: FileText,
      keywords: 'invoice bill line item tax total send paid overdue draft pdf',
      body: (
        <>
          <Lead>Create and send bills, and track which are paid. Go to <em>Invoices</em>.</Lead>
          <Steps items={[
            <>Click <strong>New Invoice</strong> — the number auto-generates (e.g. INV-2026-001).</>,
            <>Pick the <strong>Bill to</strong> lead/client, set issue &amp; due dates and an optional tax rate.</>,
            <>Add <strong>line items</strong> (description, quantity, rate) — amounts, subtotal, tax, and total calculate automatically.</>,
            <>Use the live preview, then <strong>Save as draft</strong> or <strong>Send</strong>. Mark <strong>Paid</strong> when payment arrives.</>,
          ]} />
          <Lead>Statuses: <span className="text-slate-500 font-medium">Draft</span> · <span className="text-blue-500 font-medium">Sent</span> · <span className="text-emerald-500 font-medium">Paid</span> · <span className="text-red-500 font-medium">Overdue</span>. You can also print or download as PDF.</Lead>
        </>
      ),
    },
    {
      id: 'reports', title: 'Reports', icon: BarChart3,
      keywords: 'report analytics agent performance channel breakdown export activity date range',
      body: (
        <>
          <Lead>See how the whole team is performing, broken down by person and by channel. Go to <em>Reports</em>.</Lead>
          <Bullets items={[
            <>Pick a date range — last 7 days, 30 days, 90 days, or a custom range.</>,
            <><strong>Per-agent table</strong> — leads created, leads assigned, leads contacted, deals won, conversion rate, emails sent, and WhatsApp messages sent, for each active team member.</>,
            <><strong>Channel breakdown</strong> — how contact happened across email, WhatsApp, calls, and every other outreach channel.</>,
            <><strong>Activity log</strong> — every logged action in the period, filterable by team member or activity type.</>,
          ]} />
        </>
      ),
    },
    {
      id: 'notifications', title: 'Notifications', icon: Bell,
      keywords: 'notification bell alert unread mark read',
      body: (
        <>
          <Lead>The <strong>bell icon</strong> in the top bar keeps you informed, with a badge for unread alerts.</Lead>
          <Bullets items={[
            <>You're notified about a <strong>new lead</strong> from your public form and a <strong>new email</strong> from a known lead.</>,
            <>Click a notification to mark it read and jump to the related item.</>,
            <>Use <strong>Mark all read</strong> to clear the badge.</>,
          ]} />
        </>
      ),
    },
    {
      id: 'support', title: 'Support', icon: LifeBuoy,
      keywords: 'support help desk ticket case message contact platform admin',
      body: (
        <>
          <Lead>Stuck on something, or found a bug? Go to <em>Support</em> to open a case directly with the platform team — no need to leave the app.</Lead>
          <Steps items={[
            <>Click <strong>New Case</strong>, give it a subject, and describe the issue.</>,
            <>Reply any time to add more detail — each case keeps the full message history.</>,
            <>You'll get a notification when the platform team replies.</>,
          ]} />
        </>
      ),
    },
    {
      id: 'settings', title: 'Settings', icon: Settings,
      keywords: 'settings profile workspace smtp imap sending limits batch templates lead generation password logo signature',
      body: (
        <>
          <Lead>Manage your account, workspace, and email. Go to <em>Settings</em> — the left menu has these sections.</Lead>
          <SubHead>Profile</SubHead>
          <Lead>Update your name, email, avatar, and password. The danger zone lets you permanently delete your account (with password confirmation).</Lead>
          <SubHead>Workspace</SubHead>
          <Lead>Set your company name and logo, plus the website, phone, contact email, and LinkedIn that fill the <strong>signature</strong> built into every email template.</Lead>
          <SubHead>SMTP Accounts</SubHead>
          <Steps items={[
            <>Click <strong>Add account</strong> and optionally pick a <strong>Quick preset</strong> (Gmail, Outlook, Mailgun, SendGrid, SES…) to auto-fill technical fields.</>,
            <>Enter the From name/email, host, port, encryption, username, and password. Add IMAP details to enable the Inbox.</>,
            <>Use <strong>Test SMTP</strong> / <strong>Test IMAP</strong>, then set one account <strong>active</strong> (only one at a time).</>,
          ]} />
          <Callout type="tip">Gmail: enable 2-Factor Authentication, then create an <strong>App Password</strong> and use it as the password.</Callout>
          <SubHead>Sending Limits &amp; automated follow-ups</SubHead>
          <Lead>Control bulk send speed: <strong>batch size</strong> (emails per batch) and <strong>delay</strong> (seconds between batches). A provider-limits reference table is shown to help you choose.</Lead>
          <Lead>The <strong>Automated follow-ups</strong> toggle on this same page turns the feature on for your workspace. Once it's on, any campaign can add a follow-up sequence that automatically re-sends to leads who haven't opened the original email — you write the sequence once per campaign, then it runs on its own.</Lead>
          <SubHead>Templates</SubHead>
          <Lead>Choose one of <strong>three built-in designs</strong> to wrap your campaigns; <strong>Preview</strong> with the eye icon, or <strong>Deactivate</strong> for plain HTML.</Lead>
          <Callout type="note">There's no custom-template builder — to change branding, update your <strong>Workspace</strong> details and they flow into the signature automatically.</Callout>
          <SubHead>Lead Generation</SubHead>
          <Lead>Connect Apollo.io or People Data Labs with your API key (Test Connection, then Save) to power AI Lead Search.</Lead>
        </>
      ),
    },
    {
      id: 'team', title: 'Team &amp; Permissions', icon: Shield,
      keywords: 'team member role permission agent owner add invite deactivate roles manage',
      body: (
        <>
          <Lead>Bring teammates into your workspace and control exactly what each of them can see and do. Go to <em>Team</em> in the sidebar (only visible if you have access to it).</Lead>
          <SubHead>Team members</SubHead>
          <Steps items={[
            <>Click <strong>Add team member</strong> and fill in their name, email, a password, and a role.</>,
            <>They can sign in immediately with those details — there's no invite email to wait on.</>,
            <><strong>Edit</strong> a member to change their name, email, or role; <strong>Deactivate</strong> to block their login without losing their history (their past leads and activity stay exactly where they are).</>,
          ]} />
          <Callout type="note">The workspace <strong>owner</strong> always has full access to everything and never appears in this list — this page is for managing everyone else.</Callout>
          <SubHead>Roles &amp; permissions</SubHead>
          <Lead>Click <strong>Roles &amp; permissions</strong> to see every role in your workspace. A default <strong>Agent</strong> role is created automatically for every new workspace — it can be edited or deleted like any other role, as long as no one is currently assigned to it.</Lead>
          <Steps items={[
            <>Click <strong>New role</strong> (or edit an existing one) and give it a name.</>,
            <>Tick individual permissions, or use a group's <strong>select all</strong> checkbox (Leads, Pipeline, Campaigns, WhatsApp, Inbox, Clients &amp; Projects, Invoices, Team, Settings, Dashboard) to grant a whole category at once.</>,
            <>Save — every teammate with that role gets the new permissions right away.</>,
          ]} />
          <Callout type="tip">Permissions decide what shows up in someone's sidebar too — if a teammate can't see Team, Reports, or another section, it's because their role doesn't include it yet.</Callout>
        </>
      ),
    },
    {
      id: 'public-form', title: 'Lead Capture Forms', icon: ClipboardList,
      keywords: 'public intake form share link website embed lead capture builder fields',
      body: (
        <>
          <Lead>Build your own public web forms where anyone can submit their details — no login required for visitors. Go to <em>Forms</em>.</Lead>
          <Steps items={[
            <>Click <strong>New Form</strong>, name it, and add fields — built-in ones (First Name, Last Name, Email, Phone, Country, Notes, Budget) map straight onto the lead, or add your own custom text, number, dropdown, date, or long-answer fields.</>,
            <>Save — each form gets its own shareable link, shown on the Forms list.</>,
            <><strong>Toggle</strong> a form active or inactive any time, and edit its fields whenever you like.</>,
          ]} />
          <Bullets items={[
            <>Every workspace starts with one default form, ready to share immediately.</>,
            <>On submit: a new lead is created from the answers, you get a notification, and it appears instantly in Leads.</>,
            <>Share the link on your website, email signature, social bio, or a QR code.</>,
          ]} />
        </>
      ),
    },
    {
      id: 'admin', title: 'Admin Portal', icon: ShieldCheck,
      keywords: 'admin superadmin platform organizations users impersonate login guard separate',
      body: (
        <>
          <Callout type="note">The platform admin portal is a completely separate login at <Token>/admin/login</Token>, only for the people who run the platform itself. It isn't part of your workspace and regular users can never reach it.</Callout>
          <Bullets items={[
            <><strong>Admin Dashboard</strong> — platform-wide totals (organizations, users, leads, invoices).</>,
            <><strong>Users</strong> — search everyone and <strong>impersonate</strong> a user to troubleshoot (a banner lets you stop).</>,
            <><strong>Organizations</strong> — search all workspaces with owner and counts.</>,
          ]} />
        </>
      ),
    },
  ]
}

/* ────────────────────────────────────────────────────────────────────────── */

export default function Documentation() {
  const sections = useMemo(() => buildSections(), [])

  const [query, setQuery] = useState('')
  const [active, setActive] = useState(sections[0].id)
  const scrollRef = useRef(null)
  const sectionRefs = useRef({})

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sections
    return sections.filter(s =>
      s.title.toLowerCase().includes(q) || s.keywords.toLowerCase().includes(q)
    )
  }, [query, sections])

  // Scroll-spy — highlight the section currently in view.
  useEffect(() => {
    const root = scrollRef.current
    if (!root) return
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { root, rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    )
    filtered.forEach(s => {
      const el = sectionRefs.current[s.id]
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [filtered])

  const scrollTo = id => {
    const el = sectionRefs.current[id]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActive(id)
  }

  const scrollTop = () => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <>
      <Head title="Documentation" />
      <AppLayout title="Documentation" noPadding>

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
              <BookOpen size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-slate-800">Documentation</h1>
              <p className="text-[13px] text-slate-500 mt-0.5">Everything your CRM can do, and how to use it — even the smallest feature.</p>
            </div>
          </div>
        </div>

        {/* Two-column layout: stacked on mobile, side-by-side on desktop */}
        <div className="flex flex-col md:flex-row gap-0 min-h-0 flex-1">

          {/* Table of contents */}
          <div className="w-full md:w-60 md:shrink-0 border-b md:border-b-0 md:border-r border-slate-100 bg-white flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search the guide…"
                  className="w-full h-8 pl-7 pr-2 text-[12.5px] rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-violet-300 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Mobile: horizontal scrollable chip strip */}
            <nav className="flex md:hidden overflow-x-auto gap-1 p-2 scrollbar-none">
              {filtered.length === 0 && (
                <p className="text-[12px] text-slate-400 px-3 py-2 whitespace-nowrap">No sections match "{query}".</p>
              )}
              {filtered.map(({ id, title, icon: Icon }) => {
                const isActive = active === id
                return (
                  <button key={id} onClick={() => scrollTo(id)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all shrink-0',
                      isActive ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-100'
                    )}>
                    <Icon size={13} className={isActive ? 'text-violet-500' : 'text-slate-400'} />
                    {title}
                  </button>
                )
              })}
            </nav>

            {/* Desktop: vertical nav list */}
            <nav className="hidden md:flex md:flex-1 md:overflow-y-auto flex-col p-2 space-y-0.5">
              {filtered.length === 0 && (
                <p className="text-[12px] text-slate-400 px-3 py-4 text-center">No sections match "{query}".</p>
              )}
              {filtered.map(({ id, title, icon: Icon }) => {
                const isActive = active === id
                return (
                  <button key={id} onClick={() => scrollTo(id)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-medium text-left transition-all',
                      isActive ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                    )}>
                    <Icon size={14} className={isActive ? 'text-violet-500' : 'text-slate-400'} />
                    <span className="flex-1 truncate">{title}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div ref={scrollRef} className="flex-1 min-w-0 min-h-0 overflow-y-auto bg-slate-50 relative">
            <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
              {filtered.map(({ id, title, icon: Icon, body }) => (
                <section
                  key={id}
                  id={id}
                  ref={el => (sectionRefs.current[id] = el)}
                  className="scroll-mt-4 rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-slate-100">
                    <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-violet-600" />
                    </div>
                    <h2 className="text-[15px] font-bold text-slate-800">{title}</h2>
                  </div>
                  {body}
                </section>
              ))}

              {filtered.length > 0 && (
                <p className="text-center text-[12px] text-slate-400 pt-2 pb-6">
                  That's the whole tour — happy selling! 🚀
                </p>
              )}
            </div>

            {/* Back to top */}
            <button onClick={scrollTop}
              className="sticky bottom-4 ml-auto mr-4 flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-[12px] font-medium text-slate-600 hover:text-violet-700 hover:border-violet-200 transition-all">
              <ArrowUp size={13} /> Top
            </button>
          </div>
        </div>

      </AppLayout>
    </>
  )
}
