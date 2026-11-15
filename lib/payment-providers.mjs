import { paypalReference, verifyPaypalReference } from './checkout.mjs';

async function request(url, options) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(12000) });
  if (!response.ok) {
    const error = new Error('Payment provider request failed');
    error.status = response.status;
    throw error;
  }
  return response.json();
}

const euro = cents => (cents / 100).toFixed(2);
const sameAmount = (amount, cents) => amount?.currency_code === 'EUR' && amount.value === euro(cents);

function hostedUrl(value, origin) {
  const url = new URL(value);
  if (url.origin !== origin || url.username || url.password) throw new Error('Unexpected provider redirect');
  return url.href;
}

function stripeApi(config, path, options = {}) {
  return request(`https://api.stripe.com/v1/checkout/sessions${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${config.stripe}`, ...options.headers },
  });
}

function validateStripe(config, session) {
  const test = config.mode === 'test';
  if (session.livemode !== !test || !session.id?.startsWith(test ? 'cs_test_' : 'cs_live_') ||
      session.metadata?.shop !== 'iprodottidellanatura' || session.currency !== 'eur' ||
      !Number.isSafeInteger(session.amount_total) || session.amount_total <= 0) {
    throw new Error('Unexpected Stripe session');
  }
}

export async function startStripe(config, cart, key) {
  const body = new URLSearchParams({
    mode: 'payment',
    success_url: `${config.origin}/checkout.html?provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.origin}/checkout.html?cancelled=1`,
    'payment_method_types[0]': 'card',
    'shipping_address_collection[allowed_countries][0]': 'IT',
    'metadata[shop]': 'iprodottidellanatura',
    'payment_intent_data[metadata][shop]': 'iprodottidellanatura',
    client_reference_id: key,
    locale: 'it',
  });
  cart.items.forEach((item, index) => {
    const prefix = `line_items[${index}]`;
    body.set(`${prefix}[quantity]`, String(item.quantity));
    body.set(`${prefix}[price_data][currency]`, 'eur');
    body.set(`${prefix}[price_data][unit_amount]`, String(item.unitCents));
    body.set(`${prefix}[price_data][product_data][name]`, item.name);
  });
  const session = await stripeApi(config, '', {
    method: 'POST', body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Idempotency-Key': `pdn-${key}` },
  });
  validateStripe(config, session);
  if (session.amount_total !== cart.total) throw new Error('Unexpected Stripe amount');
  return { id: session.id, url: hostedUrl(session.url, 'https://checkout.stripe.com') };
}

export async function stripeStatus(config, id) {
  const session = await stripeApi(config, `/${id}`);
  validateStripe(config, session);
  if (session.id !== id) throw new Error('Stripe session mismatch');
  const status = session.payment_status === 'paid' && session.status === 'complete'
    ? 'paid' : session.status === 'expired' ? 'failed' : 'pending';
  return { status, total: session.amount_total, reference: id };
}

export async function paypalClient(config) {
  const paypal = config.paypal;
  const credentials = Buffer.from(`${paypal.clientId}:${paypal.secret}`).toString('base64');
  const auth = await request(`${paypal.api}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  if (typeof auth.access_token !== 'string' || !auth.access_token) throw new Error('Invalid PayPal access token');
  return (path, { method = 'GET', body, idempotency } = {}) => request(`${paypal.api}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${auth.access_token}`,
      ...(body && { 'Content-Type': 'application/json' }),
      ...(idempotency && { 'PayPal-Request-Id': idempotency }),
      Prefer: 'return=representation',
    },
    ...(body && { body: JSON.stringify(body) }),
  });
}

export async function startPaypal(config, cart, key) {
  const call = await paypalClient(config);
  const amount = { currency_code: 'EUR', value: euro(cart.total) };
  const order = await call('/v2/checkout/orders', {
    method: 'POST', idempotency: `pdn-${key}`,
    body: {
      intent: 'CAPTURE',
      purchase_units: [{
        custom_id: paypalReference(config, key, cart.total),
        amount: { ...amount, breakdown: { item_total: amount } },
        items: cart.items.map(item => ({
          name: item.name, sku: item.id, quantity: String(item.quantity), category: 'PHYSICAL_GOODS',
          unit_amount: { currency_code: 'EUR', value: euro(item.unitCents) },
        })),
      }],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: 'i prodotti della Natura', locale: 'it-IT',
            user_action: 'PAY_NOW', shipping_preference: 'GET_FROM_FILE',
            return_url: `${config.origin}/checkout.html?provider=paypal`,
            cancel_url: `${config.origin}/checkout.html?cancelled=1`,
          },
        },
      },
    },
  });
  const approval = order.links?.find(link => link.rel === 'payer-action' || link.rel === 'approve');
  if (!validPaypalOrder(order.id)) throw new Error('Unexpected PayPal order');
  return { id: order.id, url: hostedUrl(approval?.href, config.paypal.approvalOrigin) };
}

export const validPaypalOrder = id => typeof id === 'string' && /^[A-Z0-9]{10,32}$/.test(id);

export async function finalizePaypal(config, id, client) {
  const call = client ?? await paypalClient(config);
  const path = `/v2/checkout/orders/${id}`;
  let order = await call(path);
  const unit = order.purchase_units?.[0];
  const total = verifyPaypalReference(config, unit?.custom_id);
  if (order.id !== id || order.intent !== 'CAPTURE' || order.purchase_units?.length !== 1 ||
      !total || !sameAmount(unit.amount, total)) return { status: 'invalid' };

  if (order.status === 'APPROVED') {
    if (unit.shipping?.address?.country_code !== 'IT') return { status: 'shipping', total };
    // The return page and the verified webhook share this provider idempotency key.
    try {
      order = await call(`${path}/capture`, { method: 'POST', body: {}, idempotency: `pdn-cap-${id}` });
    } catch (error) {
      if (![409, 422].includes(error.status)) throw error;
      order = await call(path);
      if (order.status === 'APPROVED') throw error;
    }
  }

  const capture = order.purchase_units?.[0]?.payments?.captures?.[0];
  if (order.id === id && order.status === 'COMPLETED' && capture?.status === 'COMPLETED' &&
      capture?.final_capture === true && sameAmount(capture.amount, total)) {
    return { status: 'paid', total, reference: id };
  }
  const declined = ['DECLINED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'].includes(capture?.status);
  return { status: declined || order.status === 'VOIDED' ? 'failed' : 'pending', total };
}
