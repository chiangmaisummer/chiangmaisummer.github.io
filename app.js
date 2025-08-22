(function () {
  // ====== 导航开关、语言切换、高亮当前页（保留你现有逻辑） ======
  const btn = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav-links');
  const langEn = document.getElementById('lang-en');
  const langZh = document.getElementById('lang-zh');

  if (btn && nav) {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
    });
    nav?.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if (nav.classList.contains('open')) {
          nav.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  const path = window.location.pathname;
  let file = path.split('/').pop() || 'index.html';
  const baseFile = file.replace('-zh', '');

  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const hrefBase = href.replace('-zh', '');
    if (hrefBase === baseFile) a.classList.add('active');
  });

  const isZh = file.endsWith('-zh.html');
  if (langEn && langZh) {
    langEn.href = baseFile;
    langZh.href = baseFile.replace('.html', '-zh.html');
    (isZh ? langZh : langEn).classList.add('active');
  }

  // ====== 复制逻辑（含“复制全部”与 ✓ 状态、toast） ======
  const toast = createToast();

  document.querySelectorAll('[data-copy]').forEach(el => {
    el.addEventListener('click', async (e) => {
      e.preventDefault();
      const text = el.getAttribute('data-copy') || '';
      const okMsg = el.getAttribute('data-toast') || (isZh ? '已复制' : 'Copied!');
      const original = el.textContent;
      try { await copyText(text); } catch {}
      feedback(el, okMsg, original);
    });
  });

  document.querySelectorAll('[data-copy-all]').forEach(el => {
    el.addEventListener('click', async (e) => {
      e.preventDefault();
      const en  = document.querySelector('[data-copy][data-kind="en"]') ?.getAttribute('data-copy') || '';
      const th  = document.querySelector('[data-copy][data-kind="th"]') ?.getAttribute('data-copy') || '';
      const gps = document.querySelector('[data-copy][data-kind="gps"]')?.getAttribute('data-copy') || '';
      const text = [en, th, gps].filter(Boolean).join('\n');
      const okMsg = el.getAttribute('data-toast') || (isZh ? '已复制全部' : 'Copied all!');
      const original = el.textContent;
      try { await copyText(text); } catch {}
      feedback(el, okMsg, original);
    });
  });

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta);
      ta.select(); document.execCommand('copy');
      document.body.removeChild(ta);
    }
  }
  function feedback(button, toastMsg, originalLabel) {
    showToast(toastMsg);
    button.classList.add('copied');
    button.textContent = (isZh ? '✓ 已复制' : '✓ Copied');
    clearTimeout(button._timer);
    button._timer = setTimeout(() => {
      button.classList.remove('copied');
      button.textContent = originalLabel;
    }, 1600);
  }
  function createToast() {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    return t;
  }
  let toastTimer = null;
  function showToast(msg) {
    const node = document.querySelector('.toast') || createToast();
    node.textContent = msg;
    node.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove('show'), 1600);
  }

  // ====== 本地化地图按钮（Apple/Baidu） ======
  const LAT = 18.784389, LNG = 98.989616;
  const placeEN = 'Chiang Mai Summer';
  const placeZH = '清迈夏天';
  const ua = navigator.userAgent.toLowerCase();
  const isiOS = /iphone|ipad|ipod/.test(ua);
  const isMac = /macintosh|mac os x/.test(ua);
  const appleScheme = `maps://?q=${encodeURIComponent(placeEN)}&ll=${LAT},${LNG}`;
  const appleHttp   = `https://maps.apple.com/?q=${encodeURIComponent(placeEN)}&ll=${LAT},${LNG}`;
  const baiduUrl = `https://api.map.baidu.com/marker?location=${LAT},${LNG}&title=${encodeURIComponent(isZh?placeZH:placeEN)}&content=${encodeURIComponent('Prapokklao Soi 6')}&output=html&coord_type=wgs84`;

  const btnAppleEn = document.getElementById('btn-apple-en');
  if (btnAppleEn && (isiOS || isMac)) { btnAppleEn.classList.remove('hidden'); btnAppleEn.href = appleScheme; btnAppleEn.setAttribute('data-fallback', appleHttp); }
  const btnBaiduEn = document.getElementById('btn-baidu-en');
  if (btnBaiduEn && isZh) { btnBaiduEn.classList.remove('hidden'); btnBaiduEn.href = baiduUrl; }
  const btnAppleZh = document.getElementById('btn-apple-zh');
  if (btnAppleZh && (isiOS || isMac)) { btnAppleZh.classList.remove('hidden'); btnAppleZh.href = appleScheme; btnAppleZh.setAttribute('data-fallback', appleHttp); }
  const btnBaiduZh = document.getElementById('btn-baidu-zh');
  if (btnBaiduZh) { btnBaiduZh.classList.remove('hidden'); btnBaiduZh.href = baiduUrl; }

  // ====== 夜/日间主题：加载、切换、存储 ======
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem('theme'); // 'dark' | 'light' | null
  const initial = saved || (prefersDark ? 'dark' : 'light');
  setTheme(initial);

  // 把切换按钮注入到页头右侧（在 lang-switch 和 QR 图标旁边）
  const headerRight = document.querySelector('.header-right');
  if (headerRight) {
    const tbtn = document.createElement('button');
    tbtn.className = 'theme-btn';
    tbtn.setAttribute('aria-label', 'Toggle theme');
    tbtn.setAttribute('title', isZh ? '切换夜/日间模式' : 'Toggle light/dark');
    tbtn.innerHTML = getThemeIcon(initial);
    tbtn.addEventListener('click', () => {
      const now = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(now);
      localStorage.setItem('theme', now);
      tbtn.innerHTML = getThemeIcon(now);
      // 同步浏览器地址栏主题色（PWA/移动端观感）
      setMetaThemeColor(now);
    });
    headerRight.appendChild(tbtn);
  }

  // 响应系统主题变化（仅当用户未手动选择过时）
  if (!saved && window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const next = e.matches ? 'dark' : 'light';
      setTheme(next);
      setMetaThemeColor(next);
    });
  }

  function setTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
  }
  function getThemeIcon(mode) {
    // 太阳/月亮简洁图标（内联 SVG）
    return mode === 'dark'
      ? '<svg viewBox="0 0 24 24"><path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.79 1.8-1.79zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zM4.84 20.83l1.79-1.79-1.8-1.79-1.79 1.79 1.8 1.79zM20 13h3v-2h-3v2zm-2.76-8.16l1.79-1.79-1.41-1.41-1.79 1.79 1.41 1.41zM12 6a6 6 0 100 12 6 6 0 000-12zm7.16 14.83l1.79-1.79-1.8-1.79-1.79 1.79 1.8 1.79z"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M20.742 13.045A8.001 8.001 0 1111 3a7 7 0 009.742 10.045z"/></svg>';
  }
  function setMetaThemeColor(mode) {
    const el = document.querySelector('meta[name="theme-color"]') || (function(){
      const m = document.createElement('meta');
      m.name = 'theme-color';
      document.head.appendChild(m);
      return m;
    })();
    el.setAttribute('content', mode === 'dark' ? '#0b1220' : '#f7f7fb');
  }
})();

// ===== Reveal on scroll (IntersectionObserver) =====
(function(){
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || !els.length) {
    // 兜底：不支持 IO 时直接展示
    els.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
  els.forEach(el => io.observe(el));
})();

// ===== Back to Top (floating button) =====
(function(){
  const btn = document.createElement('button');
  btn.className = 'backtotop';
  btn.setAttribute('aria-label', 'Back to top');
  btn.setAttribute('title', 'Back to top');
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4l-7 7h4v7h6v-7h4l-7-7z"/></svg>';
  document.body.appendChild(btn);

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const toggle = () => {
    const show = window.scrollY > 260;
    btn.classList.toggle('show', show);
  };
  window.addEventListener('scroll', toggle, { passive: true });
  window.addEventListener('resize', toggle);
  toggle();

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (prefersReduced) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
})();

// ===== Inject Search icon in header =====
(function(){
  const headerRight = document.querySelector('.header-right');
  if (!headerRight || headerRight.querySelector('.search-icon')) return;
  const a = document.createElement('a');
  a.className='icon-btn search-icon';
  a.href='search.html';
  a.setAttribute('aria-label','Search');
  a.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>';
  headerRight.appendChild(a);
})();

// ===== Inject Feedback button in nav (optional) =====
(function(){
  const nav = document.querySelector('.nav-links');
  if (!nav || nav.querySelector('.nav-feedback')) return;
  const a = document.createElement('a');
  a.className='nav-feedback';
  a.href = (location.pathname.endsWith('-zh.html') ? 'feedback-zh.html' : 'feedback.html');
  a.textContent = (location.pathname.endsWith('-zh.html') ? '留言' : 'Feedback');
  nav.appendChild(a);
})();

// ===== Privacy-friendly analytics injector =====
(function(){
  try {
    const cfg = window.ANALYTICS || {};
    const dnt = (navigator.doNotTrack == "1" || window.doNotTrack == "1" || navigator.msDoNotTrack == "1");
    const hostOk = !cfg.hosts || cfg.hosts.includes(location.hostname);
    if ((cfg.respectDNT && dnt) || !hostOk) return;

    function add(src, attrs={}) {
      const s = document.createElement('script');
      s.src = src; s.defer = true;
      Object.entries(attrs).forEach(([k,v])=>s.setAttribute(k, v));
      document.head.appendChild(s);
    }

    if (cfg.provider === "umami" && cfg.umami && cfg.umami.enabled) {
      add(cfg.umami.src, {"data-website-id": cfg.umami.websiteId});
    } else if (cfg.provider === "plausible" && cfg.plausible && cfg.plausible.enabled) {
      add(cfg.plausible.src, {"data-domain": cfg.plausible.domain});
    } else {
      // not configured; stay silent
      if (console && console.info) console.info("[analytics] disabled (no provider configured)");
    }
  } catch(e) { /* ignore */ }
})();

// ===== Language auto-redirect (first visit to home only) =====
(function(){
  try {
    const path = location.pathname.replace(/\/+$/,'/');
    const isHome = (path === "/" || path.endsWith("/index.html"));
    if (!isHome) return;

    const params = new URLSearchParams(location.search);
    const urlLang = params.get("lang"); // ?lang=en/zh
    const saved = localStorage.getItem("lang_choice");
    if (urlLang) {
      localStorage.setItem("lang_choice", urlLang);
      if (urlLang === "zh" && !location.pathname.endsWith("index-zh.html")) {
        location.replace("index-zh.html");
      } else if (urlLang === "en" && !location.pathname.endsWith("index.html")) {
        location.replace("index.html");
      }
      return;
    }
    if (saved) return; // user has chosen

    const navLang = (navigator.language || navigator.userLanguage || "").toLowerCase();
    const preferZh = navLang.startsWith("zh");
    if (preferZh && !location.pathname.endsWith("index-zh.html")) {
      // first-time redirect to Chinese
      location.replace("index-zh.html");
    }
  } catch(e) { /* ignore */ }
})();

// Remember user choice when clicking lang switch
(function(){
  const en = document.getElementById('lang-en');
  const zh = document.getElementById('lang-zh');
  if (en) en.addEventListener('click', ()=>localStorage.setItem('lang_choice','en'));
  if (zh) zh.addEventListener('click', ()=>localStorage.setItem('lang_choice','zh'));
})();

// ===== Inject "Book" CTA in header & mobile nav =====
(function(){
  try {
    const isZh = (location.pathname.endsWith('-zh.html') ||
                 (document.documentElement.getAttribute('lang')||'').toLowerCase().startsWith('zh'));

    // 目标链接：若当前页已有 #booking-buttons 则指向本页锚点，否则跳到联系页的锚点
    const hasLocalAnchor = !!document.getElementById('booking-buttons');
    const target = hasLocalAnchor
      ? '#booking-buttons'
      : (isZh ? 'contact-zh.html#booking-buttons' : 'contact.html#booking-buttons');

    // 顶部右侧（桌面端）
    const headerRight = document.querySelector('.header-right');
    if (headerRight && !headerRight.querySelector('.nav-cta')) {
      const a = document.createElement('a');
      a.className = 'nav-cta';
      a.href = target;
      a.textContent = isZh ? '预订' : 'Book';
      headerRight.appendChild(a);
    }

    // 折叠菜单里（移动端）
    const nav = document.querySelector('.nav-links');
    if (nav && !nav.querySelector('.nav-cta-inline')) {
      const a2 = document.createElement('a');
      a2.className = 'nav-cta-inline';
      a2.href = target;
      a2.textContent = isZh ? '预订' : 'Book';
      // 点击后收起菜单（若已打开）
      a2.addEventListener('click', ()=>{
        const btn = document.querySelector('.nav-toggle');
        if (nav.classList.contains('open')) {
          nav.classList.remove('open');
          if (btn) btn.setAttribute('aria-expanded','false');
        }
      });
      nav.appendChild(a2);
    }
  } catch(e) { /* ignore */ }
})();

// ===== Update Book CTA target to booking page (EN/ZH) + add small icon
(function(){
  try {
    const isZh = (location.pathname.endsWith('-zh.html') ||
                 (document.documentElement.getAttribute('lang')||'').toLowerCase().startsWith('zh'));
    const target = isZh ? 'booking-zh.html' : 'booking.html';

    const headerRight = document.querySelector('.header-right');
    if (headerRight) {
      let cta = headerRight.querySelector('.nav-cta');
      if (!cta) {
        cta = document.createElement('a');
        cta.className = 'nav-cta';
        headerRight.appendChild(cta);
      }
      \1
          cta.innerHTML = `<span class="brand-pair" style="display:inline-flex;gap:4px;align-items:center;margin-right:6px;"><svg class="icon icon-img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="14" height="14" role="img" aria-label="Booking.com" fill="none">
  <rect x="4" y="8" width="56" height="48" rx="10" fill="#003580"/>
  <circle cx="46" cy="44" r="4" fill="#FFC300"/>
  <path fill="#FFFFFF" d="M18 22h14c4.5 0 8 3.5 8 8s-3.5 8-8 8H18V22zm8 6v4h6a2 2 0 1 0 0-4h-6z"/>
</svg><svg class="icon icon-img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="14" height="14" role="img" aria-label="Airbnb" fill="none">
  <path fill="#FF5A5F" d="M32 8c-2 0-3.7 1.2-5 3.5-3.8 6.5-9 16.6-11.8 23.2C13.7 38.2 12 42 12 45.5 12 52.5 18 56 24 56c5.3 0 8.8-3.2 10.8-6.2 2 3 5.5 6.2 10.8 6.2 6 0 12-3.5 12-10.5 0-3.5-1.7-7.3-3.2-10.8C51 28.1 45.8 18 42 11.5 40 9.2 38 8 36 8h-4zM24 50c-3.7 0-6-2.3-6-4.5 0-2 .8-4.2 2.5-8.2 2.5-5.9 6.6-13.8 11.5-22.3 4.9 8.5 9 16.4 11.5 22.3 1.7 4 2.5 6.2 2.5 8.2 0 2.2-2.3 4.5-6 4.5-4.3 0-6.5-3.7-7.7-6.5-.5-1.1-2.1-1.1-2.6 0-1.2 2.8-3.4 6.5-7.7 6.5z"/>
  <circle cx="32" cy="41" r="5.5" fill="#FF5A5F"/>
</svg></span>${isZh?'预订':'Book'}`;cta.innerHTML = '<svg viewBox="0 0 24 24" style="width:14px;height:14px;margin-right:6px;vertical-align:-2px;"><path d="M4 7h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7zm2-4h12a2 2 0 0 1 2 2v2H4V5a2 2 0 0 1 2-2z"/></svg>' + (isZh ? '预订' : 'Book');
    }

    const nav = document.querySelector('.nav-links');
    if (nav) {
      let cta2 = nav.querySelector('.nav-cta-inline');
      if (!cta2) {
        cta2 = document.createElement('a');
        cta2.className = 'nav-cta-inline';
        nav.appendChild(cta2);
      }
      cta2.href = target;
      cta2.innerHTML = `<span class="brand-pair" style="display:inline-flex;gap:4px;align-items:center;margin-right:6px;"><svg class="icon icon-img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="14" height="14" role="img" aria-label="Booking.com" fill="none">
  <rect x="4" y="8" width="56" height="48" rx="10" fill="#003580"/>
  <circle cx="46" cy="44" r="4" fill="#FFC300"/>
  <path fill="#FFFFFF" d="M18 22h14c4.5 0 8 3.5 8 8s-3.5 8-8 8H18V22zm8 6v4h6a2 2 0 1 0 0-4h-6z"/>
</svg><svg class="icon icon-img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="14" height="14" role="img" aria-label="Airbnb" fill="none">
  <path fill="#FF5A5F" d="M32 8c-2 0-3.7 1.2-5 3.5-3.8 6.5-9 16.6-11.8 23.2C13.7 38.2 12 42 12 45.5 12 52.5 18 56 24 56c5.3 0 8.8-3.2 10.8-6.2 2 3 5.5 6.2 10.8 6.2 6 0 12-3.5 12-10.5 0-3.5-1.7-7.3-3.2-10.8C51 28.1 45.8 18 42 11.5 40 9.2 38 8 36 8h-4zM24 50c-3.7 0-6-2.3-6-4.5 0-2 .8-4.2 2.5-8.2 2.5-5.9 6.6-13.8 11.5-22.3 4.9 8.5 9 16.4 11.5 22.3 1.7 4 2.5 6.2 2.5 8.2 0 2.2-2.3 4.5-6 4.5-4.3 0-6.5-3.7-7.7-6.5-.5-1.1-2.1-1.1-2.6 0-1.2 2.8-3.4 6.5-7.7 6.5z"/>
  <circle cx="32" cy="41" r="5.5" fill="#FF5A5F"/>
</svg></span>${isZh?'预订':'Book'}`;
      cta2.addEventListener('click', ()=>{
        const btn = document.querySelector('.nav-toggle');
        if (nav.classList.contains('open')) {
          nav.classList.remove('open');
          if (btn) btn.setAttribute('aria-expanded','false');
        }
      });
    }
  } catch(e) {}
})();

// ===== Copy-to-clipboard for elements with [data-copy] =====
(function(){
  function toast(msg){
    try {
      var t = document.querySelector('.toast'); 
      if(!t){ t = document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
      t.textContent = msg; t.style.opacity = 1;
      setTimeout(()=>{ t.style.opacity = 0; }, 1600);
    } catch(e){}
  }
  document.addEventListener('click', function(e){
    var el = e.target.closest('[data-copy]');
    if(!el) return;
    e.preventDefault();
    var text = el.getAttribute('data-copy') || '';
    if(!text) return;
    navigator.clipboard.writeText(text).then(function(){
      toast((location.pathname.endsWith('-zh.html') ? '已复制：' : 'Copied: ') + text);
    }).catch(function(){
      // 兼容不支持 clipboard 的环境
      var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta);
      ta.select(); try{ document.execCommand('copy'); toast((location.pathname.endsWith('-zh.html') ? '已复制：' : 'Copied: ') + text);}catch(e){}
      ta.remove();
    });
  });
})();
