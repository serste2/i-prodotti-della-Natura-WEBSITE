import { test } from 'node:test';
import assert from 'node:assert/strict';
import checkout from '../api/checkout.js';
import webhook from '../api/paypal-webhook.js';
import { attemptKey, configuration, paypalReference, quote } from '../lib/checkout.mjs';

const attempt = 'f1d40d5c-03cc-416d-8926-e1fcfea65dfe';
const paypalId = 'MOCKORDER01234567';
const stripeId = 'cs_test_session12345';
const origin = 'http://localhost:4173';
const testEnv = {
  CHECKOUT_ENABLED: 'test', CHECKOUT_ORIGIN: origin, STRIPE_SECRET_KEY: 'sk_test_mock',
  PAYPAL_MODE: 'sandbox', PAYPAL_CLIENT_ID: 'mock', PAYPAL_CLIENT_SECRET: 'mock',
  CHECKOUT_SIGNING_SECRET: 'x'.repeat(32), PAYPAL_WEBHOOK_ID: 'mock-webhook',
};
const cart = quote({ cignula: 2, inbruma: 1 });

function fakeResponse() {
  return {
    setHeader() {},
    status(status) { this.code = status; return this; },
    json(data) { this.data = data; },
    end() {},
  };
}

function post(body) {
  return { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body };
}

function withEnvironment(t, values = testEnv) {
  const original = process.env;
  process.env = { ...values };
  t.after(() => { process.env = original; });
}

function mockFetch(t, responder) {
  const original = global.fetch;
  global.fetch = async (url, options) => Response.json(await responder(url, options));
  t.after(() => { global.fetch = original; });
}

test('quotes the current shop catalog and only accepts valid quantities', () => {
  assert.equal(cart.total, 8000);
  assert.equal(cart.shippingCents, 0);
  assert.deepEqual(cart.items.map(({ quantity, unitCents }) => [quantity, unitCents]), [[2, 1200], [1, 5600]]);
  for (const quantities of [{}, { cignula: -1 }, { cignula: 21 }, { cignula: '2' }, { cignula: null }, { other: 1 }]) {
    assert.throws(() => quote(quantities));
  }
  assert.notEqual(attemptKey(attempt, cart), attemptKey(attempt, quote({ cignula: 1 })));
});

test('separates sandbox and production configuration', () => {
  const production = { ...testEnv, VERCEL_ENV: 'production' };
  assert.equal(configuration(production).stripe, null);
  assert.equal(configuration(production).paypal, null);
  const live = { ...production, CHECKOUT_ENABLED: 'live', STRIPE_SECRET_KEY: 'sk_live_mock', PAYPAL_MODE: 'live' };
  assert.equal(configuration(live).stripe, null);
  assert.equal(configuration(live).paypal, null);
  live.CHECKOUT_TERMS_PATH = '/condizioni.html';
  assert.equal(configuration(live).stripe, 'sk_live_mock');
  assert.equal(configuration(live).paypal.api, 'https://api-m.paypal.com');
  assert.equal(configuration({ ...live, PAYPAL_WEBHOOK_ID: '' }).paypal, null);
  assert.equal(configuration({ ...testEnv, STRIPE_SECRET_KEY: 'sk_live_mock' }).stripe, null);
});

test('production flags reveal no secrets and unconfigured checkout cannot create a payment', async t => {
  withEnvironment(t, { VERCEL_ENV: 'production' });
  const res = fakeResponse();
  await checkout({ method: 'GET' }, res);
  assert.deepEqual(res.data, { test: false, termsPath: null, methods: { stripe: false, paypal: false } });
  const req = post({ action: 'start', provider: 'stripe', quantities: { cignula: 1 }, attempt });
  req.headers.origin = 'https://iprodottidellanatura.com';
  await checkout(req, res);
  assert.equal(res.code, 503);
  req.headers.origin = 'https://external.example';
  await checkout(req, res);
  assert.equal(res.code, 403);
});

test('Stripe uses server prices, Italy shipping and only confirms paid complete sessions', async t => {
  withEnvironment(t);
  let paid = false;
  mockFetch(t, (url, options) => {
    if (options.method === 'POST') {
      assert.equal(options.body.get('line_items[0][price_data][unit_amount]'), '1200');
      assert.equal(options.body.get('line_items[1][price_data][unit_amount]'), '5600');
      assert.equal(options.body.get('shipping_address_collection[allowed_countries][0]'), 'IT');
      assert.ok(options.headers['Idempotency-Key']);
    }
    assert.ok(url.startsWith('https://api.stripe.com/'));
    return {
      id: stripeId, livemode: false, amount_total: 8000, currency: 'eur',
      metadata: { shop: 'iprodottidellanatura' },
      status: paid ? 'complete' : 'open', payment_status: paid ? 'paid' : 'unpaid',
      url: `https://checkout.stripe.com/c/pay/${stripeId}`,
    };
  });
  const res = fakeResponse();
  await checkout(post({ action: 'start', provider: 'stripe', quantities: { cignula: 2, inbruma: 1 }, unitCents: 1, codes: ['RACCOLTO20'], attempt }), res);
  assert.equal(res.data.id, stripeId);
  assert.match(res.data.url, /^https:\/\/checkout\.stripe\.com\//);
  const req = post({ action: 'status', provider: 'stripe', id: stripeId });
  await checkout(req, res);
  assert.equal(res.data.status, 'pending');
  paid = true;
  await checkout(req, res);
  assert.equal(res.data.status, 'paid');
  assert.equal(res.data.total, 8000);
});

test('Stripe refuses an untrusted redirect and a live response in preview', async t => {
  withEnvironment(t);
  let live = false;
  mockFetch(t, () => ({
    id: stripeId, livemode: live, amount_total: 1200, currency: 'eur',
    metadata: { shop: 'iprodottidellanatura' }, url: 'https://unexpected.example/',
  }));
  const res = fakeResponse();
  const req = post({ action: 'start', provider: 'stripe', quantities: { cignula: 1 }, attempt });
  await checkout(req, res);
  assert.equal(res.code, 502);
  live = true;
  await checkout(req, res);
  assert.equal(res.code, 502);
});

test('PayPal creates an itemized signed EUR order and an approval URL', async t => {
  withEnvironment(t);
  mockFetch(t, (url, options) => {
    assert.ok(url.startsWith('https://api-m.sandbox.paypal.com/'));
    if (url.endsWith('/token')) return { access_token: 'mock-token' };
    const payload = JSON.parse(options.body);
    assert.equal(payload.intent, 'CAPTURE');
    const unit = payload.purchase_units[0];
    assert.equal(unit.custom_id, paypalReference(configuration(testEnv), attemptKey(attempt, cart), 8000));
    assert.equal(unit.amount.value, '80.00');
    assert.equal(unit.items[0].unit_amount.value, '12.00');
    assert.equal(payload.payment_source.paypal.experience_context.user_action, 'PAY_NOW');
    return { id: paypalId, links: [{ rel: 'payer-action', href: `https://www.sandbox.paypal.com/checkoutnow?token=${paypalId}` }] };
  });
  const res = fakeResponse();
  await checkout(post({ action: 'start', provider: 'paypal', quantities: { cignula: 2, inbruma: 1 }, attempt }), res);
  assert.equal(res.code, 200);
  assert.equal(res.data.id, paypalId);
});

test('PayPal never captures invalid, unapproved or non-Italy orders and retries safely', async t => {
  withEnvironment(t);
  let country = 'FR', state = 'CREATED', trusted = true, captures = 0;
  const amount = { currency_code: 'EUR', value: '80.00' };
  mockFetch(t, (url, options) => {
    if (url.endsWith('/token')) return { access_token: 'mock-token' };
    if (url.endsWith('/capture')) {
      captures++;
      assert.equal(options.headers['PayPal-Request-Id'], `pdn-cap-${paypalId}`);
      state = 'COMPLETED';
    }
    return {
      id: paypalId, intent: 'CAPTURE', status: state,
      purchase_units: [{
        custom_id: trusted ? paypalReference(configuration(testEnv), attemptKey(attempt, cart), 8000) : 'external-order',
        amount, shipping: { address: { country_code: country } },
        payments: state === 'COMPLETED' ? { captures: [{ status: 'COMPLETED', final_capture: true, amount }] } : {},
      }],
    };
  });
  const req = post({ action: 'status', provider: 'paypal', id: paypalId });
  const res = fakeResponse();
  await checkout(req, res);
  assert.equal(res.data.status, 'pending');
  state = 'APPROVED';
  trusted = false;
  await checkout(req, res);
  assert.equal(res.code, 404);
  trusted = true;
  await checkout(req, res);
  assert.equal(res.data.status, 'shipping');
  assert.equal(captures, 0);
  country = 'IT';
  await checkout(req, res);
  assert.equal(res.data.status, 'paid');
  await checkout(req, res);
  assert.equal(res.data.status, 'paid');
  assert.equal(captures, 1);
});

test('PayPal webhook never fetches an order when verification fails', async t => {
  withEnvironment(t);
  mockFetch(t, (url, options) => {
    if (url.endsWith('/token')) return { access_token: 'mock-token' };
    assert.ok(url.endsWith('/verify-webhook-signature'));
    assert.equal(JSON.parse(options.body).webhook_id, 'mock-webhook');
    return { verification_status: 'FAILURE' };
  });
  const res = fakeResponse();
  await webhook({
    method: 'POST',
    headers: Object.fromEntries(['auth-algo', 'cert-url', 'transmission-id', 'transmission-sig', 'transmission-time'].map(key => [`paypal-${key}`, 'mock'])),
    body: { event_type: 'CHECKOUT.ORDER.APPROVED', resource: { id: paypalId } },
  }, res);
  assert.equal(res.code, 400);
});
