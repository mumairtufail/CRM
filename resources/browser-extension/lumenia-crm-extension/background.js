importScripts('config.js');

// All network calls to the Lumenia CRM API happen here, in the service
// worker, not in the content script (LinkedIn's page CSP would block them)
// and not duplicated in the popup. The token lives in chrome.storage.local,
// never localStorage, since extensions get their own storage area.

async function getToken() {
  const { authToken } = await chrome.storage.local.get('authToken');
  return authToken || null;
}

async function apiFetch(path, options = {}) {
  const token = await getToken();
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${LUMENIA_API_BASE}${path}`, { ...options, headers });
  } catch (err) {
    return { ok: false, status: 0, data: { message: 'Could not reach Lumenia CRM. Check your connection.' } };
  }

  let data = null;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (response.status === 401) {
    await chrome.storage.local.remove(['authToken', 'authUser']);
  }

  return { ok: response.ok, status: response.status, data };
}

async function handleLogin({ email, password }) {
  const result = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, device_name: 'chrome-extension' }),
  });

  if (!result.ok) {
    const message = result.data?.errors
      ? Object.values(result.data.errors).flat().join(' ')
      : result.data?.message || 'Login failed.';
    return { success: false, message };
  }

  await chrome.storage.local.set({
    authToken: result.data.token,
    authUser: result.data.user,
  });

  return { success: true, user: result.data.user };
}

async function handleLogout() {
  await apiFetch('/auth/logout', { method: 'POST' });
  await chrome.storage.local.remove(['authToken', 'authUser', 'lastImportedLead']);
  return { success: true };
}

async function handleImportLead(payload) {
  const result = await apiFetch('/leads/import-single', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!result.ok) {
    const message = result.status === 401
      ? 'Your session expired. Log in again from the extension popup.'
      : (result.data?.errors
        ? Object.values(result.data.errors).flat().join(' ')
        : result.data?.message || 'Import failed.');
    return { success: false, message };
  }

  await chrome.storage.local.set({ lastImportedLead: result.data.lead });

  return { success: true, lead: result.data.lead, created: result.data.created };
}

async function handleGenerateMessage({ leadId }) {
  const result = await apiFetch(`/leads/${leadId}/generate-message`, { method: 'POST' });

  if (!result.ok) {
    return { success: false, message: result.data?.message || 'Message generation failed.' };
  }

  return { success: true, holdOff: result.data.hold_off, message: result.data.message };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    switch (message.type) {
      case 'CHECK_AUTH': {
        const token = await getToken();
        const { authUser } = await chrome.storage.local.get('authUser');
        sendResponse({ loggedIn: !!token, user: authUser || null });
        break;
      }
      case 'LOGIN':
        sendResponse(await handleLogin(message));
        break;
      case 'LOGOUT':
        sendResponse(await handleLogout());
        break;
      case 'IMPORT_LEAD':
        sendResponse(await handleImportLead(message.payload));
        break;
      case 'GENERATE_MESSAGE':
        sendResponse(await handleGenerateMessage(message));
        break;
      default:
        sendResponse({ success: false, message: 'Unknown message type.' });
    }
  })();

  return true; // keep the message channel open for the async response
});
