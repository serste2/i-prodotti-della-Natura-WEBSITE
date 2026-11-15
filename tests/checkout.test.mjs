import test from 'node:test';
import assert from 'node:assert/strict';
import {quote,configuration,testKey,sessionParams,idempotency} from '../lib/checkout.mjs';
import handler from '../api/checkout.js';
const cart={quantities:{cignula:2,inbruma:1},codes:['INULA05','RACCOLTO20'],gift:true};
test('server catalogue ignores browser amounts and preserves rewards',()=>{
 const q=quote({...cart,total:1,percent:100});assert.equal(q.subtotal,8000);assert.equal(q.total,6000);assert.equal(q.percent,25);assert.equal(q.gift,true);assert.equal(q.rewardsVerified,false);
 const p=sessionParams(q,'https://preview.example');assert.equal(p.get('line_items[0][price_data][unit_amount]'),'900');assert.equal(p.get('line_items[1][price_data][unit_amount]'),'4200');assert.equal(p.get('line_items[0][quantity]'),'2');
});
test('all permitted rewards calculate exact cents',()=>{
 for(const [codes,total] of [[[],6800],[['INULA05'],6460],[['RACCOLTO10'],6120],[['RACCOLTO15'],5780],[['RACCOLTO20'],5440],[['INULA05','RACCOLTO10'],5780],[['INULA05','RACCOLTO15'],5440],[['INULA05','RACCOLTO20'],5100]]) assert.equal(quote({quantities:{cignula:1,inbruma:1},codes}).total,total);
});
test('reject malformed quantities, products and discounts',()=>{
 for(const quantity of [-1,21,1.5,'2',NaN,Infinity,null]) { if(quantity===null) continue; assert.throws(()=>quote({quantities:{cignula:quantity}})); }
 for(const quantities of [{},{alien:1},{toString:1},[]]) assert.throws(()=>quote({quantities}));
 for(const codes of [['RACCOLTO100'],['INULA05','INULA05'],['RACCOLTO10','RACCOLTO20'],'INULA05'])assert.throws(()=>quote({...cart,codes}));
});
test('production, live keys and untrusted origins fail closed',()=>{
 assert.throws(()=>configuration({VERCEL_ENV:'production'}));assert.throws(()=>configuration({CHECKOUT_ORIGIN:'https://evil.example/path'}));
 assert.throws(()=>testKey({CHECKOUT_ENABLED:'test',STRIPE_SECRET_KEY:'sk_live_example'}));assert.throws(()=>testKey({}));
});
test('idempotency binds retry to immutable quote',()=>{
 const id='12345678-1234-1234-1234-123456789abc',q=quote(cart);
 assert.equal(idempotency(id,q),idempotency(id,quote(cart)));assert.notEqual(idempotency(id,q),idempotency(id,quote({...cart,codes:[]})));
});
async function call(body,headers={},method='POST') {
 const res={headers:{},setHeader(k,v){this.headers[k]=v;},status(code){this.code=code;return this;},json(data){this.data=data;return this;}};
 await handler({method,headers:{origin:'http://localhost:4173','content-type':'application/json',...headers},body},res);return res;
}
test('API guards and mock Stripe integration (no actual payment)',async()=>{
 const original={...process.env},originalFetch=global.fetch;
 try {
  delete process.env.VERCEL;delete process.env.VERCEL_ENV;delete process.env.CHECKOUT_ORIGIN;delete process.env.STRIPE_SECRET_KEY;delete process.env.CHECKOUT_ENABLED;
  assert.equal((await call({action:'quote',...cart})).data.paymentReady,false);
  assert.equal((await call({action:'session',...cart,requestId:'12345678-1234-1234-1234-123456789abc'})).code,503);
  assert.equal((await call({action:'quote',...cart},{origin:'https://evil.example'})).code,403);
  assert.equal((await call({}, {},'GET')).code,405);assert.equal((await call('x'.repeat(5000))).code,413);
  process.env.CHECKOUT_ENABLED='test';process.env.STRIPE_SECRET_KEY='sk_test_fixture';
  let calls=0;global.fetch=async(url,options)=>{calls++;assert.equal(options.body.get('line_items[0][price_data][unit_amount]'),'900');assert.ok(options.headers['Idempotency-Key']);return {ok:true,json:async()=>({id:'cs_test_fixture123',livemode:false,metadata:{inula_test:'true'},url:'https://checkout.stripe.com/c/pay/cs_test_fixture123'})};};
  assert.equal((await call({action:'session',...cart,requestId:'12345678-1234-1234-1234-123456789abc'})).code,200);assert.equal(calls,1);
  global.fetch=async()=>({ok:true,json:async()=>({id:'cs_test_fixture123',livemode:true,metadata:{inula_test:'true'},url:'https://checkout.stripe.com/'})});
  assert.equal((await call({action:'session',...cart,requestId:'12345678-1234-1234-1234-123456789abc'})).code,502);
  global.fetch=async()=>({ok:true,json:async()=>({id:'cs_test_fixture123',livemode:false,metadata:{inula_test:'true'},payment_status:'paid',status:'complete',amount_total:6000,currency:'eur'})});
  assert.equal((await call({action:'status',sessionId:'cs_test_fixture123'})).data.paid,true);
  process.env.VERCEL_ENV='production';assert.equal((await call({action:'quote',...cart})).code,503);
 } finally {global.fetch=originalFetch; for(const k of Object.keys(process.env)) if(!(k in original)) delete process.env[k];Object.assign(process.env,original);}
});
