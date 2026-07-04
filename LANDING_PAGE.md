# Lumenia CRM Landing Page Documentation

This document provides a detailed breakdown of the sections, interactive components, copy blocks, buttons, and navigation options on the **Lumenia CRM Landing Page** (implemented in [Welcome.jsx](file:///d:/clean_work/crm-app/resources/js/Pages/Welcome.jsx)).

---

## 1. Global Navigation Bar (Header)
Located at the top of the page, this bar is fixed and transitions from transparent to a blur-glass white backdrop upon scrolling down.

### Branding & Logo
* **Logo**: Custom SVG logo mark (`LogoMark`).
* **Title Text**: `"Lumenia CRM"` (bold, links to `/`).

### Navigation Links
Links scroll smoothly to their respective anchors on the page:
1. **Features**: Links to `#features`.
2. **AI Prospecting**: Links to `#integrations`.
3. **How it works**: Links to `#how-it-works`.
4. **Pricing**: Links to `#pricing`.
5. **Contact**: Links to `#contact`.

### Action Buttons
* **Sign In** (Link): Directs to `/login`. Styling adapts to scroll state (white/transparent when on top, slate/gray hover state when scrolled).
* **Get Started** (Link): Directs to `/register`. Styled as a premium solid violet gradient (`linear-gradient(135deg, #7C3AED, #4F46E5)`).

### Mobile Menu
* **Trigger Button**: Hamburger menu icon (`Menu` / `X`) visible on mobile screens.
* **Dropdown Panel**: Full-width block containing all navigation links and custom-styled mobile Sign In / Get Started buttons.

---

## 2. Hero Section
The opening screen designed to capture attention and direct users to register.

### Copy Blocks
* **Heading**: 
  > `"Stop losing deals to spreadsheets."`
  > *(With a sleek gradient highlight: "spreadsheets.")*
* **Description**:
  > `"Lumenia CRM puts your leads, emails, pipeline, and invoices in one workspace your whole team can use — starting free."`
* **Sub-Badge**: Features an option to alert that AI prospecting is live.

### Action Buttons
1. **Create Free Account** (Link): Directs to `/register`. Large violet gradient button with a sliding right arrow (`ArrowRight`) on hover.
2. **Sign in** (Link): Directs to `/login`. Styled in slate-gray transparency with a right arrow.

### Interactive Mockup & Floating Chips
* **Mockup Dashboard**: Shows a simulated web application dashboard with a sidebar navigation (Dashboard, Leads, Pipeline, Campaigns, Invoices, Projects) and summary cards.
* **Floating Feature Chips**: Slide in with micro-animations showing live-updates:
  * **New lead**: *Apex Digital · just now* (Violet, with `Bell` icon).
  * **Email opened**: *Ahmed K. · 2 min ago* (Blue, with `Mail` icon).
  * **Invoice paid**: *#041 · $500* (Green, with `CheckCircle2` icon).

---

## 3. Integration Strip ("Works with")
A clean, dark horizontal bar showcasing compatibility with tools and services.
* **Supported Platforms List**:
  * `Gmail`
  * `Outlook`
  * `WhatsApp Business`
  * `SendGrid`
  * `Mailgun`
  * `Brevo`
  * `Google Sheets`
  * `CSV Import`

---

## 4. Platform Statistics
A dark stats counter section displaying verified social proof and performance metrics.
1. **500+**: *Active workspaces* (Violet)
2. **50k+**: *Leads tracked* (Blue)
3. **99.9%**: *Uptime SLA* (Green)
4. **4.9★**: *Average rating* (Amber)

---

## 5. Core Features Section (`#features`)
A light grid detailing the six primary modules included inside the CRM.

### Feature Cards
1. **Lead Management**: Manual entry, CSV imports, and AI discovery. Includes custom timelines, tags, and activities.
2. **Email Campaigns**: Mass emails with automated follow-ups sent to contacts who do not open.
3. **Sales Pipeline**: Kanban board to drag cards between deal stages with status filters.
4. **Invoicing**: Invoices generated in under 30 seconds with automatic payment tracking.
5. **AI Prospecting**: AI-powered lead search using natural language descriptions.
6. **Clients & Projects**: Converting won leads to active clients, managing projects, tasks, and files.

---

## 6. AI Prospecting & Data Partners (`#integrations`)
A deep-dark section explaining how data is fetched from industry-standard sales intelligence databases.

### Bento Cards
* **Apollo.io (Sales Intelligence)**: 
  * Displays: *275M+ verified contacts*, *73M+ companies*, *98% email accuracy*, and *< 1s query time*.
  * Features: Work emails, phone numbers, seniority filters, tech stack, and funding data.
* **People Data Labs (Enterprise Data)**: 
  * Displays: *1.5B+ global profiles*, *420M+ professional records*, and *180+ countries*.
  * Features: Work/personal emails, employment history, certifications, and real-time job changes.
* **Combined Network Stat**: 
  * Highlights *350M+ Reachable contacts* deduplicated and ranked by Ideal Customer Profile (ICP) match score.

### AI Search Live Simulation
Renders a simulated query input bar:
* **Query**: `"Find SaaS founders in Pakistan with companies under 50 employees using HubSpot or Salesforce"`
* **Matching Results Preview**:
  * *Ahmed Karim* (Techstars PK) — ICP Score `94` (Source: Apollo)
  * *Sara Qureshi* (Cloudify.io) — ICP Score `89` (Source: PDL)
  * *Omar Siddiqui* (Nexara Pvt) — ICP Score `83` (Source: Apollo)
* **Import Loader**: Simulates importing results to workspace.

---

## 7. Pipeline Highlight Section
An illustrative layout showing a visual Kanban board and deal cards next to feature bullet points.

### Interactive Mockup
* **Kanban Columns**: *New*, *In Talk*, and *Proposal* stages containing simulated cards like *Apex Digital ($1,500)*, *Orion Labs ($2,000)*, and *Cloudify ($2,800)*.
* **Feature Bullets**:
  * Custom stages that match your sales process.
  * Priority and score per lead.
  * Bulk moves across stages.
  * Full activity log on every card.
  * Filter by tag, owner, or status in seconds.

---

## 8. Email Campaigns Highlight Section
Shows analytics for email marketing campaigns.

### Analytics Preview Card
* **Campaign Title**: *Q4 Outreach — Batch 1* (847 recipients, running 2 days).
* **Metrics Grid**:
  * **Delivered**: *847 (100%)*
  * **Opened**: *412 (48.7%)*
  * **Clicked**: *89 (10.5%)*
  * **Replied**: *24 (2.8%)*
* **Delivery Graph**: Simulated sending volume distribution over 48 hours.
* **Feature Bullets**: Works with any SMTP mailer, open/click tracking, personalization fields, multi-step automated follow-ups, and scheduled sends.

---

## 9. WhatsApp Automation Highlight Section
A section dedicated to automated messaging powered by the WhatsApp Business API.

### Conversation Simulator
* **Incoming Client Chat**: *"Hey, do you have a free trial? What's pricing look like for a 5-person team?"*
* **Auto-Reply Chat**: *"Yep, the free plan has no time limit. For 5 seats our Team plan is $79/mo. Want someone to call you and walk through it?"* (Tagged: *Answered from your knowledge base*).
* **Workspace Action Log**: *Lead created — tagged "Pricing inquiry"*.
* **Feature Bullets**: FAQ knowledge-base matching, buyer signal identification, auto-tagging, and timeline history mapping.

---

## 10. Lead History Timeline Section
A timeline layout displaying how a contact's lifecycle is tracked in the system.

### Timeline Feed Example
1. **Lead found via AI prospecting**: *Apollo.io · "SaaS founders, Pakistan, <50 employees" · ICP score 94* (14 days ago).
2. **Campaign email sent**: *Q4 Outreach — Batch 1* (13 days ago).
3. **Email opened x3**: *High-intent signal → moved to Interested* (12 days ago).
4. **Auto follow-up sent**: *Triggered: no reply in 48 h* (10 days ago).
5. **Call logged**: *Bilal Akhtar · "Very interested — wants a demo"* (9 days ago).
6. **Proposal sent**: *$1,500 / mo · PDF generated via LeadFlow* (7 days ago).
7. **Invoice paid**: *INV-041 · $1,500 · Received in full · Deal Won* (2 days ago).

---

## 11. How It Works Section (`#how-it-works`)
A clean three-step onboarding overview:
1. **01. Create your workspace**: Sign up, choose a workspace name, and enter (under 2 minutes).
2. **02. Add your leads**: Import via CSV, connect Google Sheets, or search using AI.
3. **03. Work your pipeline**: Send emails, log calls, drag cards, and invoice clients.

---

## 12. Automation Rules (IF-THEN)
A grid outlining the event triggers and system actions:
* **IF**: *No reply in 48 hours* $\rightarrow$ **THEN**: *Auto-send a follow-up email*
* **IF**: *Email opened 3+ times* $\rightarrow$ **THEN**: *Alert the assigned rep instantly*
* **IF**: *Pricing link clicked* $\rightarrow$ **THEN**: *Move lead to "Hot" stage*
* **IF**: *Deal stalled 7+ days* $\rightarrow$ **THEN**: *Send a nudge reminder*

---

## 13. Target Verticals / Business Types
A breakdown of how specific user profiles benefit:
* **Agencies**: Workspace separation per client; isolated client data; superadmin overview.
* **Sales Teams**: Follow-up rules; shared timelines; team collaboration tools.
* **Freelancers**: Full pipeline cycle (first contact, outreach, invoice) managed in a single tab.

---

## 14. Customer Testimonials Section
A premium display showing customer quotes, ratings, and avatars:
* **Marcus Reid** (Sales Manager, USA): Feedback on the WhatsApp bot answering FAQs.
* **Dana Whitfield** (Growth Lead, USA): Automated follow-ups closing deals.
* **Julien Marchand** (Founder, Canada): Shifting from spreadsheets to a single pipeline board.
* **Priya Anand** (Sales Director, UK): Identifying stalled leads.
* **Omar Al Farsi** (Operations Manager, UAE): Centralizing multi-channel communications.

---

## 15. Dynamic Pricing Section (`#pricing`)
Lists the subscription tiers available on the system.

### Interactive Plan Cards
Loads plan configurations directly from database models:
* **Basic / Free Plan**: Core CRM functionality, limits on modules.
* **Featured / Pro Plan**: Violet gradient highlight, styled as *"Most Popular"*, with modules like AI Prospecting and WhatsApp bot.
* **Enterprise Plan**: Styled with custom text and contact options for scaling teams.

---

## 16. Accordion FAQs (`#faq`)
Nine dropdown accordion items answering common questions:
1. Do I need a credit card to sign up?
2. How does the AI Lead Search work?
3. Can I bring in my existing leads?
4. How are workspaces separated?
5. Which email providers work for campaigns?
6. Is the data stored securely?
7. Can I convert a lead into a client and invoice them?
8. How does the WhatsApp bot know what to say?
9. Do follow-up emails send automatically?

---

## 17. Contact Us Form (`#contact`)
Features general support coordinates and an interactive submission form.

### Support Columns
* **Email**: `hello@lumenialab.com` (We reply within 24 hours).
* **Phone**: `+92 335 445 5494` (Available 24 hours).
* **Headquarters**: `Lahore, Pakistan` (Lumenia Lab Pvt. Ltd.).

### Contact Form Fields
1. **Full Name** (Input, text, required)
2. **Email Address** (Input, email, required)
3. **Company Name** (Input, text, optional)
4. **Phone Number** (Input, tel, optional)
5. **Subject** (Input, text, required)
6. **Message** (Textarea, required)
7. **Submit Button**: Gradient violet button styled with a loading spinner while submitting.

---

## 18. Footer
The bottom section containing navigation, copyright, and latest posts.
* **Short Description**: *"A CRM for sales teams that actually want to use their CRM. By Lumenia Lab."*
* **Link Columns**:
  * **Product**: Features, Pricing, FAQ, Changelog.
  * **Account**: Sign In, Register, Support, Contact.
  * **Legal**: Privacy Policy, Terms of Service, Security.
  * **Latest Blogs**: Dynamic links showing the latest **5 active blog articles** (with a link to `/blog` index).
* **General Coordinates**: Twitter/X link, LinkedIn link, hello@lumenialab.com email link, and copyright notice.
