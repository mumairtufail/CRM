# Email Open & Click Tracking

## How it works

### Open tracking (pixel)

When a campaign email is sent, a 1×1 transparent GIF is injected at the bottom of every email:

```html
<img src="https://crm.lumenialab.com/t/{token}/open.gif"
     width="1" height="1" style="display:none;" />
```

When the recipient opens the email and images load, their email client makes a GET request to that URL.  
The server finds the `EmailSend` record by token, sets `opened_at = now()`, updates `status → opened`, and increments `opened_count` on the campaign.

**Limitation:** Email clients that block remote images (Gmail web app loads them by default; Outlook desktop often blocks) will not trigger the pixel. Open rates are therefore an undercount.

---

### Click tracking (redirect)

Every `<a href="...">` link in the email body is rewritten to:

```
https://crm.lumenialab.com/t/{token}/click?url=https%3A%2F%2Foriginal-url.com
```

When the recipient clicks a link, the server:
1. Finds the `EmailSend` record by token
2. Sets `clicked_at = now()`, updates `status → clicked`, increments `clicked_count` on the campaign
3. Also marks `opened_at` if not already set (a click implies an open)
4. Redirects the user to the original URL

Each recipient gets their own unique `token`, so clicks are tied to a specific person.

---

## Where to see who opened / clicked

### Campaign show page → Send Log table

Go to **Campaigns → [any campaign]**. The Send Log table shows per-recipient status:

| Status  | Meaning |
|---------|---------|
| Queued  | Job dispatched, not yet processed |
| Pending | Job running, SMTP attempt in progress |
| Sent    | Email delivered, no tracking event yet |
| Opened  | Pixel fired — recipient loaded images |
| Clicked | Recipient clicked at least one link |
| Failed  | SMTP error — see error column |

The **Opened** and **Clicked** columns also show when the event happened (e.g. "2 hours ago").

### Campaign show page → Stats card

At the top of the campaign show page:
- **Open rate** = `opened_count / sent_count × 100`
- **Click rate** = `clicked_count / sent_count × 100`

These are computed live from actual `email_sends` rows, not cached counters.

### Terminal panel (right side)

The live log on the right shows real-time status changes with symbols:

| Symbol | Status |
|--------|--------|
| `⧖`   | Queued |
| `○`   | Pending |
| `✓`   | Sent |
| `◎`   | Opened |
| `◈`   | Clicked |
| `✗`   | Failed |

---

## Database tables

### `email_sends`

| Column           | Description |
|------------------|-------------|
| `lead_id`        | Which lead received the email |
| `email_used`     | The actual address it was sent to |
| `status`         | queued / pending / sent / opened / clicked / failed |
| `tracking_token` | 64-char random string, unique per send |
| `sent_at`        | When the SMTP send succeeded |
| `opened_at`      | When the pixel was loaded |
| `clicked_at`     | When a link was first clicked |
| `error_message`  | SMTP error if status = failed |

### `email_campaigns`

Stores denormalized counts (`sent_count`, `opened_count`, `clicked_count`) for fast display. These are incremented atomically via `increment()` on each tracking event but can drift on retried campaigns — the live `/log` endpoint recomputes them from `email_sends` directly for accuracy.

---

## Tracking routes (public, no auth required)

```
GET /t/{token}/open.gif   → trackOpen()
GET /t/{token}/click      → trackClick()   ?url=https://...
```

These routes are outside the auth middleware so email clients and recipients can reach them without being logged in.

---

## Known limitations

1. **Image blocking** — Open rate undercounts recipients whose email client blocks images.
2. **Link skipping** — `mailto:`, `tel:`, `#anchor`, and `/unsubscribe` links are NOT wrapped with the tracker.
3. **One click per recipient** — Clicking multiple links in the same email only records one `clicked` event (by design, to avoid inflating the count).
4. **Forwarded emails** — If a recipient forwards the email, opens/clicks from the forwardee will be attributed to the original recipient's token.
