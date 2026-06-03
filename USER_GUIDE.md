# CRM Portal — User Guide

## What Is This Portal?

This is a **Customer Relationship Management (CRM)** platform designed to help your team manage leads, track deals, send emails, and stay organised — all in one place. Every workspace is completely private to your organisation.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Dashboard](#2-dashboard)
3. [Leads](#3-leads)
4. [Pipeline](#4-pipeline)
5. [Email Campaigns](#5-email-campaigns)
6. [Invoices](#6-invoices)
7. [Tags](#7-tags)
8. [Importing Leads](#8-importing-leads)
9. [Email Inbox](#9-email-inbox)
10. [Settings & Profile](#10-settings--profile)
11. [Notifications](#11-notifications)
12. [Public Intake Form](#12-public-intake-form)
13. [Admin Portal (Superadmin Only)](#13-admin-portal)

---

## 1. Getting Started

### Creating an Account

1. Go to the portal and click **Register**.
2. Enter your name, email address, and a password.
3. Registering automatically creates a new private workspace for you.
4. Verify your email address by clicking the link sent to your inbox.

### Logging In

- Enter your email and password on the **Login** page.
- Use **Forgot Password** if you need to reset your password.

### Your Workspace

When you register, a workspace is created just for you and your team. All your leads, campaigns, invoices, and settings belong to this workspace and are not visible to anyone outside of it.

---

## 2. Dashboard

The dashboard is the first thing you see after logging in. It gives you a real-time overview of your entire CRM.

### What You See

| Section | What It Shows |
|---|---|
| **Total Leads** | How many leads you have, with a percentage change vs. last month |
| **Won This Month** | Number of deals marked as Won this month |
| **Emails Sent** | Total campaign emails sent this month |
| **Open Deals** | Deals that are still active (not Won or Lost) |
| **Conversion Rate** | Percentage of leads converted to Won |

### Charts & Widgets

- **New Leads Chart** — A line/area chart showing how many new leads were added over the last 30 days.
- **Pipeline Funnel** — A visual bar chart showing how many leads sit at each stage (New → Won/Lost).
- **Lead Sources** — A bar chart showing where your leads came from (manually added, CSV import, intake form, etc.).
- **Top Open Deals** — The 6 highest-value deals still in progress, with deal values.
- **Recent Leads** — The 6 most recently added leads with their current status.
- **Recent Activity** — A live feed of the last 8 actions taken across all leads (status changes, emails sent, notes added, etc.).
- **Follow-ups Due** — Up to 5 leads that have an upcoming or overdue follow-up date (within the next 7 days). Overdue items are highlighted in red.

Clicking any item in these widgets takes you directly to that lead or section.

---

## 3. Leads

Leads are the heart of the CRM. A lead represents a person or company you are selling to or have a relationship with.

### Viewing All Leads

Go to **Leads** in the navigation. You will see a table with:

- Lead name and primary email (with avatar)
- Company
- Status (you can change it directly from this table)
- Priority (High / Medium / Low)
- Social media links (clickable icons)
- Deal value
- Actions menu (View, Edit, Delete)

**Sorting:** Click any column header to sort the list.

**Searching:** Type in the search bar to find leads by name, company, or email address.

**Filtering by Status:** Use the status dropdown to show only leads in a specific stage (e.g. only "Proposal" leads).

**Pagination:** 20 leads are shown per page. Use the Previous / Next buttons to navigate.

### Selecting Multiple Leads

Tick the checkboxes on the left side of any rows to select multiple leads. A bar will appear at the bottom of the screen showing how many are selected, with a **Delete** button to remove them all at once. A confirmation is required before deletion.

---

### Adding a New Lead

Click **New Lead** (or go to Leads → Create). Fill in the form:

**Basic Information**
- First Name (required)
- Last Name
- Company
- Job Title

**Contact Details**
- Email addresses — you can add multiple. The first one is marked as primary.
- Phone numbers — you can add multiple. The first one is marked as primary.

**Professional Details**
- Website URL
- LinkedIn URL
- Industry
- City and Country

**Sales Information**
- **Status** — Where is this lead in your pipeline? (New, Contacted, Qualified, Proposal, Negotiation, Won, Lost, Unqualified)
- **Priority** — High, Medium, or Low
- **Deal Value** — The monetary value of this potential deal
- **Currency** — Defaults to USD
- **Source** — How did you get this lead? (Manual entry, CSV import, intake form, etc.)

**Social Media**
Add links to the lead's social profiles: Twitter, Instagram, Facebook, TikTok, YouTube, GitHub.

**Notes**
A free-text area for any additional information about this lead.

Click **Create Lead** to save.

---

### Viewing a Lead's Profile

Click a lead's name anywhere in the system to open their full profile page. This page is divided into several sections:

**Header**
- Name, job title, company, status badge, priority badge, and any tags applied to the lead.

**Mini Stats**
- Deal value, number of emails sent, number of activities logged, and days since the lead was added.

**Contact Card**
- All email addresses and phone numbers on file, each clickable to open your email client or phone dialler.

**Company & Location**
- Company name, website (clickable link), LinkedIn profile, city/country, and industry.

**Social Media**
- Links to all social profiles added for this lead.

**Pipeline Details**
- Deal value and currency, last contacted date, and next follow-up date.

**Notes**
- Any notes saved for this lead.

**Quick Actions (right panel)**
- Send Email (opens your email client)
- Call (opens phone dialler)
- Edit Lead
- View Pipeline

**Status Selector (right panel)**
- Change the lead's status directly from their profile page.

**Activity Timeline (right panel)**
- A chronological log of everything that has happened with this lead: when they were created, every time their status changed, every email sent to them, calls logged, and notes added.

---

### Editing a Lead

Click **Edit** from the lead table or the lead's profile page. The edit form is identical to the create form — change any fields and click **Update Lead**.

### Deleting a Lead

Click **Delete** from the actions menu on the leads table, or from the lead's profile page. A confirmation dialog will appear before the lead is permanently removed.

---

## 4. Pipeline

The Pipeline view gives you a visual map of where all your deals stand.

### Pipeline Stats (at the top)

| Stat | Description |
|---|---|
| Total Leads | Total number of leads in the pipeline |
| Pipeline Value | Sum of all deal values across all stages |
| Won Value | Total value of all deals marked as Won |
| Win Rate | Percentage of closed deals that were Won |

### Kanban View (default)

Leads are displayed as cards in columns, one column per stage:

**New → Contacted → Qualified → Proposal → Negotiation → Won → Lost → Unqualified**

Each card shows:
- Lead avatar, name, company
- Primary email
- Deal value (if set)
- Follow-up date (shown in red if overdue)
- A coloured left border indicating priority (red = High, yellow = Medium, blue = Low)

**Moving a Lead:** Drag a card from one column and drop it into another column to change the lead's status instantly.

Each column header shows: stage name · number of leads · total deal value · percentage of overall pipeline.

### Table View

Click the **Table** toggle to switch to a flat table view. This shows the same leads in a spreadsheet format with a status dropdown per row. Use this if you prefer a more compact overview.

### Filters

- **Search** — Find leads by name or company
- **Priority** — Filter by High, Medium, or Low priority
- **Source** — Filter by where the lead came from
- **Clear Filters** — Reset all filters at once

The view preference (Kanban or Table) is remembered in your browser.

---

## 5. Email Campaigns

Send bulk emails to groups of your leads.

### Viewing Campaigns

Go to **Campaigns** to see all your campaigns. Each campaign card shows:
- Campaign name and current status (Draft, Sending, Sent, Paused)
- Subject line
- Sender name and email
- Total recipient count
- If already sent: number of emails sent, opened, and clicked

### Creating a Campaign

Click **New Campaign** and fill in:

- **Campaign Name** — An internal name (not shown to recipients)
- **From Name** — The sender name recipients will see
- **From Email** — The sender email address
- **Subject** — The email subject line
- **Body** — The HTML content of your email
- **Recipients:**
  - Filter by **Status** (e.g. send only to leads in "Proposal" stage)
  - Filter by **Tag** (e.g. send only to leads tagged "VIP")
  - A live counter shows exactly how many leads match your filters before you send

Click **Save** to save as a draft, or **Send** to send immediately.

> **Note:** Sending requires an active SMTP account configured in Settings.

### Campaign Performance

After a campaign is sent, open it to see detailed stats:
- Total recipients
- Emails sent, opened (with percentage), clicked (with percentage)
- Bounce count
- Unsubscribe count
- The date and time it was sent

---

## 6. Invoices

Create and manage invoices linked to your leads.

### Viewing Invoices

Go to **Invoices** to see all invoices. Use the status filter pills to view:
- **All** — Every invoice
- **Draft** — Not yet sent
- **Sent** — Delivered to the client
- **Paid** — Payment received
- **Overdue** — Past the due date and unpaid

The table shows invoice number, linked lead/company, total amount, status, issue date, and due date.

### Creating an Invoice

Click **New Invoice** and fill in:

**Invoice Details**
- **Invoice Number** — Auto-generated (e.g. INV-2026-001), but editable
- **Link to Lead** — Optionally attach this invoice to a lead in your CRM
- **Status** — Draft, Sent, Paid, or Overdue
- **Issue Date** — Defaults to today
- **Due Date** — Defaults to 30 days from today
- **Tax Rate** — Optional percentage (e.g. 10 for 10%)
- **Notes** — Any additional information for the recipient

**Line Items**
Add one or more line items, each with:
- Description
- Quantity
- Rate (price per unit)
- Amount (automatically calculated)

The **Subtotal**, **Tax Amount**, and **Total** are all calculated automatically as you type.

Click the **+ Add Item** button to add more line items.

Click **Save** to save the invoice.

### Sending an Invoice

Open an invoice and click **Send Invoice**. This marks the invoice as "Sent" and records the email address it was sent to.

---

## 7. Tags

Tags are labels you create to categorise and organise your leads (e.g. "VIP", "Hot Lead", "Follow Up", "Newsletter").

### Managing Tags

Go to **Tags** to see all tags in your workspace. Each tag shows:
- A coloured swatch
- Tag name
- How many leads are using this tag

### Creating a Tag

Click **New Tag**, enter a name, choose a colour, and save.

### Editing a Tag

Click **Edit** next to any tag to change its name or colour.

### Deleting a Tag

Click **Delete** next to any tag. A confirmation is required. Deleting a tag removes it from all leads it was applied to.

### Applying Tags to Leads

When creating or editing a lead, select one or more tags from the tag picker. Tags are also shown as coloured pills on the lead's profile page and in campaign recipient filters.

---

## 8. Importing Leads

Import large numbers of leads from a CSV file or directly from a Google Sheet.

### Importing from a CSV File

1. Go to **Import**.
2. Click **Upload CSV** and select your file (must be `.csv` or `.txt`, max 10MB).
3. The system will show you a preview table of the first 500 rows.
4. Review the preview to make sure the data looks correct.
5. Click **Confirm Import** to create all the leads.

A summary will show how many leads were imported and how many rows were skipped (e.g. duplicates or missing required fields).

### Importing from Google Sheets

1. Go to **Import**.
2. Paste your Google Sheet URL into the Google Sheets field.
3. Make sure the sheet is set to **Anyone with the link can view**.
4. Click **Fetch** to preview the data.
5. Review the preview and click **Confirm Import**.

### Supported Column Names

Your spreadsheet can use any of these column names (the system recognises common variations):

| Data | Accepted Column Names |
|---|---|
| First Name | `first_name`, `First Name`, `firstname` |
| Last Name | `last_name`, `Last Name`, `lastname` |
| Company | `company`, `Company` |
| Job Title | `job_title`, `Job Title`, `title` |
| Email | `email`, `Email`, `email_address` |
| Phone | `phone`, `Phone`, `phone_number` |
| Website | `website`, `Website` |
| LinkedIn | `linkedin_url`, `linkedin`, `LinkedIn` |
| Country | `country`, `Country` |
| City | `city`, `City` |
| Industry | `industry`, `Industry` |
| Notes | `notes`, `Notes` |
| Deal Value | `deal_value`, `Deal Value` |
| Status | `status`, `Status` |
| Priority | `priority`, `Priority` |
| Twitter | `twitter` |
| Instagram | `instagram` |
| Facebook | `facebook` |

> **First Name is required.** Rows without a first name will be skipped.

All imported leads are automatically given the source label matching their import method (CSV or Google Sheets) and a status of "New" unless your file includes a status column.

---

## 9. Email Inbox

Connect your email account to view and manage incoming emails directly inside the CRM.

> **Setup required:** You must have an SMTP account with IMAP settings configured in Settings before using the inbox. See [Settings & Profile](#10-settings--profile).

### Inbox Layout

The inbox has three folders:
- **Inbox** — All emails received (excluding trashed)
- **Starred** — Emails you have bookmarked
- **Trash** — Emails moved to trash

Each email in the list shows the sender name and address, subject line, a short preview of the message body, and the received date. Unread emails are displayed in bold.

### Actions per Email

| Action | What It Does |
|---|---|
| Click the email | Opens the full email with all content |
| Mark as Read / Unread | Toggles the read status |
| Star / Unstar | Adds or removes from your Starred folder |
| Move to Trash | Moves the email to your Trash folder |
| Restore | Moves a trashed email back to Inbox |
| Delete Permanently | Removes the email forever |

### Syncing Your Inbox

Click the **Sync** button to fetch the latest emails from your email server. The last synced time is displayed so you know when emails were last refreshed.

---

## 10. Settings & Profile

Access your settings by clicking your name or avatar in the top navigation, then choosing **Profile / Settings**.

### Account Settings

- **Name** — Update your display name
- **Email** — Update your login email (you will need to re-verify your email if changed)
- **Change Password** — Update your login password
- **Delete Account** — Permanently delete your account and all its data (requires password confirmation)

### Workspace Settings

- **Workspace Name** — The name of your organisation as it appears in the portal
- **Logo** — Upload a logo image (JPG, PNG, GIF, WebP, or SVG, max 2MB). A preview is shown. Click **Remove** to delete the current logo.

### SMTP Accounts (Email Configuration)

This is where you connect your email account so the CRM can send campaigns and sync your inbox.

**Adding an SMTP Account:**
Fill in the form with your email provider's settings:

| Field | Description |
|---|---|
| Account Name | A label for this account (e.g. "My Gmail") |
| SMTP Host | Your email server (e.g. `smtp.gmail.com`) |
| SMTP Port | Usually 587 (TLS) or 465 (SSL) |
| Encryption | TLS, SSL, or None |
| Username | Your email address |
| Password | Your email password or app password |
| From Name | The name recipients see (e.g. "John from Acme") |
| From Email | The email address you are sending from |
| IMAP Host | (Optional) For inbox sync (e.g. `imap.gmail.com`) |
| IMAP Port | (Optional) Usually 993 |
| IMAP Encryption | (Optional) Usually SSL |

**Managing Accounts:**
- **Activate** — Set an account as your active sending account (only one can be active at a time)
- **Test SMTP** — Sends a test email to verify the connection works
- **Test IMAP** — Verifies that inbox sync is configured correctly
- **Edit** — Update any settings
- **Delete** — Remove the account

### Mail Sending Settings

Control how bulk campaign emails are sent to avoid hitting rate limits:

- **Batch Size** — How many emails to send per batch (1–500, default 10)
- **Batch Delay** — How many seconds to wait between batches (0–300, default 5 seconds)

### Email Templates

Email templates control the visual wrapper around your campaign emails (header, footer, branding).

**System Templates** are pre-built templates provided by the platform. You can activate one as your default but cannot edit or delete them.

**Custom Templates** are templates you create yourself:
- **Create New Template** — Enter a name, description, and paste in your HTML. Use the placeholder tokens below to make it dynamic.
- **Edit** — Modify an existing custom template
- **Preview** — See how the template renders in a browser
- **Activate / Deactivate** — Set one template as your default for all campaigns
- **Delete** — Remove a custom template

**Available Placeholder Tokens for Templates:**

| Token | Replaced With |
|---|---|
| `{{content}}` | The campaign email body |
| `{{first_name}}` | Recipient's first name |
| `{{from_name}}` | Your sender name |
| `{{company_name}}` | Your workspace name |
| `{{year}}` | The current year |

---

## 11. Notifications

Click the **bell icon** in the top navigation to see your notifications. A red badge shows how many unread notifications you have.

### Notification Centre

The notifications page shows a list of recent notifications, each with:
- A title and description of the event
- How long ago it happened
- A link to navigate to the related item

**Mark as Read:** Click any notification to mark it as read and go to the related item.

**Mark All as Read:** Click the **Mark All Read** button to clear all unread notifications at once.

### When You Get Notified

- A new lead submits your public intake form
- (More notification types may be added over time)

---

## 12. Public Intake Form

Every workspace has a unique public URL that you can share with website visitors, in email signatures, or on landing pages. Anyone who fills it in becomes a new lead in your CRM automatically.

### How It Works

1. Share your intake form URL with potential leads. The URL looks like:
   `https://yourportal.com/intake/your-workspace-slug`
2. The visitor fills in the form — no account needed.
3. On submit, a new lead is created in your workspace with status "New" and source "Intake Form".
4. You receive an in-app notification about the new lead.

### Fields on the Intake Form

- First Name (required)
- Last Name
- Email (required)
- Company
- Job Title
- Phone
- Website
- Industry
- Notes / Message

---

## 13. Admin Portal

> **This section is only accessible to Superadmin accounts.**

The Admin Portal gives platform administrators a system-wide view of all organisations and users.

### Admin Dashboard

Shows global statistics:
- Total number of organisations on the platform
- Total number of users
- Total leads across all workspaces
- Total invoices across all workspaces

Also shows recent organisations and recent users in table format.

### Managing Users

Go to **Admin → Users** to see all users on the platform. You can **Impersonate** any user — this logs you in as that user so you can see their workspace and troubleshoot issues on their behalf.

A banner is always shown when you are impersonating someone. Click **Stop Impersonating** in the banner to return to your own admin account.

### Managing Organisations

Go to **Admin → Organisations** to see all workspaces on the platform, including owner details, number of users, and number of leads per workspace.

---

## Quick Reference — Lead Statuses

| Status | Meaning |
|---|---|
| **New** | Just added, no contact made yet |
| **Contacted** | You have reached out at least once |
| **Qualified** | Confirmed as a good fit |
| **Proposal** | A proposal or quote has been sent |
| **Negotiation** | Actively discussing terms |
| **Won** | Deal closed successfully |
| **Lost** | Deal did not close |
| **Unqualified** | Not a suitable prospect |

## Quick Reference — Lead Priorities

| Priority | Meaning |
|---|---|
| **High** | Needs immediate attention |
| **Medium** | Normal follow-up cadence |
| **Low** | Low urgency, follow up when available |

---

*For technical setup issues, contact your system administrator.*
