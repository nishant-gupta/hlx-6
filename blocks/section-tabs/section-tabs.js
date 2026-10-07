/**
 * section-tabs — a horizontal list of links to sibling pages (TRIXEO, PATTRNS), the current page
 * underlined (live cmp-list in the "trixeo-navigation" experience fragment).
 * Authoring: one cell with a <ul> of links. Variant `framed` adds the live fragment's rules above
 * and below. The list is MOVED (EW1); the active item is derived from the current path.
 */
export default function decorate(block) {
  const ul = block.querySelector('ul');
  const nav = document.createElement('nav');
  nav.className = 'section-tabs-inner';
  if (ul) {
    const here = window.location.pathname.replace(/\.html$/, '').replace(/^\/content/, '').toLowerCase();
    [...ul.querySelectorAll('li')].forEach((li) => {
      li.querySelectorAll(':scope > p').forEach((p) => p.replaceWith(...p.childNodes));
      const a = li.querySelector('a');
      if (!a) return;
      const target = new URL(a.href, window.location).pathname.replace(/\.html$/, '').toLowerCase();
      if (target === here) {
        li.classList.add('is-active');
        a.setAttribute('aria-current', 'page');
      }
    });
    nav.append(ul);
  }
  block.replaceChildren(nav);
}
