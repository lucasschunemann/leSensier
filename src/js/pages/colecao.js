import { boot, reveals, reduced, gsap, ScrollTrigger } from '../shell.js';
import { fragrances, sets } from '../catalog.js';
import { families, familyOrder } from '../families.js';
import { fragranceCard, setCard } from '../cards.js';

boot();

const FILTERS = [
  ['todos', 'Todos'],
  ['autoral', 'Autorais'],
  ['releitura', 'Releituras'],
  ['kits', 'Kits'],
  ['corpo', 'Corpo'],
  null,
  ...familyOrder.filter((k) => k !== 'the').map((k) => [k, families[k].name]),
];

const bar = document.querySelector('.filters__in');
bar.innerHTML = FILTERS.map((f) => (f ? `<button type="button" data-f="${f[0]}" aria-pressed="false">${f[1]}</button>` : '<span class="filters__sep" aria-hidden="true"></span>')).join('') + '<span class="filters__count"></span>';

const grid = document.querySelector('[data-grid]');
const count = document.querySelector('.filters__count');

function items(f) {
  const kits = sets.filter((s) => s.kind === 'kit');
  const body = sets.filter((s) => s.kind === 'corpo');
  if (f === 'autoral' || f === 'releitura') return fragrances.filter((x) => x.line === f).map(fragranceCard);
  if (f === 'kits') return kits.map((s, i) => setCard(s, { wide: i === 0 }));
  if (f === 'corpo') return body.map((s) => setCard(s));
  if (families[f]) return [
    ...fragrances.filter((x) => x.family === f).map(fragranceCard),
    ...sets.filter((s) => s.family === f).map((s) => setCard(s)),
  ];
  // Todos: fragrâncias por família, kits intercalados após as Linge
  const out = [];
  familyOrder.forEach((k) => {
    fragrances.filter((x) => x.family === k).forEach((x) => out.push(fragranceCard(x)));
    if (k === 'linge') out.push(setCard(sets.find((s) => s.slug === 'les-linges'), { wide: true }));
    if (k === 'sorbet') out.push(setCard(sets.find((s) => s.slug === 'les-sorbets'), { wide: true }));
  });
  kits.filter((s) => !['les-linges', 'les-sorbets'].includes(s.slug)).forEach((s) => out.push(setCard(s)));
  body.forEach((s) => out.push(setCard(s)));
  return out;
}

function render(f, animate = true) {
  bar.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.f === f)));
  const list = items(f);
  const go = () => {
    grid.innerHTML = list.length ? list.join('') : '<p class="grid__empty">Nada por aqui ainda.</p>';
    count.textContent = `${list.length} ${list.length === 1 ? 'item' : 'itens'}`;
    if (!reduced) {
      gsap.from(grid.children, { y: 50, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: { each: 0.05, amount: 0.6 }, clearProps: 'all' });
    }
    ScrollTrigger.refresh();
  };
  if (animate && !reduced && grid.children.length) {
    gsap.to(grid.children, { y: -20, autoAlpha: 0, duration: 0.35, ease: 'power2.in', stagger: { amount: 0.15 }, onComplete: go });
  } else go();
  const url = new URL(location.href);
  if (f === 'todos') url.searchParams.delete('f'); else url.searchParams.set('f', f);
  history.replaceState(null, '', url);
}

bar.addEventListener('click', (e) => {
  const b = e.target.closest('[data-f]');
  if (b) render(b.dataset.f);
});

const start = new URLSearchParams(location.search).get('f') || 'todos';
render(FILTERS.some((f) => f && f[0] === start) ? start : 'todos', false);
reveals();
