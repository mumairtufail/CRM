# AI Lead Generation Module — Claude Code Prompt

## Overview

Build a fully functional **AI-powered Lead Generation module** inside an existing Laravel + Inertia.js + React + shadcn/ui CRM application. The module allows users to type a natural language prompt, have Claude AI parse it into structured filters, query the Apollo.io Search API, preview results, and import selected leads directly into the CRM.

---

## Tech Stack

- **Backend:** Laravel 10+ (PHP)
- **Frontend:** React with Inertia.js
- **UI Components:** shadcn/ui (use actual shadcn components — do NOT write manual CSS or custom HTML components where a shadcn component exists)
- **API:** Apollo.io Search API (`api/v1/contacts/search`, `api/v1/accounts/search`)
- **AI Parsing:** Anthropic Claude API (`claude-sonnet-4-20250514`)
- **Environment Variable:** `LEAD_GENERATION_API_KEY` (Apollo API key already in `.env`)

---

## What To Build

### 1. Backend — Laravel

#### Service Interface
Create `app/Contracts/LeadGenerationInterface.php`:

```php
interface LeadGenerationInterface
{
    public function searchContacts(array $filters, int $page = 1): array;
    public function searchAccounts(array $filters): array;
    public function parsePromptToFilters(string $prompt): array;
}
```

#### Service Implementation
Create `app/Services/LeadGenerationService.php`:

- Implement `LeadGenerationInterface`
- Inject `GuzzleHttp\Client` via constructor
- Read Apollo API key from `config('services.apollo.key')` which reads from `LEAD_GENERATION_API_KEY` env var
- `parsePromptToFilters(string $prompt)` — calls Claude API (`claude-sonnet-4-20250514`) to convert natural language to structured Apollo filters. Returns array with keys: `job_titles`, `seniority_levels`, `industries`, `locations`, `company_sizes`, `keywords`
- `searchContacts(array $filters, int $page)` — calls `POST https://api.apollo.io/api/v1/contacts/search` with the filters. Returns array of contacts with: `id`, `first_name`, `last_name`, `title`, `company_name`, `linkedin_url`, `city`, `state`, `country`, `industry`, `company_size`, `seniority`
- `searchAccounts(array $filters)` — calls `POST https://api.apollo.io/api/v1/accounts/search`. Returns companies.

#### Service Provider Binding
In `app/Providers/AppServiceProvider.php`:

```php
$this->app->bind(LeadGenerationInterface::class, LeadGenerationService::class);
```

#### Config
Add to `config/services.php`:

```php
'apollo' => [
    'key' => env('LEAD_GENERATION_API_KEY'),
    'base_url' => 'https://api.apollo.io/api/v1',
],
```

#### Controller
Create `app/Http/Controllers/LeadGenerationController.php`:

- `index()` — returns Inertia view `LeadGeneration/Index`
- `parsePrompt(Request $request)` — validates `prompt` string, calls `LeadGenerationService::parsePromptToFilters()`, returns JSON with extracted filters
- `search(Request $request)` — validates filters + page number, calls `searchContacts()`, returns JSON with contacts array + pagination info + total count
- `import(Request $request)` — validates array of selected contact IDs + contact data, creates Lead records in the CRM database for each, returns JSON with success count

#### Routes
Add to `routes/web.php` inside auth middleware group:

```php
Route::prefix('lead-generation')->name('lead-generation.')->group(function () {
    Route::get('/', [LeadGenerationController::class, 'index'])->name('index');
    Route::post('/parse-prompt', [LeadGenerationController::class, 'parsePrompt'])->name('parse-prompt');
    Route::post('/search', [LeadGenerationController::class, 'search'])->name('search');
    Route::post('/import', [LeadGenerationController::class, 'import'])->name('import');
});
```

#### Apollo API Request Format
For `contacts/search`, send:

```json
{
  "api_key": "YOUR_KEY",
  "page": 1,
  "per_page": 25,
  "person_titles": ["CTO", "Chief Technology Officer"],
  "person_seniorities": ["c_suite", "director", "vp"],
  "organization_industry_tag_ids": [],
  "organization_num_employees_ranges": ["11,50", "51,200"],
  "prospected_by_current_team": ["no"]
}
```

#### Claude Prompt for Filter Extraction
When calling Claude API to parse the user prompt, use this system prompt:

```
You are a B2B lead generation filter extractor. 
Convert the user's natural language query into structured JSON filters for Apollo.io.

Return ONLY valid JSON with these exact keys:
{
  "job_titles": [],        // array of job title strings
  "seniority_levels": [],  // array from: "c_suite", "vp", "director", "manager", "senior", "entry"
  "industries": [],        // array of industry strings
  "locations": [],         // array of city/country strings
  "company_sizes": [],     // array of Apollo ranges like "1,10" "11,50" "51,200" "201,500" "501,1000" "1001,5000"
  "keywords": []           // any other relevant keywords
}

Return nothing except the JSON object. No explanation, no markdown.
```

---

### 2. Frontend — React + Inertia + shadcn/ui

#### File Location
Create `resources/js/Pages/LeadGeneration/Index.jsx`

#### Page Layout

Use the existing CRM layout wrapper (same as other pages in the app).

The page has **3 main sections** stacked vertically:

---

#### Section 1 — Hero Prompt Input

A prominent search area at the top of the page:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   🔍  Find Leads with AI                                        │
│   Describe your ideal prospect in plain English                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ "Find CTOs at SaaS companies in the US with 50-200      │   │
│  │  employees"                                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [ Search Leads ]                                               │
│                                                                 │
│  Try: "Marketing directors at e-commerce brands in UK"          │
│       "Founders of funded startups in New York"                 │
│       "VP of Sales at B2B software companies"                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Use shadcn components:
- `Textarea` from shadcn for the prompt input (3 rows, auto-resize)
- `Button` with a search icon for the submit button
- `Badge` components for the example prompt chips (clickable — clicking fills the textarea)

---

#### Section 2 — Extracted Filters Display (shown after AI parsing)

After the user submits a prompt and Claude parses it, show the extracted filters as an editable panel:

```
┌─────────────────────────────────────────────────────────────────┐
│  ✓ AI interpreted your search as:                               │
│                                                                 │
│  Job Titles     [CTO ×] [Chief Technology Officer ×] [+ Add]   │
│  Seniority      [C-Suite ×] [VP ×] [+ Add]                     │
│  Industry       [SaaS ×] [Software ×] [+ Add]                  │
│  Location       [United States ×] [+ Add]                       │
│  Company Size   [51-200 ×] [+ Add]                              │
│                                                                 │
│  [ Refine Search ]   [ Run Search → ]                           │
└─────────────────────────────────────────────────────────────────┘
```

Use shadcn components:
- `Card` + `CardContent` for the filter panel
- `Badge` with `×` button for each filter tag (removable)
- `Input` for inline adding new filter values
- `Button` variants for the action buttons
- `Separator` between filter rows

Each filter row label should use `Label` component. Users can:
- Remove any filter tag by clicking `×`
- Add new values to any filter row
- Click **Refine Search** to go back and edit the prompt
- Click **Run Search** to execute with current filters

---

#### Section 3 — Results Table (shown after search runs)

```
┌─────────────────────────────────────────────────────────────────┐
│  143 leads found   [ ☐ Select All ]   [ Import Selected (0) ]  │
├──────┬──────────────┬─────────────────┬────────────┬───────────┤
│  ☐   │ Name         │ Title / Company │ Location   │ LinkedIn  │
├──────┼──────────────┼─────────────────┼────────────┼───────────┤
│  ☐   │ James Wilson │ CTO             │ New York   │ 🔗 View   │
│      │              │ Acme SaaS Ltd   │ US         │           │
├──────┼──────────────┼─────────────────┼────────────┼───────────┤
│  ☐   │ Sarah Chen   │ CTO             │ San Fran   │ 🔗 View   │
│      │              │ BuildFast Inc   │ US         │           │
└──────┴──────────────┴─────────────────┴────────────┴───────────┘
│  < Previous   Page 1 of 6   Next >                              │
└─────────────────────────────────────────────────────────────────┘
```

Use shadcn components:
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` for the results
- `Checkbox` for row selection and select-all
- `Button` with count badge for the import action
- `Badge` for seniority/industry labels in rows
- `Avatar` + `AvatarFallback` for lead initials
- Pagination using shadcn `Button` components for prev/next

**Row details to show per lead:**
- Checkbox
- Avatar with initials + Full name + Company name (stacked)
- Job title + Seniority badge
- Industry
- Location (City, Country)
- LinkedIn URL as an icon link (opens in new tab)
- Company size

**Import button behaviour:**
- Disabled when 0 selected
- Shows count: "Import Selected (12)"
- On click → calls `/lead-generation/import` with selected contacts data
- On success → shows shadcn `Toast` with "12 leads imported successfully"
- Imported leads are created with `source = 'AI Search'` and `status = 'New'`

---

#### Loading States

- While AI is parsing the prompt: show `Skeleton` components where the filter panel will appear + a subtle "AI is interpreting your search..." text with a spinner
- While search is running: show `Skeleton` rows in the table (5 skeleton rows)
- While importing: show loading spinner on the import button, disable all checkboxes

---

#### Empty States

- No results: Use shadcn `Card` with an icon, "No leads found" heading, and suggestion to broaden filters
- API error: Use shadcn `Alert` with `AlertDescription` showing the error message

---

#### Error Handling

- Wrap all API calls in try/catch
- Show shadcn `Alert` component with `variant="destructive"` for errors
- Show `Toast` notifications for success actions

---

### 3. Sidebar Navigation Entry

In the existing sidebar component (wherever other nav items like Leads, Pipeline, Campaigns are defined), add a new nav item:

```jsx
{
  label: "AI Lead Search",
  href: route('lead-generation.index'),
  icon: <Sparkles className="w-4 h-4" />,  // lucide-react Sparkles icon
  active: route().current('lead-generation.*')
}
```

Place it directly below the **Leads** nav item in the sidebar. Use the exact same component pattern as the existing sidebar items — do not create a new pattern.

---

## State Management

Manage all state locally in `Index.jsx` using React `useState`:

```javascript
const [prompt, setPrompt] = useState('')
const [parsedFilters, setParsedFilters] = useState(null)
const [searchResults, setSearchResults] = useState([])
const [totalResults, setTotalResults] = useState(0)
const [currentPage, setCurrentPage] = useState(1)
const [selectedIds, setSelectedIds] = useState([])
const [isParsingPrompt, setIsParsingPrompt] = useState(false)
const [isSearching, setIsSearching] = useState(false)
const [isImporting, setIsImporting] = useState(false)
const [step, setStep] = useState('prompt') // 'prompt' | 'filters' | 'results'
```

The `step` value controls which sections are visible:
- `prompt` → show only Section 1
- `filters` → show Section 1 (collapsed/summary) + Section 2
- `results` → show Section 1 (collapsed/summary) + Section 2 (collapsed) + Section 3

---

## Apollo API Notes

- The free tier of `contacts/search` returns contacts but does **not** include email or phone
- Always include `"prospected_by_current_team": ["no"]` to avoid showing contacts already in Apollo CRM
- Per page: use 25 results per page
- Map Apollo `person_seniority` values to display labels: `c_suite` → "C-Suite", `vp` → "VP", `director` → "Director" etc.
- If Apollo returns a `linkedin_url` of `null` or empty, hide the LinkedIn link for that row
- Handle Apollo rate limiting: if a 429 is returned, show a friendly "Too many requests, please wait a moment" message

---

## Database

When importing leads, create records in the existing `leads` table using the existing `Lead` model. Map Apollo fields to lead fields:

| Apollo Field | Lead Field |
|---|---|
| `first_name` | `first_name` |
| `last_name` | `last_name` |
| `title` | `job_title` |
| `organization_name` | `company` |
| `linkedin_url` | `linkedin_url` |
| `city` + `country` | `city`, `country` |
| `organization_industry_tag_values[0]` | `industry` |
| `"AI Search"` (hardcoded) | `source` |
| `"New"` (hardcoded) | `status` |
| Current workspace ID | `workspace_id` |

Before inserting, check for duplicate emails. If `email` is null (free tier), check for duplicate by `first_name` + `last_name` + `company` combination to avoid importing the same person twice.

---

## File Structure Summary

```
app/
  Contracts/
    LeadGenerationInterface.php        ← NEW
  Services/
    LeadGenerationService.php          ← NEW
  Http/
    Controllers/
      LeadGenerationController.php     ← NEW

config/
  services.php                         ← EDIT (add apollo key)

routes/
  web.php                              ← EDIT (add routes)

resources/js/
  Pages/
    LeadGeneration/
      Index.jsx                        ← NEW
  Components/
    Sidebar.jsx (or wherever sidebar is) ← EDIT (add nav item)
```

---

## Checklist Before Finishing

- [ ] `LEAD_GENERATION_API_KEY` is read from env correctly via `config('services.apollo.key')`
- [ ] Service is bound in `AppServiceProvider`
- [ ] All routes are inside the `auth` middleware group
- [ ] Claude API system prompt instructs to return JSON only
- [ ] Apollo request always includes `api_key` in the POST body
- [ ] Duplicate check runs before each lead import
- [ ] `source` is set to `'AI Search'` and `status` to `'New'` on all imported leads
- [ ] LinkedIn URLs open in a new tab
- [ ] All loading states are handled (parsing, searching, importing)
- [ ] All error states use shadcn `Alert` or `Toast`
- [ ] Sidebar uses the `Sparkles` icon from lucide-react
- [ ] Sidebar item is active when on any `lead-generation.*` route
- [ ] shadcn components are imported from `@/components/ui/` — no manual rewrites