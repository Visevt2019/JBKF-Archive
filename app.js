/* app.js
   - Loads data.json from repo (no localStorage)
   - Menu auto-closes after any navigation click (mobile fix)
   - Renders archive, latest, series, chapter pages
   - Renders chapter.code as HTML
*/

let DATA = null;
let currentSeriesId = null;

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
function esc(s){ return s ? String(s) : ''; }
function placeholder(w=600,h=320){
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><rect width='100%' height='100%' fill='#e9e6e6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#bdbdbd' font-family='Arial' font-size='20'>No image</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/* Load data.json */
async function loadData(){
  try {
    const res = await fetch("data.json", { cache: "no-store" });
    if(!res.ok) throw new Error("Failed to load data.json");
    DATA = await res.json();
  } catch(e){
    console.error(e);
    DATA = { about: "Error loading data", video: "", characters: [], series: [] };
  }
}

/* Menu and routing */
const pages = $$('.page');
function showPage(id){
  pages.forEach(p => p.id === id ? p.classList.add('active') : p.classList.remove('active'));
  closeMenu();
  window.scrollTo({top:0,behavior:'smooth'});
}
const menuBtn = $('#menuBtn'), sideMenu = $('#sideMenu'), menuCloseTop = $('#menuCloseTop');
if(menuBtn) menuBtn.addEventListener('click', ()=> sideMenu.setAttribute('aria-hidden', sideMenu.getAttribute('aria-hidden') === 'false' ? 'true' : 'false'));
if(menuCloseTop) menuCloseTop.addEventListener('click', ()=> sideMenu.setAttribute('aria-hidden','true'));
document.addEventListener('click', (e)=> {
  if(sideMenu && !sideMenu.contains(e.target) && !menuBtn.contains(e.target)) sideMenu.setAttribute('aria-hidden','true');
});
function closeMenu(){ if(sideMenu) sideMenu.setAttribute('aria-hidden','true'); }

/* Menu links: auto-close after click */
$$('[data-route]').forEach(el => el.addEventListener('click', e => {
  e.preventDefault();
  const route = el.getAttribute('data-route');
  routeTo(route);
  closeMenu();
}));
const visitArchiveBtn = $('#visitArchiveBtn');
if(visitArchiveBtn) visitArchiveBtn.addEventListener('click', (e)=>{
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
$$('[data-back]').forEach(b => b.addEventListener('click', ()=>{
  if($('#chapter') && $('#chapter').classList.contains('active')) showPage('series');
  else if($('#series') && $('#series').classList.contains('active')) showPage('archive');
  else showPage('home');
}));

/* Home render */
function renderHome(){
  if(!DATA) return;
  $('#aboutText').innerHTML = DATA.about || '';
  const vidSrc = DATA.video ? `./${DATA.video}` : '';
  const source = $('#charactersVideo source');
  if(source) source.src = vidSrc;
  const video = $('#charactersVideo');
  if(video) video.load();

  // If characters array exists, try to populate images and names
  const grid = $('#charactersGrid');
  if(grid && DATA.characters && DATA.characters.length){
    grid.innerHTML = '';
    DATA.characters.slice(0,6).forEach((c, i) => {
      const div = document.createElement('div');
      div.className = 'char-card';
      div.innerHTML = `
        <div class="char-name">${esc(c.name || `Character ${i+1}`)}</div>
        <img class="char-img" src="${c.image ? './' + c.image : ''}" alt="${esc(c.name || '')}">
        <div class="char-desc">${esc(c.desc || '')}</div>
      `;
      grid.appendChild(div);
    });
  }
}

/* Archive */
function renderArchive(){
  if(!DATA) return;
  const grid = $('#seriesGrid'); if(!grid) return;
  grid.innerHTML = '';
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
  if(!DATA) return;
  const wrap = $('#latestList'); if(!wrap) return;
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
function openSeries(id){
  if(!DATA) return;
  const s = (DATA.series || []).find(x=>x.id===id); if(!s) return;
  currentSeriesId = id;
  const titleEl = $('#seriesTitle'); if(titleEl) titleEl.textContent = s.title;
  const introEl = $('#seriesIntro');
  if(introEl) introEl.innerHTML = `<div style="display:flex;gap:12px;align-items:flex-start"><img src="${s.image ? './' + s.image : placeholder(300,160)}" style="width:220px;height:120px;object-fit:cover;border-radius:10px;margin-right:12px"><div><p>${esc(s.intro)}</p></div></div>`;
  const list = $('#chaptersList'); if(!list) return;
  list.innerHTML = '';
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
  if(!DATA) return;
  const s = (DATA.series || []).find(x=>x.id===seriesId); if(!s) return;
  const ch = (s.chapters || []).find(c=>c.id===chapterId); if(!ch) return;
  const title = $('#chapterTitle'); if(title) title.textContent = ch.title;
  const meta = $('#chapterMeta'); if(meta) meta.textContent = `${ch.date || ''} • ${ch.author || ''}`;
  const content = $('#chapterContent'); if(content) content.innerHTML = ch.code || '<p>(No content)</p>';
  showPage('chapter');
}

/* Info */
function renderInfo(){ if(!DATA) return; const el = $('#infoText'); if(el) el.innerHTML = DATA.about || ''; }

/* Init */
async function init(){
  await loadData();
  renderHome();
  renderArchive();
  renderLatest();
  // Wire hero buttons (in case they exist)
  $$('.hero-actions [data-route]').forEach(b => b.addEventListener('click', e=>{
    const route = b.getAttribute('data-route'); routeTo(route); closeMenu();
  }));
}
init();
