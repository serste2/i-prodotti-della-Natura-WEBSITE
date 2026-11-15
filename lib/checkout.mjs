import { createHash } from 'node:crypto';
export const catalog = Object.freeze({cignula:{name:'CÍGNULA Mini', cents:1200}, inbruma:{name:'INBRUMA dei Carbonari',cents:5600}});
export function quote(input) {
  if (!input || !input.quantities || typeof input.quantities !== 'object' || Array.isArray(input.quantities)) throw new Error('Carrello non valido');
  if (Object.keys(input.quantities).some(k => !Object.hasOwn(catalog,k))) throw new Error('Prodotto sconosciuto');
  const codes = input.codes ?? [];
  if (!Array.isArray(codes) || codes.length > 2 || new Set(codes).size !== codes.length || codes.some(c => !['INULA05','RACCOLTO10','RACCOLTO15','RACCOLTO20'].includes(c)) || codes.filter(c=>c.startsWith('RACCOLTO')).length > 1) throw new Error('Codici sconto non validi');
  if (input.gift !== undefined && typeof input.gift !== 'boolean') throw new Error('Premio non valido');
  // Test policy: additive INULA05 + one harvest reward, maximum 25%.
  // Browser rewards are NOT proof of eligibility; never use this policy for live payments.
  const percent = codes.reduce((sum,c)=>sum+(c==='INULA05'?5:Number(c.slice(8))),0);
  const items = Object.entries(catalog).flatMap(([id,p])=>{
    const quantity = input.quantities[id] ?? 0;
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 20) throw new Error('Quantità non valida (0–20)');
    return quantity ? [{id,name:p.name,quantity,unitCents:p.cents,discountedUnitCents:p.cents*(100-percent)/100}] : [];
  });
  if (!items.length) throw new Error('Il carrello è vuoto');
  const subtotal = items.reduce((s,i)=>s+i.unitCents*i.quantity,0);
  const total = items.reduce((s,i)=>s+i.discountedUnitCents*i.quantity,0);
  return {items,codes,percent,subtotal,discount:subtotal-total,total,currency:'eur',gift:input.gift===true,testOnly:true,rewardsVerified:false,shippingCents:0};
}
export function configuration(env) {
  if (env.VERCEL_ENV === 'production') throw new Error('Checkout disabilitato in produzione');
  const origin = env.CHECKOUT_ORIGIN || (env.VERCEL_ENV === 'preview' && env.VERCEL_URL ? `https://${env.VERCEL_URL}` : 'http://localhost:4173');
  const url = new URL(origin);
  if (url.origin !== origin || (url.protocol !== 'https:' && !(url.protocol === 'http:' && url.hostname === 'localhost' && !env.VERCEL))) throw new Error('Origine checkout non valida');
  return origin;
}
export function testKey(env) {
  if (env.CHECKOUT_ENABLED !== 'test' || !/^sk_test_[A-Za-z0-9]+$/.test(env.STRIPE_SECRET_KEY || '')) throw new Error('Stripe test non configurato');
  return env.STRIPE_SECRET_KEY;
}
export function sessionParams(q,origin) {
  const p = new URLSearchParams({mode:'payment',success_url:`${origin}/checkout.html?session_id={CHECKOUT_SESSION_ID}`,cancel_url:`${origin}/checkout.html?cancelled=1`,'payment_method_types[0]':'card','shipping_address_collection[allowed_countries][0]':'IT','metadata[inula_test]':'true','metadata[reward_codes]':q.codes.join(','),'metadata[rewards_verified]':'false','metadata[mystery_gift]':String(q.gift)});
  q.items.forEach((i,n)=>{
    p.set(`line_items[${n}][quantity]`,String(i.quantity));
    p.set(`line_items[${n}][price_data][currency]`,'eur');
    p.set(`line_items[${n}][price_data][unit_amount]`,String(i.discountedUnitCents));
    p.set(`line_items[${n}][price_data][product_data][name]`,i.name+(q.percent?` (sconto test ${q.percent}%)`:''));
  });
  return p;
}
export function idempotency(requestId,q) {
  if (typeof requestId !== 'string' || !/^[0-9a-f-]{36}$/.test(requestId)) throw new Error('Identificativo richiesta non valido');
  return `inula-test-${requestId}-${createHash('sha256').update(JSON.stringify(q)).digest('hex')}`;
}
