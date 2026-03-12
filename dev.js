/* dev.js
   - Minimal developer editor that edits data.json in the repo
   - Prompts for a GitHub Personal Access Token at commit time (not stored)
   - Matches the structure of dev.html
*/

const owner = "Visevt2019";   // replace with your GitHub username/org
const repo = "JBKF-Archive";  // replace with your repo name
const branch = "main";        // change if your default branch differs

let DATA = null;
let currentSeriesId = null;
let currentChapterId = null;

const $ = s => document.querySelector(s);

/* Utility */
function uid(prefix='id'){ return prefix + Date.now().toString(36).slice(-6); }
function setHidden(sel, hidden){ const el = $(sel); if(!el) return; el.style.display = hidden ? 'none' : ''; }

/* Load data.json from repo (raw) */
async function loadData(){
  try {
    const res = await fetch("data.json", { cache: "no-store" });
    if(!res.ok) throw new Error("Failed to load data.json");
    DATA = await res.json();
  } catch(e){
    console.error(e);
    DATA = { about: "JBKF", video: "", characters: [], series: [] };
  }
}

/* Commit DATA to GitHub by updating data.json (requires token) */
async function commitData(message){
  const token = prompt("Paste a GitHub Personal Access Token with repo contents write access. It will not be stored.");
  if(!token) { alert("No token provided. Commit cancelled."); return; }

  // Get current file SHA (if exists)
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
    // ignore, sha stays null (create file)
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/data.json`;
  const body = {
    message: message || "Update data.json via dev page",
    content: btoa(unescape(encodeURIComponent(JSON.stringify(DATA, null, 2)))),
    branch
  };
  if(sha) body.sha = sha;

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
    alert("Commit failed: " + res.status + " — " + txt);
    throw new Error("Commit failed");
  }

  alert("Commit successful. The site will reflect changes once GitHub Pages/Actions update.");
}

/* UI wiring and editor logic */
async function onLogin(){
  await loadData();
  $('#loginCard').style.display = 'none';
  $('#editorCard').style.display = '';
  renderSeriesSelect();
  hideChapterEditor();
}

$('#loginBtn').addEventListener('click', onLogin);

/* Series select and controls */
function renderSeriesSelect(){
  const sel = $('#seriesSelect');
  sel.innerHTML = '';
  (DATA.series || []).forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.title || s.id;
    sel.appendChild(opt);
  });
  currentSeriesId = sel.value || (DATA.series[0] && DATA.series[0].id) || null;
  sel.value = currentSeriesId;
  onSeriesChange();
}
$('#seriesSelect').addEventListener('change', ()=> { currentSeriesId = $('#seriesSelect').value; onSeriesChange(); });

function onSeriesChange(){
  currentChapterId = null;
  const s = (DATA.series || []).find(x=>x.id === currentSeriesId);
  if(!s){
    $('#seriesTitle').value = '';
    $('#seriesIntro').value = '';
    $('#seriesImage').value = '';
    $('#chaptersList').innerHTML = '';
    return;
  }
  $('#seriesTitle').value = s.title || '';
  $('#seriesIntro').value = s.intro || '';
  $('#seriesImage').value = s.image || '';
  renderChaptersList(s);
  hideChapterEditor();
}

/* Add / remove series */
$('#addSeries').addEventListener('click', ()=>{
  const id = uid('s');
  const newS = { id, title: 'New Series', image: '', intro: '', chapters: [] };
  DATA.series = DATA.series || [];
  DATA.series.push(newS);
  renderSeriesSelect();
  $('#seriesSelect').value = id;
  currentSeriesId = id;
  onSeriesChange();
});
$('#removeSeries').addEventListener('click', ()=>{
  if(!currentSeriesId) return alert('No series selected');
  if(!confirm('Delete selected series?')) return;
  DATA.series = (DATA.series || []).filter(s => s.id !== currentSeriesId);
  renderSeriesSelect();
});

/* Chapters list */
function renderChaptersList(series){
  const list = $('#chaptersList');
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

/* Add chapter */
$('#addChapter').addEventListener('click', ()=>{
  if(!currentSeriesId) return alert('Select a series first');
  const s = (DATA.series || []).find(x=>x.id === currentSeriesId);
  const chId = s.id + '-ch' + Date.now().toString(36);
  const newCh = { id: chId, title: 'New Chapter', date: new Date().toISOString().slice(0,10), author: '', code: '' };
  s.chapters = s.chapters || [];
  s.chapters.push(newCh);
  renderChaptersList(s);
  openChapterEditor(chId);
});

/* Chapter editor */
function openChapterEditor(chId){
  const s = (DATA.series || []).find(x=>x.id === currentSeriesId); if(!s) return;
  const ch = (s.chapters || []).find(x=>x.id === chId); if(!ch) return;
  currentChapterId = chId;
  $('#chapterTitle').value = ch.title || '';
  $('#chapterDate').value = ch.date || '';
  $('#chapterAuthor').value = ch.author || '';
  $('#chapterCode').value = ch.code || '';
  $('#chapterForm').style.display = '';
}
$('#cancelChapter').addEventListener('click', ()=> { $('#chapterForm').style.display = 'none'; currentChapterId = null; });

$('#saveChapter').addEventListener('click', async ()=>{
  if(!currentSeriesId || !currentChapterId) return alert('No chapter selected');
  const s = (DATA.series || []).find(x=>x.id === currentSeriesId);
  const ch = (s.chapters || []).find(x=>x.id === currentChapterId);
  if(!ch) return;
  ch.title = $('#chapterTitle').value.trim();
  ch.date = $('#chapterDate').value.trim();
  ch.author = $('#chapterAuthor').value.trim();
  ch.code = $('#chapterCode').value;
  renderChaptersList(s);
  try {
    await commitData(`Update chapter ${ch.id}`);
  } catch(e){
    console.error(e);
  }
});

/* Save series */
$('#saveSeries').addEventListener('click', async ()=>{
  if(!currentSeriesId) return alert('No series selected');
  const s = (DATA.series || []).find(x=>x.id === currentSeriesId);
  s.title = $('#seriesTitle').value.trim();
  s.intro = $('#seriesIntro').value.trim();
  s.image = $('#seriesImage').value.trim();
  renderSeriesSelect();
  try {
    await commitData(`Update series ${s.id}`);
  } catch(e){
    console.error(e);
  }
});

/* Init */
(async function init(){
  // load data so the login can show editor after pressing login
  await loadData();
  // keep login visible until user presses login
})();
