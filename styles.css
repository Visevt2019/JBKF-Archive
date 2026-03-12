:root{
  --bg:#f9f5f5;
  --edge:rgba(0,0,0,0.06);
  --accent:#c62828;
  --muted:#6b6b6b;
  --card:#ffffff;
  --radius:12px;
  --maxw:1100px;
  --gap:14px;
  --ring-size:18px;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
}

/* Reset */
*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0;
  background:
    radial-gradient(900px 400px at 6% 10%, rgba(0,0,0,0.02), transparent 6%),
    radial-gradient(700px 350px at 94% 90%, rgba(0,0,0,0.02), transparent 6%),
    var(--bg);
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  color:#111;
  padding-bottom:40px;
}

/* Header */
.site-header{
  position:fixed;top:0;left:0;right:0;height:72px;
  display:flex;align-items:center;justify-content:space-between;padding:0 18px;
  background:linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85));
  border-bottom:1px solid var(--edge);z-index:60;backdrop-filter: blur(6px);
}
.brand{font-weight:900;font-size:18px}
.menu-btn{background:transparent;border:0;font-size:22px;padding:8px;cursor:pointer}

/* Side menu */
.side-menu{
  position:fixed;top:0;right:-360px;width:320px;height:100vh;background:linear-gradient(180deg,#fff,#fafafa);
  box-shadow:-18px 30px 60px rgba(0,0,0,0.08);transition:right .28s;z-index:70;padding:28px;display:flex;flex-direction:column;justify-content:flex-start;
}
.side-menu[aria-hidden="false"]{right:0}
.menu-close-top{position:absolute;right:12px;top:12px;border:0;background:transparent;font-size:20px;cursor:pointer}
.menu-list{list-style:none;padding:40px 0 0 0;margin:0}
.menu-list li{margin:18px 0}
.menu-list a{color:#111;text-decoration:none;font-weight:800;font-size:16px}
.menu-footer{margin-top:auto}

/* Container & pages */
.container{max-width:var(--maxw);margin:120px auto 40px;padding:0 18px}
.page{display:none}
.page.active{display:block}

/* Hero */
.hero{padding:36px;border-radius:var(--radius);background:linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9));border:1px solid var(--edge);text-align:center}
.hero-title{margin:0 0 18px;font-size:64px;line-height:1;letter-spacing:-1px}
@media (max-width:900px){ .hero-title{font-size:40px} }

/* Buttons and ring animation */
.hero-actions{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.btn{padding:12px 18px;border-radius:12px;border:1px solid var(--edge);background:transparent;cursor:pointer;font-weight:800}
.btn.primary{background:var(--accent);color:#fff;border-color:transparent}

/* Animated rainbow ring around Visit Archive */
.ring{
  position:relative;
  z-index:1;
}
.ring::before{
  content:"";
  position:absolute;
  inset:calc(-1 * var(--ring-size));
  border-radius:999px;
  padding:var(--ring-size);
  background: conic-gradient(from 0deg, #ff4d4d, #ffb84d, #ffd54d, #8cff4d, #4dd6ff, #7a4dff, #ff4db8, #ff4d4d);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - var(--ring-size)), black calc(100% - var(--ring-size)));
  mask: radial-gradient(farthest-side, transparent calc(100% - var(--ring-size)), black calc(100% - var(--ring-size)));
  opacity:0.0;
  transition:opacity .18s ease;
  animation:spin 3.6s linear infinite;
  pointer-events:none;
}
.ring:hover::before, .ring:focus::before{ opacity:0.9; }
@keyframes spin{ to{ transform:rotate(360deg); } }

/* Sections & cards */
.section{margin-top:28px}
.video-wrap{padding:12px}
.video-wrap video{width:100%;max-height:420px;border-radius:12px;background:#000;object-fit:cover}

/* Characters grid */
.characters-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:14px}
.char-card{background:#fff;border:1px solid var(--edge);border-radius:12px;padding:12px;display:flex;flex-direction:column;align-items:center;text-align:center}
.char-name{font-weight:900;margin-bottom:8px}
.char-img{width:160px;height:160px;background:#e9e6e6;border-radius:10px;object-fit:cover;margin-bottom:10px}
.char-desc{color:var(--muted);font-size:14px}
@media (max-width:900px){ .characters-grid{grid-template-columns:repeat(2,1fr)} .char-img{width:120px;height:120px} }

/* Archive grid */
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;margin-top:12px}
.card{background:var(--card);border-radius:12px;padding:14px;border:1px solid var(--edge)}

/* Lists */
.list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px}
.list .item{padding:12px;border-radius:10px;border:1px solid var(--edge);background:var(--card);cursor:pointer}
.meta{color:var(--muted);font-size:13px;margin-top:6px}

/* Page header & back */
.page-header{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.back{background:transparent;border:0;cursor:pointer;font-size:16px}

/* Responsive */
@media (max-width:700px){
  .container{margin-top:100px}
  .hero-title{font-size:36px}
  .characters-grid{grid-template-columns:repeat(1,1fr)}
  .side-menu{width:100%;right:-100%}
  .side-menu[aria-hidden="false"]{right:0}
}
