/* dev.js - robust, defensive version
   - Loads data.json (best-effort)
   - Shows editor even if load fails and prints errors to console + on-page message
   - Commits via GitHub API (prompts for token)
*/

const owner = "Visevt2019";   // update if needed
const repo = "JBKF-Archive";  // update if needed
const branch = "main";

let DATA = { about: "JBKF", video: "", characters: [], series: [] };
let currentSeriesId = null;
let currentChapterId = null;

const $ = s => document.querySelector(s);
function uid(prefix='id'){ return prefix + Date.now().toString(36).slice(-6); }

async function loadData(){
  try {
    const res = await fetch("data.json", { cache: "no-store" });
    if(!res.ok) throw new Error("HTTP " + res.status);
    const json = await res.json();
    DATA = json;
    console.log("data.json loaded", DATA);
  } catch(err){
    console.error("Failed to load data.json:", err);
    showError("Warning: could not load data.json. Editor will still work but commits may create/overwrite data.json.");
    // keep default DATA so editor still functions
  }
}

function showError(msg){
  let el = $('#devError');
  if(!el){
    el = document.createElement('div');
    el.id = 'devError';
    el.style.background = '#fff3cd';
    el.style.border = '1px solid #ffeeba';
    el.style.padding = '10px';
    el.style.margin = '10px 0';
    el.style.borderRadius = '6px';
    const container = document.body;
    container.insertBefore(el, container.firstChild);
  }
  el.textContent = msg;
}

/* Commit DATA to GitHub */
async function commitData(message){
  const token = prompt("Paste a GitHub Personal Access Token with repo write access. It will not be stored.");
  if(!token){ alert("No token provided. Commit cancelled."); return; }

  // get current SHA if exists
  let sha = null;
  try {
    const metaRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data.json?ref=${branch}`, {
      headers: { Authorization: `token ${token}` }
    });
    if(metaRes.ok){
      const meta = await metaRes.json();
      sha = meta.sha;
    }
  } catch(e){
    console.warn("Could not fetch file metadata:", e);
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/data.json`;
  const body = {
    message: message || "Update data.json via dev page",
    content: btoa(unescape(encodeURIComponent(JSON.stringify(DATA, null, 2)))),
    branch
  };
  if(sha) body.sha = sha;

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    if(!res.ok){
      const txt = await res.text();
      throw new Error(res.status + " " + txt);
    }
    alert("Commit successful.");
  } catch(err){
    console.error("Commit failed:", err);
    alert("Commit failed: " + err.message);
  }
}

/* UI helpers */
function renderSeriesSelect(){
  const sel = $('#seriesSelect');
  if(!sel) return;
  sel.innerHTML = '';
  (DATA.series || []).forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.title || s.id;
    sel.appendChild(opt);
  });
  currentSeriesId = sel.value || (DATA.series[0] && DATA.series[0].id) || null;
  sel.value = currentSeriesId || '';
  onSeriesChange();
}
function onSeriesChange(){
  currentChapterId = null;
  const s = (DATA.series || []).find(x=>x.id === currentSeriesId);
  if(!s){
    if($('#seriesTitle')) $('#seriesTitle').value = '';
    if($('#seriesIntro')) $('#seriesIntro').value = '';
    if($('#seriesImage')) $('#seriesImage').value = '';
    if($('#chaptersList')) $('#chaptersList').innerHTML = '';
    return;
  }
  if($('#seriesTitle')) $('#seriesTitle').value = s.title || '';
  if($('#seriesIntro')) $('#seriesIntro').value = s.intro || '';
  if($('#seriesImage')) $('#seriesImage').value = s.image || '';
  renderChaptersList(s);
  hideChapterEditor();
}
function renderChaptersList(series){
  const list = $('#chaptersList');
  if(!list) return;
  list.innerHTML = '';
  if(!series.chapters || !series.chapters.length){
    list.innerHTML = '<div class="hint">No chapters yet</div>';
    return;
  }
  series.chapters.forEach(ch => {
    const div = document.createElement('div'); div.className = 'item';
    div.innerHTML = `<div style="flex:1"><strong>${ch.title}</strong><div class="meta">${ch.date} • ${ch.author}</div></div>
      <div style="display:flex;gap:8px">
        <button class="btn small edit-ch" data-id="${ch.id}">Edit</button>
        <button class="btn small del-ch" data-id="${ch.id}">Remove</button>
      </div>`;
    list.appendChild(div);
  });
  list.querySelectorAll('.edit-ch').forEach(b => b.addEventListener('click', e=> openChapterEditor(e.target.dataset.id)));
  list.querySelectorAll('.del-ch').forEach(b => b.addEventListener('click', e=>{
    const id = e.target.dataset.id;
    if(!confirm('Delete this chapter?')) return;
    const s = (DATA.series || []).find(x=>x.id === currentSeriesId);
    s.chapters = (s.chapters || []).filter(c => c.id !== id);
    renderChaptersList(s);
  }));
}
function openChapterEditor(chId){
  const s = (DATA.series || []).find(x=>x.id === currentSeriesId); if(!s) return;
  const ch = (s.chapters || []).find(x=>x.id === chId); if(!ch) return;
  currentChapterId = chId;
  if($('#chapterTitle')) $('#chapterTitle').value = ch.title || '';
  if($('#chapterDate')) $('#chapterDate').value = ch.date || '';
  if($('#chapterAuthor')) $('#chapterAuthor').value = ch.author || '';
  if($('#chapterCode')) $('#chapterCode').value = ch.code || '';
  if($('#chapterForm')) $('#chapterForm').style.display = '';
}
function hideChapterEditor(){ if($('#chapterForm')) $('#chapterForm').style.display = 'none'; currentChapterId = null; }

/* Event wiring (defensive: check elements exist) */
function wireEvents(){
  const loginBtn = $('#loginBtn');
  if(loginBtn) loginBtn.addEventListener('click', async ()=>{
    try {
      await loadData();
    } catch(e){
      console.error("loadData error:", e);
    }
    // Always show editor to avoid blank screen
    if($('#loginCard')) $('#loginCard').style.display = 'none';
    if($('#editorCard')) $('#editorCard').style.display = '';
    try { renderSeriesSelect(); } catch(e){ console.error(e); }
  });

  const sel = $('#seriesSelect');
  if(sel) sel.addEventListener('change', ()=> { currentSeriesId = sel.value; onSeriesChange(); });

  const addSeries = $('#addSeries');
  if(addSeries) addSeries.addEventListener('click', ()=>{
    const id = uid('s');
    const newS = { id, title: 'New Series', image: '', intro: '', chapters: [] };
    DATA.series = DATA.series || [];
    DATA.series.push(newS);
    renderSeriesSelect();
    $('#seriesSelect').value = id;
    currentSeriesId = id;
    onSeriesChange();
  });

  const removeSeries = $('#removeSeries');
  if(removeSeries) removeSeries.addEventListener('click', ()=>{
    if(!currentSeriesId) return alert('No series selected');
    if(!confirm('Delete selected series?')) return;
    DATA.series = (DATA.series || []).filter(s => s.id !== currentSeriesId);
    renderSeriesSelect();
  });

  const addChapter = $('#addChapter');
  if(addChapter) addChapter.addEventListener('click', ()=>{
    if(!currentSeriesId) return alert('Select a series first');
    const s = (DATA.series || []).find(x=>x.id === currentSeriesId);
    const chId = s.id + '-ch' + Date.now().toString(36);
    const newCh = { id: chId, title: 'New Chapter', date: new Date().toISOString().slice(0,10), author: '', code: '' };
    s.chapters = s.chapters || [];
    s.chapters.push(newCh);
    renderChaptersList(s);
    openChapterEditor(chId);
  });

  const saveChapter = $('#saveChapter');
  if(saveChapter) saveChapter.addEventListener('click', async ()=>{
    if(!currentSeriesId || !currentChapterId) return alert('No chapter selected');
    const s = (DATA.series || []).find(x=>x.id === currentSeriesId);
    const ch = (s.chapters || []).find(x=>x.id === currentChapterId);
    if(!ch) return;
    ch.title = ($('#chapterTitle') && $('#chapterTitle').value.trim()) || ch.title;
    ch.date = ($('#chapterDate') && $('#chapterDate').value.trim()) || ch.date;
    ch.author = ($('#chapterAuthor') && $('#chapterAuthor').value.trim()) || ch.author;
    ch.code = ($('#chapterCode') && $('#chapterCode').value) || ch.code;
    renderChaptersList(s);
    try { await commitData(`Update chapter ${ch.id}`); } catch(e){ console.error(e); }
  });

  const cancelChapter = $('#cancelChapter');
  if(cancelChapter) cancelChapter.addEventListener('click', ()=> hideChapterEditor());

  const saveSeries = $('#saveSeries');
  if(saveSeries) saveSeries.addEventListener('click', async ()=>{
    if(!currentSeriesId) return alert('No series selected');
    const s = (DATA.series || []).find(x=>x.id === currentSeriesId);
    s.title = ($('#seriesTitle') && $('#seriesTitle').value.trim()) || s.title;
    s.intro = ($('#seriesIntro') && $('#seriesIntro').value.trim()) || s.intro;
    s.image = ($('#seriesImage') && $('#seriesImage').value.trim()) || s.image;
    renderSeriesSelect();
    try { await commitData(`Update series ${s.id}`); } catch(e){ console.error(e); }
  });
}

/* Init */
(async function init(){
  try {
    // pre-load data so login is faster; ignore errors
    await loadData();
  } catch(e){
    console.warn("Initial loadData failed:", e);
  }
  wireEvents();
})();
