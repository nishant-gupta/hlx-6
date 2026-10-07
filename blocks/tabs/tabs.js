/**
 * tabs — in-page tabs over SECTIONS (live cmp-tabs on the product listing; dynamics M-4).
 *
 * Authoring: one row per tab label. Each panel is the run of sections whose section metadata
 * `tab` equals the label (David's Model D2: no nested block tables — panels are sections combined
 * client-side). Observed on live (stardust/replica/motion/product-listing.json): click swaps the
 * active tab/panel; the tab list becomes position:fixed at top 0 once the page scrolls past it,
 * with its space kept (no content jump). Label paragraphs are MOVED into the tab buttons (EW1).
 */
function panelsFor(label) {
  return [...document.querySelectorAll('main > .section[data-tab]')].filter((s) => s.dataset.tab === label);
}

export default function decorate(block) {
  const labels = [];
  const list = document.createElement('ol');
  list.className = 'tabs-list';
  list.setAttribute('role', 'tablist');
  [...block.children].forEach((row, i) => {
    const cell = row.firstElementChild || row;
    const label = cell.textContent.trim();
    labels.push(label);
    const tab = document.createElement('li');
    tab.className = 'tabs-tab';
    tab.setAttribute('role', 'tab');
    tab.tabIndex = i === 0 ? 0 : -1;
    tab.setAttribute('aria-selected', String(i === 0));
    if (i === 0) tab.classList.add('is-active');
    tab.append(...cell.childNodes);
    tab.querySelectorAll('p').forEach((p) => p.replaceWith(...p.childNodes));
    list.append(tab);
  });
  const bar = document.createElement('div');
  bar.className = 'tabs-list-wrap';
  const inner = document.createElement('div');
  inner.className = 'tabs-list-inner';
  inner.append(list);
  bar.append(inner);
  block.replaceChildren(bar);

  const show = (idx) => {
    [...list.children].forEach((t, i) => {
      t.classList.toggle('is-active', i === idx);
      t.setAttribute('aria-selected', String(i === idx));
      t.tabIndex = i === idx ? 0 : -1;
    });
    labels.forEach((l, i) => panelsFor(l).forEach((s) => s.classList.toggle('tab-hidden', i !== idx)));
  };
  [...list.children].forEach((t, i) => {
    t.addEventListener('click', () => show(i));
    t.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(i); } });
  });
  show(0);
  // sections decorate after this block in some loads — re-apply once the page settles
  window.addEventListener('load', () => show([...list.children].findIndex((t) => t.classList.contains('is-active'))));

  const host = block.closest('.section') || block;
  const onScroll = () => {
    const stick = window.scrollY > host.getBoundingClientRect().top + window.scrollY;
    if (stick && !bar.classList.contains('is-sticky')) block.style.paddingTop = `${bar.offsetHeight}px`;
    if (!stick) block.style.paddingTop = '';
    bar.classList.toggle('is-sticky', stick);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}
