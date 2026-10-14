const RECAPTCHA_API_URL = 'https://www.google.com/recaptcha/api.js?render=explicit';

let recaptchaApiPromise;

function loadRecaptchaApi() {
  if (window.grecaptcha?.render) return Promise.resolve(window.grecaptcha);
  if (recaptchaApiPromise) return recaptchaApiPromise;

  recaptchaApiPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = RECAPTCHA_API_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (!window.grecaptcha) {
        reject(new Error('The reCAPTCHA API did not initialize.'));
        return;
      }
      window.grecaptcha.ready(() => resolve(window.grecaptcha));
    };
    script.onerror = () => reject(new Error('The reCAPTCHA API could not be loaded.'));
    document.head.append(script);
  }).catch((error) => {
    recaptchaApiPromise = undefined;
    throw error;
  });

  return recaptchaApiPromise;
}

function getConfiguration(block) {
  const config = {};
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const key = cells[0].textContent.trim().toLowerCase().replace(/[\s_-]/g, '');
    const value = cells[1].textContent.trim();
    if (key === 'sitekey' || key === 'recaptchasitekey') config.siteKey = value;
    if (key === 'endpoint' || key === 'action') config.endpoint = value;
  });
  return config;
}

function createField({
  label,
  name,
  type = 'text',
  multiline = false,
}) {
  const field = document.createElement(multiline ? 'textarea' : 'input');
  field.id = `contact-form-${name}`;
  field.name = name;
  field.required = true;
  if (!multiline) field.type = type;

  const fieldLabel = document.createElement('label');
  fieldLabel.htmlFor = field.id;
  fieldLabel.textContent = label;

  const wrapper = document.createElement('div');
  wrapper.className = 'contact-form-field';
  wrapper.append(fieldLabel, field);
  return wrapper;
}

export default async function decorate(block) {
  const { endpoint, siteKey } = getConfiguration(block);
  block.replaceChildren();

  if (!endpoint || !siteKey) {
    const message = document.createElement('p');
    message.className = 'contact-form-message';
    message.setAttribute('role', 'alert');
    message.textContent = 'Contact form is not configured. Add endpoint and sitekey rows.';
    block.append(message);
    return;
  }

  const form = document.createElement('form');
  form.className = 'contact-form-form';
  form.method = 'post';
  form.action = endpoint;

  form.append(
    createField({ label: 'First name', name: 'firstName' }),
    createField({ label: 'Last name', name: 'lastName' }),
    createField({ label: 'Email', name: 'email', type: 'email' }),
    createField({ label: 'Comment', name: 'comment', multiline: true }),
  );

  const captcha = document.createElement('div');
  captcha.className = 'contact-form-captcha';
  form.append(captcha);

  const message = document.createElement('p');
  message.className = 'contact-form-message';
  message.setAttribute('role', 'status');
  message.setAttribute('aria-live', 'polite');

  const submit = document.createElement('button');
  submit.className = 'button primary';
  submit.type = 'submit';
  submit.textContent = 'Submit';
  submit.disabled = true;
  form.append(submit, message);
  block.append(form);

  let captchaApi;
  let captchaWidget;
  try {
    captchaApi = await loadRecaptchaApi();
    captchaWidget = captchaApi.render(captcha, { sitekey: siteKey });
    submit.disabled = false;
  } catch (error) {
    message.setAttribute('role', 'alert');
    message.textContent = 'Unable to load reCAPTCHA. Please try again later.';
    // eslint-disable-next-line no-console
    console.error('Contact form reCAPTCHA initialization failed', error);
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const token = captchaApi.getResponse(captchaWidget);
    if (!token) {
      message.textContent = 'Please complete the reCAPTCHA challenge.';
      return;
    }

    submit.disabled = true;
    message.textContent = 'Sending your message...';
    const formData = new FormData(form);
    formData.set('g-recaptcha-response', token);

    try {
      const response = await fetch(form.action, { method: 'POST', body: formData });
      if (!response.ok) throw new Error(`Contact form submission failed (${response.status}).`);
      form.reset();
      captchaApi.reset(captchaWidget);
      message.textContent = 'Thank you. Your message has been sent.';
    } catch (error) {
      captchaApi.reset(captchaWidget);
      message.textContent = 'Your message could not be sent. Please try again later.';
      // eslint-disable-next-line no-console
      console.error('Contact form submission failed', error);
    } finally {
      submit.disabled = false;
    }
  });
}
