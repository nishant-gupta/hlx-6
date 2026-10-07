import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * header — language bar + logo + mega-menu + search/login (stardust replica of myastrazeneca.ch).
 *
 * Authored in /<lang>/nav (three sections, the stock contract):
 *   1. brand: a paragraph holding the logo link (<a><picture></a>)
 *   2. nav: one nested <ul> — top items with a child <ul> become dropdowns; leaf items are links
 *   3. tools: a paragraph with the search label, a CTA paragraph with the login link
 * The language bar comes from the page's `languages` metadata ("DE=/de/…*, FR=/fr/…", * = current).
 *
 * Behaviour mirrors what was observed on live (stardust/replica/motion/menu-*.json): click-toggled
 * top items (chevron flips), click-driven columns (active item magenta, next column revealed),
 * mobile burger overlay with drill-down (Back row + active parent + children). No animations.
 * Authored elements are MOVED into the chrome (EW1); nothing is rebuilt from text.
 */

const isDesktop = window.matchMedia('(min-width: 1024px)');

function buildLangBar() {
  const meta = getMetadata('languages');
  const bar = document.createElement('div');
  bar.className = 'lang-bar';
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Language');
  const ul = document.createElement('ul');
  meta.split(',').map((s) => s.trim()).filter(Boolean).forEach((entry) => {
    const [code, rawHref = ''] = entry.split('=');
    const active = rawHref.endsWith('*');
    const li = document.createElement('li');
    if (active) li.className = 'is-active';
    const a = document.createElement('a');
    a.href = active ? rawHref.slice(0, -1) : rawHref;
    a.lang = code.toLowerCase();
    a.textContent = code; // @ew-exempt language codes are page config (metadata), not authored copy
    li.append(a);
    ul.append(li);
  });
  nav.append(ul);
  bar.append(nav);
  return bar;
}

function closeTops(navEl, except) {
  navEl.querySelectorAll('.nav-top').forEach((li) => {
    if (li === except) return;
    li.classList.remove('is-open');
    const btn = li.querySelector(':scope > .nav-top-toggle');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  });
}

function onActivate(el, fn) {
  el.addEventListener('click', fn);
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      el.click();
    }
  });
}

function decorateNav(navEl) {
  const top = navEl.querySelector('ul');
  if (!top) return;
  top.classList.add('nav-l0');
  // the pipeline wraps list-item text in <p> on live (#98) — unwrap everywhere in the nav
  navEl.querySelectorAll('li > p').forEach((p) => p.replaceWith(...p.childNodes));
  [...top.children].forEach((li) => {
    li.classList.add('nav-top');
    const sub = li.querySelector(':scope > ul');
    if (!sub) return;
    const toggle = document.createElement('span');
    toggle.className = 'nav-top-toggle';
    toggle.setAttribute('role', 'button');
    toggle.tabIndex = 0;
    toggle.setAttribute('aria-expanded', 'false');
    const text = document.createElement('span');
    text.className = 'nav-top-label';
    text.append(...[...li.childNodes].filter((n) => n !== sub));
    const chev = document.createElement('span');
    chev.className = 'azi azi-chevron-down';
    chev.setAttribute('aria-hidden', 'true');
    toggle.append(text, chev);
    const panel = document.createElement('div');
    panel.className = 'nav-panel';
    sub.classList.add('nav-l1');
    panel.append(sub);
    li.prepend(toggle);
    li.append(panel);
    onActivate(toggle, () => {
      if (!isDesktop.matches) return;
      const willOpen = !li.classList.contains('is-open');
      closeTops(navEl, li);
      li.classList.toggle('is-open', willOpen);
      toggle.setAttribute('aria-expanded', String(willOpen));
    });
  });
  navEl.querySelectorAll('.nav-l1 > li > ul').forEach((u) => u.classList.add('nav-l2'));
  navEl.querySelectorAll('.nav-l2 > li > ul').forEach((u) => u.classList.add('nav-l3'));
  // parent items inside panels: wrap their label so the columns can be driven by click
  navEl.querySelectorAll('.nav-panel li').forEach((li) => {
    const child = li.querySelector(':scope > ul');
    if (!child) return;
    const label = document.createElement('span');
    label.className = 'nav-item-label';
    label.setAttribute('role', 'button');
    label.tabIndex = 0;
    label.append(...[...li.childNodes].filter((n) => n !== child));
    li.prepend(label);
    li.classList.add('has-children');
    onActivate(label, () => {
      if (!isDesktop.matches) return;
      [...li.parentElement.children].forEach((sib) => {
        sib.classList.toggle('is-active', sib === li);
        if (sib !== li) sib.querySelectorAll('.is-active').forEach((d) => d.classList.remove('is-active'));
      });
    });
  });
}

function decorateMobile(headerEl, navEl, burger) {
  const l0 = navEl.querySelector('.nav-l0');
  if (!l0) return;
  const back = document.createElement('li');
  back.className = 'nav-back';
  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.innerHTML = '<span class="azi azi-chevron-left" aria-hidden="true"></span>';
  backBtn.append('Back'); // @ew-exempt mobile drill-down control label (live: "Back")
  back.append(backBtn);
  l0.prepend(back);
  let trail = [];
  const render = () => {
    navEl.classList.toggle('is-drilled', trail.length > 0);
    navEl.querySelectorAll('.is-current').forEach((e) => e.classList.remove('is-current'));
    trail.forEach((li) => li.classList.add('is-current'));
  };
  burger.addEventListener('click', () => {
    const open = !headerEl.classList.contains('menu-open');
    headerEl.classList.toggle('menu-open', open);
    document.documentElement.classList.toggle('menu-locked', open);
    burger.setAttribute('aria-expanded', String(open));
    if (open) window.scrollTo(0, headerEl.querySelector('.site-header').getBoundingClientRect().top + window.scrollY);
    trail = [];
    render();
  });
  backBtn.addEventListener('click', () => { trail.pop(); render(); });
  navEl.addEventListener('click', (e) => {
    if (isDesktop.matches) return;
    const hit = e.target.closest('.nav-top-toggle, .nav-item-label');
    if (!hit) return;
    e.stopImmediatePropagation();
    trail.push(hit.closest('li'));
    render();
  }, true);
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  block.textContent = '';
  if (!fragment) return;

  const [brandSec, navSec, toolsSec] = [...fragment.children];
  const row = document.createElement('div');
  row.className = 'site-header';
  const inner = document.createElement('div');
  inner.className = 'site-header-inner';

  const brand = document.createElement('div');
  brand.className = 'site-header-logo';
  const logoLink = brandSec && brandSec.querySelector('a');
  if (logoLink) {
    logoLink.querySelectorAll('img').forEach((img) => { img.loading = 'eager'; });
    brand.append(logoLink.closest('p') || logoLink);
  }

  const navEl = document.createElement('nav');
  navEl.className = 'site-header-nav';
  navEl.id = 'nav';
  navEl.setAttribute('aria-label', 'Main');
  const ul = navSec && navSec.querySelector('ul');
  if (ul) navEl.append(ul);
  decorateNav(navEl);

  const tools = document.createElement('div');
  tools.className = 'site-header-tools';
  const search = document.createElement('a');
  search.className = 'site-header-search';
  const lang = window.location.pathname.split('/')[1] || 'de';
  search.href = `/${lang}/startseite/search-result`;
  const searchLabel = toolsSec && [...toolsSec.querySelectorAll('p')].find((p) => !p.querySelector('a'));
  const icon = document.createElement('span');
  icon.className = 'azi azi-search';
  icon.setAttribute('aria-hidden', 'true');
  search.append(icon);
  if (searchLabel) {
    searchLabel.classList.add('sr-only');
    search.append(searchLabel);
  }
  tools.append(search);
  const login = toolsSec && toolsSec.querySelector('a');
  if (login) {
    login.classList.remove('button', 'primary', 'secondary');
    login.classList.add('btn-login');
    const wrap = login.closest('p') || login;
    wrap.classList.remove('button-wrapper');
    wrap.classList.add('btn-login-wrap');
    tools.append(wrap);
  }

  const burger = document.createElement('button');
  burger.type = 'button';
  burger.className = 'site-header-burger';
  burger.setAttribute('aria-label', 'Menu');
  burger.setAttribute('aria-expanded', 'false');
  burger.innerHTML = '<span></span><span></span>';

  inner.append(brand, navEl, tools, burger);
  row.append(inner);
  block.append(buildLangBar(), row);
  decorateMobile(block, navEl, burger);

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeTops(navEl); });
}
