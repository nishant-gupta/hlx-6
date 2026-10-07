/**
 * accordion — FAQ (live cmp-accordion on the COPD pages). Block Collection shape:
 * one row per item — cell 1: the question, cell 2: the answer (rich text).
 * Built on <details>/<summary>; the question paragraph is MOVED into the summary (EW1).
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [q, a] = [...row.children];
    const details = document.createElement('details');
    details.className = 'accordion-item';
    const summary = document.createElement('summary');
    summary.className = 'accordion-title';
    if (q) summary.append(...q.childNodes);
    summary.querySelectorAll('p').forEach((p) => p.replaceWith(...p.childNodes));
    const icon = document.createElement('span');
    icon.className = 'azi azi-chevron-down';
    icon.setAttribute('aria-hidden', 'true');
    summary.append(icon);
    const body = document.createElement('div');
    body.className = 'accordion-panel';
    if (a) body.append(...a.childNodes);
    details.append(summary, body);
    row.replaceWith(details);
  });
}
