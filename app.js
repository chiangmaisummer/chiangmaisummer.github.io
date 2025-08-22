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

  // ===== 复制逻辑 =====
  const toast = createToast();

  // 单项复制
  document.querySelectorAll('[data-copy]').forEach(el => {
    el.addEventListener('click', async (e) => {
      e.preventDefault();
      const text = el.getAttribute('data-copy') || '';
      const okMsg = el.getAttribute('data-toast') || (isZh ? '已复制' : 'Copied!');
      const original = el.textContent;
      try {
        await copyText(text);
        feedback(el, okMsg, original);
      } catch {
        feedback(el, okMsg, original);
      }
    });
  });

  // 复制全部
  document.querySelectorAll('[data-copy-all]').forEach(el => {
    el.addEventListener('click', async (e) => {
      e.preventDefault();
      // 用换行拼接三项：英文地址 / 泰文地址 / 坐标
      const en = document.querySelector('[data-copy][data-kind="en"]')?.getAttribute('data-copy') || '';
      const th = document.querySelector('[data-copy][data-kind="th"]')?.getAttribute('data-copy') || '';
      const gps = document.querySelector('[data-copy][data-kind="gps"]')?.getAttribute('data-copy') || '';
      const text = [en, th, gps].filter(Boolean).join('\n');
      const okMsg = el.getAttribute('data-toast') || (isZh ? '已复制全部' : 'Copied all!');
      const original = el.textContent;
      try {
        await copyText(text);
        feedback(el, okMsg, original);
      } catch {
        feedback(el, okMsg, original);
      }
    });
  });

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // 回退方案
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
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
})();
