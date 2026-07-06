// Runs on linkedin.com/in/* pages. Injects one "Import to CRM" button near the
// profile name. All DOM reading happens here; all network calls go through
// the background service worker (background.js), never directly from this
// script, since LinkedIn's page CSP would block calls to the CRM API anyway.
(function () {
  const BUTTON_ID = 'lumenia-import-btn';
  let lastUrl = location.href;

  function getProfileNameEl() {
    return document.querySelector('main h1') || document.querySelector('h1');
  }

  function splitName(fullName) {
    const parts = fullName.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { first_name: '', last_name: '' };
    if (parts.length === 1) return { first_name: parts[0], last_name: '' };
    return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
  }

  function getHeadline(h1) {
    if (!h1) return '';
    const scope = h1.closest('section') || h1.parentElement;
    const candidate = scope?.querySelector('.text-body-medium.break-words');
    return candidate ? candidate.innerText.trim() : '';
  }

  function getLocationText(h1) {
    const scope = h1?.closest('section') || document;
    const candidate = scope.querySelector('.text-body-small.inline.t-black--light.break-words')
      || scope.querySelector('.text-body-small.break-words');
    return candidate ? candidate.innerText.trim() : '';
  }

  function splitLocation(text) {
    if (!text) return { city: '', country: '' };
    const parts = text.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      return { city: parts[0], country: parts[parts.length - 1] };
    }
    return { city: '', country: parts[0] || '' };
  }

  function getCurrentCompany() {
    const anchor = Array.from(document.querySelectorAll('div[id], section[id]'))
      .find((el) => el.id === 'experience');
    const section = anchor?.closest('section') || anchor?.parentElement;
    const firstItem = section?.querySelector('li');
    if (!firstItem) return '';

    const lines = Array.from(firstItem.querySelectorAll('span[aria-hidden="true"]'))
      .map((s) => s.innerText.trim())
      .filter(Boolean);

    // First line is usually the role title, second is "Company · Employment type".
    return lines[1] ? lines[1].split('·')[0].trim() : '';
  }

  function getContactInfo() {
    const modal = document.querySelector('#pv-contact-info, .pv-profile-section__section-info');
    const result = { website: '', twitter: '', instagram: '', facebook: '', tiktok: '', youtube: '' };
    if (!modal) return result;

    for (const a of modal.querySelectorAll('a[href]')) {
      const href = a.href;
      if (/twitter\.com|x\.com/i.test(href) && !result.twitter) result.twitter = href;
      else if (/instagram\.com/i.test(href) && !result.instagram) result.instagram = href;
      else if (/facebook\.com/i.test(href) && !result.facebook) result.facebook = href;
      else if (/tiktok\.com/i.test(href) && !result.tiktok) result.tiktok = href;
      else if (/youtube\.com|youtu\.be/i.test(href) && !result.youtube) result.youtube = href;
      else if (!/linkedin\.com/i.test(href) && !result.website) result.website = href;
    }
    return result;
  }

  function extractProfile() {
    const h1 = getProfileNameEl();
    const fullName = h1 ? h1.innerText.trim() : '';
    const { first_name, last_name } = splitName(fullName);
    const { city, country } = splitLocation(getLocationText(h1));
    const contact = getContactInfo();
    const today = new Date().toISOString().slice(0, 10);

    return {
      first_name,
      last_name,
      job_title: getHeadline(h1),
      company: getCurrentCompany(),
      city,
      country,
      linkedin_url: location.href.split('?')[0],
      website: contact.website,
      twitter: contact.twitter,
      instagram: contact.instagram,
      facebook: contact.facebook,
      tiktok: contact.tiktok,
      youtube: contact.youtube,
      notes: `Imported from LinkedIn on ${today}.`,
    };
  }

  function setStatus(wrapper, text, isError) {
    let status = wrapper.querySelector('.lumenia-status');
    if (!status) {
      status = document.createElement('span');
      status.className = 'lumenia-status';
      wrapper.appendChild(status);
    }
    status.textContent = text;
    status.classList.toggle('lumenia-status-error', !!isError);
  }

  function onImportClick(button, wrapper) {
    return () => {
      const profile = extractProfile();
      if (!profile.first_name) {
        setStatus(wrapper, 'Could not read a name from this page.', true);
        return;
      }

      button.disabled = true;
      setStatus(wrapper, 'Importing...', false);

      chrome.runtime.sendMessage({ type: 'IMPORT_LEAD', payload: profile }, (response) => {
        button.disabled = false;
        if (!response) {
          setStatus(wrapper, 'Extension error. Try again.', true);
          return;
        }
        if (!response.success) {
          setStatus(wrapper, response.message || 'Import failed.', true);
          return;
        }
        setStatus(wrapper, response.created ? 'Imported to CRM.' : 'Lead updated in CRM.', false);
      });
    };
  }

  function injectButton() {
    if (document.getElementById(BUTTON_ID)) return;

    const h1 = getProfileNameEl();
    if (!h1) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'lumenia-import-wrapper';

    const button = document.createElement('button');
    button.id = BUTTON_ID;
    button.type = 'button';
    button.className = 'lumenia-import-button';
    button.textContent = 'Import to CRM';
    button.addEventListener('click', onImportClick(button, wrapper));

    wrapper.appendChild(button);
    h1.insertAdjacentElement('afterend', wrapper);
  }

  function tick() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      document.querySelector('.lumenia-import-wrapper')?.remove();
    }
    injectButton();
  }

  setInterval(tick, 1000);
  tick();
})();
