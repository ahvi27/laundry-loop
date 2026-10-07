'use strict';
const KEY='laundry-loop-v1';
const stages=['In basket','Washing','Drying','Ready to fold','Finished'];
let loads=[],filter='all';
try{const saved=JSON.parse(localStorage.getItem(KEY));if(Array.isArray(saved))loads=saved.filter(l=>l&&typeof l.name==='string'&&Number.isInteger(l.stage)&&l.stage>=0&&l.stage<=4)}catch{}
const $=id=>document.getElementById(id);
function element(tag,cls,text){const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node}
function save(){try{localStorage.setItem(KEY,JSON.stringify(loads))}catch{$('storage').textContent='Browser storage is unavailable. Keep this page open to keep your loads.'}render()}
function announce(text){$('message').textContent=text;$('message').classList.add('visible');clearTimeout(announce.timeout);announce.timeout=setTimeout(()=>$('message').classList.remove('visible'),2500)}
function remaining(load){if(load.stage!==1)return load.stage===4?'All done':load.minutes+' min wash cycle';const seconds=Math.max(0,Math.ceil((load.started+load.minutes*60000-Date.now())/1000));return seconds?String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0')+' remaining':'Wash time finished — move to drying'}
function render(){ $('active').textContent=loads.filter(l=>l.stage<3).length;$('ready').textContent=loads.filter(l=>l.stage===3).length;$('done').textContent=loads.filter(l=>l.stage===4).length;const list=$('loads');list.replaceChildren();const visible=loads.filter(l=>filter==='all'||(filter==='done'?l.stage===4:l.stage<4));if(!visible.length){const empty=element('div','empty');empty.append(element('strong','',filter==='done'?'No finished loads yet.':'Your laundry board is clear.'),element('span','','Add a load to start tracking.'));list.append(empty)}for(const load of visible){const card=element('article','load'),top=element('div','load-top'),info=element('div','info');info.append(element('strong','',load.name),element('small','',load.type));const del=element('button','delete','×');del.setAttribute('aria-label','Delete '+load.name);del.onclick=()=>{loads=loads.filter(l=>l.id!==load.id);save();announce('Load removed')};top.append(element('div','symbol',load.stage===4?'✓':'◉'),info,del);const progress=element('div','progress'),bar=element('span');bar.style.width=(load.stage/4*100)+'%';progress.append(bar);const bottom=element('div','load-bottom'),time=element('span','time',remaining(load));time.dataset.timer=load.id;bottom.append(time);if(load.stage<4){const next=element('button','next',['Start wash','Move to drying','Ready to fold','Mark finished'][load.stage]);next.onclick=()=>{load.stage++;if(load.stage===1)load.started=Date.now();save();announce(stages[load.stage])};bottom.append(next)}card.append(top,element('span','status',stages[load.stage]),progress,bottom);list.append(card)}}
$('form').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target),name=String(f.get('name')).trim();if(!name){e.target.elements.name.setCustomValidity('Enter a load name.');e.target.elements.name.reportValidity();return}loads.unshift({id:Date.now().toString(36)+Math.random().toString(36).slice(2),name,type:String(f.get('type')),minutes:Number(f.get('minutes')),stage:0,started:null});save();e.target.reset();announce('Added to your basket')});$('form').elements.name.addEventListener('input',e=>e.target.setCustomValidity(''));
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b))});render()}));$('date').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'});setInterval(()=>{document.querySelectorAll('[data-timer]').forEach(n=>{const l=loads.find(x=>x.id===n.dataset.timer);if(l)n.textContent=remaining(l)})},1000);render();

const themeQuery=window.matchMedia('(prefers-color-scheme: dark)');
let themePreference;
try{themePreference=localStorage.getItem('laundry-loop-theme')}catch{}
function applyTheme(theme){
 document.documentElement.dataset.theme=theme;
 $('theme-toggle').setAttribute('aria-pressed',String(theme==='dark'));
 document.querySelector('meta[name="theme-color"]').content=theme==='dark'?'#111b29':'#203955';
}
applyTheme(document.documentElement.dataset.theme);
$('theme-toggle').addEventListener('click',()=>{
 themePreference=document.documentElement.dataset.theme==='dark'?'light':'dark';
 applyTheme(themePreference);
 try{localStorage.setItem('laundry-loop-theme',themePreference)}catch{}
});
themeQuery.addEventListener('change',e=>{if(themePreference!=='dark'&&themePreference!=='light')applyTheme(e.matches?'dark':'light')});
