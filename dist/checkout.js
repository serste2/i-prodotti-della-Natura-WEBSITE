'use strict';

const statusNode = document.querySelector('#status');
const methods = [...document.querySelectorAll('[data-provider]')];
const retry = document.querySelector('#check-again');
const search = new URLSearchParams(location.search);
const provider = search.get('provider');
const returnId = provider === 'stripe' ? search.get('session_id') : search.get('token');
const returning = search.has('provider');
const euro = new Intl.NumberFormat(document.documentElement.lang || 'it-IT', { style: 'currency', currency: 'EUR' });
const money = cents => euro.format(cents / 100);
let options;
let quantities;

function readSession(key, fallback) {
  try {
    return JSON.parse(sessionStorage.getItem(key) || 'null') ?? fallback;
  } catch {
    return fallback;
  }
}

async function checkout(body) {
  const response = await fetch('/api/checkout', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Checkout non disponibile.');
  return result;
}

function setButtons(busy) {
  for (const button of methods) button.disabled = busy || !options.methods[button.dataset.provider];
}

function showQuote(quote) {
  const products = document.querySelector('#items');
  for (const item of quote.items) {
    const row = document.createElement('li');
    const name = document.createElement('span');
    const value = document.createElement('span');
    name.textContent = `${item.name} × ${item.quantity}`;
    value.textContent = money(item.unitCents * item.quantity);
    row.append(name, value);
    products.append(row);
  }
  document.querySelector('#summary').hidden = false;
  document.querySelector('#total').textContent = money(quote.total);
  const terms = document.querySelector('#terms');
  if (quote.termsPath) {
    terms.href = quote.termsPath;
    terms.hidden = false;
  }
  document.querySelector('#rewards').hidden = !['inulaFieldComplete', 'inulaHarvest', 'inulaMysteryGiftUnlocked']
    .some(key => Boolean(localStorage.getItem(key)));
  const available = Object.values(quote.methods).some(Boolean);
  document.querySelector('#methods').hidden = !available;
  document.querySelector('#test').hidden = !available || !quote.test;
  for (const button of methods) button.hidden = !quote.methods[button.dataset.provider];
  setButtons(false);
  statusNode.textContent = search.has('cancelled')
    ? 'Pagamento annullato. Il carrello è ancora disponibile.'
    : available ? '' : 'Pagamenti online non attivi. Puoi richiedere l’ordine dal carrello.';
}

async function verify() {
  retry.hidden = true;
  statusNode.textContent = 'Verifica del pagamento…';
  try {
    const result = await checkout({ action: 'status', provider, id: returnId });
    if (result.status === 'paid') {
      statusNode.textContent = result.test
        ? `Pagamento di test verificato · ${money(result.total)}.`
        : `Pagamento confermato · ${money(result.total)}. Riferimento: ${result.reference}.`;
      const attempt = readSession('shopCheckoutAttempt', {});
      if (attempt.provider === provider && attempt.providerId === returnId && attempt.fingerprint === JSON.stringify(readSession('inulaCart', {}))) {
        sessionStorage.removeItem('inulaCart');
        sessionStorage.removeItem('shopCheckoutAttempt');
      }
    } else if (result.status === 'shipping') {
      statusNode.textContent = 'L’indirizzo PayPal è fuori dall’Italia. Torna al carrello per riprovare con un indirizzo italiano.';
    } else if (result.status === 'failed') {
      statusNode.textContent = 'Pagamento non completato. Il carrello è ancora disponibile.';
    } else {
      statusNode.textContent = 'Il gestore sta ancora elaborando il pagamento. Verifica di nuovo prima di riprovare.';
      retry.hidden = false;
    }
  } catch (error) {
    statusNode.textContent = error.message;
    retry.hidden = false;
  }
}

for (const button of methods) {
  button.addEventListener('click', async () => {
    const selected = button.dataset.provider;
    setButtons(true);
    statusNode.textContent = 'Apertura della pagina di pagamento…';
    try {
      const fingerprint = JSON.stringify(quantities);
      let attempt = readSession('shopCheckoutAttempt', {});
      if (attempt.fingerprint !== fingerprint || attempt.provider !== selected || Date.now() - attempt.at > 3600000) {
        attempt = { provider: selected, fingerprint, id: crypto.randomUUID(), at: Date.now() };
        sessionStorage.setItem('shopCheckoutAttempt', JSON.stringify(attempt));
      }
      const result = await checkout({ action: 'start', provider: selected, quantities, attempt: attempt.id });
      attempt.providerId = result.id;
      sessionStorage.setItem('shopCheckoutAttempt', JSON.stringify(attempt));
      location.assign(result.url);
    } catch (error) {
      statusNode.textContent = error.message;
      setButtons(false);
    }
  });
}

retry.addEventListener('click', verify);
window.addEventListener('pageshow', event => {
  if (event.persisted && !returning && options) setButtons(false);
});
const locale = search.get('lang') || sessionStorage.getItem('shopCheckoutLocale');
if (['en', 'ja', 'de', 'fr', 'hi', 'es'].includes(locale)) {
  sessionStorage.setItem('shopCheckoutLocale', locale);
  document.querySelector('#back').href = `/${locale}/#cart`;
} else if (search.has('lang')) {
  sessionStorage.removeItem('shopCheckoutLocale');
}
if (returning) {
  verify();
} else {
  quantities = readSession('inulaCart', {});
  checkout({ action: 'quote', quantities }).then(result => {
    options = result;
    if (search.has('cancelled')) sessionStorage.removeItem('shopCheckoutAttempt');
    showQuote(result);
  }).catch(error => { statusNode.textContent = error.message; });
}
