import { boot, reveals, reduced, gsap, SplitText } from '../shell.js';
import { families, familyOrder, caps } from '../families.js';
import { fragrances } from '../catalog.js';
import { bottle } from '../bottle.js';
import { brl } from '../store.js';
import { catalogView } from '../catalogView.js';
import * as THREE from 'three';

boot();

document.querySelectorAll('[data-bottle]').forEach((el) => (el.innerHTML = bottle(JSON.parse(el.dataset.bottle))));

const min50 = Math.min(...fragrances.map((f) => (f.sizes.find((s) => s.label === '50 ml') || f.sizes[0]).price));
const min5 = Math.min(...fragrances.flatMap((f) => f.sizes.filter((s) => s.label === '5 ml').map((s) => s.price)));
document.querySelector('[data-hero-sub]').textContent = `${fragrances.length} perfumes em seis famílias. Parfum 50 ml a partir de ${brl(min50)}, miniaturas de 5 ml a partir de ${brl(min5)}.`;

/* ---------- Hero: frasco 3D que troca de família ---------- */
const lead = { linge: 'linge-lave', brume: 'brume-de-bain', sorbet: 'sorbet-melon', brise: 'brise-de-bergamote', souffle: 'souffle-de-santal', douceur: 'douceur-de-litchi' };
const heroFams = familyOrder.filter((k) => k !== 'the');
const tabs = document.querySelector('[data-hero-tabs]');
tabs.innerHTML = heroFams.map((k, i) => `<button type="button" role="tab" data-k="${k}" aria-selected="${i === 0}">${families[k].name}</button>`).join('');
const famEl = document.querySelector('[data-hero-fam]');
const linkEl = document.querySelector('[data-hero-link]');
const stage = document.querySelector('.hero__stage');

let gl = null;
try {
  await Promise.all([document.fonts.load('500 80px Geist'), document.fonts.load('400 40px "Geist Mono"')]).catch(() => {});
  const { createBottle } = await import('../bottle3d.js');
  gl = createBottle(document.querySelector('.hero__gl'), { background: families.linge.paper });
} catch (err) {
  console.warn('WebGL indisponível, usando frasco em SVG.', err);
  stage.classList.add('no-gl');
}

const tween = (color, hex) => {
  const c = new THREE.Color(hex);
  gsap.to(color, { r: c.r, g: c.g, b: c.b, duration: 1.2, ease: 'power2.inOut' });
};

let current = null;
function show(k, animate = true) {
  if (k === current) return;
  current = k;
  const f = fragrances.find((x) => x.slug === lead[k]);
  const fam = families[k];
  const n = fragrances.filter((x) => x.family === k).length;
  tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.k === k)));
  famEl.textContent = `${fam.name}. ${fam.text}`;
  linkEl.textContent = `Ver ${n === 1 ? 'o perfume' : `os ${n} perfumes`}`;
  linkEl.href = `/colecao.html?f=${k}`;

  if (!gl) {
    stage.style.background = fam.paper;
    document.querySelector('.hero__fallback').innerHTML = bottle({ family: k, line: f.line, name: f.name });
    return;
  }
  const apply = () => {
    gl.drawLabel(f.name);
    gl.cap.color.set(caps[f.line].mid);
  };
  if (!animate || reduced) {
    apply();
    gl.juice.color.set(fam.tint);
    gl.scene.background.set(fam.paper);
    return;
  }
  // Um giro completo: a etiqueta troca quando está de costas
  let swapped = false;
  gsap.to(gl.state, {
    spin: gl.state.spin + Math.PI * 2, duration: 1.4, ease: 'expo.inOut',
    onUpdate() { if (!swapped && this.progress() > 0.5) { apply(); swapped = true; } },
  });
  tween(gl.juice.color, fam.tint);
  tween(gl.scene.background, fam.paper);
}

let auto = null;
const cycle = () => {
  clearInterval(auto);
  auto = setInterval(() => show(heroFams[(heroFams.indexOf(current) + 1) % heroFams.length]), 5000);
};
tabs.addEventListener('click', (e) => {
  const b = e.target.closest('[data-k]');
  if (!b) return;
  clearInterval(auto);
  auto = 'stopped';
  show(b.dataset.k);
});
show(heroFams[0], false);
if (!reduced) cycle();
document.addEventListener('visibilitychange', () => {
  if (auto === 'stopped' || reduced) return;
  if (document.hidden) clearInterval(auto); else cycle();
});

if (!reduced) {
  const title = SplitText.create('.hero__title', { type: 'lines', mask: 'lines' });
  gsap.timeline({ delay: 0.1 })
    .from(title.lines, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.07 })
    .from('.hero__sub, .hero__cta', { y: 16, autoAlpha: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 }, '-=0.8')
    .from('.hero__stage', { clipPath: 'inset(6% 6% 6% 6%)', duration: 1.4, ease: 'expo.out' }, 0)
    .from('.hero__fams button', { y: 10, autoAlpha: 0, duration: 0.6, ease: 'expo.out', stagger: 0.04 }, '-=1');
}

/* ---------- Loja ---------- */
catalogView(document.querySelector('.shop'));

reveals();
