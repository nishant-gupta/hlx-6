/**
 * social — like / share / save icons, anonymous state (live cmp-socialFeatures, dynamics M-3).
 *
 * Authoring rows: 1) the sign-in prompt copy  2) the error copy. Live ships both as raw i18n keys
 * ("requestToSignInContent", "errorMessage"); the replica mirrors them verbatim.
 * Observed on live: every icon click opens the sign-in popup (body.popup-open); close hides it.
 * The authored paragraphs are MOVED into the popups (EW1); icon buttons carry no words.
 */
const ICONS = [['like', 'azi-heart', 'Like'], ['share', 'azi-share', 'Share'], ['favorite', 'azi-star', 'Save']];

function popup(row, kind) {
  const box = document.createElement('div');
  box.className = 'social-popup';
  box.dataset.popup = kind;
  box.hidden = true;
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'social-close';
  close.setAttribute('aria-label', 'Schließen');
  close.innerHTML = '<span class="azi azi-close" aria-hidden="true"></span>';
  box.append(close);
  if (row) {
    const cell = row.firstElementChild || row;
    box.append(...cell.childNodes);
  }
  close.addEventListener('click', () => {
    box.hidden = true;
    document.body.classList.remove('popup-open');
  });
  return box;
}

export default function decorate(block) {
  const [signinRow, errorRow] = [...block.children];
  const ul = document.createElement('ul');
  ICONS.forEach(([feature, icon, label]) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.feature = feature;
    b.setAttribute('aria-label', label);
    b.innerHTML = `<span class="azi ${icon}" aria-hidden="true"></span>`;
    li.append(b);
    ul.append(li);
  });
  const signin = popup(signinRow, 'signin');
  const error = popup(errorRow, 'error');
  ul.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
    signin.hidden = false;
    document.body.classList.add('popup-open');
  }));
  block.replaceChildren(ul, error, signin);
}
