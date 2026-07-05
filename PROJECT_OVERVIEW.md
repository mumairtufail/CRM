# LumeniaCRM — Project Overview

Information reference only — what currently exists in the codebase, section by section. Not a design spec, not a roadmap.

Stack: Laravel 12/13 + Inertia.js + React + Tailwind (shadcn/ui components). Internal legacy name in some UI copy: "LeadFlow".

---

## 1. Color Scheme (exact values in use)

**Brand core**
- Primary violet: `#7C3AED`
- Gradient partner (indigo): `#4F46E5`
- Lighter violet accent: `#8B5CF6`
- Deep violet: `#6D28D9` / `#6425D0`
- Light-mode CSS variables (`resources/css/app.css`, HSL): `--primary: 262 83% 58%` (= `#7C3AED`), `--accent: 340 60% 58%` (pink/rose), `--background: 248 100% 98%` (near-white, faint violet tint), `--foreground: 251 25% 12%` (near-black navy-violet text), `--destructive: 0 72% 51%` (red), `--radius: 0.75rem`.

**Dark surfaces** (landing page sections, admin sidebar, chat widget) — a family of near-black violet-tinted darks, not a single flat black:
`#030208`, `#06050D`, `#07050F`, `#08060F`, `#0A0812`, `#0C0815`, `#0D0A1A`, `#0D0B18`, `#0F0C1E`, `#130F22`, `#150F29`, `#1B1330`, `#241A44`.
Admin sidebar background specifically: `linear-gradient(180deg, #0D0B18 0%, #130F22 50%, #0F0D1C 100%)`.

**Supporting accents** (feature icons, status colors, charts)
- Blue: `#3B82F6`
- Emerald/green (success, "online" dots): `#10B981`
- Amber (warning): `#F59E0B`
- Teal: `#14B8A6`
- Pink/rose: `#EC4899`, unread badge: rose-500
- WhatsApp brand green: `#25D366`
- Destructive/error: red (`#0 72% 51%` HSL / Tailwind `red-500`-ish)

**Typography**: Poppins (Google Fonts), all weights 300–800.

**Component system**: shadcn/ui (Radix primitives) + `tailwindcss-animate`, admin/tenant panels light-themed on white/slate-50 surfaces with violet accents; public landing page and the chat widget are dark-themed.

---

## 2. Multi-Tenancy Model

- Row-level tenancy: every tenant-owned table has an `organization_id` column.
- `BelongsToTenant` trait (`app/Models/Concerns/BelongsToTenant.php`) applies a global Eloquent scope to auto-filter every query to the current organization (resolved via a `TenantContext` singleton) and auto-stamps `organization_id` on create. Supports "shared/global" null-org rows visible to all tenants where relevant.
- `ResolveTenant` middleware resolves the active organization per-request — supports subdomain-based resolution (`acme.crm.test`) with fallback to the authenticated user's own organization; 403s if the two disagree, 404s if a subdomain matches nothing.
- Two separate auth guards: `web` (provider `users` — the tenant `User` model, organization owners/members) and `admin` (provider `admins` — the separate `Admin` model, its own login at `/admin/login`, entirely separate session/guard from tenant auth).

---

## 3. Public-Facing Pages (no auth required)

**Landing page** (`/`, `Pages/Welcome.jsx`) — sections in order:
Nav → Hero (headline, CTA, testimonial avatar strip) → Integration strip ("Works with": Gmail, Outlook, WhatsApp Business, SendGrid, Mailgun, Brevo, Google Sheets, CSV Import) → Stats (500+ workspaces, 50k+ leads tracked, 99.9% uptime, 4.9★ rating) → Features (`#features`: Lead Management, Email Campaigns, Sales Pipeline, Invoicing, AI Prospecting, Clients & Projects) → AI Data Partners / AI Prospecting showcase (`#integrations`) → Pipeline highlight → Campaign highlight → WhatsApp Automation → Lead History Timeline (mock activity feed) → How it works (`#how-it-works`: create workspace → add leads → work your pipeline) → Automation + Business Impact → Testimonials → Free Tools Showcase (`#free-tools`) → Pricing (`#pricing`, pulls live plan data) → FAQ (`#faq`) → Contact Us (`#contact`: email/phone/HQ + contact form) → Final CTA → Footer.
Also includes the live **AI chat widget** (floating, bottom-right; see §6).

**Blog** — public index (paginated, 9/page, tags/author/read-time) and single-post view by slug.

**Public lead-capture Forms** — tenant-built forms rendered at `/f/{slug}`, with view/submit/autosave of partial progress.

**Sitemap** — `/sitemap.xml`, dynamically generated (homepage, blog index, every published post).

**Contact form** — `POST /contact`, feeds the Admin "Contact Messages" inbox.

**Free public Tools** (`/tools`, no auth) — Email Signature Generator, Invoice Generator, Proposal Writer, UTM Builder (also mirrored inside the authenticated app, see §4).

---

## 4. Tenant-Facing App (the CRM itself)

- **Dashboard** — role-aware. Owners/permitted users get an org-wide view (total leads, month-over-month %, deals won, emails sent, open pipeline value, conversion rate, 30-day leads-over-time chart, status/source breakdown pies, recent leads, top deals, upcoming follow-ups, activity feed). Regular members get an agent view scoped to their own assigned leads.
- **Leads** — core contact/lead records, full-text search, bulk delete/add-to-group, status/channel updates, assignment (permission-gated), one-click convert to Client. Each lead has multiple emails/phones, tags, group memberships, activity timeline, sends, invoices.
- **Pipeline** — Kanban board across 8 fixed stages (new, contacted, qualified, proposal, negotiation, won, lost, unqualified), up to 100 leads/column, deal value/currency, priority, source, per-status totals.
- **AI Lead Generation** — natural-language ICP prompt → parsed into structured filters (rule-based or AI-assisted) → searched against a tenant-configured external provider (Apollo.io or People Data Labs, tenant's own API key) → de-duplicated → imported straight into Leads.
- **Import** — CSV upload or Google Sheets import, column mapping/preview, downloadable template, confirm/cancel jobs.
- **Clients** — converted leads; documents; linked projects.
- **Projects** — per-client projects with tasks and documents.
- **Invoices** — line-item invoices tied to a lead (subtotal/tax/total, issue/due dates, status), "send to client" email action.
- **Campaigns (Email)** — gated to Pro+ plans. Bulk email to a group/form audience; send/stop/resume-followups/clone/log; automatic follow-up sequences for non-openers; open/click tracking.
- **WhatsApp** — gated to Premium:
  - *Campaigns* — bulk WhatsApp broadcasts to groups.
  - *Conversations* — two-way WhatsApp inbox per lead.
  - *Status* — read-only status/quota page (tenants never hold their own Meta credentials — centrally pooled by the platform admin).
  - Auto-reply bot uses the org's AI provider + a per-tenant knowledge base + conversation history, with basic lead-qualification keyword detection.
- **Inbox** — IMAP-connected mailbox: sync, inbox/sent/starred/trash, mark read/starred, trash/restore/delete, compose+send via the tenant's active SMTP credential.
- **Groups** — named/colored lead segments used as campaign audiences.
- **Forms** — public lead-capture form builder (slug, active toggle, slug-availability check); submissions become Leads.
- **Reports** — analytics dashboard with date-range presets: Leads Over Time, Funnel, Channel Breakdown, Agent Performance, Top Countries, Top Cities, Activity Feed.
- **Support** — self-service ticketing (subject + body, threaded replies, open/pending/closed status); also visible cross-tenant from the Admin panel.
- **Tools** (authenticated mirror of the public tools) — Hub, Email Signature Generator, Invoice Generator, Proposal Writer, UTM Builder.
- **Notifications** — in-app center (lead created / email received / replied / opened / clicked), mark read/clear/delete.
- **Documentation** — static, searchable in-app user guide covering every feature area plus Team & Permissions and the Admin Portal.
- **Profile / Settings** (tabbed hub) — Profile (name/email/password/delete account), Workspace (company name/logo/website/phone/email/LinkedIn), Tags (create/edit/delete), SMTP Accounts (multiple, activate/test SMTP+IMAP), Sending Limits/Mail (batch size/delay, org-wide follow-up toggle), Templates (built-in only, activate/preview), AI Provider (per-tenant Claude/OpenAI/Kimi config + test), Lead Generation provider (Apollo.io / PDL + API key), WhatsApp (read-only status), Maintenance (clear leads cache).
- **Settings → Team** — invite/edit/remove members, assign roles (permission-gated).
- **Settings → Roles** — custom roles with granular, group-checkable permissions across every module (permission-gated).

---

## 5. Admin / Super-Admin Panel (`/admin`, separate `admin` guard)

- **Dashboard** — platform-wide overview.
- **Users** — cross-tenant user list, search/filter by role, impersonation ("log in as" + "leave impersonation").
- **Organizations** — every tenant workspace; change subscription plan and plan status (active/inactive); delete single or bulk.
- **Plans** — CRUD for the 3 subscription tiers: name/slug/tagline/description, monthly & yearly price (+ struck-through "original" price), featured flag, sort order, CTA text, and which feature Modules the plan unlocks; toggle active, delete.
- **Blogs** — full CMS: create/edit/publish-toggle/delete, plus AI-assisted content generation and AI SEO suggestions.
- **Contact Messages** — inbox for the public contact form; mark read/unread, delete.
- **Support Cases** — cross-tenant view of every ticket; reply, change status.
- **WhatsApp** (one page, 3 tabs) — Settings (pooled Meta Cloud API credentials + test), Tenants (per-org access/quota), Inbound (unassigned/unmatched inbound messages — assign or ignore).
- **Chatbot Conversations** — browse recorded transcripts of the public-site AI chatbot; view/delete individual conversations.
- **SMTP Settings** — platform-level outbound SMTP (system emails), with test-send.
- **Settings** (single page, tabbed):
  - **Account** — admin name/email/password.
  - **SMTP / Email** — same platform SMTP config.
  - **Branding** — custom logo upload, downloadable default branding assets, reset.
  - **AI Configuration** — platform-level AI provider (Claude/OpenAI/Kimi) used by blog AI tools and the public chatbot: API key, model, base URL, active toggle, connection test. Model catalog: Claude (Opus 4.8/4.5, Sonnet 4.6/3.7/3.5, Haiku 4.5/3.5), OpenAI (GPT-4o, GPT-4o mini, GPT-4 Turbo, GPT-3.5 Turbo, o3-mini, o1-mini, o1), Kimi/NVIDIA NIM (Kimi K2/K2.6, Llama 3.1 Nemotron 70B, Llama 3.1 405B, Mistral Nemo Minitron 8B, DeepSeek R1).
  - **AI Chatbot** — enable/disable the public landing-page chat widget, agent display name, welcome message, system prompt (editable, with a built-in default fallback), and a Knowledge Base manager (title/content/active/sort-order entries) that grounds the chatbot's answers; link into Recorded Conversations.
  - **SEO & Indexing** — default meta title/description/keywords, robots rules, sitemap status/link.

---

## 6. AI Chatbot (public landing-page widget) — current state

- Floating widget, bottom-right, dark themed to match the landing page; toggle open/close, message history persisted in the visitor's browser (localStorage) across reloads.
- Backed by `POST /chatbot/message` (IP-throttled 20/min, no auth).
- Every visitor session recorded server-side as its own conversation + full message transcript (`ChatbotConversation` / `ChatbotMessage`), browsable/searchable/deletable from Admin → Chatbot Chats.
- Answers are generated using the platform's configured AI provider (same one used for admin blog tools), grounded in the admin-managed Knowledge Base — instructed not to invent facts outside it.
- Persona/system prompt and agent display name are admin-editable; if the visitor directly asks whether it's a bot, it answers honestly rather than claiming to be human.
- A starter knowledge base seeder exists (`database/seeders/ChatbotKnowledgeSeeder.php`) with entries on: what the product is, plans & pricing, core features, WhatsApp automation, security/workspace isolation, getting started, integrations, and support — runnable anytime with `php artisan db:seed --class=ChatbotKnowledgeSeeder`.

---

## 7. Core Domain Models (`app/Models`)

Activity, Admin, AiProviderSetting, Blog, ChatbotConversation, ChatbotMessage, ChatbotKnowledgeEntry, Client, ClientDocument, ContactMessage, EmailCampaign, EmailSend, EmailTemplate, FetchedEmail, FormSession, ImportJob, Invoice, InvoiceItem, Lead, LeadEmail, LeadPhone, LeadForm, LeadGroup, Module, Notification, Organization, Permission, Plan, PlatformWhatsappCredential, Project, ProjectDocument, ProjectTask, Role, SmtpCredential, SupportCase, SupportCaseMessage, SystemSetting, Tag, TenantWhatsappSettings, User, WhatsappCampaign, WhatsappSend, WhatsappConversation, WhatsappCredentialAuditLog, WhatsappKnowledgeBase, WhatsappMessage, WhatsappTemplate, WhatsappUnassignedInbound, WhatsappUsageMonthly.

(One line each, informally: `Lead` is the central CRM record; `Organization` is the tenant; `SystemSetting` is the generic platform key/value store backing SMTP/AI/chatbot/SEO/branding config; the rest are named for what they hold.)

---

## 8. Key Integrations & Automations

- **Email (SMTP/IMAP)** — `MailService` sends via a per-tenant, per-user active SMTP credential (dynamic mailer config per send); IMAP paired for the Inbox feature; separate superadmin SMTP path for system emails.
- **WhatsApp Business Cloud API** — `WhatsappService` wraps Meta's Cloud API using centrally pooled platform credentials (tenants never hold their own Meta app credentials); inbound webhook is signature-validated; unmatched inbound messages queue for admin triage.
- **AI provider integration (Claude / OpenAI / Kimi)** — `AiService` is a single dispatcher (per-org, per-current-tenant, or per-admin) that talks to Anthropic's API directly, or any OpenAI-compatible endpoint (OpenAI itself, or Kimi via NVIDIA NIM). Reused across: AI Lead Generation prompt parsing, the WhatsApp bot, the public AI Chatbot, and Admin blog AI tools.
- **Lead import** — CSV or Google Sheets, with column mapping/preview and job tracking.
- **AI-powered lead prospecting** — pluggable providers (Apollo.io, People Data Labs); free-text ICP → structured filters → provider search → de-dupe → import.
- **Invoicing** — in-app CRUD with tax calc and an emailed "send to client" action; a standalone free Invoice Generator tool also exists (public + authenticated).

---

## 9. Subscription Plans & Feature Gating

| Plan | Price (mo / yr) | Modules unlocked |
|---|---|---|
| **Basic** | $29 / $290 (was $39 / $390) | none — core CRM only (up to 500 leads, 1 pipeline, basic invoicing) |
| **Pro** (featured) | $79 / $790 (was $99 / $990) | `email_campaigns` — unlimited leads/pipelines, automated email campaigns, advanced reports |
| **Premium** | $149 / $1490 (was $199 / $1990) | `email_campaigns`, `whatsapp_campaigns`, `whatsapp_automation` — WhatsApp broadcast campaigns, the WhatsApp auto-response bot, priority support |

Gating is enforced at the route layer via `module:{key}` middleware, which checks the organization's assigned plan and 403s with an upgrade prompt if a module isn't included. Plans, pricing, and module assignments are all editable from Admin → Plans; each organization's plan/status is changeable from Admin → Organizations.
