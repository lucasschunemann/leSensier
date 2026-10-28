import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import wordmark from '../assets/wordmark-currentColor.svg?raw';
import { bag, brl, formatOf } from './store.js';
import { bottle } from './bottle.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const fine = window.matchMedia('(pointer: fine)').matches;
export let lenis = null;

const NAV = [
  ['Coleção', '/colecao.html'],
  ['Kits', '/colecao.html?f=kits'],
  ['Famílias', '/#familias'],
  ['A marca', '/marca.html'],
];

function header(dark) {
  const el = document.createElement('header');
  el.className = 'hd' + (dark ? ' hd--dark' : '');
  el.innerHTML = `
    <a class="hd__logo" href="/" aria-label="Le Sensier, início">${wordmark}</a>
    <nav class="hd__nav" aria-label="Principal">
      ${NAV.map(([t, h]) => `<a href="${h}">${t}</a>`).join('')}
    </nav>
    <button class="hd__bag" type="button" data-bag-open>Sacola <span data-bag-count>0</span></button>
    <button class="hd__menu" type="button" aria-expanded="false" aria-controls="menu">Menu</button>`;
  return el;
}

function menu() {
  const el = document.createElement('div');
  el.className = 'menu';
  el.id = 'menu';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<nav>${NAV.map(([t, h]) => `<a href="${h}"><span>${t}</span></a>`).join('')}</nav>`;
  return el;
}

function drawer() {
  const el = document.createElement('aside');
  el.className = 'bag';
  el.setAttribute('aria-hidden', 'true');
  el.setAttribute('aria-label', 'Sacola');
  el.innerHTML = `
    <div class="bag__veil" data-bag-close></div>
    <div class="bag__panel" role="dialog" aria-modal="true" aria-labelledby="bag-title">
      <div class="bag__head"><h2 id="bag-title">Sacola</h2><button type="button" data-bag-close>Fechar</button></div>
      <ul class="bag__list"></ul>
      <div class="bag__foot">
        <p class="bag__total"><span>Subtotal</span><span data-bag-total></span></p>
        <p class="bag__note">Frete e pagamento são calculados no checkout.</p>
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
      gsap.fromTo(m.querySelectorAll('span'), { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06 });
    } else lenis?.start();
  });
}

// Transição entre páginas: cortina sobe ao sair, desce ao entrar.
function wireTransitions() {
  const curtain = document.createElement('div');
  curtain.className = 'curtain';
  curtain.innerHTML = `<div class="curtain__mark">${wordmark}</div>`;
  document.body.appendChild(curtain);

  const entering = sessionStorage.getItem('ls-nav') === '1';
  sessionStorage.removeItem('ls-nav');
  if (entering && !reduced) {
    gsap.set(curtain, { yPercent: 0 });
    gsap.to(curtain, { yPercent: -100, duration: 1.1, ease: 'expo.inOut', delay: 0.1 });
  } else gsap.set(curtain, { yPercent: 100 });

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || reduced || e.metaKey || e.ctrlKey || a.target === '_blank') return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) {
      const t = document.querySelector(url.hash);
      if (t) { e.preventDefault(); closeMenuIfOpen(); lenis ? lenis.scrollTo(t, { duration: 1.6 }) : t.scrollIntoView(); }
      return;
    }
    if (url.href === location.href) return;
    e.preventDefault();
    sessionStorage.setItem('ls-nav', '1');
    gsap.fromTo(curtain, { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: 'expo.inOut', onComplete: () => (location.href = url.href) });
  });
  window.addEventListener('pageshow', (e) => { if (e.persisted) gsap.set(curtain, { yPercent: 100 }); });
}

function closeMenuIfOpen() {
  if (document.documentElement.classList.contains('menu-open')) document.querySelector('.hd__menu').click();
}

function wireCursor() {
  if (!fine || reduced) return;
  const c = document.createElement('div');
  c.className = 'cursor';
  c.innerHTML = '<span class="cursor__label"></span>';
  document.body.appendChild(c);
  const label = c.firstChild;
  const xTo = gsap.quickTo(c, 'x', { duration: 0.35, ease: 'power3' });
  const yTo = gsap.quickTo(c, 'y', { duration: 0.35, ease: 'power3' });
  window.addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); c.classList.add('is-on'); });
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cursor]');
    const link = e.target.closest('a, button, [role="button"], input, label');
    c.classList.toggle('is-label', !!t);
    c.classList.toggle('is-link', !t && !!link);
    label.textContent = t ? t.dataset.cursor : '';
  });
  document.addEventListener('pointerleave', () => c.classList.remove('is-on'));
}

// Revelações reutilizáveis
export function reveals(root = document) {
  if (reduced) return;
  root.querySelectorAll('[data-split]').forEach((el) => {
    const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'ln' });
    gsap.from(split.lines, {
      yPercent: 105, duration: 1.2, ease: 'expo.out', stagger: 0.08,
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });
  root.querySelectorAll('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 40, autoAlpha: 0, duration: 1.2, ease: 'expo.out', delay: Number(el.dataset.reveal) || 0,
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  });
  root.querySelectorAll('[data-stagger]').forEach((el) => {
    gsap.from(el.children, {
      y: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07,
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });
}

function footer() {
  const el = document.createElement('footer');
  el.className = 'ft';
  el.innerHTML = `
    <div class="ft__top">
      <p class="ft__line">Perfumaria brasileira. Criações autorais e releituras.</p>
      <nav class="ft__nav" aria-label="Rodapé">
        <div><h3>Loja</h3><a href="/colecao.html">Coleção</a><a href="/colecao.html?f=autoral">Autorais</a><a href="/colecao.html?f=releitura">Releituras</a><a href="/colecao.html?f=kits">Kits</a><a href="/colecao.html?f=corpo">Corpo</a></div>
        <div><h3>Casa</h3><a href="/#familias">Famílias</a><a href="/marca.html">A marca</a><a href="https://lesensier.com.br/pages/trocas-e-devolucoes">Trocas e devoluções</a></div>
      </nav>
    </div>
    <a class="ft__mark" href="/" aria-label="Le Sensier">${wordmark}</a>
    <p class="ft__small">© ${new Date().getFullYear()} Le Sensier</p>`;
  return el;
}

export function boot({ dark = false } = {}) {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);
  document.body.prepend(header(dark));
  document.body.append(menu(), drawer());
  document.body.append(footer());
  wireBag();
  wireMenu();
  wireTransitions();
  wireCursor();

  if (!reduced) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Cabeçalho some ao rolar para baixo, volta ao subir
  const hd = document.querySelector('.hd');
  let last = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (s) => {
      const y = s.scroll();
      hd.classList.toggle('is-hidden', y > 200 && y > last && !document.documentElement.classList.contains('menu-open'));
      hd.classList.toggle('is-scrolled', y > 40);
      last = y;
    },
  });

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

export { gsap, ScrollTrigger, SplitText };
