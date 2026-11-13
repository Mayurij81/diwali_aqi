let CITIES=[],BASE,WIN,NIGHTS,LIMIT;   // filled from /api/data
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const data={},charts={};let current='';
const $=id=>document.getElementById(id);
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const inR=(t,r)=>{const d=t.slice(0,10);return d>=r[0]&&d<=r[1]};
const pick=(c,key,r)=>c.time.map((t,i)=>inR(t,r)&&c[key]&&c[key][i]!=null?c[key][i]:null).filter(v=>v!==null);
const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:NaN;
const f=(v,d=0)=>isNaN(v)?'n/a':v.toFixed(d);
const fmtT=t=>+t.slice(8,10)+' '+MON[+t.slice(5,7)-1]+', '+t.slice(11,16);
function mk(id,cfg){if(charts[id])charts[id].destroy();charts[id]=new Chart($(id),cfg)}
const band={id:'band',beforeDatasetsDraw(ch){
 const t=ch.data.labels;if(!/T/.test(t[0]||''))return;
 const a=t.findIndex(x=>inR(x,WIN)),b=t.length-1-[...t].reverse().findIndex(x=>inR(x,WIN));if(a<0)return;
 const x=ch.scales.x,y=ch.scales.y,c=ch.ctx,x0=x.getPixelForValue(a),x1=x.getPixelForValue(b);
 c.save();c.fillStyle=css('--shade');c.fillRect(x0,y.top,x1-x0,y.bottom-y.top);
 c.fillStyle=css('--accent');c.font='600 11px system-ui,sans-serif';c.fillText('DIWALI WINDOW',x0+6,y.top+14);c.restore()}};
const axis=(t,pos)=>({position:pos,title:{display:true,text:t,color:css('--muted'),font:{size:11}},ticks:{color:css('--muted'),font:{size:11}},grid:{color:pos==='left'?css('--line'):'transparent'}});
function fig1(c){
 const ds=[{label:'PM2.5 (µg/m³)',data:c.pm,borderColor:css('--accent'),borderWidth:1.5,pointRadius:0,tension:.2,yAxisID:'y'},
  {label:'60 µg/m³ reference',data:c.time.map(()=>LIMIT),borderColor:css('--muted'),borderDash:[5,4],borderWidth:1,pointRadius:0,yAxisID:'y'}];
 const sc={x:{ticks:{color:css('--muted'),autoSkip:false,maxRotation:0,font:{size:11},callback:(v,i)=>c.time[i].endsWith('T00:00')&&i%48===0?c.time[i].slice(8,10)+' '+MON[+c.time[i].slice(5,7)-1]:''},grid:{display:false}},y:axis('PM2.5, µg/m³','left')};
 if(c.wind){ds.push({label:'Wind (km/h)',data:c.wind,borderColor:css('--base'),borderWidth:1,pointRadius:0,tension:.2,yAxisID:'y2'});sc.y2=axis('Wind, km/h','right')}
 mk('c1',{type:'line',data:{labels:c.time,datasets:ds},plugins:[band],options:{maintainAspectRatio:false,animation:false,interaction:{mode:'index',intersect:false},scales:sc,plugins:{legend:{labels:{color:css('--muted'),boxWidth:14,font:{size:11}}}}}})}
function fig2(c){
 const hrs=[...Array(24).keys()],lab=hrs.map(h=>String(h).padStart(2,'0')+'h');
 const base=hrs.map(h=>mean(c.time.map((t,i)=>inR(t,BASE)&&+t.slice(11,13)===h&&c.pm[i]!=null?c.pm[i]:null).filter(v=>v!==null)));
 const day=d=>hrs.map(h=>{const i=c.time.indexOf(d+'T'+String(h).padStart(2,'0')+':00');return i>=0?c.pm[i]:null});
 mk('c2',{type:'line',data:{labels:lab,datasets:[
  {label:'Baseline average (25 Oct–1 Nov)',data:base,borderColor:css('--base'),borderWidth:2,pointRadius:0,tension:.3},
  {label:'8 Nov (Lakshmi Puja)',data:day(NIGHTS[0]),borderColor:css('--accent'),borderWidth:2,pointRadius:0,tension:.3},
  {label:'9 Nov',data:day(NIGHTS[1]),borderColor:css('--accent'),borderDash:[5,4],borderWidth:1.5,pointRadius:0,tension:.3}]},
  options:{maintainAspectRatio:false,animation:false,interaction:{mode:'index',intersect:false},scales:{x:{ticks:{color:css('--muted'),font:{size:11},maxTicksLimit:12},grid:{display:false}},y:axis('PM2.5, µg/m³','left')},plugins:{legend:{labels:{color:css('--muted'),boxWidth:14,font:{size:11}}}}}})}
function fig3(S){
 mk('c3',{type:'bar',data:{labels:CITIES.map(c=>c.name),datasets:[
  {label:'Baseline mean',data:S.map(s=>s.bm),backgroundColor:css('--base')},
  {label:'Diwali window mean',data:S.map(s=>s.wm),backgroundColor:css('--accent')}]},
  options:{maintainAspectRatio:false,animation:false,scales:{x:{ticks:{color:css('--muted')},grid:{display:false}},y:axis('µg/m³','left')},plugins:{legend:{labels:{color:css('--muted'),boxWidth:14,font:{size:11}}}}}})}
function render(){
 const c=data[current],S=CITIES.map(k=>data[k.name].stats),s=c.stats;
 document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.textContent===current));
 fig1(c);fig2(c);fig3(S);
 const dir=s.pct>=0?'higher':'lower';
 $('citytext').textContent=`${current}: mean PM2.5 was ${f(s.wm)} µg/m³ in the window, ${f(Math.abs(s.pct))}% ${dir} than the baseline ${f(s.bm)} µg/m³. The highest hour was ${f(s.peak)} µg/m³ (${s.pt?fmtT(s.pt):'n/a'}), and ${s.hrs} hours in the window were above ${LIMIT} µg/m³.`+(isNaN(s.ww)?'':` Mean wind was ${f(s.ww,1)} km/h against ${f(s.wb,1)} km/h in the baseline.`);
 let h='<tr><th>City</th><th>Baseline mean</th><th>Window mean</th><th>Change</th><th>Window peak</th><th>Hours &gt; '+LIMIT+'</th><th>Wind (window / base)</th></tr>';
 CITIES.forEach((k,i)=>{const q=S[i];h+=`<tr><td>${k.name}</td><td>${f(q.bm)}</td><td>${f(q.wm)}</td><td>${q.pct>=0?'+':''}${f(q.pct)}%</td><td>${f(q.peak)}</td><td>${q.hrs}</td><td>${isNaN(q.ww)?'n/a':f(q.ww,1)+' / '+f(q.wb,1)}</td></tr>`});
 $('tbl').innerHTML=h}
function summary(){
 const S=CITIES.map(k=>data[k.name].stats),up=S.filter(s=>s.pct>0).length;
 let mi=0,pi=0;S.forEach((s,i)=>{if(s.pct>S[mi].pct)mi=i;if(s.peak>S[pi].peak)pi=i});
 const so=S[0];
 $('abstract').textContent=`In ${up} of ${CITIES.length} cities, modelled PM2.5 was higher during 7–9 November 2026 than in the week before. The largest rise was in ${CITIES[mi].name} (${S[mi].pct>=0?'+':''}${f(S[mi].pct)}%), and the highest single hour was in ${CITIES[pi].name}. This note describes the pattern and what the data cannot show.`;
 $('stats').innerHTML=[
  [`${up} / ${CITIES.length}`,'cities with a higher mean PM2.5 in the Diwali window than in the baseline'],
  [`${S[mi].pct>=0?'+':''}${f(S[mi].pct)}%`,`largest change in window mean, in ${CITIES[mi].name}`],
  [`${f(S[pi].peak)}`,`µg/m³, highest hourly value in the window (${CITIES[pi].name}, ${fmtT(S[pi].pt)})`],
  [`${so.pct>=0?'+':''}${f(so.pct)}%`,'change in window mean for Solapur, compared with its own baseline']
 ].map(x=>`<div class="stat"><div class="n">${x[0]}</div><div class="t">${x[1]}</div></div>`).join('')}
function csv(){
 let r=['city,time,pm2_5_ugm3,wind_kmh'];
 CITIES.forEach(k=>{const c=data[k.name];c.time.forEach((t,i)=>r.push([k.name,t,c.pm[i]??'',c.wind?c.wind[i]??'':''].join(',')))});
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([r.join('\n')],{type:'text/csv'}));a.download='diwali2026_pm25_hourly.csv';a.click()}
(async()=>{
 try{
  const r=await fetch('/api/data');if(!r.ok)throw new Error('HTTP '+r.status);
  const j=await r.json();
  BASE=j.meta.baseline;WIN=j.meta.window;NIGHTS=j.meta.nights;LIMIT=j.meta.limit;
  j.cities.forEach(c=>{data[c.name]=c;CITIES.push({name:c.name})});
  current=CITIES[0].name;
  CITIES.forEach(k=>{const b=document.createElement('button');b.textContent=k.name;b.onclick=()=>{current=k.name;render()};$('tabs').appendChild(b)});
  $('csv').onclick=e=>{e.preventDefault();csv()};
  $('when').textContent=new Date(j.meta.retrievedAt).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'});
  summary();render();
 }catch(e){$('abstract').innerHTML='<span class="err">Could not load data ('+e.message+'). If you opened this file directly, run it with <code>npx vercel dev</code> so the /api route is available.</span>'}
})();
