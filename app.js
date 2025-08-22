(function () {
  const btn = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav-links');
  const langEn = document.getElementById('lang-en');
  const langZh = document.getElementById('lang-zh');

  // 移动端菜单开关
  if (btn && nav) {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
    });
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if (nav.classList.contains('open')) {
          nav.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // 当前页面文件名（根路径视为 index.html）
  const path = window.location.pathname;
  let file = path.split('/').pop() || 'index.html';
  const baseFile = file.replace('-zh', '');

  // 高亮当前导航项
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const hrefBase = href.replace('-zh', '');
    if (hrefBase === baseFile) a.classList.add('active');
  });

  // 语言切换
  const isZh = file.endsWith('-zh.html');
  if (langEn && langZh) {
    langEn.href = baseFile;
    langZh.href = baseFile.replace('.html', '-zh.html');
    (isZh ? langZh : langEn).classList.add('active');
  }

  // ===== 复制逻辑（含“复制全部”与 ✓ 状态）=====
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
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      document.body.appendChild(t);
    }
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

  // ===== 本地化地图按钮：Apple Maps / Baidu Maps =====
  const LAT = 18.784389, LNG = 98.989616;
  const placeEN = 'Chiang Mai Summer';
  const placeZH = '清迈夏天';

  const ua = navigator.userAgent.toLowerCase();
  const isiOS = /iphone|ipad|ipod/.test(ua);
  const isMac = /macintosh|mac os x/.test(ua);

  // Apple Maps 链接（优先 scheme，fallback 到 https）
  const appleScheme = `maps://?q=${encodeURIComponent(placeEN)}&ll=${LAT},${LNG}`;
  const appleHttp   = `https://maps.apple.com/?q=${encodeURIComponent(placeEN)}&ll=${LAT},${LNG}`;

  // 百度地图（支持 wgs84）
  const baiduUrl = `https://api.map.baidu.com/marker?location=${LAT},${LNG}&title=${encodeURIComponent(isZh?placeZH:placeEN)}&content=${encodeURIComponent('Prapokklao Soi 6')}&output=html&coord_type=wgs84`;

  // 英文页按钮
  const btnAppleEn = document.getElementById('btn-apple-en');
  if (btnAppleEn) {
    if (isiOS || isMac) {
      btnAppleEn.classList.remove('hidden');
      btnAppleEn.setAttribute('href', appleScheme);
      // 兜底备用（长按可复制）：data-fallback
      btnAppleEn.setAttribute('data-fallback', appleHttp);
      // 如果用户在桌面浏览器阻止了 scheme，可手动右键复制备用链接
    }
  }

  const btnBaiduEn = document.getElementById('btn-baidu-en');
  if (btnBaiduEn && isZh) { // 仅在中文用户更可能使用时显示（你也可以改成始终显示）
    btnBaiduEn.classList.remove('hidden');
    btnBaiduEn.setAttribute('href', baiduUrl);
  }

  // 中文页按钮
  const btnAppleZh = document.getElementById('btn-apple-zh');
  if (btnAppleZh) {
    if (isiOS || isMac) {
      btnAppleZh.classList.remove('hidden');
      btnAppleZh.setAttribute('href', appleScheme);
      btnAppleZh.setAttribute('data-fallback', appleHttp);
    }
  }

  const btnBaiduZh = document.getElementById('btn-baidu-zh');
  if (btnBaiduZh) {
    btnBaiduZh.classList.remove('hidden'); // 中文页默认显示
    btnBaiduZh.setAttribute('href', baiduUrl);
  }
})();
