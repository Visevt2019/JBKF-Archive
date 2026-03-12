/* app.js
   - Single storage key: 'jbkf_simple_v1'
   - Menu auto-closes after any navigation click (mobile fix)
   - Latest updates route fixed
   - Renders chapter.code as HTML
   - Characters: 6 dummy frames included in HTML; you can replace images by uploading files to repo root and editing via dev.html
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

/* Menu and routing */
const pages = $$('.page');
function showPage(id){
  pages.forEach(p => p.id === id ? p.classList.add('active') : p.classList.remove('active'));
  closeMenu();
  window.scrollTo({top:0,behavior:'smooth'});
}
const menuBtn = $('#menuBtn'), sideMenu = $('#sideMenu'), menuCloseTop = $('#menuCloseTop');
menuBtn.addEventListener('click', ()=> sideMenu.setAttribute('aria-hidden', sideMenu.getAttribute('aria-hidden') === 'false' ? 'true' : 'false'));
menuCloseTop.addEventListener('click', ()=> sideMenu.setAttribute('aria-hidden','true'));
document.addEventListener('click', (e)=> { if(!sideMenu.contains(e.target) && !menuBtn.contains(e.target)) sideMenu.setAttribute('aria-hidden','true'); });

function closeMenu(){ sideMenu.setAttribute('aria-hidden','true'); }

/* Menu links: auto-close after click */
$$('[data-route]').forEach(el => el.addEventListener('click', e => {
  e.preventDefault();
  const route = el.getAttribute('data-route');
  routeTo(route);
  closeMenu(); // ensure menu closes after every press
}));

/* Visit Archive button ring should also close menu on mobile */
$('#visitArchiveBtn').addEventListener('click', (e)=>{
  const route = e.target.getAttribute('data-route');
  routeTo(route);
  closeMenu();
});

function routeTo(route){
  if(route === 'archive'){ renderArchive(); showPage('archive'); }
  else if(route === 'info'){ renderInfo(); showPage('info'); }
  else if(route === 'latest'){ renderLatest(); showPage('latest'); }
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
}
function scrollToChars(){ const el = $('#charactersPreview'); if(el) el.scrollIntoView({behavior:'smooth'}); }

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

/* Latest */
function renderLatest(){
  const wrap = $('#latestList');
  wrap.innerHTML = '';
  const items = [];
  (DATA.series || []).forEach(s => {
    (s.chapters || []).forEach(ch => {
      items.push({ seriesTitle: s.title, seriesId: s.id, chapter: ch });
    });
  });
  items.sort((a,b)=> (b.chapter.date || '').localeCompare(a.chapter.date || ''));
  if(!items.length){ wrap.innerHTML = '<p class="meta">No updates yet.</p>'; return; }
  items.slice(0,8).forEach(it => {
    const div = document.createElement('div'); div.className = 'card';
    div.innerHTML = `<strong>${esc(it.chapter.title)}</strong><div class="meta">${esc(it.chapter.date)} • ${esc(it.chapter.author)} — ${esc(it.seriesTitle)}</div>`;
    div.addEventListener('click', ()=> openChapter(it.seriesId, it.chapter.id));
    wrap.appendChild(div);
  });
}

/* Series view */
let currentSeriesId = null;
function openSeries(id){
  const s = (DATA.series || []).find(x=>x.id===id); if(!s) return;
  currentSeriesId = id;
  $('#seriesTitle').textContent = s.title;
  $('#seriesIntro').innerHTML = `<div style="display:flex;gap:12px;align-items:flex-start"><img src="${s.image ? './' + s.image : placeholder(300,160)}" style="width:220px;height:120px;object-fit:cover;border-radius:10px"><div><p>${esc(s.intro)}</p></div></div>`;
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

/* Info & init */
function renderInfo(){ $('#infoText').innerHTML = DATA.about || ''; }
function refreshCurrentView(){ renderHome(); renderArchive(); renderLatest(); if(currentSeriesId) openSeries(currentSeriesId); }
renderHome(); renderArchive(); renderLatest();

/* Wire hero buttons */
$$('.hero-actions [data-route]').forEach(b => b.addEventListener('click', e=>{
  const route = b.getAttribute('data-route'); routeTo(route); closeMenu();
}));
