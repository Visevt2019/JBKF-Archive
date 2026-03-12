:root{
  --bg:#f9f5f5;
  --edge:rgba(0,0,0,0.06);
  --accent:#c62828;
  --muted:#6b6b6b;
  --card:#ffffff;
  --radius:12px;
  --maxw:1100px;
  --gap:14px;
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
  position:fixed;top:0;left:0;right:0;height:64px;
  display:flex;align-items:center;justify-content:space-between;padding:0 16px;
  background:linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85));
  border-bottom:1px solid var(--edge);z-index:40;backdrop-filter: blur(6px);
}
.brand{font-weight:800}
.menu-btn{background:transparent;border:0;font-size:20px;padding:8px;cursor:pointer}

/* Side menu */
.side-menu{
  position:fixed;top:0;right:-340px;width:320px;height:100vh;background:linear-gradient(180deg,#fff,#fafafa);
  box-shadow:-18px 30px 60px rgba(0,0,0,0.08);transition:right .28s;z-index:50;padding:28px;display:flex;flex-direction:column;justify-content:space-between;
}
.side-menu[aria-hidden="false"]{right:0}
.menu-list{list-style:none;padding:0;margin:0}
.menu-list li{margin:14px 0}
.menu-list a{color:#111;text-decoration:none;font-weight:700;font-size:16px}
.menu-footer{display:flex;justify-content:space-between;align-items:center}
.close-menu{background:transparent;border:0;font-size:18px;cursor:pointer}

/* Container & pages */
.container{max-width:var(--maxw);margin:90px auto 40px;padding:0 16px}
.page{display:none}
.page.active{display:block}

/* Cards & hero */
.card{background:var(--card);border-radius:var(--radius);padding:16px;border:1px solid var(--edge)}
.hero{padding:22px;text-align:center}
.hero h1{margin:0 0 12px;font-size:24px}
.hero-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.btn{padding:10px 14px;border-radius:10px;border:1px solid var(--edge);background:transparent;cursor:pointer;font-weight:700}
.btn.primary{background:var(--accent);color:#fff;border-color:transparent}

/* Sections */
.section{margin-top:20px}
.cards{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px}
.card img{width:100%;border-radius:10px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:12px}
.list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px}
.list .item{padding:12px;border-radius:10px;border:1px solid var(--edge);background:var(--card);cursor:pointer}
.meta{color:var(--muted);font-size:13px;margin-top:6px}

/* Video */
.video-wrap video{width:100%;max-height:320px;border-radius:10px;background:#000;object-fit:cover}

/* Page header & back */
.page-header{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.back{background:transparent;border:0;cursor:pointer;font-size:16px}

/* Saved suggestions */
.saved .saved-item{padding:8px;border-radius:8px;border:1px solid var(--edge);background:var(--card);margin-top:8px}

/* Responsive */
@media (max-width:700px){
  .container{margin-top:84px}
  .hero h1{font-size:20px}
  .grid{grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}
  .side-menu{width:100%;right:-100%}
  .side-menu[aria-hidden="false"]{right:0}
}
