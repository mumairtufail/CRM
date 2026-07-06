# Lumenia CRM — LinkedIn Import

Personal-use Chrome extension. Not published to the Chrome Web Store — load it
locally in developer mode. It does three things, one LinkedIn profile at a
time, only when you click a button:

1. Logs in with your existing Lumenia CRM account (Sanctum token, stored in
   `chrome.storage.local`).
2. Captures the currently open LinkedIn profile into a CRM lead with one
   click ("Import to CRM" button injected near the profile name).
3. Drafts one outreach message using your workspace's configured AI provider
   (the same one used everywhere else in the CRM) — shown in the popup for
   you to edit, copy, and paste into LinkedIn yourself. Nothing is ever sent
   automatically.

It has no AI integration of its own and no separate lead storage — every
request goes to your existing Lumenia CRM backend.

## Load it in Chrome

1. Go to `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this folder (`lumenia-crm-extension`)
5. Pin the extension icon

The extension is configured to talk to `https://lumeniacrm.com`. If your CRM
is hosted elsewhere, edit `config.js` (the `LUMENIA_API_BASE` constant) and
`host_permissions` in `manifest.json` before loading it, then reload the
extension from `chrome://extensions`.

## Use it

1. Click the extension icon and log in with your Lumenia CRM email/password.
2. Open any `linkedin.com/in/...` profile page.
3. Click **Import to CRM** (appears just under the person's name). If you
   have the Contact Info panel open, any website/Twitter/Instagram/Facebook/
   TikTok/YouTube links visible there are captured too.
4. Re-open the extension popup — it shows the lead you just imported.
5. Click **Generate message** to draft a short outreach message with your
   configured AI provider. Edit it if you like, click **Copy**, then paste it
   into LinkedIn's own message box and send it yourself.
6. If the profile signals something sensitive (health issue, job loss,
   financial stress), the popup shows "Hold off on outreach" instead of a
   draft.

## Notes

- Every import is one click, one profile — there's no background scanning or
  bulk import.
- If a lead with the same LinkedIn URL already exists in your CRM, importing
  again updates it instead of creating a duplicate.
- LinkedIn changes its page markup periodically. If a captured field (company,
  headline, location) comes back blank, the page layout likely shifted —
  fields that can't be read are left blank, never guessed.
- Fields LinkedIn doesn't expose (email, phone, deal value) are always left
  blank for you to fill in later inside the CRM.
