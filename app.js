(function () {
  const btn = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav-links');

  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
  });

  // 点击菜单项后自动收起（移动端体验更好）
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      if (nav.classList.contains('open')) {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });
})();
