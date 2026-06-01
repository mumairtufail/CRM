# CRM App — Project Overview

**Stack:** Laravel 12 + Inertia.js + React 18 (JSX) + shadcn/ui + Tailwind CSS v3  
**Database:** MySQL  
**Last build:** 2026-06-01

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Database Schema](#2-database-schema)
3. [Backend — Models](#3-backend--models)
4. [Backend — Controllers](#4-backend--controllers)
5. [Backend — Services, Jobs & Mail](#5-backend--services-jobs--mail)
6. [Routes](#6-routes)
7. [Frontend — Pages](#7-frontend--pages)
8. [Frontend — Layout Components](#8-frontend--layout-components)
9. [Frontend — Common Components](#9-frontend--common-components)
10. [Frontend — shadcn UI Components](#10-frontend--shadcn-ui-components)
11. [Design System](#11-design-system)
12. [Seeders & Factories](#12-seeders--factories)
13. [Key Dependencies](#13-key-dependencies)
14. [Admin Credentials](#14-admin-credentials)

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Backend framework | Laravel 12 |
| Frontend bridge | Inertia.js v2 |
| Frontend UI | React 18 (JSX) |
| Component library | shadcn/ui (Radix UI primitives) |
| Styling | Tailwind CSS v3 |
| Forms | React Hook Form + Zod |
| Tables | TanStack Table v8 (server-side pagination) |
| Charts | Recharts |
| Icons | lucide-react |
| Toasts | Sonner |
| Animations | Framer Motion |
| Rich text editor | Tiptap v3 |
| Drag & drop | @dnd-kit |
| Date utilities | date-fns |
| Auth scaffolding | Laravel Breeze |
| API auth | Laravel Sanctum |
| JS routes | Ziggy |
| Build tool | Vite 5 |

---

## 2. Database Schema

### Tables

#### `users`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| name | string | |
| email | string unique | |
| password | string | hashed |
| email_verified_at | timestamp | nullable |
| company_name | string | nullable |
| company_logo | string | nullable, path |
| mail_batch_size | int | default 50 |
| mail_batch_delay | int | seconds delay between batches |
| remember_token | string | |
| timestamps | | |

#### `leads`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| first_name | string | |
| last_name | string | nullable |
| company | string | nullable |
| job_title | string | nullable |
| website | string | nullable |
| linkedin_url | string | nullable |
| notes | text | nullable |
| source | string | nullable (e.g. referral, website) |
| status | string | new / contacted / qualified / proposal / negotiation / won / lost / unqualified |
| priority | string | low / medium / high |
| deal_value | decimal | nullable |
| currency | string | default USD |
| location | string | nullable |
| industry | string | nullable |
| avatar_url | string | nullable |
| social_handles | json | nullable |
| last_contacted_at | timestamp | nullable |
| follow_up_at | timestamp | nullable, indexed |
| deleted_at | timestamp | soft deletes |
| timestamps | | |

**Indexes:** status, source, follow_up_at

#### `lead_emails`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| lead_id | FK → leads | |
| email | string | |
| is_primary | boolean | default false |
| timestamps | | |

#### `lead_phones`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| lead_id | FK → leads | |
| phone | string | |
| is_primary | boolean | default false |
| timestamps | | |

#### `tags`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| name | string | |
| color | string | hex color |
| timestamps | | |

#### `lead_tag` (pivot)
| Column | Type |
|---|---|
| lead_id | FK → leads |
| tag_id | FK → tags |

#### `activities`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| lead_id | FK → leads | |
| type | string | note / email_sent / call / status_change / import |
| description | text | |
| meta | json | nullable |
| timestamps | | |

#### `email_campaigns`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| user_id | FK → users | |
| name | string | |
| subject | string | |
| body_html | longtext | |
| body_text | text | nullable |
| status | string | draft / sending / sent / paused |
| from_name | string | |
| from_email | string | |
| filters | json | recipient filter criteria |
| total_recipients | int | default 0 |
| sent_count | int | default 0 |
| opened_count | int | default 0 |
| clicked_count | int | default 0 |
| bounced_count | int | default 0 |
| unsubscribed_count | int | default 0 |
| deleted_at | timestamp | soft deletes |
| timestamps | | |

#### `email_sends`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| email_campaign_id | FK → email_campaigns | |
| lead_id | FK → leads | |
| email_used | string | email address used |
| status | string | pending / sent / failed / bounced / opened / clicked |
| message_id | string | nullable |
| sent_at | timestamp | nullable |
| opened_at | timestamp | nullable |
| clicked_at | timestamp | nullable |
| timestamps | | |

#### `smtp_credentials`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| user_id | FK → users | |
| host | string | |
| port | int | |
| encryption | string | tls / ssl / none |
| username | string | |
| password | string | encrypted |
| from_name | string | |
| from_email | string | |
| is_active | boolean | default false |
| timestamps | | |

#### `import_jobs`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| user_id | FK → users | |
| source | string | csv / google_sheet |
| status | string | preview / processing / completed / failed |
| preview_data | json | nullable |
| total_rows | int | |
| imported_rows | int | |
| skipped_rows | int | |
| errors | json | nullable |
| file_path | string | nullable |
| raw_input | text | nullable |
| timestamps | | |

---

## 3. Backend — Models

| Model | File | Key Relationships |
|---|---|---|
| `User` | `app/Models/User.php` | hasMany SmtpCredentials, hasMany EmailCampaigns |
| `Lead` | `app/Models/Lead.php` | hasMany LeadEmail, hasMany LeadPhone, belongsToMany Tag, hasMany Activity. Uses soft deletes. |
| `LeadEmail` | `app/Models/LeadEmail.php` | belongsTo Lead |
| `LeadPhone` | `app/Models/LeadPhone.php` | belongsTo Lead |
| `Tag` | `app/Models/Tag.php` | belongsToMany Lead |
| `Activity` | `app/Models/Activity.php` | belongsTo Lead |
| `EmailCampaign` | `app/Models/EmailCampaign.php` | belongsTo User, hasMany EmailSend. Uses soft deletes. |
| `EmailSend` | `app/Models/EmailSend.php` | belongsTo EmailCampaign, belongsTo Lead |
| `SmtpCredential` | `app/Models/SmtpCredential.php` | belongsTo User. Password cast encrypted. |
| `ImportJob` | `app/Models/ImportJob.php` | belongsTo User |

---

## 4. Backend — Controllers

### `DashboardController`
Renders the dashboard Inertia page with computed stats:
- Total leads + week-over-week change
- Won count, emails sent, pipeline value, conversion rate
- `leadsOverTime` — daily lead counts for area chart
- `statusBreakdown` — counts by status for bar chart
- `sourceBreakdown` — counts by source for pie chart
- `recentLeads`, `topDeals`, `upcomingFollowUps`, `recentActivities`

### `LeadController`
Full CRUD for leads with:
- `index` — search, filter by status/source, sort, server-side paginate
- `create` / `store` — create lead form
- `show` — lead detail with emails, phones, tags, activities
- `edit` / `update` — edit lead
- `updateStatus` — PATCH for quick status change (pipeline drag & drop)
- `destroy` — soft delete

### `CampaignController`
- `index` — list campaigns with engagement metrics
- `create` — form with status/tag-based recipient filtering
- `store` — create campaign
- `show` — campaign detail with recipient list
- `send` — dispatch `SendCampaignBatch` job
- `recipientCount` — AJAX endpoint for live recipient count preview

### `PipelineController`
- `index` — returns leads grouped by all status columns (new → unqualified) for the kanban board

### `ImportController`
- `index` — import form
- `upload` — accept CSV, parse, create `ImportJob` in preview state
- `fetchSheets` — list user's Google Sheets
- `uploadFromSheets` — import from a specific sheet
- `confirm` — finalize import, create Lead records
- `cancel` — delete the preview `ImportJob`

### `TagController`
- `index` — list tags with lead counts
- `store` — create tag
- `update` — rename / recolor tag
- `destroy` — delete tag

### `SmtpCredentialController`
- `store` / `update` / `destroy` — SMTP account management
- `activate` / `deactivate` — set active SMTP for sending
- `test` — send a test email using the credential
- `updateMailSettings` — update batch size and delay on the User

### `ProfileController`
- `edit` — profile page (user info + workspace + SMTP list + mail settings)
- `update` — update name/email
- `updateWorkspace` — update company name and logo upload
- `removeLogo` — delete company logo
- `destroy` — delete account

### Auth Controllers (Laravel Breeze)
`AuthenticatedSessionController`, `RegisteredUserController`, `EmailVerificationPromptController`, `EmailVerificationNotificationController`, `VerifyEmailController`, `PasswordResetLinkController`, `NewPasswordController`, `PasswordController`, `ConfirmablePasswordController`

---

## 5. Backend — Services, Jobs & Mail

### `app/Services/MailService.php`
Dynamically configures Laravel's mail driver at runtime using the user's active `SmtpCredential`. Static factory method `forUser(User $user)` sets the mailer config and returns a configured `Mailer` instance.

### `app/Jobs/SendCampaignBatch.php`
Queued job (`ShouldQueue`) for sending email campaigns in batches. Respects `mail_batch_size` and `mail_batch_delay` from the user's settings.

### `app/Mail/CampaignMail.php`
Mailable class used by `SendCampaignBatch`. Sets `from`, `subject`, and renders the HTML body from the `EmailCampaign` model.

### `app/Http/Middleware/HandleInertiaRequests.php`
Shares authenticated user data (id, name, email, company_name, company_logo) with every Inertia page via `share()`.

---

## 6. Routes

All authenticated routes are protected by `auth` + `verified` middleware.

### Main Application Routes (`routes/web.php`)

| Method | URI | Controller | Name |
|---|---|---|---|
| GET | `/` | redirect → `/dashboard` | |
| GET | `/dashboard` | DashboardController@index | dashboard |
| GET | `/leads` | LeadController@index | leads.index |
| GET | `/leads/create` | LeadController@create | leads.create |
| POST | `/leads` | LeadController@store | leads.store |
| GET | `/leads/{lead}` | LeadController@show | leads.show |
| GET | `/leads/{lead}/edit` | LeadController@edit | leads.edit |
| PUT/PATCH | `/leads/{lead}` | LeadController@update | leads.update |
| PATCH | `/leads/{lead}/status` | LeadController@updateStatus | leads.updateStatus |
| DELETE | `/leads/{lead}` | LeadController@destroy | leads.destroy |
| GET | `/pipeline` | PipelineController@index | pipeline.index |
| GET | `/campaigns` | CampaignController@index | campaigns.index |
| GET | `/campaigns/create` | CampaignController@create | campaigns.create |
| POST | `/campaigns` | CampaignController@store | campaigns.store |
| GET | `/campaigns/{campaign}` | CampaignController@show | campaigns.show |
| POST | `/campaigns/{campaign}/send` | CampaignController@send | campaigns.send |
| GET | `/campaigns/recipient-count` | CampaignController@recipientCount | campaigns.recipientCount |
| GET | `/import` | ImportController@index | import.index |
| POST | `/import/upload` | ImportController@upload | import.upload |
| GET | `/import/sheets` | ImportController@fetchSheets | import.sheets |
| POST | `/import/sheets` | ImportController@uploadFromSheets | import.uploadFromSheets |
| POST | `/import/confirm` | ImportController@confirm | import.confirm |
| DELETE | `/import/cancel` | ImportController@cancel | import.cancel |
| GET | `/tags` | TagController@index | tags.index |
| POST | `/tags` | TagController@store | tags.store |
| PUT | `/tags/{tag}` | TagController@update | tags.update |
| DELETE | `/tags/{tag}` | TagController@destroy | tags.destroy |
| GET | `/profile` | ProfileController@edit | profile.edit |
| PATCH | `/profile` | ProfileController@update | profile.update |
| POST | `/profile/workspace` | ProfileController@updateWorkspace | profile.workspace |
| DELETE | `/profile/logo` | ProfileController@removeLogo | profile.removeLogo |
| DELETE | `/profile` | ProfileController@destroy | profile.destroy |
| POST | `/smtp` | SmtpCredentialController@store | smtp.store |
| PUT | `/smtp/{smtp}` | SmtpCredentialController@update | smtp.update |
| DELETE | `/smtp/{smtp}` | SmtpCredentialController@destroy | smtp.destroy |
| POST | `/smtp/{smtp}/activate` | SmtpCredentialController@activate | smtp.activate |
| POST | `/smtp/{smtp}/deactivate` | SmtpCredentialController@deactivate | smtp.deactivate |
| POST | `/smtp/{smtp}/test` | SmtpCredentialController@test | smtp.test |
| PATCH | `/mail-settings` | SmtpCredentialController@updateMailSettings | mail.settings |

### Auth Routes (`routes/auth.php`)
Standard Laravel Breeze routes: register, login, logout, forgot-password, reset-password, verify-email, confirm-password, password update.

---

## 7. Frontend — Pages

### `resources/js/Pages/Dashboard.jsx`
Main analytics dashboard featuring:
- **Stat cards:** Total leads, Won deals, Emails sent, Pipeline value, Conversion rate — each with week-over-week change indicator
- **Area chart (Recharts):** Lead creation over time (last 30 days)
- **Bar chart (Recharts):** Lead count by status
- **Pie chart (Recharts):** Lead count by source
- **Recent leads** table
- **Top deals** list (highest deal_value)
- **Upcoming follow-ups** list
- **Recent activities** timeline

### `resources/js/Pages/Leads/Index.jsx`
Leads list page with:
- Full-text search bar
- Filter dropdowns: status, source
- Sortable columns via TanStack Table
- Server-side pagination (prev/next + page info)
- Per-row actions: view, edit, delete (with `ConfirmDialog`)
- `LeadAvatar`, `StatusBadge`, `PriorityBadge` in each row

### `resources/js/Pages/Leads/Create.jsx`
Create lead form with fields: first name, last name, company, job title, website, LinkedIn, multiple emails, multiple phones, location, industry, deal value, currency, priority, status, notes, social handles.

### `resources/js/Pages/Leads/Edit.jsx`
Same form as Create, pre-filled with existing lead data. Includes activity log section showing past interactions.

### `resources/js/Pages/Leads/Show.jsx`
Lead detail/profile view with:
- Avatar, name, job title, company
- Contact info (emails, phones)
- Social handles (LinkedIn, Twitter, etc.)
- Tags
- Deal info (value, currency, status, priority)
- Location & industry
- Notes
- Activity timeline

### `resources/js/Pages/Pipeline.jsx`
Kanban pipeline board with:
- Columns for each status: New → Contacted → Qualified → Proposal → Negotiation → Won → Lost → Unqualified
- Drag & drop between columns (`@dnd-kit`)
- Calls `leads.updateStatus` on drop to persist the change
- Each card: lead name, company, deal value, priority badge, primary email
- Filter bar and grid/list view toggle

### `resources/js/Pages/Campaigns/Index.jsx`
Campaign list with columns: name, subject, status, from email, recipients, sent count, open count, click count, created date.

### `resources/js/Pages/Campaigns/Create.jsx`
Create campaign form with:
- Name, subject, from name, from email
- Recipient filter: by status and/or tags
- Live recipient count (AJAX)
- Rich HTML body editor (Tiptap via `RichEditor` component)
- Email templates: blank, intro, follow-up, promotional

### `resources/js/Pages/Campaigns/Show.jsx`
Campaign detail view with engagement metrics and per-lead send status list.

### `resources/js/Pages/Import.jsx`
Bulk lead import with two modes:
- **CSV upload** — drag & drop file, column mapping UI, preview table, confirm
- **Google Sheets** — list sheets, pick one, preview, confirm

### `resources/js/Pages/Tags/Index.jsx`
Tag management: list tags with lead count, create new tag (name + color picker), edit, delete.

### `resources/js/Pages/Profile/Edit.jsx`
User settings page with sections:
- Profile info (name, email, change password)
- Workspace (company name, company logo upload)
- SMTP credentials (list, add, edit, delete, activate, test)
- Mail settings (batch size, delay)

### Auth Pages (Laravel Breeze)
`Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx`, `VerifyEmail.jsx`, `ConfirmPassword.jsx`

Login uses a dark glassmorphism card design (no split panel).

---

## 8. Frontend — Layout Components

### `resources/js/Components/Layout/AppLayout.jsx`
Root layout for all authenticated pages. Renders `<Sidebar>` + `<TopBar>` + main content area. Mounts `<Toaster>` from Sonner once for the entire app.

Page background: `#F4F2FF` (light lavender).

### `resources/js/Components/Layout/Sidebar.jsx`
Left sidebar navigation with:
- Brand mark (gradient logo)
- Nav items: Dashboard, Leads, Pipeline, Campaigns, Import, Tags
- Active indicator: violet-600 left border bar
- Quick actions: New Lead, New Campaign buttons
- Background: near-black purple gradient `linear-gradient(180deg, #0D0B18, #130F22, #0F0D1C)`

### `resources/js/Components/Layout/TopBar.jsx`
Top bar with:
- Current page title
- User avatar + name
- Profile dropdown with Sign Out link
- Background: `rgba(255,255,255,0.88)` with backdrop-blur

---

## 9. Frontend — Common Components

| Component | File | Purpose |
|---|---|---|
| `DataTable` | `Common/DataTable.jsx` | TanStack Table wrapper. Accepts `columns`, `data`, `pagination`, `onPageChange`, `onSort`. Handles server-side pagination and client-side sorting. |
| `PageHeader` | `Common/PageHeader.jsx` | Page title + optional subtitle. |
| `SearchInput` | `Common/SearchInput.jsx` | Debounced search box. |
| `StatCard` | `Common/StatCard.jsx` | Metric card with title, value, change %, color accent bar/icon. |
| `StatusBadge` | `Common/StatusBadge.jsx` | Colored badge for lead status. |
| `PriorityBadge` | `Common/PriorityBadge.jsx` | Colored badge for priority (high/medium/low). |
| `LeadAvatar` | `Common/LeadAvatar.jsx` | Avatar with gradient background and initials fallback. |
| `EmptyState` | `Common/EmptyState.jsx` | Empty list placeholder with icon and message. |
| `ConfirmDialog` | `Common/ConfirmDialog.jsx` | Destructive-action confirmation modal. |
| `RichEditor` | `Common/RichEditor.jsx` | Tiptap v3 rich text editor for campaign HTML body. |
| `Skeletons` | `Common/Skeletons.jsx` | Skeleton loader components for tables and cards. |

---

## 10. Frontend — shadcn UI Components

21 components installed in `resources/js/Components/ui/`:

`alert-dialog`, `avatar`, `badge`, `button`, `card`, `checkbox`, `dialog`, `dropdown-menu`, `input`, `label`, `popover`, `progress`, `select`, `separator`, `sheet`, `skeleton`, `switch`, `table`, `tabs`, `textarea`, `tooltip`

All built on Radix UI primitives + `class-variance-authority`.

---

## 11. Design System

### Color Palette

| Token | Value | Usage |
|---|---|---|
| Page background | `#F4F2FF` | AppLayout bg |
| Sidebar bg | `linear-gradient(180deg, #0D0B18, #130F22, #0F0D1C)` | Sidebar |
| Primary accent | `#7C3AED` (violet-600) | Active nav, brand mark |
| Primary gradient | `linear-gradient(135deg, #7C3AED, #4F46E5)` | Buttons, avatar |
| Glass card | `rgba(255,255,255,0.85)` + backdrop-blur | Content cards |
| TopBar | `rgba(255,255,255,0.88)` + backdrop-blur | Top nav |
| Heading text | slate-800 | |
| Muted text | slate-500 | |
| Sidebar text | white/40–75 | |

### Typography
- Font: **Poppins** (Google Fonts)

### CSS Utilities (custom, in `app.css`)
- `.glass-card` — glassmorphism card
- `.sidebar-bg` — sidebar gradient
- Custom scrollbar styling
- CSS variables: `--primary`, `--accent`, `--radius`

### Stat Card Colors
blue / green / amber / purple / red / teal — passed as `color` prop to `StatCard`

---

## 12. Seeders & Factories

### `DatabaseSeeder.php`
Runs on `php artisan db:seed`. Creates:
1. **Admin user:** `admin@crm.local` / `password`
2. **10 default tags** with preset colors:
   - Hot Lead (red), Cold (blue), Follow Up (amber), VIP (purple), Agency (indigo), Startup (green), Enterprise (slate), Pakistan (emerald), UAE (orange), US (sky)

### `LeadFactory.php`
Generates realistic fake lead records for testing/development.

---

## 13. Key Dependencies

### PHP / Composer
| Package | Version | Purpose |
|---|---|---|
| laravel/framework | ^13.8 | Core framework |
| inertiajs/inertia-laravel | ^2.0 | Server-side Inertia adapter |
| tightenco/ziggy | ^2.0 | PHP routes available in JS |
| laravel/sanctum | ^4.0 | API auth |
| laravel/breeze | ^2.4 | Auth scaffolding (dev) |

### JS / npm
| Package | Version | Purpose |
|---|---|---|
| @inertiajs/react | ^2.0.0 | Client-side Inertia |
| react / react-dom | ^18.2.0 | UI framework |
| tailwindcss | ^3.2.1 | Styling |
| @tanstack/react-table | ^8.21.3 | Data tables |
| @tanstack/react-query | ^5.100.14 | Server state (available) |
| recharts | ^3.8.1 | Charts |
| lucide-react | ^1.17.0 | Icons (note: no `Linkedin` icon — use `Link2`) |
| sonner | ^2.0.7 | Toast notifications |
| framer-motion | ^12.40.0 | Animations |
| @dnd-kit/core | ^6.3.1 | Drag & drop (pipeline) |
| @tiptap/* | ^3.24.0 | Rich text editor (campaigns) |
| react-hook-form | ^7.77.0 | Form state |
| zod | ^4.4.3 | Schema validation |
| date-fns | ^4.4.0 | Date formatting |

---

## 14. Admin Credentials

| Field | Value |
|---|---|
| Email | `admin@crm.local` |
| Password | `password` |

Run `php artisan db:seed` to create the admin user and default tags.

---

## Feature Summary

| Feature | Status |
|---|---|
| Authentication (login, register, reset password, verify email) | Done |
| Lead CRUD (create, read, update, delete, soft delete) | Done |
| Lead search & filtering (status, source) | Done |
| Server-side paginated leads table | Done |
| Lead detail page (profile, contacts, activities) | Done |
| Pipeline kanban board (drag & drop status update) | Done |
| Email campaigns (create, send in batches, track status) | Done |
| Campaign rich HTML editor with templates | Done |
| Bulk import (CSV + Google Sheets, preview + confirm) | Done |
| Tag system (create, edit, delete, assign to leads) | Done |
| Activity log (auto-logged on status change, import, etc.) | Done |
| SMTP credential management (multi-account, activate, test) | Done |
| Batch email settings (size + delay) | Done |
| Dashboard analytics (charts, stats, follow-ups) | Done |
| User profile & workspace settings (logo upload) | Done |
| Glassmorphism design system | Done |
| Toast notifications (Sonner) | Done |
| Skeleton loaders | Done |
