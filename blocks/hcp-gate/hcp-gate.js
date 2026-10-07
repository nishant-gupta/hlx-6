/**
 * hcp-gate — HCP self-certification modal (live cmp-selfcertification; dynamics M-1).
 *
 * Authoring rows: 1) the notice paragraph(s)  2) the two CTAs — <strong> "Ich bin Arzt/Ärztin"
 * (confirms, href "#hcp-confirm") and <em> "Ich bin Patient:in." (leaves to the patient site).
 * Observed on live (gate-probe): the modal is visible on first load, "yes" hides it and the choice
 * survives reload. Remembered here for 120 minutes (live data-expiry-time="120").
 * Authored paragraphs are MOVED into the dialog (EW1/EW3).
 */
const KEY = 'hcp-selfcert';
const MINUTES = 120;

export default function decorate(block) {
  const [textRow, actionsRow] = [...block.children];
  const box = document.createElement('div');
  box.className = 'hcp-gate-box';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  const content = document.createElement('div');
  content.className = 'hcp-gate-content';
  if (textRow) content.append(...(textRow.firstElementChild || textRow).childNodes);
  const actions = document.createElement('div');
  actions.className = 'hcp-gate-actions';
  if (actionsRow) {
    [...(actionsRow.firstElementChild || actionsRow).children].forEach((p) => actions.append(p));
  }
  box.append(content, actions);
  block.replaceChildren(box);

  const close = () => {
    block.hidden = true;
    document.documentElement.classList.remove('hcp-gate-open');
  };
  if ((+localStorage.getItem(KEY) || 0) > Date.now()) { close(); return; }
  document.documentElement.classList.add('hcp-gate-open');
  const yes = [...actions.querySelectorAll('a')].find((a) => a.getAttribute('href') === '#hcp-confirm' || a.classList.contains('primary'));
  if (yes) {
    yes.classList.add('self-certify-yes');
    yes.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.setItem(KEY, String(Date.now() + MINUTES * 60000));
      close();
    });
  }
}
