'use strict';
/* ============ Settings you can edit ============ */
// Official contact details (from dlsjbc.edu.ph/contact)
const CONTACT = {
  registrarEmail: 'registrar@dlsjbc.edu.ph',
  generalEmail: 'info@dlsjbc.edu.ph',
  office: 'Registrar’s Office, 1F St. John Baptist De La Salle Bldg., De La Salle Drive, Mangagoy, Bislig City, Surigao del Sur',
  facebook: 'https://www.facebook.com/dlsjbc',
  website: 'https://www.dlsjbc.edu.ph'
};
// Dummy data (no database needed)
const USERS = [{ id: '2026-00001', email: 'student@dlsjbc.edu.ph', pw: 'Animo2026', name: 'Juan Dela Cruz' }];
const norm = v => String(v).trim().toUpperCase();
const TAKEN_IDS = ['2026-00001', '2026-00002'];
const TAKEN_EMAILS = ['student@dlsjbc.edu.ph'];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const icon = n => `<svg class="i" aria-hidden="true"><use href="#i-${n}"/></svg>`;

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg, undo) {
  const t = $('#toast'), u = $('#toastUndo');
  $('#toastMsg').textContent = msg;
  u.hidden = !undo;
  u.onclick = () => { undo(); t.hidden = true; };
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 6000);
}

/* ---------- Contact cards (from CONTACT above) ---------- */
$('#contactCards').innerHTML = [
  ['mail', 'Registrar email', CONTACT.registrarEmail, 'mailto:' + CONTACT.registrarEmail],
  ['mail', 'General inquiries', CONTACT.generalEmail, 'mailto:' + CONTACT.generalEmail],
  ['pin', 'Visit us', CONTACT.office, ''],
  ['globe', 'Official website', CONTACT.website.replace('https://www.', ''), CONTACT.website, true],
  ['globe', 'Facebook', CONTACT.facebook.replace('https://www.', ''), CONTACT.facebook, true]
].map(([ic, title, text, href, ext]) => {
  const inner = `<span class="ico" aria-hidden="true">${icon(ic)}</span><span><b>${title}</b>${esc(text)}${ext ? '<em>Opens in a new tab</em>' : ''}</span>`;
  return href
    ? `<a class="contact-card" href="${esc(href)}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${inner}</a>`
    : `<div class="contact-card">${inner}</div>`;
}).join('');

/* ---------- Navigation (hash router) ---------- */
const views = $$('.view');
const NAV_FOR = { forgot: 'login' };
function route() {
  const id = (location.hash || '#home').slice(1);
  const target = views.find(v => v.id === id) || $('#home');
  views.forEach(v => { v.hidden = v !== target; v.classList.remove('enter'); });
  void target.offsetWidth;
  target.classList.add('enter');
  const navId = NAV_FOR[target.id] || target.id;
  $$('.nav a').forEach(a => {
    a.dataset.view === navId ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
  });
  document.title = target.querySelector('h1').textContent + ' | DLSJBC Student Portal';
  $('#nav').classList.remove('open');
  $('#menuBtn').setAttribute('aria-expanded', 'false');
  window.scrollTo({ top: 0 });
  $('#main').focus({ preventScroll: true });
}
window.addEventListener('hashchange', route);
$('#menuBtn').addEventListener('click', e => {
  const open = $('#nav').classList.toggle('open');
  e.currentTarget.setAttribute('aria-expanded', open);
});

/* ---------- Show / hide password ---------- */
$$('.toggle').forEach(b => b.addEventListener('click', () => {
  const input = document.getElementById(b.dataset.target);
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  b.textContent = show ? 'Hide' : 'Show';
  b.setAttribute('aria-pressed', show);
}));

/* ---------- Field helpers ---------- */
function setError(input, msg) {
  const wrap = input.closest('.field') || input.closest('fieldset');
  const err = document.getElementById(input.name + '-err') || document.getElementById(input.id + '-err');
  if (msg) {
    wrap.classList.add('invalid'); wrap.classList.remove('valid');
    if (err) err.textContent = msg;
    input.setAttribute('aria-invalid', 'true');
  } else {
    wrap.classList.remove('invalid');
    if (input.type !== 'radio' && input.type !== 'checkbox') wrap.classList.add('valid');
    if (err) err.textContent = '';
    input.removeAttribute('aria-invalid');
  }
  return !msg;
}

/* ---------- Registration validation ---------- */
const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const nameRx = /^[A-Za-zÀ-ÿ'’.\- ]{2,}$/;
const RULES = {
  firstName: v => !v.trim() ? 'Enter your first name.' : !nameRx.test(v.trim()) ? 'Use letters only, at least 2 characters.' : '',
  lastName: v => !v.trim() ? 'Enter your last name.' : !nameRx.test(v.trim()) ? 'Use letters only, at least 2 characters.' : '',
  birthdate: v => {
    if (!v) return 'Choose your date of birth.';
    const d = new Date(v), now = new Date();
    if (d > now) return 'Date of birth cannot be in the future.';
    const age = (now - d) / 31557600000;
    return age < 10 || age > 90 ? 'Check the year. Age must be between 10 and 90.' : '';
  },
  studentNo: v => !v.trim() ? 'Enter your student number.' : !/^[A-Za-z0-9][A-Za-z0-9\-\/ ]{2,19}$/.test(v.trim()) ? 'Use 3 to 20 letters or numbers. Dashes are allowed.' : TAKEN_IDS.includes(norm(v)) ? 'This student number is already registered. Try logging in instead.' : '',
  email: v => !v.trim() ? 'Enter your email address.' : !emailRx.test(v.trim()) ? 'Enter a valid email, like name@gmail.com.' : TAKEN_EMAILS.includes(v.trim().toLowerCase()) ? 'This email is already registered. Try logging in instead.' : '',
  phone: v => !v.trim() ? 'Enter your mobile number.' : !/^\+?[\d\s\-()]+$/.test(v.trim()) || v.replace(/\D/g, '').length < 7 || v.replace(/\D/g, '').length > 15 ? 'Enter a valid number using digits only (7 to 15 digits).' : '',
  program: v => v ? '' : 'Choose your program.',
  password: v => !v ? 'Create a password.' : v.length < 8 ? 'Use at least 8 characters.' : !/[A-Za-z]/.test(v) || !/\d/.test(v) ? 'Include at least one letter and one number.' : '',
  confirm: v => !v ? 'Re-enter your password.' : v !== $('#password').value ? 'Passwords do not match.' : ''
};
const form = $('#regForm');
const LABELS = { firstName: 'First name', lastName: 'Last name', birthdate: 'Date of birth', studentNo: 'Student number', email: 'Email address', phone: 'Mobile number', program: 'Program', year: 'Year level', password: 'Password', confirm: 'Confirm password', agree: 'Agreement' };
const SECTIONS = {
  personal: ['firstName', 'lastName', 'birthdate', 'studentNo'],
  contact: ['email', 'phone'],
  enroll: ['program', 'year'],
  security: ['password', 'confirm', 'agree']
};

function isValid(n) {
  if (n === 'year') return !!form.querySelector('[name=year]:checked');
  if (n === 'agree') return form.elements.agree.checked;
  return !RULES[n](form.elements[n].value);
}
function validateField(name) {
  if (name === 'year') {
    const ok = isValid('year');
    $('#yearGroup').classList.toggle('invalid', !ok);
    $('#year-err').textContent = ok ? '' : 'Choose your year level.';
    return ok;
  }
  if (name === 'agree') {
    const ok = isValid('agree');
    form.elements.agree.closest('.check').classList.toggle('invalid', !ok);
    $('#agree-err').textContent = ok ? '' : 'Tick the box to continue.';
    return ok;
  }
  const el = form.elements[name];
  return setError(el, RULES[name](el.value));
}
/* ---------- Save progress on this device (survives closing or restarting the tab) ---------- */
// Passwords and the privacy-policy tick are deliberately never saved.
const DRAFT_KEY = 'dlsjbc-registration-draft';
const DRAFT_DAYS = 3;
const SAVED = ['firstName', 'lastName', 'birthdate', 'studentNo', 'email', 'phone', 'program', 'year'];
let draftTimer;
function saveDraft() {
  clearTimeout(draftTimer);
  const data = {};
  SAVED.forEach(n => { const v = n === 'year' ? (form.querySelector('[name=year]:checked') || {}).value : form.elements[n].value; if (v) data[n] = v; });
  try {
    if (Object.keys(data).length) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ data, savedAt: Date.now() }));
      $('#savedText').hidden = false;
    } else { localStorage.removeItem(DRAFT_KEY); $('#savedText').hidden = true; }
  } catch (_) { /* storage blocked (private mode): the form still works, it just will not be saved */ }
}
const queueSave = () => { clearTimeout(draftTimer); draftTimer = setTimeout(saveDraft, 300); };
function loadDraft() {
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
    if (!saved || Date.now() - saved.savedAt > DRAFT_DAYS * 864e5) { localStorage.removeItem(DRAFT_KEY); return false; }
    SAVED.forEach(n => {
      const v = saved.data[n]; if (!v) return;
      if (n === 'year') { const r = form.querySelector(`[name=year][value="${v}"]`); if (r) r.checked = true; }
      else form.elements[n].value = v;
    });
    return Object.keys(saved.data).length > 0;
  } catch (_) { return false; }
}
window.addEventListener('pagehide', saveDraft);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveDraft(); });

function updateProgress() {
  const names = Object.keys(LABELS);
  const done = names.filter(isValid).length;
  const pct = Math.round(done / names.length * 100);
  $('#bar').style.width = pct + '%';
  $('#progressWrap').setAttribute('aria-valuenow', pct);
  $('#progressText').textContent = done === names.length ? 'All required fields done. You can register now.' : `${done} of ${names.length} required fields done`;
  Object.entries(SECTIONS).forEach(([k, list]) => {
    const n = list.filter(isValid).length;
    const li = $(`#checklist [data-for=${k}]`);
    li.classList.toggle('done', n === list.length);
    $('em', li).textContent = n === list.length ? 'Done' : `${n}/${list.length}`;
  });
  queueSave();
  if (!$('#summary').hidden) renderSummary(names.filter(n => !isValid(n)));   // keep the banner honest as the user fixes things
}
Object.keys(RULES).forEach(n => {
  const el = form.elements[n];
  el.addEventListener('blur', () => { if (el.value || el.closest('.field').classList.contains('invalid')) validateField(n); });
  el.addEventListener('input', () => {
    if (el.closest('.field').classList.contains('invalid')) validateField(n);
    if (n === 'password' && form.elements.confirm.value) validateField('confirm');
    updateProgress();
  });
});
form.addEventListener('change', e => {
  if (e.target.name === 'year') validateField('year');
  if (e.target.name === 'agree') validateField('agree');
  updateProgress();
});
/* jump from checklist to a section */
$$('#checklist [data-jump]').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  const fs = form.querySelector(`[data-section=${a.dataset.jump}]`);
  fs.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const first = fs.querySelector('input,select');
  setTimeout(() => first.focus({ preventScroll: true }), 300);
}));

function focusField(n) {
  const el = n === 'year' ? form.querySelector('[name=year]') : form.elements[n];
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => el.focus({ preventScroll: true }), 250);
}

/* ---------- Submit ---------- */
function renderSummary(failed) {
  const box = $('#summary');
  if (!failed.length) { box.hidden = true; return; }
  box.innerHTML = `<strong>${failed.length} ${failed.length === 1 ? 'field needs' : 'fields need'} attention. Each one is marked below.</strong><button type="button" class="btn ghost" id="goFirst">Go to ${esc(LABELS[failed[0]].toLowerCase())}</button>`;
  box.hidden = false;
  $('#goFirst').addEventListener('click', () => focusField(failed[0]));
}
form.addEventListener('submit', e => {
  e.preventDefault();
  const failed = Object.keys(LABELS).filter(n => !validateField(n));
  const box = $('#summary');
  if (failed.length) {
    renderSummary(failed);
    focusField(failed[0]);
    return;
  }
  box.hidden = true;
  const btn = form.querySelector('[type=submit]');
  btn.classList.add('loading'); btn.textContent = 'Registering';
  setTimeout(() => {
    btn.classList.remove('loading'); btn.textContent = 'Register';
    const d = Object.fromEntries(new FormData(form));
    clearTimeout(draftTimer); try { localStorage.removeItem(DRAFT_KEY); } catch (_) {}
    TAKEN_IDS.push(norm(d.studentNo)); TAKEN_EMAILS.push(d.email.trim().toLowerCase());
    const ref = 'DLSJBC-' + Math.floor(100000 + Math.random() * 900000);
    const c = $('#confirmation');
    c.innerHTML = `<h2><svg class="tick" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21"/><path d="M14 25l8 8 14-17"/></svg>Registration successful</h2>
      <p>Welcome, ${esc(d.firstName)}! Keep your reference number. You can use it if you need to contact the Registrar.</p>
      <div class="refbox"><span class="ref" id="refText">${ref}</span><button type="button" class="btn ghost" id="copyRef">${icon('copy')} Copy number</button></div>
      <dl><dt>Name</dt><dd>${esc(d.firstName)} ${esc(d.lastName)}</dd><dt>Student number</dt><dd>${esc(d.studentNo)}</dd>
      <dt>Program</dt><dd>${esc(d.program)}, ${esc(d.year)} year</dd><dt>Email</dt><dd>${esc(d.email)}</dd><dt>Mobile</dt><dd>${esc(d.phone)}</dd></dl>
      <p class="small">Demo only: nothing was sent or stored on a server.</p>
      <div class="actions"><a class="btn primary" href="#login">Go to log in</a><button type="button" class="btn ghost" id="again">Register another student</button></div>`;
    resetForm();   // the details are already captured above; this also keeps the form from being re-saved as a draft
    $('#regLayout').hidden = true;
    c.hidden = false;
    window.scrollTo({ top: 0 });
    c.focus({ preventScroll: true });
    $('#again').addEventListener('click', () => { resetForm(); $('#draftNote').hidden = true; $('#regLayout').hidden = false; c.hidden = true; window.scrollTo({ top: 0 }); form.elements.firstName.focus(); });
    $('#copyRef').addEventListener('click', async e => {
      const b = e.currentTarget;
      try { await navigator.clipboard.writeText(ref); b.innerHTML = icon('check') + ' Copied'; }
      catch { const r = document.createRange(); r.selectNodeContents($('#refText')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = 'Press Ctrl+C to copy'; }
    });
  }, 900);
});

/* ---------- Clear with Undo ---------- */
function snapshot() {
  const s = {};
  [...form.elements].forEach(el => { if (!el.name) return; s[el.name + (el.type === 'radio' ? ':' + el.value : '')] = el.type === 'checkbox' || el.type === 'radio' ? el.checked : el.value; });
  return s;
}
function restore(s) {
  [...form.elements].forEach(el => {
    if (!el.name) return;
    const k = el.name + (el.type === 'radio' ? ':' + el.value : '');
    if (k in s) el.type === 'checkbox' || el.type === 'radio' ? (el.checked = s[k]) : (el.value = s[k]);
  });
  updateProgress();
}
function resetForm() {
  form.reset();
  $$('.invalid,.valid', form).forEach(n => n.classList.remove('invalid', 'valid'));
  $$('[aria-invalid]', form).forEach(n => n.removeAttribute('aria-invalid'));
  $$('.err', form).forEach(n => (n.textContent = ''));
  $('#summary').hidden = true;
  updateProgress();
}
$('#clearBtn').addEventListener('click', () => {
  const s = snapshot();
  resetForm();
  form.elements.firstName.focus();
  toast('Form cleared.', () => restore(s));
});

/* ---------- Login (with role-aware guidance) ---------- */
const lf = $('#loginForm'), ls = $('#loginStatus');
function onRole() {
  const role = lf.role.value, student = role === 'Student';
  const note = $('#roleNote');
  note.hidden = student;
  note.textContent = student ? '' : `${role} accounts are created by the school, not through online registration. Log in below if you already have one, or contact the Registrar to be set up.`;
  $('#loginIdLabel').textContent = student ? 'Student number or email *' : 'Email *';
  $('#switchLine').innerHTML = student ? 'New here? <a href="#register">Register for an account</a>' : 'Need an account? <a href="#contact">Contact the Registrar</a>';
}
$$('[name=role]', lf).forEach(r => r.addEventListener('change', onRole));
lf.addEventListener('submit', e => {
  e.preventDefault();
  ls.className = 'status'; ls.textContent = '';
  const id = lf.loginId.value.trim(), pw = lf.loginPw.value;
  const a = setError(lf.loginId, id ? '' : 'Enter your student number or email.');
  const b = setError(lf.loginPw, pw ? '' : 'Enter your password.');
  if (!a || !b) return;
  const btn = lf.querySelector('[type=submit]');
  btn.classList.add('loading'); btn.textContent = 'Logging in';
  setTimeout(() => {
    btn.classList.remove('loading'); btn.textContent = 'Log in';
    const role = lf.role.value;
    const user = USERS.find(u => (norm(u.id) === norm(id) || u.email === id.toLowerCase()) && u.pw === pw);
    if (user) { ls.className = 'status ok'; ls.textContent = `Welcome back, ${user.name}. You are logged in as ${role}.`; }
    else { ls.className = 'status bad'; ls.innerHTML = 'We could not log you in. Check your details and try again, or <a href="#forgot">reset your password</a>.'; lf.loginPw.focus(); }
  }, 800);
});
['loginId', 'loginPw'].forEach(n => lf[n].addEventListener('input', () => { if (lf[n].value) setError(lf[n], ''); }));
$$('.social-btn').forEach(b => b.addEventListener('click', () => {
  b.classList.add('loading');
  ls.className = 'status'; ls.textContent = `Connecting to ${b.dataset.provider}…`;
  setTimeout(() => {
    b.classList.remove('loading');
    ls.className = 'status ok';
    ls.textContent = `Demo: signed in as ${lf.role.value} with ${b.dataset.provider}. No real account was used.`;
  }, 1100);
}));

/* ---------- Forgot password ---------- */
const ff = $('#forgotForm'), fs = $('#forgotStatus');
ff.addEventListener('submit', e => {
  e.preventDefault();
  fs.className = 'status'; fs.textContent = '';
  const v = ff.forgotId.value.trim();
  if (!setError(ff.forgotId, v ? '' : 'Enter your student number or email.')) return;
  const btn = ff.querySelector('[type=submit]');
  btn.classList.add('loading'); btn.textContent = 'Sending';
  setTimeout(() => {
    btn.classList.remove('loading'); btn.textContent = 'Send reset link';
    fs.className = 'status ok';
    /* same message whether or not the account exists, so nobody can probe for accounts */
    fs.textContent = 'If that matches an account, a reset link is on its way. Check your inbox and spam folder. (Demo: nothing is actually sent.)';
  }, 900);
});
ff.forgotId.addEventListener('input', () => { if (ff.forgotId.value) setError(ff.forgotId, ''); });

/* ---------- Contact form ---------- */
const mf = $('#msgForm'), ms = $('#msgStatus');
mf.addEventListener('submit', e => {
  e.preventDefault();
  ms.className = 'status'; ms.textContent = '';
  const ok = [
    setError(mf.msgName, mf.msgName.value.trim() ? '' : 'Enter your name.'),
    setError(mf.msgEmail, emailRx.test(mf.msgEmail.value.trim()) ? '' : 'Enter a valid email so we can reply.'),
    setError(mf.msgText, mf.msgText.value.trim().length >= 10 ? '' : 'Tell us a little more (at least 10 characters).')
  ].every(Boolean);
  if (!ok) return;
  const subject = encodeURIComponent('Inquiry from ' + mf.msgName.value.trim());
  const body = encodeURIComponent(mf.msgText.value.trim() + '\n\n' + mf.msgName.value.trim() + '\n' + mf.msgEmail.value.trim());
  window.location.href = `mailto:${CONTACT.registrarEmail}?subject=${subject}&body=${body}`;
  ms.className = 'status ok';
  ms.textContent = `Opening your email app. If nothing opens, write to ${CONTACT.registrarEmail}.`;
});

$('#startOver').addEventListener('click', () => { $('#clearBtn').click(); });
$('#clearBtn').addEventListener('click', () => { $('#draftNote').hidden = true; });

route();
if (loadDraft()) $('#draftNote').hidden = false;
updateProgress();
saveDraft();
