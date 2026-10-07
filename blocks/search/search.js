/**
 * search — site search results (live searchresults component; dynamics F-2, hands-off A-3).
 * Authoring: key/value rows — `placeholder`, `summary` ("… {count} … {term}"), `no-results`.
 * Results come from the EDS query-index (/query-index.json), scoped to the page's locale tree;
 * every term must match the title or description (case- and accent-insensitive).
 * @ew-exempt the result list is generated from the index, not authored prose
 */
const fold = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function config(block) {
  const cfg = {};
  [...block.children].forEach((row) => {
    const [k, v] = row.children;
    if (k && v) cfg[k.textContent.trim().toLowerCase()] = v.textContent.trim();
  });
  return cfg;
}

let index;
async function loadIndex() {
  if (!index) {
    index = fetch('/query-index.json')
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => j.data || [])
      .catch(() => []);
  }
  return index;
}

export default async function decorate(block) {
  const cfg = config(block);
  const lang = window.location.pathname.split('/')[1] || 'de';

  const form = document.createElement('form');
  form.className = 'search-form';
  form.setAttribute('role', 'search');
  const field = document.createElement('div');
  field.className = 'search-field';
  const icon = document.createElement('span');
  icon.className = 'azi azi-search';
  icon.setAttribute('aria-hidden', 'true');
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.className = 'search-input';
  input.placeholder = cfg.placeholder || '';
  input.setAttribute('aria-label', cfg.placeholder || 'Search');
  field.append(icon, input);
  form.append(field);

  const results = document.createElement('div');
  results.className = 'search-results';
  results.setAttribute('aria-live', 'polite');

  const render = async (term) => {
    results.replaceChildren();
    const terms = fold(term).split(/\s+/).filter(Boolean);
    if (!terms.length) return;
    const rows = (await loadIndex()).filter((r) => r.path && r.path.startsWith(`/${lang}/`)
      && !/\/(nav|footer|search-result)$/.test(r.path));
    const hits = rows.filter((r) => {
      const hay = fold(`${r.title} ${r.description}`);
      return terms.every((t) => hay.includes(t));
    });
    const summary = document.createElement('h3');
    summary.className = 'search-summary';
    const [before, after] = (cfg.summary || '{count} {term}').split('{term}');
    summary.textContent = before.replace('{count}', hits.length);
    const em = document.createElement('span');
    em.className = 'search-term';
    em.textContent = term;
    summary.append(em, after || '');
    results.append(summary);
    if (!hits.length) {
      const none = document.createElement('h4');
      none.className = 'search-none';
      none.textContent = cfg['no-results'] || '';
      results.append(none);
      return;
    }
    const ul = document.createElement('ul');
    ul.className = 'search-list';
    hits.forEach((r) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'search-item';
      a.href = r.path;
      const h = document.createElement('h4');
      h.textContent = (r.title || r.path).replace(/\s*\|\s*MyAstraZeneca\s*$/i, '');
      a.append(h);
      if (r.description) {
        const p = document.createElement('p');
        p.className = 'search-description';
        p.textContent = r.description;
        a.append(p);
      }
      li.append(a);
      ul.append(li);
    });
    results.append(ul);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const term = input.value.trim();
    const url = new URL(window.location.href);
    if (term) url.searchParams.set('q', term); else url.searchParams.delete('q');
    window.history.replaceState(null, '', url);
    render(term);
  });

  block.replaceChildren(form, results);
  const q = new URLSearchParams(window.location.search).get('q') || '';
  if (q) {
    input.value = q;
    render(q);
  }
}
