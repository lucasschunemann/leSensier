import { bottle } from './bottle.js';
import { families } from './families.js';
import { brl } from './store.js';

export function fragranceCard(f) {
  const mini = f.sizes.find((s) => s.label === '5 ml');
  const big = f.sizes.find((s) => s.label === '50 ml') || f.sizes[0];
  return `
  <a class="card" href="/produto.html?p=${f.slug}" data-cursor="Ver" style="--card-bg:${families[f.family].paper}">
    <div class="card__media">
      <span class="card__tag">${f.line === 'autoral' ? 'Autoral' : 'Releitura'}${f.bestseller ? ' · Mais vendido' : ''}</span>
      ${bottle({ family: f.family, line: f.line, name: f.name })}
    </div>
    <h3 class="card__name">${f.name}</h3>
    <p class="card__short">${f.short}</p>
    <p class="card__meta"><span>${families[f.family].name} · ${f.category}</span><span>${brl(big.price)}</span></p>
    ${mini ? `<p class="card__short">Miniatura 5 ml: ${brl(mini.price)}</p>` : ''}
  </a>`;
}

export function setCard(s, { wide = false } = {}) {
  const fam = s.family || 'brume';
  const body = s.kind === 'corpo';
  const media = body
    ? bottle({ family: fam, line: 'autoral', name: s.name.replace(/^Polpa /, ''), format: 'jar' })
    : Array.from({ length: Math.min(6, s.contents.length || 4) }, () => bottle({ family: fam, line: 'autoral', format: '5', label: false })).join('');
  const tag = body ? 'Corpo' : 'Kit';
  return `
  <a class="card${wide ? ' card--wide' : ''}" href="/produto.html?p=${s.slug}" data-cursor="Ver" style="--card-bg:${families[fam].paper}">
    <div class="card__media${body ? '' : ' minis'}">
      <span class="card__tag">${tag}</span>
      ${media}
    </div>
    <h3 class="card__name">${s.name}</h3>
    <p class="card__short">${s.desc}</p>
    <p class="card__meta"><span>${tag}</span><span>${brl(s.sizes[0].price)}</span></p>
  </a>`;
}
