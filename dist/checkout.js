const statusNode=document.querySelector('#status'), pay=document.querySelector('#pay');
const money=cents=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(cents/100);
async function api(body) {
  const response=await fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const data=await response.json(); if(!response.ok) throw new Error(data.error || 'Checkout non disponibile'); return data;
}
let payload;
(async()=>{
  try {
    const search=new URLSearchParams(location.search);
    if(search.has('session_id')) {
      const result=await api({action:'status',sessionId:search.get('session_id')});
      statusNode.textContent=result.paid?`Pagamento di test verificato: ${money(result.total)}. Nessun incasso reale e nessun ordine da spedire.`:'Pagamento non completato. Puoi tornare al carrello e riprovare.';
      pay.hidden=true; return;
    }
    const quantities=JSON.parse(sessionStorage.getItem('inulaCart') || '{}');
    const harvest=JSON.parse(localStorage.getItem('inulaHarvest') || 'null');
    const codes=[];
    if(localStorage.getItem('inulaFieldComplete')) codes.push('INULA05');
    if(harvest?.discount) codes.push(`RACCOLTO${harvest.discount}`);
    payload={quantities,codes,gift:localStorage.getItem('inulaMysteryGiftUnlocked')==='1'};
    const q=await api({action:'quote',...payload});
    q.items.forEach(i=>{const li=document.createElement('li');li.textContent=`${i.name} × ${i.quantity} — ${money(i.unitCents*i.quantity)}`;document.querySelector('#items').append(li);});
    for(const [label,amount] of [['Prodotti',q.subtotal],['Sconto test',-q.discount],['Spedizione simulata',q.shippingCents],['Totale test',q.total]]) {
      const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=money(amount);document.querySelector('#totals').append(dt,dd);
    }
    document.querySelector('#rewards').textContent=`Codici: ${q.codes.join(' + ') || 'nessuno'}.${q.gift?' Omaggio misterioso conservato.':''} Ricompense del browser non certificate: valide solo per questa prova. Sconti test cumulati fino al 25%.`;
    pay.disabled=!q.paymentReady;
    statusNode.textContent=(search.has('cancelled')?'Pagamento annullato; carrello e ricompense conservati.\n':'')+(q.paymentReady?'Pronto per il pagamento di test.':'Riepilogo verificato. Stripe test non ancora collegato: nessun pagamento disponibile.');
  }catch(e){statusNode.textContent=e.message;}
})();
pay.addEventListener('click',async()=>{
  pay.disabled=true;statusNode.textContent='Apertura del checkout Stripe di test…';
  try {
    const fingerprint=JSON.stringify(payload);
    let attempt=JSON.parse(sessionStorage.getItem('inulaCheckoutAttempt') || 'null');
    if(!attempt || attempt.fingerprint!==fingerprint || Date.now()-attempt.at>3600000) {attempt={fingerprint,id:crypto.randomUUID(),at:Date.now()};sessionStorage.setItem('inulaCheckoutAttempt',JSON.stringify(attempt));}
    const result=await api({action:'session',...payload,requestId:attempt.id});
    const url=new URL(result.url);if(url.origin!=='https://checkout.stripe.com') throw new Error('Destinazione non valida');
    location.assign(url.href);
  }catch(e){statusNode.textContent=e.message;pay.disabled=false;}
});
