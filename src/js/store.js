import { fragrances, sets } from './catalog.js';

const KEY = 'ls-bag';
const SHOP = 'https://lesensier.com.br';
const listeners = new Set();

export const brl = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function findProduct(slug) {
  return fragrances.find((f) => f.slug === slug) || sets.find((s) => s.slug === slug);
}

export function formatOf(label) {
  if (/200/.test(label)) return '200';
  if (/^5 ml/.test(label)) return '5';
  return '50';
}

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}
function write(items) {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* sem storage: sacola vive só nesta página */ }
  memory = items;
  listeners.forEach((fn) => fn(items));
}
let memory = read();

export const bag = {
  get items() { return memory; },
  get count() { return memory.reduce((a, i) => a + i.qty, 0); },
  get total() { return memory.reduce((a, i) => a + i.qty * i.price, 0); },
  add(product, size) {
    const items = [...memory];
    const hit = items.find((i) => i.id === size.id);
    if (hit) hit.qty += 1;
    else items.push({
      id: size.id, qty: 1, slug: product.slug, name: product.name, label: size.label, price: size.price,
      family: product.family || 'brume', line: product.line || 'autoral', kind: product.kind || 'parfum',
    });
    write(items);
  },
  set(id, qty) {
    write(memory.map((i) => (i.id === id ? { ...i, qty } : i)).filter((i) => i.qty > 0));
  },
  on(fn) { listeners.add(fn); fn(memory); return () => listeners.delete(fn); },
  // Permalink de carrinho da Shopify: leva os itens direto para o checkout da loja atual.
  checkoutUrl() { return `${SHOP}/cart/${memory.map((i) => `${i.id}:${i.qty}`).join(',')}`; },
};
