import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * footer — logo + HCP disclaimer column, then one column per authored link list.
 * Authored in /<lang>/footer: section 1 = logo paragraph + disclaimer paragraph(s);
 * every following section = one <ul> of links (a column). Elements are moved, never rebuilt.
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  block.textContent = '';
  if (!fragment) return;

  const [brandSec, ...cols] = [...fragment.children];
  const inner = document.createElement('div');
  inner.className = 'site-footer-inner';

  const brand = document.createElement('div');
  brand.className = 'site-footer-brand';
  if (brandSec) {
    const content = brandSec.querySelector('.default-content-wrapper') || brandSec;
    brand.append(...content.children);
  }

  const links = document.createElement('div');
  links.className = 'site-footer-links-wrap';
  cols.forEach((sec) => {
    const col = document.createElement('div');
    col.className = 'site-footer-links';
    const content = sec.querySelector('.default-content-wrapper') || sec;
    col.append(...content.children);
    links.append(col);
  });

  inner.append(brand, links);
  block.append(inner);
}
