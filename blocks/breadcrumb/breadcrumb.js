/**
 * breadcrumb — authored per page as one list (live cmp-breadcrumb, play-icon separators).
 * Authoring: one cell with a <ul>; each item is a link, the last item plain text (current page).
 * An item whose link is wrapped in <em> targets a non-page category on live and renders muted.
 * The list is MOVED into the nav (EW1); a single-item trail (home) is hidden, as on live.
 */
export default function decorate(block) {
  const ul = block.querySelector('ul');
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  if (ul) {
    [...ul.children].forEach((li) => {
      if (li.querySelector('em')) li.classList.add('is-muted');
      // live separates items with whitespace (inline-block) — keep a trailing space in each link
      const a = li.querySelector('a');
      if (a && !a.textContent.endsWith(' ')) a.append(' ');
    });
    const last = ul.lastElementChild;
    if (last) last.setAttribute('aria-current', 'page');
    nav.append(ul);
  }
  block.replaceChildren(nav);
}
