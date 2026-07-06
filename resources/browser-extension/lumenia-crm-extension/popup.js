const el = (id) => document.getElementById(id);

function sendMessage(message) {
  return new Promise((resolve) => chrome.runtime.sendMessage(message, resolve));
}

function showView(view) {
  el('loginView').classList.toggle('hidden', view !== 'login');
  el('mainView').classList.toggle('hidden', view !== 'main');
}

async function loadLeadPanel() {
  const { lastImportedLead } = await chrome.storage.local.get('lastImportedLead');

  el('generateStatus').classList.add('hidden');
  el('holdOffBox').classList.add('hidden');
  el('messageBox').classList.add('hidden');
  el('copyBtn').classList.add('hidden');

  if (!lastImportedLead) {
    el('noLeadHint').classList.remove('hidden');
    el('leadPanel').classList.add('hidden');
    return;
  }

  el('noLeadHint').classList.add('hidden');
  el('leadPanel').classList.remove('hidden');
  el('leadPanel').dataset.leadId = lastImportedLead.id;
  el('leadName').textContent = `${lastImportedLead.first_name} ${lastImportedLead.last_name || ''}`.trim();
  el('leadSub').textContent = [lastImportedLead.job_title, lastImportedLead.company].filter(Boolean).join(' at ');
}

async function init() {
  const auth = await sendMessage({ type: 'CHECK_AUTH' });
  if (auth?.loggedIn) {
    el('userEmail').textContent = auth.user?.email || '';
    showView('main');
    await loadLeadPanel();
  } else {
    showView('login');
  }
}

el('loginBtn').addEventListener('click', async () => {
  const email = el('email').value.trim();
  const password = el('password').value;
  const errorEl = el('loginError');
  errorEl.classList.add('hidden');

  if (!email || !password) {
    errorEl.textContent = 'Enter your email and password.';
    errorEl.classList.remove('hidden');
    return;
  }

  el('loginBtn').disabled = true;
  const result = await sendMessage({ type: 'LOGIN', email, password });
  el('loginBtn').disabled = false;

  if (!result?.success) {
    errorEl.textContent = result?.message || 'Login failed.';
    errorEl.classList.remove('hidden');
    return;
  }

  el('userEmail').textContent = result.user?.email || '';
  showView('main');
  await loadLeadPanel();
});

el('logoutBtn').addEventListener('click', async () => {
  await sendMessage({ type: 'LOGOUT' });
  el('email').value = '';
  el('password').value = '';
  showView('login');
});

el('generateBtn').addEventListener('click', async () => {
  const leadId = el('leadPanel').dataset.leadId;
  if (!leadId) return;

  const status = el('generateStatus');
  status.classList.remove('hidden');
  status.textContent = 'Drafting message...';
  el('holdOffBox').classList.add('hidden');
  el('messageBox').classList.add('hidden');
  el('copyBtn').classList.add('hidden');
  el('generateBtn').disabled = true;

  const result = await sendMessage({ type: 'GENERATE_MESSAGE', leadId });
  el('generateBtn').disabled = false;

  if (!result?.success) {
    status.textContent = result?.message || 'Message generation failed.';
    return;
  }

  status.classList.add('hidden');

  if (result.holdOff) {
    el('holdOffBox').classList.remove('hidden');
    return;
  }

  el('messageBox').value = result.message || '';
  el('messageBox').classList.remove('hidden');
  el('copyBtn').classList.remove('hidden');
});

el('copyBtn').addEventListener('click', async () => {
  await navigator.clipboard.writeText(el('messageBox').value);
  const copyBtn = el('copyBtn');
  const original = copyBtn.textContent;
  copyBtn.textContent = 'Copied';
  setTimeout(() => { copyBtn.textContent = original; }, 1200);
});

init();
