import { boot, reveals, reduced, fine, gsap, openBag } from '../shell.js';
import { fragrances, sets } from '../catalog.js';
import { families } from '../families.js';
import { bottle } from '../bottle.js';
import { bag, brl, findProduct, formatOf } from '../store.js';
import { fragranceCard, setCard } from '../cards.js';

boot();

const params = new URLSearchParams(location.search);
const p = findProduct(params.get('p')) || fragrances.find((f) => f.slug === 'brume-de-bain');
const isSet = !p.notes;
const fam = families[p.family || 'brume'];
const LEVELS = ['Leve', 'Leve a moderada', 'Moderada', 'Moderada a intensa', 'Intensa'];

document.title = `${p.name} · Le Sensier`;
document.querySelector('meta[name="description"]').content = isSet ? p.desc : `${p.name}: ${p.short} ${p.category}.`;
document.documentElement.style.setProperty('--fam-paper', fam.paper);

function formatFor(size) {
  if (isSet) return p.kind === 'corpo' ? 'jar' : '5';
  return formatOf(size.label);
}

function media(size) {
  if (isSet && p.kind === 'kit') {
    const n = Math.min(6, p.contents.length || 4);
    return `<div class="minis" style="display:flex;align-items:end;justify-content:center">${Array.from({ length: n }, () => bottle({ family: p.family || 'brume', line: 'autoral', format: '5', label: false })).join('')}</div>`;
  }
  return bottle({ family: p.family || 'brume', line: p.line || 'autoral', name: isSet ? p.name.replace(/^Polpa /, '') : p.name, format: formatFor(size) });
}

function intensityIndex(txt) {
  const t = txt.toLowerCase();
  if (t.includes('média a alta')) return 3;
  const i = LEVELS.findIndex((l) => l.toLowerCase() === t);
  return i < 0 ? 2 : i;
}

const pre = params.get('s');
let size = p.sizes.find((s) => s.label === pre) || p.sizes[0];

const el = document.querySelector('[data-pdp]');
el.innerHTML = `
  <div class="pdp__media">
    <span class="pdp__word" aria-hidden="true">${fam.name}</span>
    <div class="pdp__bottle">${media(size)}</div>
  </div>
  <div class="pdp__info">
    <nav class="pdp__crumbs" aria-label="Caminho">
      <a href="/colecao.html">Coleção</a><span>/</span>
      ${isSet ? `<a href="/colecao.html?f=${p.kind === 'corpo' ? 'corpo' : 'kits'}">${p.kind === 'corpo' ? 'Corpo' : 'Kits'}</a>` : `<a href="/colecao.html?f=${p.family}">${fam.name}</a>`}
    </nav>
    <header style="display:grid;gap:14px">
      ${isSet ? '' : `<p class="label">${p.line === 'autoral' ? 'Autoral' : 'Releitura'}${p.bestseller ? ' · Mais vendido da casa' : ''}</p>`}
      <h1 class="pdp__title" data-split>${p.name}</h1>
      ${isSet ? '' : `<p class="pdp__cat">${p.category}</p>`}
    </header>
    <p class="pdp__short" data-reveal>${isSet ? p.desc : p.short}</p>

    ${p.sizes.length > 1 ? `
    <fieldset class="sizes">
      <legend>Tamanho</legend>
      ${p.sizes.map((s) => `
        <label><input type="radio" name="size" value="${s.id}" ${s.id === size.id ? 'checked' : ''} />
          <span>${s.label}<small>${brl(s.price)}</small></span></label>`).join('')}
    </fieldset>` : ''}

    <div class="buy">
      <p class="buy__price" data-price>${brl(size.price)}</p>
      <button class="btn btn--ink" type="button" data-add ${size.available ? '' : 'disabled'}>${size.available ? 'Adicionar à sacola' : 'Esgotado'}</button>
    </div>
    <p class="pdp__added" role="status" aria-live="polite"></p>

    ${isSet ? (p.contents.length ? `
      <div>
        <p class="label" style="margin-bottom:12px">O kit contém</p>
        <ul class="pdp__contents">${p.contents.map((c) => `<li>${c}${p.kind === 'kit' ? ' <span class="label" style="margin-left:8px">5 ml</span>' : ''}</li>`).join('')}</ul>
      </div>` : '') : `
      <div class="notes">
        ${[['Saída', p.notes.top], ['Coração', p.notes.heart], ['Fundo', p.notes.base]].filter(([, n]) => n.length).map(([t, n]) => `
          <div class="notes__row"><h3>${t}</h3><ul>${n.map((x) => `<li>${x}</li>`).join('')}</ul></div>`).join('')}
      </div>
      <div class="intensity">
        <p class="label">Intensidade</p>
        <div class="intensity__bar" aria-hidden="true">${LEVELS.map((_, i) => `<i class="${i <= intensityIndex(p.intensity) ? 'on' : ''}"></i>`).join('')}</div>
        <p>${p.intensity}</p>
      </div>`}
  </div>`;

const bottleEl = el.querySelector('.pdp__bottle');
const priceEl = el.querySelector('[data-price]');
const addBtn = el.querySelector('[data-add]');
const status = el.querySelector('.pdp__added');

el.querySelectorAll('input[name="size"]').forEach((input) => {
  input.addEventListener('change', () => {
    size = p.sizes.find((s) => String(s.id) === input.value);
    priceEl.textContent = brl(size.price);
    addBtn.disabled = !size.available;
    addBtn.textContent = size.available ? 'Adicionar à sacola' : 'Esgotado';
    const swap = () => { bottleEl.innerHTML = media(size); };
    if (reduced) return swap();
    gsap.timeline()
      .to(bottleEl, { y: 40, autoAlpha: 0, duration: 0.35, ease: 'power2.in', onComplete: swap })
      .to(bottleEl, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'expo.out' });
  });
});

addBtn.addEventListener('click', () => {
  bag.add(p, size);
  status.textContent = `${p.name}${size.label !== 'Único' ? `, ${size.label}` : ''} foi para a sacola.`;
  if (!reduced) {
    const clone = bottleEl.cloneNode(true);
    const r = bottleEl.getBoundingClientRect();
    const target = document.querySelector('.hd__bag').getBoundingClientRect();
    Object.assign(clone.style, { position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', zIndex: 80, pointerEvents: 'none' });
    document.body.appendChild(clone);
    gsap.to(clone, {
      x: target.left - r.left - r.width / 2 + 20, y: target.top - r.top - r.height / 2, scale: 0.08, autoAlpha: 0.2,
      duration: 0.9, ease: 'power3.inOut', onComplete: () => { clone.remove(); openBag(); },
    });
  } else openBag();
});

// Frasco reage ao ponteiro e à rolagem
if (!reduced) {
  gsap.from(bottleEl, { y: 80, autoAlpha: 0, scale: 0.96, duration: 1.6, ease: 'expo.out', delay: 0.3 });
  gsap.from('.pdp__word', { xPercent: 12, autoAlpha: 0, duration: 2, ease: 'expo.out' });
  if (fine) {
    const box = el.querySelector('.pdp__media');
    const rx = gsap.quickTo(bottleEl, 'rotationY', { duration: 0.8, ease: 'power3' });
    const ry = gsap.quickTo(bottleEl, 'rotationX', { duration: 0.8, ease: 'power3' });
    gsap.set(box, { perspective: 900 });
    box.addEventListener('pointermove', (e) => {
      const b = box.getBoundingClientRect();
      rx(((e.clientX - b.left) / b.width - 0.5) * 26);
      ry(-((e.clientY - b.top) / b.height - 0.5) * 14);
    });
    box.addEventListener('pointerleave', () => { rx(0); ry(0); });
  }
  gsap.to('.pdp__word', { xPercent: -14, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
  gsap.from('.intensity__bar i.on', { scaleX: 0, duration: 0.8, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.intensity', start: 'top 90%' } });
  gsap.from('.notes__row', { y: 24, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.notes', start: 'top 90%' } });
}

// Relacionados
const rel = document.querySelector('[data-related]');
const same = isSet
  ? sets.filter((s) => s.slug !== p.slug && s.kind === p.kind).slice(0, 4).map((s) => setCard(s))
  : fragrances.filter((f) => f.family === p.family && f.slug !== p.slug).slice(0, 4).map(fragranceCard);
if (same.length) {
  rel.hidden = false;
  rel.querySelector('h2').textContent = isSet ? (p.kind === 'corpo' ? 'Mais para o corpo' : 'Outros kits') : `Mais ${fam.name}`;
  rel.querySelector('.grid').innerHTML = same.join('');
  rel.querySelector('.grid').setAttribute('data-stagger', '');
}

reveals();
