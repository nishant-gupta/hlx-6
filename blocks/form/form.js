/**
 * form — definition-driven contact form (live dynamicformv2; dynamics F-1, hands-off A-2).
 *
 * Authoring: key/value rows — `source | /data/forms/contact-<lang>.json` (required), optional
 * `endpoint | <url>`. The definition (fields, labels, options, required copy, submit label) was
 * recorded from the live form. Required fields show the live error copy; a valid submission
 * POSTs { data, page, timestamp } as JSON to the endpoint when one is configured, otherwise it
 * is captured locally and the notice says plainly that no backend is connected.
 * @ew-exempt field labels/options/notice come from the form definition (data), not authored prose
 */
function rowValue(block, key) {
  const row = [...block.children].find((r) => r.firstElementChild
    && r.firstElementChild.textContent.trim().toLowerCase() === key);
  return row && row.children[1] ? row.children[1].textContent.trim() : '';
}

function el(tag, attrs = {}, text = '') {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => { if (v !== undefined && v !== false) e.setAttribute(k, v === true ? '' : v); });
  if (text) e.textContent = text;
  return e;
}

function field(def, msg) {
  const group = el('div', { class: `form-group${def.type === 'checkbox' ? ' form-group-check' : ''}` });
  const id = `f-${def.name}`;
  let control;
  if (def.type === 'checkbox') {
    const label = el('label', { class: 'form-check' });
    control = el('input', { type: 'checkbox', name: def.name, required: def.required });
    const span = el('span');
    if (def.link) span.append(el('a', { href: def.link }, def.label));
    else span.textContent = def.label;
    label.append(control, ' ', span);
    group.append(label);
  } else {
    const label = el('label', { class: 'form-label', for: id }, def.label);
    if (def.required) { label.append(' '); label.append(el('span', { class: 'form-req' }, '*')); }
    if (def.type === 'select') {
      control = el('select', {
        class: 'form-control form-control-select', id, name: def.name, required: def.required,
      });
      (def.options || []).forEach((o) => control.append(el('option', { value: o.value }, o.text)));
    } else if (def.type === 'textarea') {
      control = el('textarea', {
        class: 'form-control form-control-textarea', id, name: def.name, placeholder: def.placeholder,
      });
    } else {
      control = el('input', {
        class: 'form-control', id, name: def.name, type: 'text', placeholder: def.placeholder, required: def.required,
      });
    }
    group.append(label, control);
  }
  if (def.required) {
    const err = el('p', { class: 'form-error' }, msg);
    err.hidden = true;
    group.append(err);
  }
  return group;
}

export default async function decorate(block) {
  const source = rowValue(block, 'source');
  const endpoint = rowValue(block, 'endpoint');
  block.textContent = '';
  if (!source) return;
  const def = await (await fetch(source)).json();
  const form = el('form', { class: 'form', novalidate: true });
  def.fields.forEach((f) => form.append(field(f, def.required)));
  const actions = el('div', { class: 'form-group form-group-actions' });
  actions.append(el('button', { class: 'button primary form-submit', type: 'submit' }, def.submit));
  form.append(actions);
  const notice = el('p', { class: 'form-notice', role: 'status' }, def.notice);
  notice.hidden = true;
  form.append(notice);

  const check = (g) => {
    const c = g.querySelector('[required]');
    if (!c) return true;
    const ok = c.type === 'checkbox' ? c.checked : c.value.trim() !== '';
    const err = g.querySelector('.form-error');
    if (err) err.hidden = ok;
    c.setAttribute('aria-invalid', String(!ok));
    return ok;
  };
  const groups = [...form.querySelectorAll('.form-group')];
  groups.forEach((g) => g.querySelectorAll('input, select, textarea').forEach((c) => c.addEventListener('change', () => check(g))));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!groups.map(check).every(Boolean)) return;
    const payload = {
      data: Object.fromEntries(new FormData(form)),
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
    };
    const url = endpoint || def.endpoint;
    if (url) {
      await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } else {
      const key = `form:${def.formId || 'contact'}`;
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      stored.push(payload);
      localStorage.setItem(key, JSON.stringify(stored));
    }
    notice.hidden = false;
    form.reset();
  });
  block.append(form);
}
