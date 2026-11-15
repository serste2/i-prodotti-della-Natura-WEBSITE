import { attemptKey, configuration, paymentOptions, quote } from '../lib/checkout.mjs';
import { finalizePaypal, startPaypal, startStripe, stripeStatus, validPaypalOrder } from '../lib/payment-providers.mjs';

export default async function checkout(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const send = (status, data) => res.status(status).json(data);
  let config;
  try {
    config = configuration(process.env);
  } catch {
    return send(503, { error: 'Checkout non disponibile.' });
  }
  if (req.method === 'GET') return send(200, paymentOptions(config));
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return send(405, { error: 'Metodo non consentito.' });
  }
  if (req.headers.origin !== config.origin) return send(403, { error: 'Origine non consentita.' });
  if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) {
    return send(415, { error: 'Formato non valido.' });
  }
  let body;
  try {
    const serialized = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (!serialized) throw new Error();
    if (Buffer.byteLength(serialized) > 4096) return send(413, { error: 'Richiesta troppo grande.' });
    body = JSON.parse(serialized);
    if (!body || !['quote', 'start', 'status'].includes(body.action)) throw new Error();
  } catch {
    return send(400, { error: 'Richiesta non valida.' });
  }
  let cart, key;
  const { action, provider, id } = body;
  if (action !== 'status') {
    try {
      cart = quote(body.quantities);
      if (action === 'quote') return send(200, { ...cart, ...paymentOptions(config) });
      key = attemptKey(body.attempt, cart);
    } catch (error) {
      return send(400, { error: error.message });
    }
  }
  if (!['stripe', 'paypal'].includes(provider)) return send(400, { error: 'Metodo non valido.' });
  if (!config[provider]) return send(503, { error: 'Questo metodo di pagamento non è attivo.' });
  if (action === 'status') {
    const stripeId = new RegExp(`^cs_${config.mode}_[A-Za-z0-9]{8,200}$`);
    if (typeof id !== 'string' || !(provider === 'stripe' ? stripeId.test(id) : validPaypalOrder(id))) {
      return send(400, { error: 'Riferimento pagamento non valido.' });
    }
  }

  try {
    if (action === 'start') {
      const start = provider === 'stripe' ? startStripe : startPaypal;
      return send(200, await start(config, cart, key));
    }
    const status = provider === 'stripe' ? stripeStatus : finalizePaypal;
    const result = await status(config, id);
    if (result.status === 'invalid') return send(404, { error: 'Pagamento non trovato.' });
    return send(200, { ...result, test: config.mode === 'test' });
  } catch {
    return send(502, { error: 'Verifica con il gestore non riuscita. Riprova prima di avviare un altro pagamento.' });
  }
}
