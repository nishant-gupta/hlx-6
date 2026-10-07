/**
 * hero — full-bleed image teaser with the title overlaid (live teaser-home-hero).
 *
 * Authoring rows: 1) desktop image  2) optional mobile image  3) content (h1/h2, optional lede,
 * optional CTA paragraph). Variants: `plain` (no .75 image overlay), `boxed` (inside the container
 * on a mist band — the product-listing CTA banner), `center` (centred text).
 * Template-slotted: authored pictures and content are MOVED into fixed slots (EW1).
 */
export default function decorate(block) {
  const rows = [...block.children];
  const media = document.createElement('div');
  media.className = 'hero-media';
  const content = document.createElement('div');
  content.className = 'hero-content';

  const pictures = [];
  rows.forEach((row) => {
    const cell = row.firstElementChild || row;
    const pics = [...cell.querySelectorAll('picture')];
    const onlyMedia = pics.length && !cell.textContent.trim();
    if (onlyMedia) pictures.push(...pics);
    else content.append(...cell.childNodes);
  });

  pictures.forEach((pic, i) => {
    if (pictures.length > 1) pic.classList.add(i === 0 ? 'pic-desktop' : 'pic-mobile');
    media.append(pic);
  });
  const first = media.querySelector('img');
  if (first) {
    first.loading = 'eager';
    first.setAttribute('fetchpriority', 'high');
  }

  const actions = [...content.querySelectorAll('p.button-wrapper')];
  if (actions.length) {
    const wrap = document.createElement('div');
    wrap.className = 'hero-action';
    actions.forEach((p) => wrap.append(p));
    content.append(wrap);
  }

  block.replaceChildren(media, content);
}
