import { boot, reveals, reduced, fine, lenis, gsap, ScrollTrigger, SplitText } from '../shell.js';
import { families, familyOrder, caps } from '../families.js';
import { fragrances, sets } from '../catalog.js';
import { bottle, boxFront } from '../bottle.js';
import { brl } from '../store.js';
import * as THREE from 'three';

boot();

// Frascos declarados no HTML
document.querySelectorAll('[data-bottle]').forEach((el) => {
  el.innerHTML = bottle(JSON.parse(el.dataset.bottle));
});
document.querySelector('.closing__small').textContent = `${fragrances.length} fragrâncias, kits e corpo`;

/* ---------- Palco: frasco 3D e as sete famílias ---------- */

const lead = { linge: 'linge-lave', brume: 'brume-de-bain', sorbet: 'sorbet-melon', brise: 'brise-de-bergamote', souffle: 'souffle-de-santal', douceur: 'douceur-de-litchi' };
const states = [
  { key: 'hero', word: 'LE SENSIER', tracking: 0.14, bg: '#F3F0EA', tint: '#D9CDB8', line: 'autoral', print: '' },
  ...familyOrder.map((k) => {
    const f = families[k];
    const fr = fragrances.find((x) => x.slug === lead[k]);
    return {
      key: k, word: f.name, tracking: 0.02, bg: f.paper, tint: f.tint,
      line: k === 'the' ? 'autoral' : fr.line,
      print: k === 'the' ? 'Thé de Nashi' : fr.name,
    };
  }),
];

const sticky = document.querySelector('.stage__sticky');
const index = document.querySelector('.stage__index');

familyOrder.forEach((k, i) => {
  const f = families[k];
  const count = fragrances.filter((x) => x.family === k).length;
  const href = k === 'the' ? '/produto.html?p=les-thes' : `/colecao.html?f=${k}`;
  const cta = k === 'the' ? 'Ver o kit Les Thés' : `Ver ${count === 1 ? 'a fragrância' : `as ${count} fragrâncias`}`;
  const lineName = states[i + 1].line === 'autoral' ? 'Autoral' : 'Releitura';
  const p = document.createElement('div');
  p.className = 'stage__panel';
  p.dataset.state = i + 1;
  p.innerHTML = `
    <div class="stage__copy">
      <p class="label">${lineName}</p>
      <h2 class="stage__state">${f.state}</h2>
      <p class="stage__text">${f.text}</p>
      <a class="link" href="${href}">${cta}</a>
    </div>`;
  sticky.insertBefore(p, index);
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = f.name;
  b.dataset.go = i + 1;
  index.appendChild(b);
});

const panels = [...document.querySelectorAll('.stage__panel')];
const stageEl = document.querySelector('.stage');
const N = states.length;

let gl = null;
try {
  const { createStage } = await import('../stage3d.js');
  await Promise.all([
    document.fonts.load('400 120px "Bodoni Moda"'),
    document.fonts.load('400 40px Geist'),
  ]).catch(() => {});
  gl = createStage(document.querySelector('.stage__gl'));
} catch (err) {
  console.warn('WebGL indisponível, usando frasco em SVG.', err);
  stageEl.classList.add('no-gl');
}

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const cA = new THREE.Color(), cB = new THREE.Color();
let activePanel = 0;
let lastPrint = '';
let lastCapLine = '';
let fallbackKey = '';

function apply(progress) {
  const x = Math.min(N - 1e-4, progress * N);
  const i = Math.floor(x);
  const f = x - i;
  const tr = i < N - 1 ? smooth(0.62, 1, f) : 0;
  const a = states[i], b = states[Math.min(N - 1, i + 1)];
  const shown = tr > 0.5 ? b : a;

  const now = tr > 0.5 ? i + 1 : i;
  if (now !== activePanel) {
    panels[activePanel].classList.remove('is-active');
    panels[now].classList.add('is-active');
    index.querySelectorAll('button').forEach((btn) => btn.classList.toggle('is-active', Number(btn.dataset.go) === now));
    activePanel = now;
  }
  index.classList.toggle('is-visible', now > 0);
  document.documentElement.style.setProperty('--stage-bg', shown.bg);

  if (gl) {
    const s = gl.state;
    s.bg.copy(cA.set(a.bg)).lerp(cB.set(b.bg), tr);
    s.words = [
      { text: a.word, a: 1 - tr, tracking: a.tracking, dy: -tr * 0.08 },
      { text: b.word, a: tr, tracking: b.tracking, dy: (1 - tr) * 0.08 },
    ];
    s.spin = Math.PI * 2 * (i + tr);
    s.lift = window.innerWidth < 700 ? 0.3 : 0;
    gl.juice.color.copy(cA.set(a.tint)).lerp(cB.set(b.tint), tr);
    const capA = caps[a.line], capB = caps[b.line];
    gl.cap.color.copy(cA.set(capA.mid)).lerp(cB.set(capB.mid), tr);
    if (shown.line !== lastCapLine) {
      gl.cap.map = shown.line === 'autoral' ? gl.stone : null;
      gl.cap.roughness = shown.line === 'autoral' ? 0.85 : 0.55;
      gl.cap.needsUpdate = true;
      lastCapLine = shown.line;
    }
    if (shown.print !== lastPrint) {
      gl.state.printName = shown.print;
      gl.state.printInk = '#141311';
      gl.drawPrint();
      lastPrint = shown.print;
    }
    gl.drawBg();
  } else if (fallbackKey !== shown.key) {
    fallbackKey = shown.key;
    const fb = document.querySelector('.stage__fallback');
    fb.innerHTML = `<span class="stage__word">${shown.word}</span>${bottle({ family: shown.key === 'hero' ? 'linge' : shown.key, line: shown.line, name: shown.print })}`;
  }
}

apply(0);
ScrollTrigger.create({
  trigger: stageEl,
  start: 'top top',
  end: 'bottom bottom',
  scrub: reduced ? false : 0.6,
  onUpdate: (st) => apply(st.progress),
});

index.addEventListener('click', (e) => {
  const b = e.target.closest('[data-go]');
  if (!b) return;
  const st = ScrollTrigger.getAll().find((t) => t.trigger === stageEl);
  const y = st.start + ((Number(b.dataset.go) + 0.3) / N) * (st.end - st.start);
  lenis ? lenis.scrollTo(y, { duration: 1.8 }) : window.scrollTo({ top: y, behavior: 'smooth' });
});

// Entrada
if (!reduced) {
  const lede = SplitText.create('.stage__lede', { type: 'lines', mask: 'lines' });
  gsap.timeline({ delay: document.documentElement.classList.contains('is-entering') ? 0.6 : 0.2 })
    .from('.stage__gl, .stage__fallback', { autoAlpha: 0, scale: 1.04, duration: 1.8, ease: 'expo.out' })
    .from(lede.lines, { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.08 }, '-=1.3')
    .from('.stage__cue', { autoAlpha: 0, duration: 1 }, '-=0.8')
    .from('.hd > *', { y: -16, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.06 }, '-=1.2');
}

/* ---------- Origem: palavras acendem com a rolagem ---------- */
const origin = document.querySelector('[data-words]');
if (!reduced) {
  const split = SplitText.create(origin, { type: 'words', wordsClass: 'w' });
  gsap.fromTo(split.words, { opacity: 0.14 }, {
    opacity: 1, ease: 'none', stagger: 0.1,
    scrollTrigger: { trigger: origin, start: 'top 80%', end: 'bottom 45%', scrub: true },
  });
}

/* ---------- Linge: trilho horizontal ---------- */
const rail = document.querySelector('[data-rail]');
rail.innerHTML = fragrances.filter((f) => f.family === 'linge').map((f) => `
  <a class="rail__card" href="/produto.html?p=${f.slug}" data-cursor="Ver">
    <div class="rail__bottle">${bottle({ family: f.family, line: f.line, name: f.name })}</div>
    <h3>${f.name}</h3>
    <p>${f.short}</p>
    <p class="rail__price">${brl(f.sizes[0].price)} <span>50 ml</span></p>
  </a>`).join('') + `
  <a class="rail__card rail__card--kit" href="/produto.html?p=les-linges" data-cursor="Ver">
    <div class="rail__bottle rail__minis">${['linge', 'linge', 'linge'].map(() => bottle({ family: 'linge', line: 'autoral', format: '5', label: false })).join('')}</div>
    <h3>Les Linges</h3>
    <p>As seis em miniaturas de 5 ml.</p>
    <p class="rail__price">${brl(sets.find((s) => s.slug === 'les-linges').sizes[0].price)} <span>kit</span></p>
  </a>`;

const mm = gsap.matchMedia();
mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
  const dist = () => rail.scrollWidth - window.innerWidth + 64;
  gsap.to(rail, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: { trigger: '.rail', pin: '.rail__pin', start: 'top top', end: () => '+=' + dist(), scrub: 0.8, invalidateOnRefresh: true },
  });
  rail.querySelectorAll('.rail__bottle').forEach((b) => {
    gsap.fromTo(b, { rotate: -4 }, {
      rotate: 4, ease: 'none',
      scrollTrigger: { trigger: '.rail', start: 'top top', end: () => '+=' + dist(), scrub: true },
    });
  });
});

/* ---------- Brume de Bain ---------- */
const bainList = document.querySelector('.bain__list');
const bain = fragrances.find((f) => f.slug === 'brume-de-bain');
const polpa = sets.find((s) => s.slug === 'polpa-brume-de-bain');
const kitBain = sets.find((s) => s.slug === 'kit-bain');
bainList.innerHTML = [
  ...bain.sizes.map((s) => [s.label === '50 ml' ? 'Parfum 50 ml' : s.label === '5 ml' ? 'Miniatura 5 ml' : s.label, s.price, `/produto.html?p=brume-de-bain&s=${encodeURIComponent(s.label)}`]),
  ['Polpa para o corpo', polpa.sizes[0].price, '/produto.html?p=polpa-brume-de-bain'],
  ['Kit Bain: colônia, polpa e parfum', kitBain.sizes[0].price, '/produto.html?p=kit-bain'],
].map(([n, p, h]) => `<li><a href="${h}"><span>${n}</span><span>${brl(p)}</span></a></li>`).join('');

if (!reduced) {
  gsap.from('.bain__b', {
    yPercent: 30, autoAlpha: 0, duration: 1.6, ease: 'expo.out', stagger: 0.12,
    scrollTrigger: { trigger: '.bain__trio', start: 'top 80%' },
  });
  gsap.to('.bain__b--200', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.bain', scrub: true } });
  gsap.to('.bain__b--jar', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.bain', scrub: true } });
}

/* ---------- Caixa que abre ---------- */
function cube(el, { w, h, d, family, top, name }) {
  const f = families[family];
  el.style.setProperty('--w', w + 'px');
  el.style.setProperty('--h', h + 'px');
  el.style.setProperty('--d', d + 'px');
  el.style.setProperty('--paper', f.paper);
  el.innerHTML = `
    <div class="face face--front">${top ? '' : boxFront({ family, name, sub: 'Parfum 50 ml' })}</div>
    <div class="face face--back"></div>
    <div class="face face--left"></div>
    <div class="face face--right"></div>
    <div class="face face--top">${top ? `<span class="face__emboss">LE SENSIER</span>` : ''}</div>
    <div class="face face--bottom"></div>`;
}
const size = () => (window.innerWidth < 700 ? 0.62 : 1);
const k = size();
cube(document.querySelector('.cube--base'), { w: 260 * k, h: 300 * k, d: 180 * k, family: 'sorbet', name: 'Sorbet Melon' });
cube(document.querySelector('.cube--lid'), { w: 268 * k, h: 70 * k, d: 188 * k, family: 'sorbet', top: true });

if (!reduced) {
  const tl = gsap.timeline({
    scrollTrigger: { trigger: '.unbox', pin: '.unbox__pin', start: 'top top', end: '+=160%', scrub: 0.8 },
  });
  tl.fromTo('.unbox__scene', { rotateX: -18, rotateY: -32 }, { rotateX: -14, rotateY: 28, ease: 'none', duration: 1 }, 0)
    .to('.cube--lid', { y: -260 * k, rotateZ: -8, rotateX: 18, ease: 'power2.inOut', duration: 0.5 }, 0.15)
    .fromTo('.unbox__bottle', { y: 140 * k, autoAlpha: 0 }, { y: -40 * k, autoAlpha: 1, ease: 'power2.out', duration: 0.5 }, 0.35);
}

/* ---------- Kits ---------- */
const kitList = document.querySelector('[data-kits]');
const kitFloat = document.querySelector('.kits__float');
const kits = sets.filter((s) => s.kind === 'kit' && !/set/i.test(s.name) && !/cologne|bain/i.test(s.slug));
kitList.innerHTML = kits.map((s) => `
  <li><a href="/produto.html?p=${s.slug}" data-family="${s.family || 'brume'}" data-cursor="Ver">
    <span class="kits__name">${s.name}</span>
    <span class="kits__desc">${s.desc}</span>
    <span class="kits__price">${brl(s.sizes[0].price)}</span>
  </a></li>`).join('');

if (fine && !reduced) {
  const xTo = gsap.quickTo(kitFloat, 'x', { duration: 0.6, ease: 'power3' });
  const yTo = gsap.quickTo(kitFloat, 'y', { duration: 0.6, ease: 'power3' });
  let current = '';
  kitList.addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); });
  kitList.querySelectorAll('a').forEach((a) => {
    a.addEventListener('pointerenter', () => {
      const fam = a.dataset.family;
      if (fam !== current) {
        kitFloat.innerHTML = [0, 1, 2].map(() => bottle({ family: fam, line: 'autoral', format: '5', label: false })).join('');
        current = fam;
      }
      kitFloat.classList.add('is-on');
    });
    a.addEventListener('pointerleave', () => kitFloat.classList.remove('is-on'));
  });
}

reveals();
