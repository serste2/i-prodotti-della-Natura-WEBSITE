'use strict';
const $=id=>document.getElementById(id);let data=null,revision=0;
const finite=v=>typeof v==='number'&&Number.isFinite(v);const fmt=v=>finite(v)?v.toFixed(3):'n.d.';
function validate(d){if(d?.schemaVersion!==1||!Array.isArray(d.years)||!d.years.length||!Array.isArray(d.modes)||!d.modes.length||!d.images||!Array.isArray(d.statistics))throw Error('Formato JSON non riconosciuto');for(const u of Object.values(d.images)){const parsed=new URL(u,location.href);if(!['https:','http:'].includes(parsed.protocol))throw Error('URL immagine non valido');}return d;}
function row(t,values){const tr=document.createElement('tr');for(const value of values){const td=document.createElement('td');td.textContent=value;tr.append(td);}t.append(tr);}
function accept(d){data=validate(d);for(const id of ['yearA','yearB']){$(id).replaceChildren(...d.years.map(y=>new Option(y,y)));$(id).disabled=false;}$('yearA').value=d.years[0];$('yearB').value=d.years.at(-1);$('mode').replaceChildren(...d.modes.map(m=>new Option(m.name,m.band)));$('mode').disabled=false;$('swap').disabled=false;$('swipe').disabled=false;render();}
function value(y,band,company){return data.statistics.find(r=>Number(r.year)===Number(y)&&r.gruppo===(company?'azienda':'confronto'))?.[band];}
async function loadImage(target,url){if(!url)throw Error('Annualità non esportata');return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('Immagine non raggiungibile o URL temporaneo scaduto'));img.src=url;});}
async function render(){const rev=++revision,m=data.modes.find(m=>m.band===$('mode').value),a=$('yearA').value,b=$('yearB').value;$('labelA').textContent='A · '+a;$('labelB').textContent='B · '+b;$('note').textContent=m.note;$('legend').hidden=m.band==='RGB';document.querySelector('.results').style.display=m.band==='RGB'?'none':'';$('status').textContent='Caricamento '+a+' / '+b+'…';$('empty').style.display='flex';$('empty').textContent='Caricamento immagini…';for(const id of ['imageA','imageB'])$(id).style.display='none';
 const gradient=document.createElement('div');gradient.className='gradient';gradient.style.background='linear-gradient(to right,'+m.vis.palette.map(c=>'#'+c).join(',')+')';const ends=document.createElement('div');ends.className='endpoints';for(const v of [m.vis.min,m.vis.max]){const s=document.createElement('span');s.textContent=v+' '+m.unit;ends.append(s);}$('legend').replaceChildren(gradient,ends);
 const tbody=$('stats').tBodies[0];tbody.replaceChildren();for(const company of [true,false]){const av=value(a,m.band,company),bv=value(b,m.band,company);row(tbody,[company?'Azienda':data.comparisonLabel||'Contesto',fmt(av),fmt(bv),fmt(finite(av)&&finite(bv)?bv-av:null)]);}const series=$('series').tBodies[0];series.replaceChildren();for(const y of data.years)row(series,[y,fmt(value(y,m.band,true)),fmt(value(y,m.band,false))]);chart(m.band);
 const rt=$('rain').tBodies[0];rt.replaceChildren();for(const r of data.rain||[])row(rt,[r.year,finite(r.mm)?r.mm.toFixed(1):'n.d.']);$('rainSection').hidden=!data.rain?.length;
 try{const [ia,ib]=await Promise.all([loadImage('imageA',data.images[m.band+'_'+a]),loadImage('imageB',data.images[m.band+'_'+b])]);if(rev!==revision)return;$('imageA').src=ia.src;$('imageB').src=ib.src;$('imageA').style.display=$('imageB').style.display='block';$('empty').style.display='none';$('divider').style.display='block';$('status').textContent='A: '+a+' · B: '+b+' · Finestra 1 aprile–10 ottobre · Dati fino al '+data.through;swipe();}catch(e){if(rev!==revision)return;$('empty').textContent=e.message;$('status').textContent='Mappe non disponibili: '+e.message;$('divider').style.display='none';}}
function swipe(){const p=$('swipe').value;$('imageA').style.clipPath=`inset(0 ${100-p}% 0 0)`;$('divider').style.left=p+'%';}
function chart(band) {
  const canvas = $('chart');
  const ctx = canvas.getContext('2d');
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (!width || !height) return;

  ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const styles = getComputedStyle(canvas);
  ctx.font = '12px "Roboto Mono", monospace';
  ctx.fillStyle = styles.getPropertyValue('--ink').trim();
  const values = data.years.flatMap(year => [value(year, band, true), value(year, band, false)]).filter(finite);
  if (!values.length) {
    ctx.fillText('Statistiche non esportate', 8, 24);
    return;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min || 1) * 0.1;
  const lower = min - padding;
  const upper = max + padding;
  const left = 48;
  const right = width - 19;
  const top = 12;
  const bottom = height - 22;
  const x = index => left + index * (right - left) / Math.max(1, data.years.length - 1);
  const y = amount => bottom - (amount - lower) / (upper - lower) * (bottom - top);

  ctx.strokeStyle = styles.getPropertyValue('--rule').trim();
  ctx.lineWidth = 1;
  for (let index = 0; index < 5; index++) {
    const tick = lower + (upper - lower) * index / 4;
    const lineY = y(tick);
    ctx.beginPath();
    ctx.moveTo(left, lineY);
    ctx.lineTo(right, lineY);
    ctx.stroke();
    ctx.fillText(tick.toFixed(2), 1, lineY + 4);
  }

  const last = data.years.length - 1;
  const yearStep = Math.max(1, Math.ceil(last * 42 / (right - left)));
  ctx.textAlign = 'center';
  data.years.forEach((year, index) => {
    if (index === last || (index % yearStep === 0 && last - index >= yearStep)) {
      ctx.fillText(year, x(index), height - 3);
    }
  });
  ctx.textAlign = 'start';

  for (const company of [true, false]) {
    const color = styles.getPropertyValue(company ? '--farm-series' : '--context-series').trim();
    ctx.strokeStyle = ctx.fillStyle = color;
    ctx.lineWidth = 2.5;
    ctx.setLineDash(company ? [] : [6, 4]);
    ctx.beginPath();
    let connected = false;
    data.years.forEach((year, index) => {
      const amount = value(year, band, company);
      if (!finite(amount)) {
        connected = false;
        return;
      }
      if (connected) ctx.lineTo(x(index), y(amount));
      else ctx.moveTo(x(index), y(amount));
      connected = true;
    });
    ctx.stroke();
    ctx.setLineDash([]);
    data.years.forEach((year, index) => {
      const amount = value(year, band, company);
      if (finite(amount)) {
        ctx.beginPath();
        ctx.arc(x(index), y(amount), 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }
}
for(const id of ['mode','yearA','yearB'])$(id).addEventListener('change',render);$('swipe').addEventListener('input',swipe);$('swap').onclick=()=>{const a=$('yearA').value;$('yearA').value=$('yearB').value;$('yearB').value=a;render();};$('load').onclick=()=>{try{accept(JSON.parse($('json').value));}catch(e){$('status').textContent=e.message;}};$('file').onchange=async e=>{try{accept(JSON.parse(await e.target.files[0].text()));}catch(err){$('status').textContent=err.message;}};
fetch('data.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Archivio in attesa');return r.json();}).then(accept).catch(()=>{$('status').textContent='Pagina pronta · immagini e statistiche in attesa dell’esportazione Earth Engine.';});

function refreshChart() {
  const band = $('mode').value;
  if (data && band !== 'RGB') chart(band);
}

document.fonts.ready.then(refreshChart);
window.addEventListener('resize', refreshChart);
