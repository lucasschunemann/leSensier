import { gsap, ScrollTrigger, reduced, matches } from './shell.js';
import { fragrances, sets } from './catalog.js';
import { families, familyOrder } from './families.js';
import { fragranceCard, setCard, wireQuickAdd } from './cards.js';

export const FILTERS = [
  ['todos', 'Todos'],
  ['autoral', 'Autorais'],
  ['releitura', 'Releituras'],
  ...familyOrder.filter((k) => k !== 'the').map((k) => [k, families[k].name]),
  ['colonias', 'Colônias'],
  ['kits', 'Kits'],
  ['corpo', 'Corpo'],
];

function pick(f) {
  const kits = sets.filter((s) => s.kind === 'kit');
  const body = sets.filter((s) => s.kind === 'corpo');
  if (f === 'autoral' || f === 'releitura') return fragrances.filter((x) => x.line === f);
  if (f === 'colonias') return fragrances.filter((x) => x.sizes.some((s) => /200/.test(s.label)));
  if (f === 'kits') return kits;
  if (f === 'corpo') return body;
  if (families[f]) return [...fragrances.filter((x) => x.family === f), ...sets.filter((s) => s.family === f && s.kind === 'kit')];
  return fragrances;
}

/**
 * Grade com filtros e busca. Usada na home e na coleção.
 * root precisa conter [data-filters], [data-grid] e opcionalmente [data-q] e [data-count].
 */
export function catalogView(root, { syncUrl = false, initial = 'todos', onChange } = {}) {
  const bar = root.querySelector('[data-filters]');
  const grid = root.querySelector('[data-grid]');
  const q = root.querySelector('[data-q]');
  const countEl = root.querySelector('[data-count]');
  let current = FILTERS.some(([k]) => k === initial) ? initial : 'todos';

  bar.innerHTML = FILTERS.map(([k, t]) => `<button type="button" data-f="${k}" aria-pressed="false">${t}</button>`).join('');

  function render(animate) {
    bar.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.f === current)));
    const text = q?.value.trim() || '';
    let list = pick(current);
    if (text) list = [...fragrances, ...sets].filter((p) => matches(p, text) && (current === 'todos' || pick(current).includes(p)));
    grid.innerHTML = list.length
      ? list.map((p) => (p.notes ? fragranceCard(p) : setCard(p))).join('')
      : `<p class="grid__empty">Nada encontrado${text ? ` para "${text.replace(/</g, '')}"` : ''}.</p>`;
    if (countEl) countEl.textContent = `${list.length} ${list.length === 1 ? 'produto' : 'produtos'}`;
    if (animate && !reduced) {
      gsap.fromTo(grid.children, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out', stagger: { each: 0.03, amount: 0.35 }, clearProps: 'all' });
    }
    ScrollTrigger.refresh();
    onChange?.(current);
    if (syncUrl) {
      const url = new URL(location.href);
      if (current === 'todos') url.searchParams.delete('f'); else url.searchParams.set('f', current);
      history.replaceState(null, '', url);
    }
  }

  bar.addEventListener('click', (e) => {
    const b = e.target.closest('[data-f]');
    if (!b) return;
    current = b.dataset.f;
    b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced ? 'auto' : 'smooth' });
    render(true);
  });
  q?.addEventListener('input', () => render(false));

  wireQuickAdd();
  render(false);
  return { set: (f) => { current = f; render(true); } };
}
