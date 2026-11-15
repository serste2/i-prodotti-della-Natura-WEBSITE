import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const catalog = Object.freeze({
  cignula: Object.freeze({ name: 'CÍGNULA Mini', cents: 1200 }),
  inbruma: Object.freeze({ name: 'INBRUMA dei Carbonari', cents: 5600 }),
});

export const productionOrigin = 'https://iprodottidellanatura.com';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function quote(quantities) {
  if (!quantities || typeof quantities !== 'object' || Array.isArray(quantities) ||
      Object.keys(quantities).some(key => !Object.hasOwn(catalog, key))) {
    throw new Error('Carrello non valido.');
  }
  const items = [];
  for (const [id, product] of Object.entries(catalog)) {
    const quantity = Object.hasOwn(quantities, id) ? quantities[id] : 0;
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 20) {
      throw new Error('Quantità non valida.');
    }
    if (quantity) items.push({ id, name: product.name, quantity, unitCents: product.cents });
  }
  if (!items.length) throw new Error('Il carrello è vuoto.');
  const total = items.reduce((sum, item) => sum + item.unitCents * item.quantity, 0);
  return { items, total, shippingCents: 0, currency: 'EUR' };
}

export function configuration(env) {
  const production = env.VERCEL_ENV === 'production';
  let origin = productionOrigin;
  if (!production) {
    origin = env.CHECKOUT_ORIGIN || (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : 'http://localhost:4173');
    const url = new URL(origin);
    const local = !env.VERCEL && url.protocol === 'http:' && url.hostname === 'localhost';
    if (url.origin !== origin || (url.protocol !== 'https:' && !local) || origin === productionOrigin) {
      throw new Error('Invalid checkout origin');
    }
  }
  const terms = env.CHECKOUT_TERMS_PATH || '';
  const termsPath = /^\/(?!\/)[a-z\d/_-]+(?:\.html)?$/i.test(terms) ? terms : null;
  const mode = production ? 'live' : 'test';
  const active = env.CHECKOUT_ENABLED === mode && (!production || termsPath);
  const stripeKey = env.STRIPE_SECRET_KEY || '';
  const stripe = active && new RegExp(`^(sk|rk)_${mode}_[A-Za-z0-9]+$`).test(stripeKey) ? stripeKey : null;
  const paypal = active && env.PAYPAL_MODE === (production ? 'live' : 'sandbox') &&
    env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_SECRET &&
    (env.CHECKOUT_SIGNING_SECRET || '').length >= 32 && (!production || env.PAYPAL_WEBHOOK_ID)
    ? {
      clientId: env.PAYPAL_CLIENT_ID,
      secret: env.PAYPAL_CLIENT_SECRET,
      webhookId: env.PAYPAL_WEBHOOK_ID,
      signingSecret: env.CHECKOUT_SIGNING_SECRET,
      api: production ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com',
      approvalOrigin: production ? 'https://www.paypal.com' : 'https://www.sandbox.paypal.com',
    }
    : null;
  return { mode, origin, termsPath, stripe, paypal };
}

export function paymentOptions(config) {
  return {
    test: config.mode === 'test',
    termsPath: config.termsPath,
    methods: { stripe: Boolean(config.stripe), paypal: Boolean(config.paypal) },
  };
}

export function attemptKey(attempt, cart) {
  if (typeof attempt !== 'string' || !uuid.test(attempt)) throw new Error('Tentativo non valido.');
  return createHash('sha256').update(JSON.stringify([attempt, cart])).digest('hex').slice(0, 32);
}

export function paypalReference(config, key, total) {
  const reference = `pdn-${config.mode}:${key}:${total}`;
  const signature = createHmac('sha256', config.paypal.signingSecret).update(reference).digest('base64url');
  return `${reference}:${signature}`;
}

export function verifyPaypalReference(config, reference) {
  const parts = typeof reference === 'string' && reference.match(/^pdn-(test|live):([a-f0-9]{32}):([1-9]\d{0,5}):[\w-]{43}$/);
  if (!parts || parts[1] !== config.mode) return null;
  const expected = paypalReference(config, parts[2], Number(parts[3]));
  return timingSafeEqual(Buffer.from(reference), Buffer.from(expected)) ? Number(parts[3]) : null;
}
