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

/* HCP self-certification gate (dynamics M-1; observed gate-probe: "yes" hides the modal and the
 * choice survives reload). Remembered for data-expiry-minutes (live data-expiry-time="120"). */
document.querySelectorAll('.hcp-gate').forEach((gate) => {
  const KEY = 'hcp-selfcert';
  const until = +localStorage.getItem(KEY) || 0;
  const close = () => { gate.hidden = true; document.documentElement.classList.remove('hcp-gate-open'); };
  if (until > Date.now()) { close(); return; }
  document.documentElement.classList.add('hcp-gate-open');
  gate.querySelector('.self-certify-yes').addEventListener('click', () => {
    localStorage.setItem(KEY, String(Date.now() + (+gate.dataset.expiryMinutes || 120) * 60000));
    close();
  });
});

/* Contact form (dynamics F-1, hands-off A-2): required fields show the live error copy; a valid
 * submission is captured locally and the notice states plainly that no backend is connected. When an
 * endpoint is configured (data-endpoint), the payload { data, page, timestamp } is POSTed as JSON. */
document.querySelectorAll('form[data-form]').forEach((form) => {
  const groups = [...form.querySelectorAll('.form__group')];
  const check = (g) => {
    const c = g.querySelector('[required]');
    if (!c) return true;
    const ok = c.type === 'checkbox' ? c.checked : c.value.trim() !== '';
    const err = g.querySelector('.form__error');
    if (err) err.hidden = ok;
    c.setAttribute('aria-invalid', String(!ok));
    return ok;
  };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const valid = groups.map(check).every(Boolean);
    if (!valid) return;
    const data = Object.fromEntries(new FormData(form));
    const payload = { data, page: location.pathname, timestamp: new Date().toISOString() };
    const endpoint = form.dataset.endpoint;
    if (endpoint) await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    else {
      const key = `form:${form.dataset.form}`;
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      stored.push(payload);
      localStorage.setItem(key, JSON.stringify(stored));
    }
    form.querySelector('.form__notice').hidden = false;
    form.reset();
  });
  groups.forEach((g) => g.querySelectorAll('input, select, textarea').forEach((c) => c.addEventListener('change', () => check(g))));
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
