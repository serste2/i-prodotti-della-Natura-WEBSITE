import { configuration } from '../lib/checkout.mjs';
import { finalizePaypal, paypalClient, validPaypalOrder } from '../lib/payment-providers.mjs';

export default async function webhook(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }
  const config = configuration(process.env);
  if (!config.paypal?.webhookId) return res.status(503).end();
  let event;
  try {
    event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).end();
  }
  if (event?.event_type !== 'CHECKOUT.ORDER.APPROVED') return res.status(204).end();
  if (!validPaypalOrder(event.resource?.id)) return res.status(400).end();
  const signatures = {
    auth_algo: req.headers['paypal-auth-algo'],
    cert_url: req.headers['paypal-cert-url'],
    transmission_id: req.headers['paypal-transmission-id'],
    transmission_sig: req.headers['paypal-transmission-sig'],
    transmission_time: req.headers['paypal-transmission-time'],
  };
  if (Object.values(signatures).some(value => typeof value !== 'string' || !value)) return res.status(400).end();

  try {
    const call = await paypalClient(config);
    const verification = await call('/v1/notifications/verify-webhook-signature', {
      method: 'POST',
      body: { ...signatures, webhook_id: config.paypal.webhookId, webhook_event: event },
    });
    if (verification.verification_status !== 'SUCCESS') return res.status(400).end();
    await finalizePaypal(config, event.resource.id, call);
    return res.status(204).end();
  } catch {
    return res.status(502).end();
  }
}
