/* Site chrome interactions — mirrors the state machine OBSERVED on live (stardust/replica/motion/
 * home.json + menu-*.json): click-toggled mega-menu (li.open, chevron down→up, open-col-3 panel),
 * click-driven columns (active item magenta, next column revealed), mobile burger overlay with
 * drill-down (Back row + active parent + children). No animations fired on live: none here. */
/* Social features (anonymous): every icon opens the sign-in popup; close icon hides it.
 * Observed live: body gets `popup-open`, popup .cmp-socialFeatures__request-to-signin-content-wrapper. */
document.querySelectorAll('.social').forEach((social) => {
  const popup = social.querySelector('[data-popup="signin"]');
  if (!popup) return;
  social.querySelectorAll('[data-feature]').forEach((btn) => btn.addEventListener('click', () => {
    popup.hidden = false;
    document.body.classList.add('popup-open');
  }));
  social.querySelectorAll('.social__close').forEach((x) => x.addEventListener('click', () => {
    x.closest('.social__popup').hidden = true;
    document.body.classList.remove('popup-open');
  }));
});

/* In-page tabs (observed motion/product-listing.json): click swaps tab--active / tabpanel--active;
 * the tab list gets the sticky class (position:fixed, top 0) once window.scrollY passes the tabs' top —
 * same trigger and same mechanism as live (.cmp-tabs__tablist--sticky). */
document.querySelectorAll('.tabs').forEach((tabs) => {
  const list = tabs.querySelector('.tabs__list-wrap');
  const tabEls = [...tabs.querySelectorAll('.tabs__tab')];
  tabEls.forEach((tab) => {
    const activate = () => tabEls.forEach((t) => {
      const on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    tab.addEventListener('click', activate);
    tab.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
  });
  if (list) {
    // live keeps the list's space while it is fixed (no content jump): reserve it
    const onScroll = () => {
      const stick = window.scrollY > tabs.getBoundingClientRect().top + window.scrollY;
      if (stick && !list.classList.contains('is-sticky')) tabs.style.paddingTop = `${list.offsetHeight}px`;
      if (!stick) tabs.style.paddingTop = '';
      list.classList.toggle('is-sticky', stick);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
});

(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const desktop = () => window.matchMedia('(min-width: 1024px)').matches;
  const tops = [...header.querySelectorAll('.nav-top')];

  // ---- desktop: top-level toggle + column drill
  const closeAll = (except) => tops.forEach((li) => {
    if (li === except) return;
    li.classList.remove('is-open');
    const btn = li.querySelector(':scope > button');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    const panel = li.querySelector('.nav-panel');
    if (panel) panel.hidden = true;
  });
  tops.forEach((li) => {
    const btn = li.querySelector(':scope > button');
    const panel = li.querySelector('.nav-panel');
    if (!btn || !panel) return;
    btn.addEventListener('click', () => {
      if (!desktop()) return;
      const open = !li.classList.contains('is-open');
      closeAll(li);
      li.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
    });
    panel.querySelectorAll('li > span').forEach((label) => {
      label.setAttribute('role', 'button');
      label.tabIndex = 0;
      const activate = () => {
        if (!desktop()) return;
        const item = label.parentElement;
        [...item.parentElement.children].forEach((sib) => {
          sib.classList.toggle('is-active', sib === item);
          if (sib !== item) sib.querySelectorAll('.is-active').forEach((d) => d.classList.remove('is-active'));
        });
      };
      label.addEventListener('click', activate);
      label.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); label.click(); } });
    });
  });

  // ---- mobile: burger overlay + drill-down
  const burger = header.querySelector('.site-header__burger');
  const nav = header.querySelector('.site-header__nav');
  if (burger && nav) {
    const back = document.createElement('li');
    back.className = 'nav-back';
    back.innerHTML = '<button type="button"><span class="icon icon--chevron-left" aria-hidden="true"></span>Back</button>';
    nav.querySelector(':scope > ul').prepend(back);
    let trail = [];
    const render = () => {
      nav.classList.toggle('is-drilled', trail.length > 0);
      nav.querySelectorAll('.is-current').forEach((e) => e.classList.remove('is-current'));
      trail.forEach((li) => li.classList.add('is-current'));
    };
    burger.addEventListener('click', () => {
      const open = !header.classList.contains('menu-open');
      header.classList.toggle('menu-open', open);
      document.documentElement.classList.toggle('menu-locked', open);
      burger.setAttribute('aria-expanded', String(open));
      if (open) window.scrollTo(0, header.offsetTop);
      trail = []; render();
    });
    back.querySelector('button').addEventListener('click', () => { trail.pop(); render(); });
    nav.addEventListener('click', (e) => {
      if (desktop()) return;
      const hit = e.target.closest('.nav-top > button, .nav-panel li > span');
      if (!hit) return;
      const li = hit.closest('li');
      if (!li.querySelector(':scope > ul, :scope > .nav-panel')) return;
      e.stopImmediatePropagation();
      trail.push(li); render();
    }, true);
  }
})();
