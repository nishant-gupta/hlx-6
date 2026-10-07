/**
 * columns — text + image teaser, side by side on desktop, image on top on mobile
 * (live teaser-text-image / default teaser).
 *
 * Authoring: one row, two cells in VISUAL order — the cell holding only pictures is the media
 * (desktop picture + optional mobile picture), the other holds title, text and CTA(s).
 * Variants: `text-left` (left-aligned text on mobile too), `title-core` (plum title).
 * Template-slotted: authored nodes are MOVED (EW1).
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  const cells = [...row.children];
  const mediaIdx = cells.findIndex((c) => c.querySelector('picture') && !c.textContent.trim());
  const wrap = document.createElement('div');
  wrap.className = 'media-text';
  if (mediaIdx === 0) wrap.classList.add('image-left');

  const media = document.createElement('div');
  media.className = 'media-text-media';
  const body = document.createElement('div');
  body.className = 'media-text-body';

  // live teaser: title | description (one container, no inner gap) | action — gap 16 between them
  const text = document.createElement('div');
  text.className = 'media-text-text';
  const act = document.createElement('div');
  act.className = 'media-text-action';
  cells.forEach((cell, i) => {
    if (i === mediaIdx) {
      const pics = [...cell.querySelectorAll('picture')];
      pics.forEach((pic, j) => {
        if (pics.length > 1) pic.classList.add(j === 0 ? 'pic-desktop' : 'pic-mobile');
        media.append(pic);
      });
      return;
    }
    [...cell.childNodes].forEach((n) => {
      if (n.nodeType === 1 && /^H\d$/.test(n.tagName) && !text.childNodes.length) body.append(n);
      else if (n.nodeType === 1 && n.classList.contains('button-wrapper')) act.append(n);
      else text.append(n);
    });
  });
  if (text.textContent.trim()) body.append(text);
  if (act.children.length) body.append(act);

  wrap.append(media, body);
  block.replaceChildren(wrap);
}
