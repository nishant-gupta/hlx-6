/* eslint-disable */
/* global WebImporter */
/**
 * myastrazeneca.ch → Edge Delivery import (stardust replica, Phase 5).
 *
 * One importer for every template: the source is built from a small AEM core-component
 * vocabulary (teaser / title / text / image / button / list / tabs / socialFeatures /
 * contentpaywall / dynamicformv2 / accordion / video / selfcertification), so the transform
 * walks the content root and maps each component to the EDS content model that the gated
 * archetype prototypes define (stardust/prototypes/*-proposed.html, stardust/eds-conversion-log.md):
 *
 *   - every AEM leaf component → one EDS section (default content or a block); its spacing variant
 *     rides section metadata (`variant` tokens), so margins collapse between sections exactly as
 *     they do between AEM components;
 *   - every AEM container padding → `pt` / `pb` tokens ("<mobile>-<desktop>" px) on the first / last
 *     section of the container's group; background (mist) containers become one `band` section;
 *   - text is carried byte-verbatim (attributes stripped), AEM spacer paragraphs (<p>&nbsp;</p>,
 *     dropped by the EDS pipeline) are folded into the next paragraph as a leading <br>.
 *
 * Source pages are the settled DOM captured by stardust:extract, served locally at their live
 * paths (the live origin is CloudFront-WAF rate limited).
 */
import { IMAGE_MAP, PAGE_PATHS } from './site-data.js';

const LIVE = 'https://www.myastrazeneca.ch';
const IMG_DIR = '/stardust/prototypes/assets/img/';
const PAGE_SET = new Set(PAGE_PATHS);

/* ------------------------------------------------------------------ helpers */
const livePath = (params) => new URL(params.originalURL).pathname;
const docPath = (p) => p.replace(/\.html$/, '').replace(/\/$/, '').toLowerCase() || '/index';
const abs = (u) => { try { return new URL(u, LIVE).href; } catch { return u; } };

function localHref(href) {
  if (!href) return href;
  if (/^(mailto:|tel:|#|javascript:)/i.test(href)) return href;
  let u;
  try { u = new URL(href, LIVE); } catch { return href; }
  if (u.hostname === 'www.myastrazeneca.ch' || u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
    const p = u.pathname.replace(/\.html$/, '').toLowerCase();
    if (PAGE_SET.has(p)) return `${p}${u.search}${u.hash}`;
    return `${LIVE}${u.pathname}${u.search}${u.hash}`; // not migrated (login-gated / 404) → stays on live
  }
  return u.href;
}

function localImg(src) {
  const a = abs(src);
  const f = IMAGE_MAP[a];
  return f ? IMG_DIR + f : null;
}

/** deep-clean a node: keep href/target/src/alt, rewrite links + images, unwrap spans */
function clean(el, document) {
  const c = el.cloneNode(true);
  c.querySelectorAll('script, style, noscript, button.cmp-text__arrow, meta, link').forEach((n) => n.remove());
  c.querySelectorAll('*').forEach((n) => {
    [...n.attributes].forEach((a) => { if (!['href', 'target', 'src', 'alt', 'colspan', 'rowspan'].includes(a.name)) n.removeAttribute(a.name); });
    if (n.tagName === 'A') n.setAttribute('href', localHref(n.getAttribute('href')));
    if (n.tagName === 'IMG') {
      const l = localImg(n.getAttribute('src'));
      if (l) n.setAttribute('src', l); else n.remove();
    }
  });
  c.querySelectorAll('span, font').forEach((s) => s.replaceWith(...s.childNodes));
  foldSpacers(c, document);
  return c;
}

const isSpacer = (n) => n.tagName === 'P' && !n.querySelector('img, a, picture') && n.textContent.replace(/[\s ]/g, '') === '';

/**
 * AEM spacer lines → zero-width-space paragraphs. The EDS pipeline drops whitespace-only
 * paragraphs (#112) and the markdown step drops leading <br>s, but a paragraph holding U+200B is
 * neither — it renders exactly one line box, like the source's <p>&nbsp;</p>. Leading <br>s inside a
 * paragraph (<p><br> Text) are the same line, so they become a spacer paragraph before it.
 */
const ZWSP = '\u2800'; // braille blank: survives the grid-table markdown step (U+200B does not inside block cells)
function foldSpacers(root, document) {
  const spacer = () => { const p = document.createElement('p'); p.textContent = ZWSP; return p; };
  for (const k of [...root.children]) {
    if (isSpacer(k)) { k.replaceWith(spacer()); continue; }
    if (k.tagName !== 'P') continue;
    let lead = 0;
    while (k.firstChild && (k.firstChild.nodeName === 'BR' || (k.firstChild.nodeType === 3 && !k.firstChild.textContent.replace(/[\s ]/g, '')))) {
      if (k.firstChild.nodeName === 'BR') lead += 1;
      k.firstChild.remove();
    }
    for (let i = 0; i < lead; i += 1) k.before(spacer());
  }
}

function picture(img, document) {
  if (!img) return null;
  const l = localImg(img.getAttribute('src') || '');
  if (!l) return null;
  const i = document.createElement('img');
  i.src = l;
  i.alt = img.getAttribute('alt') || '';
  return i;
}

function cta(a, kind, document) {
  const p = document.createElement('p');
  const wrap = document.createElement(kind === 'secondary' ? 'em' : 'strong');
  const link = document.createElement('a');
  link.href = localHref(a.getAttribute('href'));
  link.textContent = a.textContent.replace(/\s+/g, ' ').trim();
  wrap.append(link);
  p.append(wrap);
  return p;
}

function heading(src, document, levelOverride) {
  const tag = levelOverride || (src.tagName.match(/^H\d$/) ? src.tagName : 'H2');
  const h = document.createElement(tag);
  const inner = clean(src, document);
  // AEM wraps title text in <p>/<span>: flatten to inline content, keep <br>/<sup>/<a>
  inner.querySelectorAll('p').forEach((p, i, all) => { if (i < all.length - 1) p.after(document.createElement('br')); p.replaceWith(...p.childNodes); });
  h.append(...inner.childNodes);
  // trailing <br>s carry no line on the heading itself
  while (h.lastChild && (h.lastChild.nodeName === 'BR' || (h.lastChild.nodeType === 3 && !h.lastChild.textContent.trim()))) h.lastChild.remove();
  return h;
}

const table = (rows, document) => WebImporter.DOMUtils.createTable(rows, document);

/* ------------------------------------------------------------------ section model */
class Out {
  constructor(document) { this.document = document; this.sections = []; }
  add(els, meta = {}) {
    const s = { els: els.filter(Boolean), meta: { ...meta } };
    if (!s.els.length) return null;
    this.sections.push(s);
    return s;
  }
  render(main) {
    const { document } = this;
    this.sections.forEach((s, i) => {
      if (i) main.append(document.createElement('hr'));
      main.append(...s.els);
      const m = s.meta;
      if (m.pt) m.pt = `${m.pt[0]}-${m.pt[1]}`;
      if (m.pb) m.pb = `${m.pb[0]}-${m.pb[1]}`;
      const rows = Object.entries(m).filter(([, v]) => v !== undefined && v !== '' && v !== '0-0');
      if (rows.length) main.append(table([['Section Metadata'], ...rows.map(([k, v]) => [k, v])], document));
    });
  }
}

const PAD = { 'tb-space': [[20, 20], [20, 20]], 'tb-space-md': [[20, 40], [20, 40]], 'desktop-tb-space': [[0, 20], [0, 20]], 'desktop-tb-space-md': [[0, 40], [0, 40]], 'tb-space-lg': [[40, 80], [40, 80]] };
const cls = (el) => [...el.classList];
const variants = (el, base) => cls(el).filter((c) => c.startsWith(`${base}--`)).map((c) => c.slice(base.length + 2));

function addPad(s, key, v) { if (!s) return; s.meta[key] = s.meta[key] || [0, 0]; s.meta[key] = [s.meta[key][0] + v[0], s.meta[key][1] + v[1]]; }

/* ------------------------------------------------------------------ component mappers */
function teaserParts(t, document) {
  const imgs = [...t.querySelectorAll('.cmp-teaser__image img')];
  const desk = t.querySelector('.cmp-teaser__image-desktop img') || imgs[0];
  const mob = t.querySelector('.cmp-teaser__image-mobile img');
  // the live teaser fills either the title or the pretitle slot; an empty (&nbsp;) pretitle can precede the title
  const hasText = (e) => !!e && e.textContent.replace(/ /g, ' ').trim() !== '';
  const slots = [t.querySelector('.cmp-teaser__title'), t.querySelector('.cmp-teaser__pretitle')];
  const title = slots.find(hasText) || slots.find(Boolean) || null;
  const desc = t.querySelector('.cmp-teaser__description');
  const actions = [...t.querySelectorAll('.cmp-teaser__action-link')];
  return { desk, mob, title, desc, actions };
}

function teaserContent(parts, document, { titleLevel } = {}) {
  const out = [];
  if (parts.title) {
    const lvl = titleLevel || (parts.title.tagName.match(/^H\d$/) ? parts.title.tagName : 'H4');
    out.push(heading(parts.title, document, lvl));
  }
  if (parts.desc) out.push(...clean(parts.desc, document).childNodes);
  parts.actions.forEach((a) => out.push(cta(a, 'primary', document)));
  return out;
}

function heroBlock(t, document, variant) {
  const parts = teaserParts(t, document);
  const rows = [[variant ? `Hero (${variant})` : 'Hero']];
  const d = picture(parts.desk, document); const m = picture(parts.mob, document);
  if (d) rows.push([d]);
  if (m && (!d || m.src !== d.src)) rows.push([m]);
  const content = teaserContent(parts, document, { titleLevel: parts.title && parts.title.tagName });
  rows.push([content.length ? content : '']);
  return table(rows, document);
}

function cardsBlock(teasers, document, variantList) {
  const rows = [[variantList.length ? `Cards (${variantList.join(', ')})` : 'Cards']];
  for (const t of teasers) {
    const parts = teaserParts(t, document);
    const media = [picture(parts.desk, document), picture(parts.mob, document)].filter(Boolean);
    rows.push([media.length ? media : '', teaserContent(parts, document)]);
  }
  return table(rows, document);
}

function protectedCardsBlock(pcs, document) {
  const rows = [['Cards (protected)']];
  for (const pc of pcs) {
    const t = pc.querySelector('.teaser');
    const parts = teaserParts(t, document);
    const media = [picture(parts.desk, document), picture(parts.mob, document)].filter(Boolean);
    const overlay = pc.querySelector('.cmp-container--protected-cta-content .cmp-text');
    rows.push([media.length ? media : '', teaserContent(parts, document), overlay ? [...clean(overlay, document).childNodes] : '']);
  }
  return table(rows, document);
}

function columnsBlock(t, document) {
  const parts = teaserParts(t, document);
  const v = variants(t, 'teaser');
  const media = [picture(parts.desk, document), picture(parts.mob, document)].filter(Boolean);
  const content = teaserContent(parts, document);
  const textFirst = v.includes('text-image');
  const vs = [];
  if (v.includes('text-left')) vs.push('text-left');
  if (v.includes('title-color-core')) vs.push('title-core');
  const name = vs.length ? `Columns (${vs.join(', ')})` : 'Columns';
  return table([[name], textFirst ? [content, media.length ? media : ''] : [media.length ? media : '', content]], document);
}

function textSection(c, out, document, extraTokens = []) {
  const v = variants(c, 'text');
  const rt = c.querySelector('.cmp-text') || c;
  const body = clean(rt, document);
  const tokens = ['text', ...v.filter((x) => !/^list-marker/.test(x)), ...extraTokens];
  // data tables inside rich text → `table` blocks, default content around them stays in the section
  const els = [];
  let buf = [];
  const flush = () => { if (buf.length) { els.push(...buf); buf = []; } };
  for (const n of [...body.childNodes]) {
    if (n.nodeType === 1 && n.tagName === 'TABLE') {
      flush();
      const rows = [...n.querySelectorAll('tr')].map((tr) => [...tr.children].map((td) => [...td.childNodes]));
      els.push(table([['Table'], ...rows], document));
    } else buf.push(n);
  }
  flush();
  return out.add(els, { variant: tokens.join(' ') });
}

function titleSection(c, out, document) {
  const h = c.querySelector('.cmp-title__text');
  if (!h) return null;
  return out.add([heading(h, document)], { variant: ['title', ...variants(c, 'title').filter((x) => !x.startsWith('color'))].join(' ') });
}

function imageSection(c, out, document) {
  const imgs = [...c.querySelectorAll('img')].map((i) => picture(i, document)).filter(Boolean);
  const els = imgs.map((i) => { const p = document.createElement('p'); p.append(i); return p; });
  return out.add(els, { variant: 'image' });
}

function buttonSection(c, out, document) {
  const a = c.querySelector('a.cmp-button, a');
  if (!a) return null;
  const v = variants(c, 'button');
  return out.add([cta(a, v.includes('secondary') ? 'secondary' : 'primary', document)], { variant: ['button', ...v.filter((x) => x !== 'secondary')].join(' ') });
}

function socialSection(c, out, document) {
  const pop = (sel) => { const e = c.querySelector(sel); return e ? e.textContent.trim() : ''; };
  return out.add([table([['Social'], [pop('.cmp-socialFeatures__request-to-signin-content') || 'requestToSignInContent'], [pop('.cmp-socialFeatures__err-msg .cmp-socialFeatures__popup-content') || 'errorMessage']], document)]);
}

function listSection(c, out, document, framed) {
  const ul = document.createElement('ul');
  c.querySelectorAll('.cmp-list__item').forEach((li) => {
    const a = li.querySelector('a');
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = localHref(a.getAttribute('href'));
    link.textContent = a.textContent.trim();
    item.append(link);
    ul.append(item);
  });
  return out.add([table([[framed ? 'Section Tabs (framed)' : 'Section Tabs'], [ul]], document)]);
}

function paywallSection(c, out, document) {
  const h = c.querySelector('.cmp-title__text');
  const els = [h ? heading(h, document) : null];
  c.querySelectorAll('a.cmp-button').forEach((a) => els.push(cta(a, a.closest('.button--secondary') ? 'secondary' : 'primary', document)));
  return out.add(els, { style: 'paywall' });
}

function formSection(c, out, document, lang) {
  return out.add([table([['Form'], ['source', `/data/forms/contact-${lang}.json`]], document)]);
}

function accordionSection(c, out, document) {
  const rows = [['Accordion']];
  c.querySelectorAll('.cmp-accordion__item').forEach((it) => {
    const title = it.querySelector('.cmp-accordion__title');
    const panel = it.querySelector('.cmp-accordion__panel');
    rows.push([title ? title.textContent.trim() : '', panel ? [...clean(panel, document).childNodes] : '']);
  });
  return out.add([table(rows, document)], { variant: variants(c, 'accordion').join(' ') || undefined });
}

function videoSection(c, out, document) {
  const holder = c.querySelector('[data-video-id]') || c;
  const id = holder.getAttribute('data-video-id');
  const kurl = (holder.getAttribute('kaltura-url') || '').replace(/^\/\//, 'https://');
  const thumb = holder.getAttribute('data-video-thumbnail-path') || (c.querySelector('img') && c.querySelector('img').getAttribute('src'));
  const poster = thumb ? picture({ getAttribute: (k) => (k === 'src' ? thumb : '') }, document) : null;
  const link = document.createElement('a');
  link.href = id ? `https://cdnapisec.kaltura.com/p/432521/sp/43252100/embedIframeJs/uiconf_id/30358591/partner_id/432521?iframeembed=true&entry_id=${id}` : kurl;
  link.textContent = link.href;
  return out.add([table([['Video'], [poster || ''], [link]], document)]);
}

// live searchresults (vendor index, dynamics F-2) → Search block over the EDS query-index (A-3);
// the authored copy is the live placeholder + the no-results line from the result template
function searchSection(c, out, document) {
  const input = c.querySelector('.cmp-searchbox__input');
  const rows = [['Search']];
  if (input && input.getAttribute('placeholder')) rows.push(['placeholder', input.getAttribute('placeholder')]);
  if (c.dataset.summary) rows.push(['summary', c.dataset.summary]);
  if (c.dataset.noResults) rows.push(['no-results', c.dataset.noResults]);
  return out.add([table(rows, document)]);
}

function tabsSection(c, out, document, ctx) {
  const tabs = c.querySelector('.cmp-tabs');
  const labels = [...tabs.querySelectorAll('.cmp-tabs__tab')].map((t) => t.textContent.trim());
  const v = variants(c, 'tabs');
  out.add([table([[v.length ? `Tabs (${v.join(', ')})` : 'Tabs'], ...labels.map((l) => [l])], document)]);
  [...tabs.querySelectorAll(':scope > .cmp-tabs__tabpanel')].forEach((pn, i) => {
    const before = out.sections.length;
    walk(pn, out, document, ctx);
    out.sections.slice(before).forEach((s) => { s.meta.tab = labels[i]; });
  });
}

/* ------------------------------------------------------------------ the walk */
const LEAF = ['teaser', 'title', 'text', 'image', 'button', 'socialFeatures', 'list', 'tabs', 'contentpaywall', 'dynamicformv2', 'accordion', 'video', 'searchresults', 'masterContentList'];
const leafOf = (el) => LEAF.find((l) => el.classList.contains(l));

function handleLeaf(el, kind, out, document, ctx) {
  switch (kind) {
    case 'teaser': {
      const v = variants(el, 'teaser');
      if (v.includes('home-hero')) return out.add([heroBlock(el, document, ctx.inBand ? 'boxed' : (v.includes('image-overlay-none') ? 'plain' : (v.includes('text-center') ? 'center' : '')))]);
      const hasImg = !!el.querySelector('.cmp-teaser__image img');
      if (!hasImg) {
        const parts = teaserParts(el, document);
        return out.add(teaserContent(parts, document), { variant: ['teaser', ...v.filter((x) => ['pretitle-core', 'text-left', 'text-center'].includes(x))].join(' ') });
      }
      if (v.includes('image-top-text-bottom')) {
        const vs = [];
        if (!v.includes('bgColor-supporting-1')) vs.push('plain');
        if (v.includes('border-base')) vs.push('bordered');
        if (v.includes('text-left')) vs.push('text-left');
        if (v.includes('title-color-core')) vs.push('title-core');
        return out.add([cardsBlock([el], document, vs)]);
      }
      return out.add([columnsBlock(el, document)]);
    }
    case 'title': return titleSection(el, out, document);
    case 'text': {
      // revision code: absolute under the footer, except the right-aligned in-flow variant (product listings)
      if ((el.querySelector('#vivo-id-wrap') || el.closest('#last-vivo-id')) && !variants(el, 'text').includes('right')) {
        const s = textSection(el, out, document);
        if (s) { s.meta.style = 'revision'; }
        return s;
      }
      return textSection(el, out, document);
    }
    case 'image': return imageSection(el, out, document);
    case 'button': return buttonSection(el, out, document);
    case 'socialFeatures': return socialSection(el, out, document);
    case 'list': return listSection(el, out, document, ctx.framedList);
    case 'tabs': return tabsSection(el, out, document, ctx);
    case 'contentpaywall': return paywallSection(el, out, document);
    case 'dynamicformv2': return formSection(el, out, document, ctx.lang);
    case 'accordion': return accordionSection(el, out, document);
    case 'video': return videoSection(el, out, document);
    case 'searchresults': return searchSection(el, out, document);
    default: return null; // masterContentList (empty listing shell) — nothing to author
  }
}

function walk(el, out, document, ctx) {
  for (const c of [...el.children]) {
    if (c.classList.contains('hidden') || c.classList.contains('cmp-tabs__tablist-wrapper')) continue; // hidden personalisation slots (anonymous)
    const kind = leafOf(c);
    if (kind) { handleLeaf(c, kind, out, document, ctx); continue; }
    if (c.classList.contains('experiencefragment')) {
      walk(c, out, document, { ...ctx, framedList: c.classList.contains('cmp-experiencefragment--customMenu') || !!c.querySelector('.cmp-experiencefragment--customMenu') });
      continue;
    }
    if (c.classList.contains('cmp-container--protected-container')) continue; // handled by its wrap container
    const cv = variants(c, 'container');
    const isContainer = c.classList.contains('container') || c.classList.contains('cmp-container') || c.tagName === 'DIV';
    if (!isContainer) continue;
    const before = out.sections.length;
    // protected cards sit one or two wrappers below their column-wrap container; they form one block
    const protectedKids = cv.some((x) => /column-wrap/.test(x))
      ? [...c.querySelectorAll('.cmp-container--protected-container')].filter((pc) => pc.parentElement.closest('[class*="column-wrap"]') === c)
      : [...c.querySelectorAll(':scope > .cmp-container > .cmp-container--protected-container, :scope > .cmp-container--protected-container')];
    const wrapTeasers = cv.some((x) => /column-wrap/.test(x)) ? [...c.querySelectorAll(':scope > .cmp-container > .teaser, :scope > .teaser')] : [];
    if (protectedKids.length) {
      out.add([protectedCardsBlock(protectedKids, document)]);
    } else if (wrapTeasers.length) {
      const v = variants(wrapTeasers[0], 'teaser');
      const vs = [];
      if (cv.includes('2-column-wrap')) vs.push('two');
      if (!v.includes('bgColor-supporting-1')) vs.push('plain');
      if (v.includes('border-base')) vs.push('bordered');
      if (v.includes('text-left')) vs.push('text-left');
      if (v.includes('title-color-core')) vs.push('title-core');
      // non-teaser children of the wrap container (titles/texts) keep their order around the cards
      const kids = [...(c.querySelector(':scope > .cmp-container') || c).children];
      let cardsDone = false;
      for (const k of kids) {
        if (k.classList.contains('teaser')) { if (!cardsDone) { out.add([cardsBlock(wrapTeasers, document, vs)]); cardsDone = true; } continue; }
        const kk = leafOf(k);
        if (kk) handleLeaf(k, kk, out, document, ctx);
      }
    } else if (cv.includes('bgColor-supporting-1')) {
      // a mist band: one section, composition styled by the band
      const inner = new Out(document);
      walk(c, inner, document, { ...ctx, inBand: true });
      const els = inner.sections.flatMap((s) => s.els);
      const hasHero = inner.sections.some((s) => s.els.some((e) => e.tagName === 'TABLE' && /hero/i.test(e.textContent.slice(0, 20))));
      const isPaywall = inner.sections.some((s) => s.meta.style === 'paywall');
      out.add(els, { style: isPaywall ? 'paywall' : 'band', variant: hasHero ? 'hero' : undefined });
    } else {
      walk(c, out, document, ctx);
    }
    const pad = cv.map((x) => PAD[x]).filter(Boolean);
    if (pad.length && out.sections.length > before) {
      for (const [t, bm] of pad) { addPad(out.sections[before], 'pt', t); addPad(out.sections[out.sections.length - 1], 'pb', bm); }
    }
    if (cv.includes('content-center') && out.sections.length > before) out.sections.slice(before).forEach((s) => { s.meta.variant = [s.meta.variant, 'center'].filter(Boolean).join(' '); });
  }
}

/* ------------------------------------------------------------------ chrome documents (nav / footer per locale) */
function navDocument(document, lang) {
  const main = document.createElement('div');
  const hdr = document.querySelector('.cmp-experiencefragment--Header');
  const logo = hdr.querySelector('.cmp-image__link');
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = localHref(logo.getAttribute('href'));
  const img = picture(hdr.querySelector('img'), document) || document.createElement('span');
  a.append(img);
  p.append(a);
  main.append(p, document.createElement('hr'));
  const build = (li) => {
    const item = document.createElement('li');
    const content = li.querySelector(':scope > .cmp-megamenu__content');
    const link = content.querySelector('a');
    if (link) { const x = document.createElement('a'); x.href = localHref(link.getAttribute('href')); x.textContent = link.textContent.replace(/\s+/g, ' ').trim(); item.append(x); } else { const p = document.createElement('p'); p.textContent = content.textContent.replace(/\s+/g, ' ').trim(); item.append(p); }
    const sub = li.querySelector(':scope > .cmp-megamenu__group');
    if (sub) { const ul = document.createElement('ul'); [...sub.children].forEach((s) => ul.append(build(s))); item.append(ul); }
    return item;
  };
  const ul = document.createElement('ul');
  [...document.querySelector('.cmp-megamenu > .cmp-megamenu__group').children].forEach((li) => ul.append(build(li)));
  main.append(ul, document.createElement('hr'));
  const search = document.querySelector('.cmp-searchbox label');
  const sp = document.createElement('p'); sp.textContent = search ? search.textContent.trim() : 'Suche';
  const login = document.querySelector('#loginHeader');
  const lp = cta(login, 'secondary', document);
  main.append(sp, lp);
  return main;
}

function footerDocument(document) {
  const main = document.createElement('div');
  const f = document.querySelector('.cmp-experiencefragment--footer');
  const brand = f.querySelector('.cmp-image__link');
  const p = document.createElement('p'); const a = document.createElement('a');
  a.href = localHref(brand.getAttribute('href'));
  const img = picture(brand.querySelector('img'), document); if (img) a.append(img);
  p.append(a);
  const disc = clean(f.querySelector('.text .cmp-text'), document);
  main.append(p, ...disc.childNodes);
  f.querySelectorAll('#FooterLinks .cmp-text').forEach((col) => {
    main.append(document.createElement('hr'));
    const ul = document.createElement('ul');
    col.querySelectorAll('a').forEach((x) => { const li = document.createElement('li'); const l = document.createElement('a'); l.href = localHref(x.getAttribute('href')); l.textContent = x.textContent.trim(); li.append(l); ul.append(li); });
    main.append(ul);
  });
  return main;
}

/* ------------------------------------------------------------------ transform */
export default {
  // html2md drops empty paragraphs from the source BEFORE transform runs: mark AEM spacer lines first
  onLoad: ({ document }) => {
    document.querySelectorAll('.root p, .cmp-selfcertification p').forEach((p) => {
      if (!p.querySelector('img, a, picture, br') && p.textContent.replace(/[\s]/g, '') === '') p.textContent = ZWSP;
    });
    // structured data (schema.org MedicalWebPage/Article): stash before script tags are stripped
    const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
      try { return JSON.parse(s.textContent); } catch (e) { return null; }
    }).filter(Boolean);
    if (ld.length) document.body.dataset.jsonLd = JSON.stringify(ld.length === 1 ? ld[0] : ld);
    // search results: the no-results copy lives in a client template script
    const tplNo = document.querySelector('#search-result-template');
    const sr = document.querySelector('.searchresults');
    if (tplNo && sr) {
      const m = tplNo.textContent.match(/results-noitems[\s\S]*?<h3>([^<]+)<\/h3>/);
      if (m) sr.dataset.noResults = m[1].trim();
    }
    const tplAll = document.querySelector('#showall-template');
    if (tplAll && sr) {
      const t = tplAll.textContent.replace(/\s+/g, ' ');
      const m = t.match(/showing-results"> ?(.*?) <%= results\.filteredResults\.length %> (.*?) <span/);
      if (m) sr.dataset.summary = `${m[1]} {count} ${m[2]} {term}`;
    }
  },
  transform: ({ document, params }) => {
    const path = livePath(params);
    const lang = path.split('/')[1];
    // chrome documents: the runner takes one document per URL, so /<lang>/startseite.html?doc=nav|footer
    const which = new URL(params.originalURL).searchParams.get('doc');
    if (which === 'nav') return [{ element: navDocument(document, lang), path: `/${lang}/nav` }];
    if (which === 'footer') return [{ element: footerDocument(document), path: `/${lang}/footer` }];
    const out = new Out(document);
    const ctx = { lang };

    // HCP self-certification gate (PATTRNS) — first section, as on live (outside the content root)
    const gate = document.querySelector('.cmp-selfcertification');
    if (gate) {
      const txt = clean(gate.querySelector('.cmp-selfcertification__content .cmp-text'), document);
      const yes = gate.querySelector('.self-certify-yes');
      const no = gate.querySelector('.self-certify-no');
      const yp = document.createElement('p'); const ys = document.createElement('strong'); const ya = document.createElement('a');
      ya.href = '#hcp-confirm'; ya.textContent = yes.textContent.replace(/\s+/g, ' ').trim(); ys.append(ya); yp.append(ys);
      out.add([table([['HCP Gate'], [[...txt.childNodes]], [[yp, cta(no, 'secondary', document)]]], document)]);
    }

    // breadcrumb (chrome-adjacent, authored per page)
    const crumbs = [...document.querySelectorAll('.breadcrumb .cmp-breadcrumb__item')];
    if (crumbs.length) {
      const ul = document.createElement('ul');
      crumbs.forEach((li) => {
        const item = document.createElement('li');
        const a = li.querySelector('a');
        const text = li.textContent.replace(/\s+/g, ' ').trim();
        if (a) {
          const href = localHref(a.getAttribute('href'));
          const link = document.createElement('a'); link.href = href; link.textContent = text;
          if (/^https?:/.test(href)) { const em = document.createElement('em'); em.append(link); item.append(em); } else item.append(link); // non-page targets render muted on live
        } else item.append(text);
        ul.append(item);
      });
      out.add([table([['Breadcrumb'], [ul]], document)]);
    }

    const root = document.querySelector('.root > .cmp-container > .container.responsivegrid');
    walk(root, out, document, ctx);

    const main = document.createElement('div');
    out.render(main);

    // page metadata
    const langs = [...document.querySelectorAll('.cmp-languagenavigation__item')].map((li) => {
      const a = li.querySelector('a');
      return `${a.textContent.trim()}=${localHref(a.getAttribute('href'))}${li.classList.contains('cmp-languagenavigation__item--active') ? '*' : ''}`;
    }).join(', ');
    const meta = [['Metadata'], ['Title', document.title.trim()]];
    const desc = document.querySelector('meta[name="description"]');
    if (desc && desc.content) meta.push(['Description', desc.content]);
    const og = document.querySelector('meta[property="og:image"]');
    if (og && og.content) { const l = localImg(og.content.replace('//content', '/content')); if (l) { const i = document.createElement('img'); i.src = l; meta.push(['Image', i]); } }
    meta.push(['nav', `/${lang}/nav`], ['footer', `/${lang}/footer`], ['languages', langs]);
    const tpl = document.querySelector('meta[name="template"]');
    if (tpl && tpl.content) meta.push(['source-template', tpl.content]);
    if (document.body.dataset.jsonLd) meta.push(['json-ld', document.body.dataset.jsonLd]); // rendered as ld+json in <head>
    main.append(table(meta, document));

    return [{ element: main, path: docPath(path) }];
  },
};
