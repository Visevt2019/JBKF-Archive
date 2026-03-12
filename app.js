/* app.js - public site
   - Uses localStorage key 'jbkf_simple_v1'
   - Listens to BroadcastChannel 'jbkf_channel' and storage events to update live
   - Renders chapter.code as HTML (you control the HTML)
*/

const STORAGE_KEY = 'jbkf_simple_v1';
const CHANNEL_NAME = 'jbkf_channel';
const bc = ('BroadcastChannel' in window) ? new BroadcastChannel(CHANNEL_NAME) : null;

const DEFAULT = {
  about: "Jingle Bells Kick Face is a meta series where series and chapters unfold sequentially.",
  video: "",
  characters: [],
  series: [
    {
      id: "s1",
      title: "Series One: Winter Riot",
      image: "",
      intro: "The first series introduces the world.",
      chapters: [
        { id: "s1-ch1", title: "Chapter 1: Bells", date: "2026-03-01", author: "Parin", code: "<p>Chapter one text.</p>" }
      ]
    }
  ],
  suggestions: []
};

let DATA = load();

function load(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT));
  }catch(e){ return JSON.parse(JSON.stringify(DEFAULT)); }
}
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(DATA)); if(bc) bc.postMessage({type:'data-updated'}); }

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const uid = (p='id') => p + Date.now().toString(36).slice(-6);
function esc(s){ return s ? String(s) : ''; }
function placeholder(w=600,h=320){ const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><rect width='100%' height='100%' fill='#e9e6e6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#bdbdbd' font-family='Arial' font-size='20'>No image</text></svg>`; return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }

/* Live update handlers */
if(bc){
  bc.onmessage = (m) => {
    if(m && m.data && m.data.type === 'data-updated') {
      DATA = load();
      refreshCurrentView();
    }
  };
}
window.addEventListener('storage', (e) => {
  if(e.key === STORAGE_KEY) {
    DATA = load();
    refreshCurrentView();
  }
});

/* Routing & menu */
const pages = $$('.page');
function showPage(id){
  pages.forEach(p => p.id === id ? p.classList.add('active') : p.classList.remove('active'));
  closeMenu();
  window.scrollTo({top:0,behavior:'smooth'});
}
const menuBtn = $('#menuBtn'), sideMenu = $('#sideMenu'), closeMenuBtn = $('#closeMenu');
menuBtn.addEventListener('click', ()=> sideMenu.setAttribute('aria-hidden', sideMenu.getAttribute('aria-hidden') === 'false' ? 'true' : 'false'));
closeMenuBtn.addEventListener('click', ()=> sideMenu.setAttribute('aria-hidden','true'));
document.addEventListener('click', (e)=> { if(!sideMenu.contains(e.target) && !menuBtn.contains(e.target)) sideMenu.setAttribute('aria-hidden','true'); });

$$('[data-route]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); routeTo(el.getAttribute('data-route')); }));

function routeTo(route){
  if(route === 'archive'){ renderArchive(); showPage('archive'); }
  else if(route === 'info'){ renderInfo(); showPage('info'); }
  else if(route === 'suggestions'){ renderSuggestions(); showPage('suggestions'); }
  else if(route === 'characters'){ showPage('home'); setTimeout(()=> scrollToChars(), 200); }
  else if(route === 'latest'){ renderArchive(); showPage('archive'); }
  else showPage('home');
}

/* Back buttons */
$$('[data-back]').forEach(b => b.addEventListener('click', ()=> {
  if($('#chapter').classList.contains('active')) showPage('series');
  else if($('#series').classList.contains('active')) showPage('archive');
  else showPage('home');
}));

/* Home render */
function renderHome(){
  $('#aboutText').innerHTML = DATA.about || '';
  const vidSrc = DATA.video ? `./${DATA.video}` : '';
  const source = $('#charactersVideo source');
  source.src = vidSrc;
  $('#charactersVideo').load();
  renderCharacters('#charactersList', DATA.characters);
}
function scrollToChars(){ const el = $('#charactersPreview'); if(el) el.scrollIntoView({behavior:'smooth'}); }
function renderCharacters(sel, list){
  const wrap = $(sel);
  wrap.innerHTML = '';
  (list || []).forEach(c => {
    const card = document.createElement('div'); card.className = 'card';
    card.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center">
        <img src="${c.img ? './' + c.img : placeholder(96,96)}" alt="${esc(c.name)}" style="width:72px;height:72px;border-radius:10px;object-fit:cover">
        <div>
          <div style="font-weight:800">${esc(c.name)}</div>
          <div class="meta">${esc(c.intro)}</div>
        </div>
      </div>
    `;
    wrap.appendChild(card);
  });
}

/* Archive */
function renderArchive(){
  const grid = $('#seriesGrid'); grid.innerHTML = '';
  (DATA.series || []).forEach(s => {
    const card = document.createElement('div'); card.className = 'card'; card.style.cursor = 'pointer';
    card.innerHTML = `
      <img src="${s.image ? './' + s.image : placeholder(600,320)}" alt="${esc(s.title)}" style="width:100%;height:160px;object-fit:cover;border-radius:10px;margin-bottom:10px">
      <div style="font-weight:800">${esc(s.title)}</div>
      <div class="meta">${esc(s.intro)}</div>
    `;
    card.addEventListener('click', ()=> openSeries(s.id));
    grid.appendChild(card);
  });
}

/* Series view */
let currentSeriesId = null;
function openSeries(id){
  const s = (DATA.series || []).find(x=>x.id===id); if(!s) return;
  currentSeriesId = id;
  $('#seriesTitle').textContent = s.title;
  $('#seriesIntro').innerHTML = `<div style="display:flex;gap:12px;align-items:flex-start"><img src="${s.image ? './' + s.image : placeholder(300,160)}" style="width:220px;height:120px;object-fit:cover;border-radius:10px"><div><p>${esc(s.intro)}</p></div></div>`;
  renderCharacters('#seriesCharacters', DATA.characters ? DATA.characters.filter(c => s.characters && s.characters.includes(c.id)) : []);
  const list = $('#chaptersList'); list.innerHTML = '';
  (s.chapters || []).forEach(ch => {
    const li = document.createElement('li'); li.className = 'item';
    li.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><div><strong>${esc(ch.title)}</strong><div class="meta">${esc(ch.date)} • ${esc(ch.author)}</div></div><button class="btn" data-ch="${ch.id}">Open</button></div>`;
    li.querySelector('button').addEventListener('click', ()=> openChapter(id, ch.id));
    list.appendChild(li);
  });
  showPage('series');
}

/* Chapter view */
function openChapter(seriesId, chapterId){
  const s = (DATA.series || []).find(x=>x.id===seriesId); if(!s) return;
  const ch = (s.chapters || []).find(c=>c.id===chapterId); if(!ch) return;
  $('#chapterTitle').textContent = ch.title;
  $('#chapterMeta').textContent = `${ch.date} • ${ch.author}`;
  $('#chapterContent').innerHTML = ch.code || '<p>(No content)</p>';
  showPage('chapter');
}

/* Info & Suggestions */
function renderInfo(){ $('#infoText').innerHTML = DATA.about || ''; }
function renderSuggestions(){
  const wrap = $('#suggestionsList'); wrap.innerHTML = '';
  (DATA.suggestions || []).forEach(s => {
    const div = document.createElement('div'); div.className = 'saved-item';
    div.innerHTML = `<div style="font-weight:700">${esc(s.date)}</div><div>${esc(s.text)}</div>`;
    wrap.appendChild(div);
  });
}
$('#saveSuggestion').addEventListener('click', ()=>{
  const val = $('#suggestionInput').value.trim(); if(!val) return alert('Write something first');
  DATA.suggestions = DATA.suggestions || [];
  DATA.suggestions.unshift({ id: uid('sg'), text: val, date: new Date().toLocaleString() });
  save(); $('#suggestionInput').value = ''; renderSuggestions();
});

/* Refresh current view after data change */
function refreshCurrentView(){
  // re-render everything relevant without changing route
  renderHome();
  renderArchive();
  // if currently viewing a series or chapter, re-open them to refresh content
  if(currentSeriesId && (DATA.series || []).find(s=>s.id===currentSeriesId)) openSeries(currentSeriesId);
}

/* Init */
renderHome(); renderArchive(); renderSuggestions();

/* Wire hero buttons */
$$('.hero-actions [data-route]').forEach(b => b.addEventListener('click', e=>{
  const route = b.getAttribute('data-route'); routeTo(route);
}));
