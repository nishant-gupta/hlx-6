/**
 * cards — image-top / text-bottom teaser grid (live teaser-image-top-text-bottom in a
 * 3-/2-column-wrap container).
 *
 * Authoring: one row per card — cell 1: desktop picture (+ optional mobile picture), cell 2: title
 * heading, description, optional CTA paragraph(s); `protected` cards add cell 3: the gated overlay
 * (name, molecule, "Mehr erfahren"/"Einloggen" link) shown over the blurred teaser.
 * Variants: `two` (2 columns), `plain` (no mist panel), `bordered`, `text-left`, `title-core`,
 * `protected`. Reconstructive (repeat units), elements MOVED (EW1/EW3).
 */
export default function decorate(block) {
  const isProtected = block.classList.contains('protected');
  const list = document.createElement('div');
  list.className = 'cards-list';
  [...block.children].forEach((row) => {
    const [mediaCell, bodyCell, overlayCell] = [...row.children];
    const card = document.createElement('article');
    card.className = 'card';

    const media = document.createElement('div');
    media.className = 'card-media';
    const pics = mediaCell ? [...mediaCell.querySelectorAll('picture')] : [];
    pics.forEach((pic, i) => {
      if (pics.length > 1) pic.classList.add(i === 0 ? 'pic-desktop' : 'pic-mobile');
      media.append(pic);
    });

    // live teaser: title | description (one container, no inner gap) | action — gap 16 between them
    const body = document.createElement('div');
    body.className = 'card-body';
    const text = document.createElement('div');
    text.className = 'card-text';
    const action = document.createElement('div');
    action.className = 'card-action';
    [...(bodyCell ? bodyCell.childNodes : [])].forEach((n) => {
      if (n.nodeType === 1 && /^H\d$/.test(n.tagName) && !text.childNodes.length) body.append(n);
      else if (n.nodeType === 1 && n.classList.contains('button-wrapper')) action.append(n);
      else text.append(n);
    });
    if (text.textContent.trim() || text.querySelector('img, a')) body.append(text);
    if (action.children.length) body.append(action);

    if (isProtected) {
      const content = document.createElement('div');
      content.className = 'protected-content';
      content.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('div');
      inner.className = 'product-card';
      inner.append(media, body);
      content.append(inner);
      content.querySelectorAll('a').forEach((a) => { a.tabIndex = -1; });
      const cta = document.createElement('div');
      cta.className = 'protected-cta';
      const ctaInner = document.createElement('div');
      ctaInner.className = 'protected-cta-inner';
      const ctaText = document.createElement('div');
      ctaText.className = 'protected-cta-text';
      if (overlayCell) ctaText.append(...overlayCell.childNodes);
      ctaInner.append(ctaText);
      cta.append(ctaInner);
      card.classList.add('protected');
      card.append(content, cta);
    } else {
      card.append(media, body);
    }
    list.append(card);
  });
  block.replaceChildren(list);
}
