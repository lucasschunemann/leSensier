import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import wordmark from '../assets/wordmark-currentColor.svg?raw';
import { bag, brl, formatOf } from './store.js';
import { bottle } from './bottle.js';
import { fragrances, sets } from './catalog.js';
import { families, familyOrder } from './families.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const fine = window.matchMedia('(pointer: fine)').matches;
export let lenis = null;

const count = (fn) => fragrances.filter(fn).length;

function header() {
  const el = document.createElement('header');
  el.className = 'hd';
  el.innerHTML = `
    <nav class="hd__nav" aria-label="Principal">
      <div class="hd__item">
        <a href="/colecao.html" class="hd__link" aria-haspopup="true" aria-expanded="false" data-mega-trigger>Perfumes</a>
        <div class="mega" data-mega>
          <div class="mega__in">
            <div class="mega__col">
              <p class="mega__h">Ver</p>
              <a href="/colecao.html">Todos os perfumes <span>${fragrances.length}</span></a>
              <a href="/colecao.html?f=autoral">Autorais <span>${count((f) => f.line === 'autoral')}</span></a>
              <a href="/colecao.html?f=releitura">Releituras <span>${count((f) => f.line === 'releitura')}</span></a>
              <a href="/colecao.html?f=colonias">Colônias 200 ml <span>${count((f) => f.sizes.some((s) => /200/.test(s.label)))}</span></a>
            </div>
            <div class="mega__col mega__col--fam">
              <p class="mega__h">Famílias</p>
              ${familyOrder.filter((k) => k !== 'the').map((k) => `<a href="/colecao.html?f=${k}" data-fam="${k}">${families[k].name} <span>${count((f) => f.family === k)}</span></a>`).join('')}
            </div>
            <div class="mega__pic" aria-hidden="true">${bottle({ family: 'linge', name: 'Linge Lave', shadow: false })}</div>
          </div>
        </div>
      </div>
      <a href="/colecao.html?f=kits" class="hd__link">Kits</a>
      <a href="/colecao.html?f=corpo" class="hd__link">Corpo</a>
      <a href="/marca.html" class="hd__link">A marca</a>
    </nav>
    <a class="hd__logo" href="/" aria-label="Le Sensier, início">${wordmark}</a>
    <div class="hd__tools">
      <button type="button" class="hd__link" data-search-open>Buscar</button>
      <button type="button" class="hd__link" data-bag-open>Sacola (<span data-bag-count>0</span>)</button>
    </div>
    <button class="hd__menu" type="button" aria-expanded="false" aria-controls="menu">Menu</button>`;
  return el;
}

function menu() {
  const el = document.createElement('div');
  el.className = 'menu';
  el.id = 'menu';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<nav>
    <a href="/colecao.html">Todos os perfumes</a>
    <a href="/colecao.html?f=autoral">Autorais</a>
    <a href="/colecao.html?f=releitura">Releituras</a>
    <a href="/colecao.html?f=kits">Kits</a>
    <a href="/colecao.html?f=corpo">Corpo</a>
    <p class="menu__h">Famílias</p>
    <div class="menu__fams">${familyOrder.filter((k) => k !== 'the').map((k) => `<a href="/colecao.html?f=${k}">${families[k].name}</a>`).join('')}</div>
    <a href="/marca.html" class="menu__small">A marca</a>
  </nav>`;
  return el;
}

function searchPanel() {
  const el = document.createElement('div');
  el.className = 'search';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `
    <div class="search__veil" data-search-close></div>
    <div class="search__panel" role="dialog" aria-modal="true" aria-label="Buscar">
      <form class="search__form" role="search" onsubmit="return false">
        <input type="search" placeholder="Buscar por nome, nota ou família" aria-label="Buscar" autocomplete="off" />
        <button type="button" data-search-close>Fechar</button>
      </form>
      <ul class="search__results" aria-live="polite"></ul>
    </div>`;
  return el;
}

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function matches(p, q) {
  const text = norm([p.name, p.category, p.short, p.desc, families[p.family]?.name, p.line, ...(p.notes ? [...p.notes.top, ...p.notes.heart, ...p.notes.base] : []), ...(p.contents || [])]
    .filter(Boolean).join(' '));
  return norm(q).split(/\s+/).filter(Boolean).every((w) => text.includes(w));
}

function wireSearch() {
  const el = document.querySelector('.search');
  const input = el.querySelector('input');
  const list = el.querySelector('.search__results');
  const all = [...fragrances, ...sets];
  const render = () => {
    const q = input.value.trim();
    const hits = q ? all.filter((p) => matches(p, q)).slice(0, 12) : fragrances.slice(0, 6);
    list.innerHTML = (q ? '' : '<li class="search__hint">Sugestões</li>') + (hits.length ? hits.map((p) => `
      <li><a href="/produto.html?p=${p.slug}">
        <span class="search__thumb">${bottle({ family: p.family || 'brume', line: p.line || 'autoral', format: p.kind === 'corpo' ? 'jar' : p.kind === 'kit' ? '5' : '50', label: false, shadow: false })}</span>
        <span class="search__name">${p.name}</span>
        <span class="search__meta">${p.notes ? p.category : p.kind === 'corpo' ? 'Corpo' : 'Kit'}</span>
        <span class="search__price">${brl(p.sizes[0].price)}</span>
      </a></li>`).join('') : `<li class="search__hint">Nada encontrado para "${q.replace(/</g, '')}".</li>`);
  };
  input.addEventListener('input', render);
  const open = () => {
    render();
    document.documentElement.classList.add('search-open');
    el.setAttribute('aria-hidden', 'false');
    lenis?.stop();
    setTimeout(() => input.focus(), 50);
  };
  const close = () => {
    document.documentElement.classList.remove('search-open');
    el.setAttribute('aria-hidden', 'true');
    lenis?.start();
  };
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-search-open]')) open();
    if (e.target.closest('[data-search-close]')) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
    if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); open(); }
  });
}

function wireMega() {
  const item = document.querySelector('.hd__item');
  const trigger = item.querySelector('[data-mega-trigger]');
  const pic = item.querySelector('.mega__pic');
  let t;
  const set = (open) => {
    clearTimeout(t);
    t = setTimeout(() => {
      document.documentElement.classList.toggle('mega-open', open);
      trigger.setAttribute('aria-expanded', String(open));
    }, open ? 60 : 140);
  };
  item.addEventListener('pointerenter', () => set(true));
  item.addEventListener('pointerleave', () => set(false));
  item.addEventListener('focusin', () => set(true));
  item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) set(false); });
  item.querySelectorAll('[data-fam]').forEach((a) => a.addEventListener('pointerenter', () => {
    const k = a.dataset.fam;
    const f = fragrances.find((x) => x.family === k);
    pic.innerHTML = bottle({ family: k, line: f.line, name: f.name, shadow: false });
  }));
}

function drawer() {
  const el = document.createElement('aside');
  el.className = 'bag';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `
    <div class="bag__veil" data-bag-close></div>
    <div class="bag__panel" role="dialog" aria-modal="true" aria-labelledby="bag-title">
      <div class="bag__head"><h2 id="bag-title">Sacola</h2><button type="button" data-bag-close>Fechar</button></div>
      <ul class="bag__list"></ul>
      <div class="bag__foot">
        <p class="bag__total"><span>Subtotal</span><span data-bag-total></span></p>
        <p class="bag__note">Frete e pagamento no checkout.</p>
        <a class="btn btn--ink bag__go" data-bag-checkout href="#">Finalizar compra</a>
      </div>
    </div>`;
  return el;
}

function bagItem(i) {
  const fmt = i.kind === 'corpo' ? 'jar' : i.kind === 'kit' ? '5' : formatOf(i.label);
  return `<li class="bag__item">
    <div class="bag__thumb">${bottle({ family: i.family, line: i.line, name: i.name, format: fmt, label: false, shadow: false })}</div>
    <div class="bag__info">
      <p class="bag__name">${i.name}</p>
      <p class="bag__meta">${i.label === 'Único' ? '' : i.label}</p>
      <div class="qty">
        <button type="button" aria-label="Diminuir" data-qty="${i.id}" data-d="-1">−</button>
        <span>${i.qty}</span>
        <button type="button" aria-label="Aumentar" data-qty="${i.id}" data-d="1">+</button>
      </div>
    </div>
    <p class="bag__price">${brl(i.price * i.qty)}</p>
  </li>`;
}

export function openBag() {
  document.documentElement.classList.add('bag-open');
  document.querySelector('.bag').setAttribute('aria-hidden', 'false');
  lenis?.stop();
}
function closeBag() {
  document.documentElement.classList.remove('bag-open');
  document.querySelector('.bag').setAttribute('aria-hidden', 'true');
  lenis?.start();
}

function wireBag() {
  const list = document.querySelector('.bag__list');
  bag.on((items) => {
    document.querySelectorAll('[data-bag-count]').forEach((n) => (n.textContent = bag.count));
    list.innerHTML = items.length ? items.map(bagItem).join('') : '<li class="bag__empty">Sua sacola está vazia.</li>';
    document.querySelector('[data-bag-total]').textContent = brl(bag.total);
    document.querySelector('.bag__foot').hidden = !items.length;
  });
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-bag-open]')) openBag();
    if (e.target.closest('[data-bag-close]')) closeBag();
    const q = e.target.closest('[data-qty]');
    if (q) {
      const id = Number(q.dataset.qty);
      const item = bag.items.find((i) => i.id === id);
      bag.set(id, item.qty + Number(q.dataset.d));
    }
    if (e.target.closest('[data-bag-checkout]')) {
      e.preventDefault();
      window.location.href = bag.checkoutUrl();
    }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeBag(); });
}

function wireMenu() {
  const btn = document.querySelector('.hd__menu');
  const m = document.querySelector('.menu');
  btn.addEventListener('click', () => {
    const open = !document.documentElement.classList.contains('menu-open');
    document.documentElement.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Fechar' : 'Menu';
    m.setAttribute('aria-hidden', String(!open));
    if (open) {
      lenis?.stop();
      if (!reduced) gsap.fromTo(m.querySelectorAll('nav > *'), { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'expo.out', stagger: 0.03 });
    } else lenis?.start();
  });
}

// Transição curta entre páginas: o conteúdo esmaece ao sair e sobe ao entrar.
function wireTransitions() {
  const main = document.querySelector('main');
  if (!reduced) gsap.from(main, { autoAlpha: 0, y: 14, duration: 0.7, ease: 'expo.out', clearProps: 'all' });
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || reduced || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) {
      const t = document.querySelector(url.hash);
      if (t) { e.preventDefault(); lenis ? lenis.scrollTo(t, { offset: -70, duration: 1.2 }) : t.scrollIntoView(); }
      return;
    }
    if (url.href === location.href) return;
    e.preventDefault();
    gsap.to(main, { autoAlpha: 0, y: -8, duration: 0.22, ease: 'power2.in', onComplete: () => (location.href = url.href) });
  });
  window.addEventListener('pageshow', (e) => { if (e.persisted) gsap.set(main, { clearProps: 'all' }); });
}

export function reveals(root = document) {
  if (reduced) return;
  root.querySelectorAll('[data-split]').forEach((el) => {
    const split = SplitText.create(el, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, { yPercent: 105, duration: 1.1, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: el, start: 'top 92%' } });
  });
  root.querySelectorAll('[data-reveal]').forEach((el) => {
    gsap.from(el, { y: 24, autoAlpha: 0, duration: 1, ease: 'expo.out', delay: Number(el.dataset.reveal) || 0, scrollTrigger: { trigger: el, start: 'top 94%' } });
  });
}

function footer() {
  const el = document.createElement('footer');
  el.className = 'ft';
  el.innerHTML = `
    <nav class="ft__nav" aria-label="Rodapé">
      <div><h3>Perfumes</h3><a href="/colecao.html">Todos</a><a href="/colecao.html?f=autoral">Autorais</a><a href="/colecao.html?f=releitura">Releituras</a><a href="/colecao.html?f=colonias">Colônias</a></div>
      <div><h3>Famílias</h3>${familyOrder.filter((k) => k !== 'the').map((k) => `<a href="/colecao.html?f=${k}">${families[k].name}</a>`).join('')}</div>
      <div><h3>Loja</h3><a href="/colecao.html?f=kits">Kits</a><a href="/colecao.html?f=corpo">Corpo</a><a href="https://lesensier.com.br/pages/trocas-e-devolucoes">Trocas e devoluções</a></div>
      <div><h3>Casa</h3><a href="/marca.html">A marca</a></div>
    </nav>
    <a class="ft__mark" href="/" aria-label="Le Sensier">${wordmark}</a>
    <p class="ft__small"><span>© ${new Date().getFullYear()} Le Sensier</span><span>Perfumaria brasileira</span></p>`;
  return el;
}

export function boot() {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);
  document.body.prepend(header());
  document.body.append(menu(), searchPanel(), drawer(), footer());
  wireBag();
  wireMenu();
  wireMega();
  wireSearch();
  wireTransitions();

  if (!reduced) {
    lenis = new Lenis({ lerp: 0.12 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const hd = document.querySelector('.hd');
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => hd.classList.toggle('is-scrolled', s.scroll() > 8) });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

export { gsap, ScrollTrigger, SplitText };
