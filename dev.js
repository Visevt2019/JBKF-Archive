const owner="Visevt2019"
const repo="JBKF-Archive"
const branch="main"

let DATA=null
let currentSeries=null
let currentChapter=null

const $=id=>document.getElementById(id)

function showError(msg){
const box=$("errorBox")
box.style.display="block"
box.innerText=msg
}

async function loadData(){

try{

const res=await fetch("data.json?t="+Date.now())

if(!res.ok) throw new Error("Cannot load data.json")

DATA=await res.json()

console.log("DATA LOADED",DATA)

}
catch(err){

showError("Failed loading data.json")
console.error(err)

DATA={series:[]}

}

}


function renderSeries(){

const sel=$("seriesSelect")

sel.innerHTML=""

DATA.series.forEach(s=>{

const opt=document.createElement("option")
opt.value=s.id
opt.textContent=s.title

sel.appendChild(opt)

})

if(DATA.series.length>0){

currentSeries=DATA.series[0].id
sel.value=currentSeries
loadSeries()

}

}


function loadSeries(){

const s=DATA.series.find(x=>x.id===currentSeries)

if(!s)return

$("seriesTitle").value=s.title
$("seriesIntro").value=s.intro
$("seriesImage").value=s.image

renderChapters()

}


function renderChapters(){

const box=$("chaptersList")
box.innerHTML=""

const s=DATA.series.find(x=>x.id===currentSeries)

if(!s.chapters)return

s.chapters.forEach(ch=>{

const div=document.createElement("div")
div.className="item"

div.innerHTML=`
<div>
<b>${ch.title}</b><br>
${ch.date} • ${ch.author}
</div>

<div>
<button onclick="editChapter('${ch.id}')">Edit</button>
<button onclick="deleteChapter('${ch.id}')">Delete</button>
</div>
`

box.appendChild(div)

})

}


function editChapter(id){

const s=DATA.series.find(x=>x.id===currentSeries)
const ch=s.chapters.find(x=>x.id===id)

currentChapter=id

$("chapterEditor").classList.remove("hidden")

$("chapterTitle").value=ch.title
$("chapterDate").value=ch.date
$("chapterAuthor").value=ch.author
$("chapterCode").value=ch.code

}


function deleteChapter(id){

if(!confirm("Delete chapter?"))return

const s=DATA.series.find(x=>x.id===currentSeries)

s.chapters=s.chapters.filter(c=>c.id!==id)

renderChapters()

}


async function commitData(msg){

const token=prompt("GitHub token")

if(!token)return

let sha=null

try{

const meta=await fetch(
`https://api.github.com/repos/${owner}/${repo}/contents/data.json`,
{headers:{Authorization:`token ${token}`}}
)

if(meta.ok){

const json=await meta.json()
sha=json.sha

}

}catch{}

const body={
message:msg,
content:btoa(JSON.stringify(DATA,null,2)),
branch
}

if(sha)body.sha=sha

const res=await fetch(
`https://api.github.com/repos/${owner}/${repo}/contents/data.json`,
{
method:"PUT",
headers:{
Authorization:`token ${token}`,
"Content-Type":"application/json"
},
body:JSON.stringify(body)
}
)

if(!res.ok){

showError("GitHub commit failed")

return

}

alert("Saved to GitHub")

}


window.onload=()=>{

$("loginBtn").onclick=async()=>{

await loadData()

$("loginCard").classList.add("hidden")
$("editorCard").classList.remove("hidden")

renderSeries()

}

$("seriesSelect").onchange=e=>{

currentSeries=e.target.value
loadSeries()

}

$("addSeries").onclick=()=>{

const id="s"+Date.now()

DATA.series.push({
id,
title:"New Series",
intro:"",
image:"",
chapters:[]
})

renderSeries()

}

$("saveSeries").onclick=()=>{

const s=DATA.series.find(x=>x.id===currentSeries)

s.title=$("seriesTitle").value
s.intro=$("seriesIntro").value
s.image=$("seriesImage").value

commitData("Update series")

}

$("addChapter").onclick=()=>{

const s=DATA.series.find(x=>x.id===currentSeries)

const id="ch"+Date.now()

const ch={
id,
title:"New Chapter",
date:new Date().toISOString().slice(0,10),
author:"",
code:""
}

s.chapters.push(ch)

renderChapters()

}

$("saveChapter").onclick=()=>{

const s=DATA.series.find(x=>x.id===currentSeries)
const ch=s.chapters.find(c=>c.id===currentChapter)

ch.title=$("chapterTitle").value
ch.date=$("chapterDate").value
ch.author=$("chapterAuthor").value
ch.code=$("chapterCode").value

$("chapterEditor").classList.add("hidden")

renderChapters()

commitData("Update chapter")

}

$("cancelChapter").onclick=()=>{

$("chapterEditor").classList.add("hidden")

}

}
