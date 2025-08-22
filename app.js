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

  // 忽略 -zh 后缀用于高亮匹配
  const baseFile = file.replace('-zh', '');

  // 高亮当前导航项（按文件名匹配）
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const hrefBase = href.replace('-zh', '');
    if (hrefBase === baseFile) {
      a.classList.add('active');
    }
  });

  // 语言切换：当前语言识别
  const isZh = file.endsWith('-zh.html');

  // 计算对应语言的文件名
  const counterpart = isZh ? baseFile : baseFile.replace('.html', '-zh.html');

  // 设置语言链接 href 与激活态
  if (langEn && langZh) {
    langEn.href = baseFile;               // 英文指向 base
    langZh.href = baseFile.replace('.html', '-zh.html'); // 中文指向 -zh
    if (isZh) {
      langZh.classList.add('active');
    } else {
      langEn.classList.add('active');
    }
  }
})();
