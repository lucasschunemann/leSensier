import { bottle } from './bottle.js';
import { families } from './families.js';
import { brl, bag, findProduct } from './store.js';

export function fragranceCard(f) {
  const main = f.sizes.find((s) => s.label === '50 ml') || f.sizes[0];
  const mini = f.sizes.find((s) => s.label === '5 ml');
  return `
  <article class="card">
    <a class="card__link" href="/produto.html?p=${f.slug}">
      <div class="card__media" style="--card-bg:${families[f.family].paper}">
        ${f.bestseller ? '<span class="card__tag">Mais vendido</span>' : ''}
        ${bottle({ family: f.family, line: f.line, name: f.name })}
      </div>
      <h3 class="card__name">${f.name}</h3>
      <p class="card__meta">${families[f.family].name} · ${f.line === 'autoral' ? 'Autoral' : 'Releitura'}</p>
      <p class="card__price">${brl(main.price)} <span>50 ml</span>${mini ? ` <span class="card__mini">5 ml ${brl(mini.price)}</span>` : ''}</p>
    </a>
    <button class="card__add" type="button" data-add="${f.slug}" data-size="${main.id}" aria-label="Adicionar ${f.name} 50 ml à sacola">Adicionar 50 ml</button>
  </article>`;
}

export function setCard(s) {
  const fam = s.family || 'brume';
  const body = s.kind === 'corpo';
  const media = body
    ? bottle({ family: fam, line: 'autoral', name: s.name.replace(/^Polpa /, ''), format: 'jar' })
    : `<div class="minis">${Array.from({ length: Math.min(4, s.contents.length || 3) }, () => bottle({ family: fam, line: 'autoral', format: '5', label: false })).join('')}</div>`;
  return `
  <article class="card">
    <a class="card__link" href="/produto.html?p=${s.slug}">
      <div class="card__media" style="--card-bg:${families[fam].paper}">${media}</div>
      <h3 class="card__name">${s.name}</h3>
      <p class="card__meta">${body ? 'Corpo' : s.contents.length ? `Kit · ${s.contents.length} × 5 ml` : 'Kit'}</p>
      <p class="card__price">${brl(s.sizes[0].price)}</p>
    </a>
    <button class="card__add" type="button" data-add="${s.slug}" data-size="${s.sizes[0].id}" aria-label="Adicionar ${s.name} à sacola">Adicionar</button>
  </article>`;
}

// Compra rápida a partir de qualquer grade
let wired = false;
export function wireQuickAdd() {
  if (wired) return;
  wired = true;
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-add][data-size]');
    if (!b) return;
    const p = findProduct(b.dataset.add);
    const size = p.sizes.find((s) => String(s.id) === b.dataset.size);
    bag.add(p, size);
    const prev = b.textContent;
    b.textContent = 'Na sacola';
    b.classList.add('is-done');
    setTimeout(() => { b.textContent = prev; b.classList.remove('is-done'); }, 1600);
  });
}
