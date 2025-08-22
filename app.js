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

  // 当前页面文件名（根路径视为 index.html），用于高亮和语言切换
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

  // ===== 复制按钮 =====
  const toast = createToast();
  document.querySelectorAll('[data-copy]').forEach(el => {
    el.addEventListener('click', async (e) => {
      e.preventDefault();
      const text = el.getAttribute('data-copy') || '';
      try {
        await navigator.clipboard.writeText(text);
        showToast(toast, el.getAttribute('data-toast') || 'Copied!');
      } catch {
        // 回退方案（少数浏览器）：
        fallbackCopy(text);
        showToast(toast, el.getAttribute('data-toast') || 'Copied!');
      }
    });
  });

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select(); document.execCommand('copy');
    document.body.removeChild(ta);
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
  function showToast(node, msg) {
    node.textContent = msg;
    node.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove('show'), 1600);
  }

  // ===== Grab 快捷：尽量打开 app，不行就提示去官网 =====
  // 我们保留 <a href="grab://open?screenType=BOOK_RIDE"> 作为主链接；
  // 也提供一个普通网页备用按钮，指向 Grab 泰国官网。
  // 这里不强制做跳转逻辑，以免影响用户体验。
})();
