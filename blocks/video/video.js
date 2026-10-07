/**
 * video — Kaltura player behind its poster (live cmp-video dynamic embed; dynamics V-1).
 * Authoring rows: 1) poster picture  2) the Kaltura iframe-embed URL (a plain link).
 * The player iframe is created on click (embed-passthrough), so the page stays light.
 */
export default function decorate(block) {
  const pic = block.querySelector('picture');
  const link = block.querySelector('a');
  const holder = document.createElement('div');
  holder.className = 'video-holder';
  if (pic) holder.append(pic);
  const play = document.createElement('button');
  play.type = 'button';
  play.className = 'video-play';
  play.setAttribute('aria-label', 'Play');
  holder.append(play);
  const src = link ? link.href : '';
  play.addEventListener('click', () => {
    if (!src) return;
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.allow = 'autoplay; fullscreen; encrypted-media';
    iframe.setAttribute('allowfullscreen', '');
    iframe.title = 'Video';
    holder.replaceChildren(iframe);
  });
  block.replaceChildren(holder);
}
