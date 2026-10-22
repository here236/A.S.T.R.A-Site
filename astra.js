// Links dos botões. Preencher com o endereço do instalador e da documentação.
// Enquanto estiverem vazios, os botões rolam a página até a seção correspondente.
const DOWNLOAD_URL = '';
const DOCS_URL = '';

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('[data-download]').forEach(a => {
  if (DOWNLOAD_URL) { a.href = DOWNLOAD_URL; a.setAttribute('download', ''); }
});
document.querySelectorAll('[data-docs]').forEach(a => {
  if (DOCS_URL) { a.href = DOCS_URL; a.target = '_blank'; a.rel = 'noopener'; }
});

// Tema claro e escuro
const themeBtn = document.getElementById('theme-toggle');
const themeMeta = document.querySelector('meta[name="theme-color"]');
let particleRGB = '196,191,255';

function readThemeColors() {
  particleRGB = getComputedStyle(root).getPropertyValue('--particle').trim() || particleRGB;
}

function setTheme(theme, save) {
  root.setAttribute('data-theme', theme);
  if (save) { try { localStorage.setItem('astra-theme', theme); } catch (e) {} }
  const dark = theme === 'dark';
  themeBtn.setAttribute('aria-label', dark ? 'Mudar para o tema claro' : 'Mudar para o tema escuro');
  if (themeMeta) themeMeta.setAttribute('content', dark ? '#07060c' : '#ffffff');
  readThemeColors();
  if (reduceMotion) drawBg();
}

themeBtn.addEventListener('click', () => {
  setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
});

// Segue a preferência do sistema enquanto a pessoa não escolher manualmente
const mq = window.matchMedia('(prefers-color-scheme: light)');
mq.addEventListener && mq.addEventListener('change', e => {
  let saved = null;
  try { saved = localStorage.getItem('astra-theme'); } catch (err) {}
  if (!saved) setTheme(e.matches ? 'light' : 'dark', false);
});

// Fundo de partículas, leve: poucas partículas, 30 quadros por segundo,
// pausa quando a aba não está visível
const bgC = document.getElementById('bg-canvas');
const bgX = bgC.getContext('2d');
let W = 0, H = 0, pts = [], running = false, lastFrame = 0;

function resize() {
  W = bgC.width = window.innerWidth;
  H = bgC.height = window.innerHeight;
  const count = Math.min(60, Math.round(W * H / 28000));
  pts = [];
  for (let i = 0; i < count; i++) {
    pts.push({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.4 + 0.6
    });
  }
  drawBg();
}

function drawBg() {
  bgX.clearRect(0, 0, W, H);
  for (const p of pts) {
    bgX.beginPath();
    bgX.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    bgX.fillStyle = `rgba(${particleRGB},0.5)`;
    bgX.fill();
  }
  bgX.lineWidth = 0.6;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 19600) {
        bgX.beginPath();
        bgX.moveTo(pts[i].x, pts[i].y);
        bgX.lineTo(pts[j].x, pts[j].y);
        bgX.strokeStyle = `rgba(${particleRGB},${(1 - Math.sqrt(d2) / 140) * 0.22})`;
        bgX.stroke();
      }
    }
  }
}

function stepBg() {
  for (const p of pts) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = W; else if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = H; else if (p.y > H) p.y = 0;
  }
}

function loop(ts) {
  if (!running) return;
  if (ts - lastFrame >= 33) { lastFrame = ts; stepBg(); drawBg(); }
  requestAnimationFrame(loop);
}

function startBg() {
  if (reduceMotion || running) return;
  running = true;
  requestAnimationFrame(loop);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) running = false; else startBg();
});

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resize, 150);
});

readThemeColors();
setTheme(root.getAttribute('data-theme'), false);
resize();
startBg();

// Aparecer ao rolar
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('visible');
    if (e.target.classList.contains('metric-item')) animateMetric(e.target);
    obs.unobserve(e.target);
  });
}, { threshold: 0.2 });

document.querySelectorAll('.feature-row,.metric-item').forEach(el => obs.observe(el));

// Contagem das métricas, com formato brasileiro (98,7)
function animateMetric(el) {
  const valEl = el.querySelector('.metric-val');
  const target = parseFloat(valEl.dataset.target);
  const suffix = valEl.dataset.suffix || '';
  const decimals = target % 1 === 0 ? 0 : 1;
  const fmt = n => n.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  if (reduceMotion) { valEl.textContent = fmt(target) + suffix; return; }

  const dur = 1500;
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    valEl.textContent = fmt(target * ease) + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
