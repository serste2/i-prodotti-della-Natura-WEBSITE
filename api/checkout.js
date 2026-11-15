import {quote,configuration,testKey,sessionParams,idempotency} from '../lib/checkout.mjs';
export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  const send=(status,data)=>res.status(status).json(data);
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); return send(405,{error:'Metodo non consentito'}); }
  let origin;
  try { origin=configuration(process.env); } catch { return send(503,{error:'Checkout test non disponibile'}); }
  if (req.headers.origin !== origin) return send(403,{error:'Origine non consentita'});
  if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) return send(415,{error:'Formato non valido'});
  let body;
  try {
    if (Number(req.headers['content-length'])>4096 || JSON.stringify(req.body).length>4096) return send(413,{error:'Richiesta troppo grande'});
    body=typeof req.body==='string'?JSON.parse(req.body):req.body;
    if (!body || !['quote','session','status'].includes(body.action)) throw new Error();
  } catch {return send(400,{error:'Richiesta non valida'});}
  let q,params,key;
  try {
    if (body.action !== 'status') q=quote(body);
    if (body.action === 'quote') {
      let paymentReady=false; try {testKey(process.env);paymentReady=true;} catch {}
      return send(200,{...q,paymentReady});
    }
    if (body.action === 'session') { params=sessionParams(q,origin); key=idempotency(body.requestId,q); }
    else if (!/^cs_test_[A-Za-z0-9]{8,200}$/.test(body.sessionId || '')) throw new Error('Sessione non valida');
  } catch(e) {return send(400,{error:e.message});}
  let secret;
  try {secret=testKey(process.env);} catch {return send(503,{error:'Stripe test non configurato. Nessun pagamento avviato.'});}
  try {
    const response=await fetch('https://api.stripe.com/v1/checkout/sessions'+(body.action==='status'?`/${body.sessionId}`:''),{
      method:body.action==='status'?'GET':'POST',
      headers:{Authorization:`Bearer ${secret}`,...(params?{'Content-Type':'application/x-www-form-urlencoded','Idempotency-Key':key}:{})},
      ...(params?{body:params}:{}),signal:AbortSignal.timeout(15000)
    });
    if (!response.ok) throw new Error();
    const session=await response.json();
    if (session.livemode !== false || session.metadata?.inula_test !== 'true' || !session.id?.startsWith('cs_test_')) throw new Error();
    if(body.action==='status') return send(200,{testOnly:true,paid:session.payment_status==='paid',status:session.status,total:session.amount_total,currency:session.currency});
    const destination=new URL(session.url);
    if(destination.origin!=='https://checkout.stripe.com') throw new Error();
    return send(200,{url:destination.href});
  } catch {return send(502,{error:'Impossibile verificare la sessione Stripe. Riprova: nessun ordine è stato confermato.'});}
}
