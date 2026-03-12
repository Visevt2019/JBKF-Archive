/* dev.js - minimal developer editor
   - Single storage key: 'jbkf_simple_v1'
   - Login -> select/add/remove series -> edit series (title,intro,image filename)
   - Chapters: add/remove/edit; chapter fields: title,date,author,code
   - Image filenames are repo-root filenames (e.g., "santa.jpeg")
*/

const STORAGE_KEY = 'jbkf_simple_v1';
const CRED_KEY = 'jbkf_dev_cred_simple';
const DEFAULT = {
  about: "Jingle Bells Kick Face",
  video: "",
  characters: [],
  series: [
    {
      id: 's1',
      title: 'Series One: Winter Riot',
      image: '',
      intro: 'The first series.',
      chapters: [
        { id: 's1-ch1', title: 'Chapter 1', date: '2026-03-01', author: 'Parin', code: '<p>Chapter content here</p>' }
      ]
    }
  ],
  suggestions: []
};

let DATA = loadData();
ensureCred();

/* helpers */
const $ = s => document.querySelector(s);
const uid = (p='id') => p + Date.now().toString(36).slice(-6);
function loadData(){ try{ const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT)); }catch(e){ return JSON.parse(JSON.stringify(DEFAULT)); } }
function saveData(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(DATA)); }
function ensureCred(){ if(!localStorage.getItem(CRED_KEY)) localStorage.setItem(CRED_KEY, JSON.stringify({u:'admin', p:'password'})); }

/* elements */
const loginCard = $('#loginCard'), editorCard = $('#editorCard');
const loginBtn = $('#loginBtn'), logoutBtn = $('#logoutBtn');
const seriesSelect = $('#seriesSelect'), addSeries = $('#addSeries'), removeSeries = $('#removeSeries');
const seriesTitle = $('#seriesTitle'), seriesIntro = $('#seriesIntro'), seriesImage = $('#seriesImage');
const chaptersList = $('#chaptersList'), addChapter = $('#addChapter');
const chapterForm = $('#chapterForm'), chapterTitle = $('#chapterTitle'), chapterDate = $('#chapterDate'), chapterAuthor = $('#chapterAuthor'), chapterCode = $('#chapterCode');
const saveChapter = $('#saveChapter'), cancelChapter = $('#cancelChapter'), saveSeries = $('#saveSeries');

let currentSeriesId = null;
let currentChapterId = null;

/* login */
loginBtn.addEventListener('click', ()=>{
  const u = $('#loginUser').value.trim(), p = $('#loginPass').value;
  const cred = JSON.parse(localStorage.getItem(CRED_KEY));
  if(u === cred.u && p === cred.p){
    loginCard.classList.add('hidden');
    editorCard.classList.remove('hidden');
    renderSeriesSelect();
    hideChapterEditor();
  } else alert('Invalid credentials');
});
logoutBtn.addEventListener('click', ()=>{
  editorCard.classList.add('hidden');
  loginCard.classList.remove('hidden');
  currentSeriesId = null; currentChapterId = null;
});

/* series select */
function renderSeriesSelect(){
  seriesSelect.innerHTML = '';
  DATA.series.forEach(s => {
    const opt = document.createElement('option'); opt.value = s.id; opt.textContent = s.title || s.id;
    seriesSelect.appendChild(opt);
  });
  if(!currentSeriesId && DATA.series.length) currentSeriesId = DATA.series[0].id;
  seriesSelect.value = currentSeriesId || (DATA.series[0] && DATA.series[0].id) || '';
  onSeriesChange();
}
seriesSelect.addEventListener('change', ()=> { currentSeriesId = seriesSelect.value; onSeriesChange(); });

function onSeriesChange(){
  currentChapterId = null;
  const s = DATA.series.find(x=>x.id === currentSeriesId);
  if(!s){ seriesTitle.value=''; seriesIntro.value=''; seriesImage.value=''; chaptersList.innerHTML=''; return; }
  seriesTitle.value = s.title || '';
  seriesIntro.value = s.intro || '';
  seriesImage.value = s.image || '';
  renderChaptersList(s);
  hideChapterEditor();
}

/* add/remove series */
addSeries.addEventListener('click', ()=>{
  const id = uid('s');
  const newS = { id, title: 'New Series', image: '', intro: '', chapters: [] };
  DATA.series.push(newS); saveData(); currentSeriesId = id; renderSeriesSelect(); onSeriesChange();
});
removeSeries.addEventListener('click', ()=>{
  if(!currentSeriesId) return alert('No series selected');
  if(!confirm('Delete selected series?')) return;
  DATA.series = DATA.series.filter(s => s.id !== currentSeriesId);
  saveData(); currentSeriesId = DATA.series[0] ? DATA.series[0].id : null; renderSeriesSelect(); onSeriesChange();
});

/* chapters list */
function renderChaptersList(series){
  chaptersList.innerHTML = '';
  if(!series.chapters || !series.chapters.length){ chaptersList.innerHTML = '<div class="hint">No chapters yet</div>'; return; }
  series.chapters.forEach(ch => {
    const div = document.createElement('div'); div.className = 'item';
    div.innerHTML = `<div style="flex:1"><strong>${ch.title}</strong><div class="meta">${ch.date} • ${ch.author}</div></div>
      <div style="display:flex;gap:8px">
        <button class="btn small edit-ch" data-id="${ch.id}">Edit</button>
        <button class="btn small del-ch" data-id="${ch.id}">Remove</button>
      </div>`;
    chaptersList.appendChild(div);
  });
  chaptersList.querySelectorAll('.edit-ch').forEach(b => b.addEventListener('click', e=> openChapterEditor(e.target.dataset.id)));
  chaptersList.querySelectorAll('.del-ch').forEach(b => b.addEventListener('click', e=>{
    const id = e.target.dataset.id;
    if(!confirm('Delete this chapter?')) return;
    const s = DATA.series.find(x=>x.id === currentSeriesId);
    s.chapters = s.chapters.filter(c => c.id !== id);
    saveData(); renderChaptersList(s);
  }));
}

/* add chapter */
addChapter.addEventListener('click', ()=>{
  if(!currentSeriesId) return alert('Select a series first');
  const s = DATA.series.find(x=>x.id === currentSeriesId);
  const chId = s.id + '-ch' + Date.now();
  const newCh = { id: chId, title: 'New Chapter', date: new Date().toISOString().slice(0,10), author: '', code: '' };
  s.chapters.push(newCh); saveData(); renderChaptersList(s); openChapterEditor(chId);
});

/* chapter editor */
function openChapterEditor(chId){
  const s = DATA.series.find(x=>x.id === currentSeriesId); if(!s) return;
  const ch = s.chapters.find(x=>x.id === chId); if(!ch) return;
  currentChapterId = chId;
  chapterTitle.value = ch.title || '';
  chapterDate.value = ch.date || '';
  chapterAuthor.value = ch.author || '';
  chapterCode.value = ch.code || '';
  showChapterEditor();
}
function showChapterEditor(){ chapterForm.style.display = 'block'; }
function hideChapterEditor(){ chapterForm.style.display = 'none'; currentChapterId = null; }

/* save chapter */
saveChapter.addEventListener('click', ()=>{
  if(!currentSeriesId || !currentChapterId) return alert('No chapter selected');
  const s = DATA.series.find(x=>x.id === currentSeriesId);
  const ch = s.chapters.find(x=>x.id === currentChapterId);
  if(!ch) return;
  ch.title = chapterTitle.value.trim();
  ch.date = chapterDate.value.trim();
  ch.author = chapterAuthor.value.trim();
  ch.code = chapterCode.value;
  saveData(); renderChaptersList(s); alert('Chapter saved');
});
cancelChapter.addEventListener('click', ()=> hideChapterEditor());

/* save series */
saveSeries.addEventListener('click', ()=>{
  if(!currentSeriesId) return alert('No series selected');
  const s = DATA.series.find(x=>x.id === currentSeriesId);
  s.title = seriesTitle.value.trim();
  s.intro = seriesIntro.value.trim();
  s.image = seriesImage.value.trim(); // filename only
  saveData(); renderSeriesSelect(); alert('Series saved');
});

/* init */
(function init(){
  if(!DATA.series) DATA.series = [];
  if(!DATA.series.length) { DATA.series = DEFAULT.series; saveData(); }
  currentSeriesId = DATA.series[0] ? DATA.series[0].id : null;
})();
