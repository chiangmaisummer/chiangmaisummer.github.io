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
