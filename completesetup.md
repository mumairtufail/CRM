# Personal CRM — Complete Setup Guide
> Laravel 12 + Inertia + React + shadcn/ui
> Hand this file to Claude Code and it will set everything up automatically.

---

## TECH STACK

- **Backend**: Laravel 12, MySQL
- **Frontend**: React (Inertia.js), shadcn/ui, Tailwind CSS
- **Forms**: React Hook Form + Zod
- **Tables**: TanStack Table v8
- **Charts**: Recharts
- **Icons**: Lucide React
- **Fonts**: Geist (headings) + Inter (body) from Google Fonts
- **Notifications**: Sonner (toast)
- **Animations**: Framer Motion
- **Drag & Drop**: @dnd-kit (Kanban board)
- **Date**: date-fns

---

## STEP 1 — INSTALL ALL FRONTEND PACKAGES

```bash
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-avatar \
  @radix-ui/react-badge @radix-ui/react-checkbox @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-popover \
  @radix-ui/react-progress @radix-ui/react-select @radix-ui/react-separator \
  @radix-ui/react-sheet @radix-ui/react-slot @radix-ui/react-switch \
  @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-tooltip \
  class-variance-authority clsx tailwind-merge lucide-react \
  react-hook-form @hookform/resolvers zod \
  @tanstack/react-table @tanstack/react-query \
  recharts framer-motion sonner date-fns \
  @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities \
  --legacy-peer-deps
```

---

## STEP 2 — INSTALL SHADCN/UI

```bash
npx shadcn@latest init
```

When prompted:
- Style: **Default**
- Base color: **Slate**
- CSS variables: **Yes**

Then add these shadcn components:

```bash
npx shadcn@latest add button card input label select textarea badge avatar \
  dialog sheet dropdown-menu table tabs separator progress tooltip \
  popover checkbox switch alert-dialog --legacy-peer-deps
```

---

## STEP 3 — FONTS SETUP

In `resources/css/app.css`, replace everything with:

```css
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.75rem;
    --sidebar-bg: 222 47% 11%;
    --sidebar-text: 210 40% 98%;
    --sidebar-accent: 221 83% 53%;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-family: 'Inter', sans-serif;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Geist', sans-serif;
  }
}
```

---

## STEP 4 — TAILWIND CONFIG

Replace `tailwind.config.js` with:

```js
import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
    './storage/framework/views/*.php',
    './resources/views/**/*.blade.php',
    './resources/js/**/*.jsx',
    './resources/js/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        display: ['Geist', ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        sidebar: {
          bg: 'hsl(var(--sidebar-bg))',
          text: 'hsl(var(--sidebar-text))',
          accent: 'hsl(var(--sidebar-accent))',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

Install the animate plugin:

```bash
npm install tailwindcss-animate --legacy-peer-deps
```

---

## STEP 5 — DATABASE SCHEMA

Run these migrations in order.

### 5.1 — Leads Table

```php
// database/migrations/xxxx_create_leads_table.php
Schema::create('leads', function (Blueprint $table) {
    $table->id();
    $table->string('first_name');
    $table->string('last_name')->nullable();
    $table->string('company')->nullable();
    $table->string('job_title')->nullable();
    $table->string('website')->nullable();
    $table->string('linkedin_url')->nullable();
    $table->text('notes')->nullable();
    $table->string('source')->default('manual');
    // source options: manual, csv, google_sheet, claude_ai, apollo, facebook, instagram
    $table->string('status')->default('new');
    // status options: new, contacted, qualified, proposal, negotiation, won, lost, unqualified
    $table->string('priority')->default('medium');
    // priority: low, medium, high
    $table->decimal('deal_value', 15, 2)->nullable();
    $table->string('currency')->default('USD');
    $table->string('country')->nullable();
    $table->string('city')->nullable();
    $table->string('industry')->nullable();
    $table->string('avatar_url')->nullable();
    $table->json('social_handles')->nullable();
    // social_handles: {"facebook":"url","instagram":"handle","twitter":"handle","tiktok":"handle"}
    $table->timestamp('last_contacted_at')->nullable();
    $table->timestamp('follow_up_at')->nullable();
    $table->softDeletes();
    $table->timestamps();
    $table->index(['status', 'created_at']);
    $table->index('source');
});
```

### 5.2 — Lead Emails Table

```php
// database/migrations/xxxx_create_lead_emails_table.php
Schema::create('lead_emails', function (Blueprint $table) {
    $table->id();
    $table->foreignId('lead_id')->constrained()->cascadeOnDelete();
    $table->string('email');
    $table->string('type')->default('work');
    // type: work, personal, other
    $table->boolean('is_primary')->default(false);
    $table->boolean('is_verified')->default(false);
    $table->timestamps();
    $table->unique(['lead_id', 'email']);
});
```

### 5.3 — Lead Phones Table

```php
// database/migrations/xxxx_create_lead_phones_table.php
Schema::create('lead_phones', function (Blueprint $table) {
    $table->id();
    $table->foreignId('lead_id')->constrained()->cascadeOnDelete();
    $table->string('phone');
    $table->string('type')->default('mobile');
    // type: mobile, work, home, whatsapp, other
    $table->boolean('is_primary')->default(false);
    $table->timestamps();
});
```

### 5.4 — Lead Tags Table

```php
// database/migrations/xxxx_create_tags_table.php
Schema::create('tags', function (Blueprint $table) {
    $table->id();
    $table->string('name')->unique();
    $table->string('color')->default('#6366f1');
    $table->timestamps();
});

Schema::create('lead_tag', function (Blueprint $table) {
    $table->foreignId('lead_id')->constrained()->cascadeOnDelete();
    $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
    $table->primary(['lead_id', 'tag_id']);
});
```

### 5.5 — Activities / Timeline Table

```php
// database/migrations/xxxx_create_activities_table.php
Schema::create('activities', function (Blueprint $table) {
    $table->id();
    $table->foreignId('lead_id')->constrained()->cascadeOnDelete();
    $table->string('type');
    // type: note, email_sent, call, meeting, status_change, import, follow_up
    $table->text('description');
    $table->json('meta')->nullable();
    // meta: extra data like old_status, new_status, email_subject etc
    $table->timestamps();
    $table->index(['lead_id', 'created_at']);
});
```

### 5.6 — Email Campaigns Table

```php
// database/migrations/xxxx_create_email_campaigns_table.php
Schema::create('email_campaigns', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('subject');
    $table->longText('body_html');
    $table->text('body_text')->nullable();
    $table->string('status')->default('draft');
    // status: draft, scheduled, sending, sent, paused
    $table->string('from_name');
    $table->string('from_email');
    $table->json('filters')->nullable();
    // filters used to select recipients: {"status":"new","tags":["hot"]}
    $table->integer('total_recipients')->default(0);
    $table->integer('sent_count')->default(0);
    $table->integer('opened_count')->default(0);
    $table->integer('clicked_count')->default(0);
    $table->integer('bounced_count')->default(0);
    $table->integer('unsubscribed_count')->default(0);
    $table->timestamp('scheduled_at')->nullable();
    $table->timestamp('sent_at')->nullable();
    $table->softDeletes();
    $table->timestamps();
});
```

### 5.7 — Email Sends Table (per-lead tracking)

```php
// database/migrations/xxxx_create_email_sends_table.php
Schema::create('email_sends', function (Blueprint $table) {
    $table->id();
    $table->foreignId('email_campaign_id')->constrained()->cascadeOnDelete();
    $table->foreignId('lead_id')->constrained()->cascadeOnDelete();
    $table->string('email_used');
    $table->string('status')->default('pending');
    // status: pending, sent, opened, clicked, bounced, unsubscribed, failed
    $table->string('message_id')->nullable();
    $table->timestamp('sent_at')->nullable();
    $table->timestamp('opened_at')->nullable();
    $table->timestamp('clicked_at')->nullable();
    $table->timestamps();
    $table->index(['email_campaign_id', 'status']);
});
```

### 5.8 — Import Jobs Table

```php
// database/migrations/xxxx_create_import_jobs_table.php
Schema::create('import_jobs', function (Blueprint $table) {
    $table->id();
    $table->string('source');
    // source: csv, google_sheet, claude_ai, apollo, bulk_social
    $table->string('status')->default('pending');
    // status: pending, processing, preview, completed, failed
    $table->json('preview_data')->nullable();
    $table->integer('total_rows')->default(0);
    $table->integer('imported_rows')->default(0);
    $table->integer('skipped_rows')->default(0);
    $table->json('errors')->nullable();
    $table->string('file_path')->nullable();
    $table->text('raw_input')->nullable();
    $table->timestamps();
});
```

### 5.9 — Run Seeders

```php
// database/seeders/DatabaseSeeder.php
public function run(): void
{
    // Create single admin user
    User::factory()->create([
        'name' => 'Admin',
        'email' => 'admin@crm.local',
        'password' => bcrypt('password'),
    ]);

    // Seed some tags
    $tags = ['Hot Lead', 'Cold', 'Follow Up', 'VIP', 'Agency', 'Startup', 'Enterprise', 'Pakistan', 'UAE', 'US'];
    foreach ($tags as $tag) {
        \App\Models\Tag::create([
            'name' => $tag,
            'color' => collect(['#6366f1','#f59e0b','#10b981','#ef4444','#3b82f6','#8b5cf6','#ec4899','#14b8a6'])->random(),
        ]);
    }

    // Seed 50 demo leads
    \App\Models\Lead::factory(50)->create()->each(function ($lead) {
        // Add 1-2 emails per lead
        $lead->emails()->createMany([
            ['email' => fake()->unique()->safeEmail(), 'type' => 'work', 'is_primary' => true],
            ...(rand(0,1) ? [['email' => fake()->unique()->safeEmail(), 'type' => 'personal']] : []),
        ]);
        // Add 1-2 phones per lead
        $lead->phones()->createMany([
            ['phone' => fake()->phoneNumber(), 'type' => 'mobile', 'is_primary' => true],
            ...(rand(0,1) ? [['phone' => fake()->phoneNumber(), 'type' => 'whatsapp']] : []),
        ]);
        // Attach 1-3 random tags
        $lead->tags()->attach(\App\Models\Tag::inRandomOrder()->limit(rand(1,3))->pluck('id'));
    });
}
```

### 5.10 — Lead Factory

```php
// database/factories/LeadFactory.php
public function definition(): array
{
    $statuses = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
    $sources = ['manual', 'csv', 'claude_ai', 'apollo', 'google_sheet'];
    $industries = ['Software', 'Marketing Agency', 'E-commerce', 'Healthcare', 'Finance', 'Real Estate', 'Education'];

    return [
        'first_name' => fake()->firstName(),
        'last_name' => fake()->lastName(),
        'company' => fake()->company(),
        'job_title' => fake()->jobTitle(),
        'website' => fake()->url(),
        'linkedin_url' => 'https://linkedin.com/in/' . fake()->userName(),
        'notes' => fake()->optional()->paragraph(),
        'source' => fake()->randomElement($sources),
        'status' => fake()->randomElement($statuses),
        'priority' => fake()->randomElement(['low', 'medium', 'high']),
        'deal_value' => fake()->optional()->numberBetween(500, 50000),
        'country' => fake()->country(),
        'city' => fake()->city(),
        'industry' => fake()->randomElement($industries),
        'last_contacted_at' => fake()->optional()->dateTimeBetween('-3 months', 'now'),
        'follow_up_at' => fake()->optional()->dateTimeBetween('now', '+1 month'),
    ];
}
```

---

## STEP 6 — LARAVEL MODELS

### Lead Model

```php
// app/Models/Lead.php
class Lead extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'first_name', 'last_name', 'company', 'job_title', 'website',
        'linkedin_url', 'notes', 'source', 'status', 'priority',
        'deal_value', 'currency', 'country', 'city', 'industry',
        'avatar_url', 'social_handles', 'last_contacted_at', 'follow_up_at',
    ];

    protected $casts = [
        'social_handles' => 'array',
        'deal_value' => 'decimal:2',
        'last_contacted_at' => 'datetime',
        'follow_up_at' => 'datetime',
    ];

    protected $appends = ['full_name', 'primary_email', 'primary_phone'];

    public function emails() { return $this->hasMany(LeadEmail::class); }
    public function phones() { return $this->hasMany(LeadPhone::class); }
    public function tags() { return $this->belongsToMany(Tag::class, 'lead_tag'); }
    public function activities() { return $this->hasMany(Activity::class)->latest(); }
    public function emailSends() { return $this->hasMany(EmailSend::class); }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    public function getPrimaryEmailAttribute(): ?string
    {
        return $this->emails()->where('is_primary', true)->value('email')
            ?? $this->emails()->value('email');
    }

    public function getPrimaryPhoneAttribute(): ?string
    {
        return $this->phones()->where('is_primary', true)->value('phone')
            ?? $this->phones()->value('phone');
    }

    public function scopeByStatus($query, string $status) {
        return $query->where('status', $status);
    }

    public function scopeSearch($query, string $search) {
        return $query->where(function($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%")
              ->orWhere('company', 'like', "%{$search}%")
              ->orWhereHas('emails', fn($q) => $q->where('email', 'like', "%{$search}%"));
        });
    }
}
```

---

## STEP 7 — ROUTES

```php
// routes/web.php
Route::middleware(['auth'])->group(function () {

    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Leads
    Route::get('/leads', [LeadController::class, 'index'])->name('leads.index');
    Route::get('/leads/create', [LeadController::class, 'create'])->name('leads.create');
    Route::post('/leads', [LeadController::class, 'store'])->name('leads.store');
    Route::get('/leads/{lead}', [LeadController::class, 'show'])->name('leads.show');
    Route::put('/leads/{lead}', [LeadController::class, 'update'])->name('leads.update');
    Route::delete('/leads/{lead}', [LeadController::class, 'destroy'])->name('leads.destroy');
    Route::patch('/leads/{lead}/status', [LeadController::class, 'updateStatus'])->name('leads.status');

    // Pipeline (Kanban)
    Route::get('/pipeline', [PipelineController::class, 'index'])->name('pipeline');

    // Import routes
    Route::get('/import', [ImportController::class, 'index'])->name('import.index');
    Route::post('/import/csv', [ImportController::class, 'csv'])->name('import.csv');
    Route::post('/import/google-sheet', [ImportController::class, 'googleSheet'])->name('import.google_sheet');
    Route::post('/import/claude', [ImportController::class, 'claude'])->name('import.claude');
    Route::post('/import/confirm/{job}', [ImportController::class, 'confirm'])->name('import.confirm');

    // Email Campaigns
    Route::get('/campaigns', [CampaignController::class, 'index'])->name('campaigns.index');
    Route::get('/campaigns/create', [CampaignController::class, 'create'])->name('campaigns.create');
    Route::post('/campaigns', [CampaignController::class, 'store'])->name('campaigns.store');
    Route::get('/campaigns/{campaign}', [CampaignController::class, 'show'])->name('campaigns.show');
    Route::post('/campaigns/{campaign}/send', [CampaignController::class, 'send'])->name('campaigns.send');

    // Tags
    Route::apiResource('tags', TagController::class);
});
```

---

## STEP 8 — FRONTEND FILE STRUCTURE

Create this exact structure inside `resources/js/`:

```
resources/js/
├── app.jsx                          # Entry point (already exists)
├── Components/
│   ├── ui/                          # shadcn components (auto-generated)
│   ├── Layout/
│   │   ├── AppLayout.jsx            # Main layout wrapper
│   │   ├── Sidebar.jsx              # Left sidebar navigation
│   │   └── TopBar.jsx               # Top header bar
│   ├── Common/
│   │   ├── DataTable.jsx            # Reusable TanStack table
│   │   ├── PageHeader.jsx           # Page title + action button
│   │   ├── StatCard.jsx             # Dashboard stat card
│   │   ├── StatusBadge.jsx          # Lead status colored badge
│   │   ├── PriorityBadge.jsx        # Priority indicator
│   │   ├── LeadAvatar.jsx           # Avatar with initials fallback
│   │   ├── EmptyState.jsx           # Empty state illustration
│   │   ├── ConfirmDialog.jsx        # Delete confirmation dialog
│   │   ├── SearchInput.jsx          # Debounced search input
│   │   └── FilterBar.jsx            # Table filter row
│   ├── Lead/
│   │   ├── LeadForm.jsx             # Create/edit lead form
│   │   ├── LeadCard.jsx             # Kanban card component
│   │   ├── LeadTimeline.jsx         # Activity timeline
│   │   └── EmailPhoneList.jsx       # Multi email/phone display
│   ├── Import/
│   │   ├── ImportMethodSelector.jsx # Choose import method
│   │   ├── PreviewTable.jsx         # Confirm before import
│   │   ├── ClaudeImport.jsx         # AI import panel
│   │   ├── CsvImport.jsx            # CSV drag/drop upload
│   │   └── GoogleSheetImport.jsx    # Google Sheet URL input
│   └── Campaign/
│       ├── CampaignForm.jsx         # Create campaign form
│       ├── RecipientFilter.jsx      # Filter leads for campaign
│       └── CampaignStats.jsx        # Open/click rates
└── Pages/
    ├── Auth/
    │   └── Login.jsx                # Login page
    ├── Dashboard.jsx                # Main dashboard
    ├── Leads/
    │   ├── Index.jsx                # Leads list table
    │   ├── Show.jsx                 # Lead detail page
    │   └── Create.jsx               # Create lead page
    ├── Pipeline.jsx                 # Kanban pipeline board
    ├── Import.jsx                   # Import center
    └── Campaigns/
        ├── Index.jsx                # Campaigns list
        ├── Create.jsx               # New campaign
        └── Show.jsx                 # Campaign stats
```

---

## STEP 9 — APP LAYOUT (Sidebar + Topbar)

### `resources/js/Components/Layout/AppLayout.jsx`

```jsx
import { useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { Toaster } from 'sonner'

export default function AppLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          title={title}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  )
}
```

### `resources/js/Components/Layout/Sidebar.jsx`

```jsx
import { Link, usePage } from '@inertiajs/react'
import {
  LayoutDashboard, Users, Kanban, Mail, Upload,
  Tag, Settings, ChevronLeft, Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Leads', href: '/leads', icon: Users },
  { label: 'Pipeline', href: '/pipeline', icon: Kanban },
  { label: 'Campaigns', href: '/campaigns', icon: Mail },
  { label: 'Import', href: '/import', icon: Upload },
  { label: 'Tags', href: '/tags', icon: Tag },
]

export default function Sidebar({ open, onToggle }) {
  const { url } = usePage()

  return (
    <aside
      className={cn(
        'flex flex-col bg-[#0f172a] text-slate-200 transition-all duration-300 ease-in-out',
        open ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700/50">
        {open && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg">CRM</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md hover:bg-slate-700/50 transition-colors ml-auto"
        >
          <ChevronLeft
            size={16}
            className={cn('transition-transform duration-300', !open && 'rotate-180')}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = url === href || (href !== '/' && url.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
              )}
            >
              <Icon size={18} className="shrink-0" />
              {open && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-slate-700/50">
        <Link
          href="/profile"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition-colors"
        >
          <Settings size={18} className="shrink-0" />
          {open && <span>Settings</span>}
        </Link>
      </div>
    </aside>
  )
}
```

### `resources/js/Components/Layout/TopBar.jsx`

```jsx
import { Menu, Bell, Search } from 'lucide-react'
import { usePage } from '@inertiajs/react'
import { Button } from '@/Components/ui/button'

export default function TopBar({ title, onMenuClick }) {
  const { auth } = usePage().props

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors lg:hidden"
        >
          <Menu size={18} />
        </button>
        <h1 className="font-display font-semibold text-gray-900 text-lg">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-md hover:bg-gray-100 transition-colors relative">
          <Bell size={18} className="text-gray-500" />
        </button>
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
          {auth?.user?.name?.charAt(0) ?? 'A'}
        </div>
      </div>
    </header>
  )
}
```

---

## STEP 10 — REUSABLE COMPONENTS

### `resources/js/Components/Common/StatCard.jsx`

```jsx
import { Card, CardContent } from '@/Components/ui/card'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function StatCard({ title, value, change, icon: Icon, color = 'blue', index = 0 }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">{title}</p>
              <p className="text-3xl font-display font-bold text-gray-900 mt-1">{value}</p>
              {change && (
                <p className={cn('text-xs mt-1 font-medium', change > 0 ? 'text-green-600' : 'text-red-500')}>
                  {change > 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
                </p>
              )}
            </div>
            <div className={cn('p-3 rounded-xl', colors[color])}>
              <Icon size={22} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
```

### `resources/js/Components/Common/StatusBadge.jsx`

```jsx
import { Badge } from '@/Components/ui/badge'
import { cn } from '@/lib/utils'

const statusConfig = {
  new:          { label: 'New',          class: 'bg-slate-100 text-slate-700 border-slate-200' },
  contacted:    { label: 'Contacted',    class: 'bg-blue-100 text-blue-700 border-blue-200' },
  qualified:    { label: 'Qualified',    class: 'bg-violet-100 text-violet-700 border-violet-200' },
  proposal:     { label: 'Proposal',     class: 'bg-amber-100 text-amber-700 border-amber-200' },
  negotiation:  { label: 'Negotiation', class: 'bg-orange-100 text-orange-700 border-orange-200' },
  won:          { label: 'Won',          class: 'bg-green-100 text-green-700 border-green-200' },
  lost:         { label: 'Lost',         class: 'bg-red-100 text-red-700 border-red-200' },
  unqualified:  { label: 'Unqualified',  class: 'bg-gray-100 text-gray-600 border-gray-200' },
}

export default function StatusBadge({ status, size = 'default' }) {
  const config = statusConfig[status] ?? statusConfig['new']
  return (
    <Badge variant="outline" className={cn(config.class, 'font-medium border', size === 'sm' && 'text-xs')}>
      {config.label}
    </Badge>
  )
}
```

### `resources/js/Components/Common/DataTable.jsx`

```jsx
import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react'

export default function DataTable({ data, columns, pageSize = 20 }) {
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  })

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-100 overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className="bg-gray-50/80 hover:bg-gray-50/80">
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3"
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        header.column.getIsSorted() === 'asc' ? <ChevronUp size={14} /> :
                        header.column.getIsSorted() === 'desc' ? <ChevronDown size={14} /> :
                        <ChevronsUpDown size={14} className="text-gray-300" />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="hover:bg-blue-50/30 transition-colors border-gray-50">
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="py-3.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageIndex * pageSize + 1} to{' '}
          {Math.min((table.getState().pagination.pageIndex + 1) * pageSize, table.getFilteredRowModel().rows.length)} of{' '}
          {table.getFilteredRowModel().rows.length} results
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline" size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft size={14} />
          </Button>
          <span className="text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            variant="outline" size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### `resources/js/Components/Common/PageHeader.jsx`

```jsx
export default function PageHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-gray-900">{title}</h2>
        {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
```

### `resources/js/Components/Common/LeadAvatar.jsx`

```jsx
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar'

const colors = [
  'bg-blue-500', 'bg-violet-500', 'bg-green-500',
  'bg-amber-500', 'bg-rose-500', 'bg-teal-500'
]

export default function LeadAvatar({ name, url, size = 'default' }) {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'
  const colorIndex = name?.charCodeAt(0) % colors.length ?? 0
  const sizeClass = size === 'sm' ? 'h-7 w-7 text-xs' : size === 'lg' ? 'h-12 w-12 text-base' : 'h-9 w-9 text-sm'

  return (
    <Avatar className={sizeClass}>
      {url && <AvatarImage src={url} alt={name} />}
      <AvatarFallback className={`${colors[colorIndex]} text-white font-semibold`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
```

---

## STEP 11 — LOGIN PAGE

### `resources/js/Pages/Auth/Login.jsx`

```jsx
import { useForm } from '@inertiajs/react'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Card, CardContent, CardHeader } from '@/Components/ui/card'
import { Zap, Mail, Lock } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Login() {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    remember: false,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    post('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-white text-3xl">Welcome back</h1>
          <p className="text-slate-400 mt-1 text-sm">Sign in to your CRM</p>
        </div>

        <Card className="border-slate-700/50 bg-slate-800/60 backdrop-blur-xl shadow-2xl">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm">Email</Label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="email"
                    value={data.email}
                    onChange={e => setData('email', e.target.value)}
                    placeholder="admin@crm.local"
                    className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-sm">Password</Label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="password"
                    value={data.password}
                    onChange={e => setData('password', e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                  />
                </div>
                {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
              </div>

              <Button
                type="submit"
                disabled={processing}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold h-11 rounded-lg shadow-lg shadow-blue-500/20 transition-all"
              >
                {processing ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
```

---

## STEP 12 — DASHBOARD PAGE

### `resources/js/Pages/Dashboard.jsx`

```jsx
import AppLayout from '@/Components/Layout/AppLayout'
import StatCard from '@/Components/Common/StatCard'
import PageHeader from '@/Components/Common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { Users, TrendingUp, Mail, DollarSign, Target, Clock } from 'lucide-react'
import StatusBadge from '@/Components/Common/StatusBadge'
import LeadAvatar from '@/Components/Common/LeadAvatar'

export default function Dashboard({ stats, leadsOverTime, statusBreakdown, recentLeads, upcomingFollowUps }) {

  const PIE_COLORS = ['#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899']

  return (
    <AppLayout title="Dashboard">
      <PageHeader
        title="Overview"
        description={`Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'} — here's what's happening.`}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Leads" value={stats.total_leads} change={stats.leads_change} icon={Users} color="blue" index={0} />
        <StatCard title="Won This Month" value={stats.won_count} change={stats.won_change} icon={TrendingUp} color="green" index={1} />
        <StatCard title="Emails Sent" value={stats.emails_sent} icon={Mail} color="purple" index={2} />
        <StatCard title="Pipeline Value" value={`$${(stats.pipeline_value/1000).toFixed(0)}k`} icon={DollarSign} color="amber" index={3} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        {/* Area Chart - Leads over time */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base font-semibold">Leads Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={leadsOverTime}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 13 }} />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Status breakdown */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base font-semibold">By Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {statusBreakdown?.map((entry, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {statusBreakdown?.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                    <span className="text-gray-600 capitalize">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-800">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Leads */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base font-semibold flex items-center gap-2">
              <Target size={16} className="text-blue-500" /> Recent Leads
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLeads?.map(lead => (
              <div key={lead.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-3">
                  <LeadAvatar name={lead.full_name} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{lead.full_name}</p>
                    <p className="text-xs text-gray-400">{lead.company}</p>
                  </div>
                </div>
                <StatusBadge status={lead.status} size="sm" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Follow-ups */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base font-semibold flex items-center gap-2">
              <Clock size={16} className="text-amber-500" /> Follow-ups Due
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingFollowUps?.map(lead => (
              <div key={lead.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-3">
                  <LeadAvatar name={lead.full_name} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{lead.full_name}</p>
                    <p className="text-xs text-amber-600 font-medium">{lead.follow_up_at_human}</p>
                  </div>
                </div>
                <StatusBadge status={lead.status} size="sm" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
```

---

## STEP 13 — DASHBOARD CONTROLLER

```php
// app/Http/Controllers/DashboardController.php
public function index()
{
    $now = now();

    $stats = [
        'total_leads'    => Lead::count(),
        'leads_change'   => 12, // calculate vs last month
        'won_count'      => Lead::byStatus('won')->whereMonth('updated_at', $now->month)->count(),
        'won_change'     => 8,
        'emails_sent'    => EmailSend::whereMonth('created_at', $now->month)->where('status', 'sent')->count(),
        'pipeline_value' => Lead::whereNotIn('status', ['won','lost'])->sum('deal_value'),
    ];

    $leadsOverTime = Lead::selectRaw('DATE(created_at) as date, COUNT(*) as count')
        ->where('created_at', '>=', now()->subDays(30))
        ->groupBy('date')
        ->orderBy('date')
        ->get();

    $statusBreakdown = Lead::selectRaw('status as name, COUNT(*) as value')
        ->groupBy('status')
        ->get();

    $recentLeads = Lead::with(['emails', 'tags'])
        ->latest()
        ->limit(5)
        ->get();

    $upcomingFollowUps = Lead::whereNotNull('follow_up_at')
        ->where('follow_up_at', '>=', now())
        ->where('follow_up_at', '<=', now()->addDays(7))
        ->orderBy('follow_up_at')
        ->limit(5)
        ->get()
        ->map(fn($lead) => array_merge($lead->toArray(), [
            'follow_up_at_human' => $lead->follow_up_at->diffForHumans(),
        ]));

    return Inertia::render('Dashboard', compact(
        'stats', 'leadsOverTime', 'statusBreakdown', 'recentLeads', 'upcomingFollowUps'
    ));
}
```

---

## STEP 14 — LEADS INDEX PAGE

### `resources/js/Pages/Leads/Index.jsx`

```jsx
import AppLayout from '@/Components/Layout/AppLayout'
import PageHeader from '@/Components/Common/PageHeader'
import DataTable from '@/Components/Common/DataTable'
import StatusBadge from '@/Components/Common/StatusBadge'
import LeadAvatar from '@/Components/Common/LeadAvatar'
import { Button } from '@/Components/ui/button'
import { Link } from '@inertiajs/react'
import { Plus, ExternalLink } from 'lucide-react'

export default function LeadsIndex({ leads }) {

  const columns = [
    {
      id: 'lead',
      header: 'Lead',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <LeadAvatar name={row.original.full_name} size="sm" />
          <div>
            <Link href={`/leads/${row.original.id}`} className="font-medium text-gray-900 hover:text-blue-600 text-sm">
              {row.original.full_name}
            </Link>
            <p className="text-xs text-gray-400">{row.original.primary_email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'company',
      header: 'Company',
      cell: ({ getValue }) => <span className="text-sm text-gray-600">{getValue()}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    },
    {
      accessorKey: 'source',
      header: 'Source',
      cell: ({ getValue }) => (
        <span className="text-xs font-medium text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded-full">
          {getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'deal_value',
      header: 'Deal Value',
      cell: ({ getValue }) => getValue()
        ? <span className="text-sm font-semibold text-green-600">${Number(getValue()).toLocaleString()}</span>
        : <span className="text-gray-300 text-sm">—</span>,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Link href={`/leads/${row.original.id}`}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ExternalLink size={14} />
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <AppLayout title="Leads">
      <PageHeader
        title="All Leads"
        description={`${leads.length} total leads`}
        action={
          <Link href="/leads/create">
            <Button className="gap-2">
              <Plus size={16} /> Add Lead
            </Button>
          </Link>
        }
      />
      <DataTable data={leads} columns={columns} />
    </AppLayout>
  )
}
```

---

## STEP 15 — FINAL COMMANDS

After creating all files, run:

```bash
# Run all migrations and seeders
php artisan migrate:fresh --seed

# Build frontend assets
npm run build

# Start development servers (two terminals)
php artisan serve
npm run dev
```

Open `http://localhost:8000` and login with:
- **Email**: admin@crm.local
- **Password**: password

---

## WHAT THIS GIVES YOU

| Feature | Status |
|---|---|
| Dark sidebar + clean topbar layout | ✅ |
| Login page (dark glassmorphism) | ✅ |
| Dashboard with 4 stat cards | ✅ |
| Area chart + Pie chart | ✅ |
| Recent leads + follow-ups widget | ✅ |
| Leads table with sorting/pagination | ✅ |
| Reusable DataTable component | ✅ |
| StatusBadge, LeadAvatar, StatCard | ✅ |
| Multi-email + multi-phone schema | ✅ |
| Lead tags with colors | ✅ |
| Activity timeline schema | ✅ |
| Email campaigns schema | ✅ |
| Import jobs schema | ✅ |
| 50 seeded demo leads | ✅ |
| Geist + Inter fonts | ✅ |
| Framer Motion animations | ✅ |
| shadcn/ui components | ✅ |

## NEXT STEPS (separate prompts to Claude Code)

1. Build the Lead Detail page (`/leads/{id}`) with timeline
2. Build the Pipeline Kanban board
3. Build the Import center (CSV + Claude AI + Google Sheets)
4. Build the Email Campaign composer and sender
5. Add Apollo.io integration for live lead search