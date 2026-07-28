# Lumenia CRM Landing Page Documentation

This document provides a detailed breakdown of the sections, interactive components, copy blocks, buttons, and navigation options on the **Lumenia CRM Landing Page** (implemented in [Welcome.jsx](file:///d:/clean_work/crm-app/resources/js/Pages/Welcome.jsx)).

There is no fabricated stats or trust-badge section on this page — the product has no real usage numbers to show yet, so that section is omitted entirely rather than filled with placeholder figures.

---

## 1. Global Navigation Bar (Header)
Located at the top of the page, this bar is fixed and transitions from transparent to a blur-glass white backdrop upon scrolling down.

### Branding & Logo
* **Logo**: Custom SVG logo mark (`LogoMark`).
* **Title Text**: `"Lumenia CRM"` (bold, links to `/`).

### Navigation Links
1. **How it works**: Links to `#flow`.
2. **Features**: Links to `#modules`.
3. **Pricing**: Links to `#pricing`.
4. **Contact**: Links to `#contact`.

### Action Buttons
* **Sign In** (Link): Directs to `/login`.
* **Get Started** (Link): Directs to `/register`. Styled as a solid violet gradient.

### Mobile Menu
* **Trigger Button**: Hamburger menu icon (`Menu` / `X`) visible on mobile screens.
* **Dropdown Panel**: Full-width block containing all navigation links and mobile Sign In / Get Started buttons.

---

## 2. Hero Section
* **Heading**: `"The CRM that"` + a rotating word/phrase on its own line: *finds your leads → writes your follow-ups → sends your invoices → closes your deals*.
* **Sub-copy**: `"AI prospecting, follow-ups, and replies, all on autopilot."`
* **Action Buttons**: **Create Free Account** (`/register`) and **Sign in** (`/login`).
* Background uses an interactive `DotGrid` effect (dots react to cursor proximity).

---

## 3. "Works With" Integration Strip
A row of logos: Apollo.io, People Data Labs, Gmail, Outlook, **WhatsApp Business** *(labeled "Coming soon")*, OpenAI, Claude, Kimi.

---

## 4. Why Choose Us (`#why-us`)
A 2×2 grid of differentiators:
1. **One workspace, not five tools** — leads, campaigns, pipeline, invoicing, support in one place.
2. **AI that does the work, not just autocomplete** — finds prospects and drafts follow-ups today; will answer WhatsApp chats itself once that launches.
3. **Your data stays yours** — database-level workspace isolation.
4. **Real people when you need them** — email support, reply within one business day.

---

## 5. Modules In Depth (`#modules`)
Rendered by `ModuleShowcase.jsx` — a sticky left-hand stepper next to a scrollable right-hand panel with a photo (or icon tile, for modules without a photo asset) per module. Modules, in order:
1. **AI Prospecting** — natural-language search across Apollo.io + People Data Labs, imports verified people.
2. **Sales Pipeline** — Kanban board, drag-to-move stages, per-card activity.
3. **Dialer & Call Logs** — bring-your-own Twilio number, click-to-call from a lead's profile, every inbound/outbound call auto-logged with recording, on the lead's timeline. (Icon tile, no photo asset yet.)
4. **Email Campaigns** — bulk send, automatic follow-ups for non-openers, open/click tracking.
5. **WhatsApp Campaigns** *(tagged "Coming soon")* — same campaign/follow-up playbook, over WhatsApp, once launched.
6. **AI Configuration** — connect OpenAI/Kimi/Claude, teach it from a knowledge base, auto-replies and auto-converts hot conversations to leads.
7. **Invoicing & Clients** — won lead → client → project → invoice, without leaving the tab.

---

## 6. How It Works (`#flow`)
Rendered by `FeatureOrbit.jsx` (an interactive `FlowTree` diagram) — eight linked steps showing one lead moving through the product: Find leads (AI Prospecting) → Sort them (Batches & Groups) → Work the pipeline → Send & follow up (Email Campaigns) → See who is warm (Open & Click Tracking) → Run it on WhatsApp *(tagged "Soon")* → Let AI answer (AI Configuration) → One inbox.
Highlight strip below it: "Every step logged on the lead automatically", "Calls and emails on one shared timeline", "AI keeps replying and qualifying after hours".

---

## 7. Secondary Tools (`#tools`)
Three cards: **Import Your Own List** (CSV/Google Sheets), **Custom Forms** (embeddable lead-capture form), **Team & Reporting** (see what each rep is working without asking for a status update).

---

## 8. Free Tools (`#free-tools`)
Four public, no-login tools, each with its own page: **Email Signature Generator**, **Invoice Generator**, **Proposal Writer**, **UTM Link Builder**.

---

## 9. Testimonials
A 3×3 grid (first card featured/larger) of customer quotes covering: the dialer's automatic call logging, AI lead search speed/accuracy, automated follow-ups recovering cold deals, pipeline replacing spreadsheets, campaign analytics, and general onboarding experience.

---

## 10. Pricing (`#pricing`)
Loads live plan data from the database (`plans` prop) rather than hardcoded tiers — plan name, tagline, monthly price, features/modules list, and a **Subscribe/Get started** CTA to `/register`. Featured plan gets a "Most Popular" badge and gradient highlight.

---

## 11. Live Timeline
Rendered by `ActivityShowcase.jsx` — a fanned stack of simulated activity-feed cards (lead found, batch created, call logged, AI qualified, email opened, stage changed, form submitted, follow-up sent, deal won) next to three small stats (`9+ event types logged`, `0s lag to the timeline`, `0 manual entry needed`).

---

## 12. FAQ (`#faq`)
Seven accordion items: card required to sign up, how AI lead search works, what batches/groups are, whether follow-ups really send automatically, which AI models power the chatbot, whether the chatbot creates leads, and workspace data isolation.

---

## 13. Contact Us (`#contact`)
* **Coordinates**: Email (`hello@lumenialab.com`), Phone (`+92 335 445 5494`), Headquarters (Lahore, Pakistan).
* **Form fields**: Full name*, Email*, Company, Phone, Subject*, Message* — posts to `/contact`, shows a success state on submit.

---

## 14. Final CTA
`"Give it a try. It's free to start."` with **Create Free Account** and **Sign In** buttons.

---

## 15. Footer
Shared `SiteFooter.jsx` component (also used on blog/tools/legal pages):
* **Product**: Lead Management, Email Campaigns, Sales Pipeline, Invoicing, AI Prospecting, Clients and Projects, **Dialer & Call Logs**, **WhatsApp Automation (Soon)**.
* **Free Tools**: Email Signature, Invoice Generator, Proposal Writer, UTM Builder, All Free Tools.
* **Company**: Pricing, FAQ, Products & Services, Changelog, Contact, Sign In, Register.
* **Legal**: Privacy Policy, Terms & Conditions, Refund & Return Policy, Shipping & Service Policy.
* **Latest Blogs**: dynamic list of the site's most recent posts.
* Copyright line, HQ location, phone, and email.

Also includes the live **AI chat widget** (floating, bottom-right, only rendered when `chatbot.enabled` is true).
