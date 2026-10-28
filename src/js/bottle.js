import { families, caps } from './families.js';

let uid = 0;

export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + amt * 255)));
  return '#' + ((1 << 24) | (f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).slice(1);
}

function wrap(name, max) {
  const lines = [];
  let cur = '';
  for (const w of name.split(' ')) {
    if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; }
    else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const SANS = 'Geist, Helvetica, Arial, sans-serif';
const MONO = "'Geist Mono', ui-monospace, monospace";

/** Etiqueta de papel colada no vidro, texto alinhado à esquerda. */
function label({ x, y, w, h, name, size, kind = 'PARFUM' }) {
  const fs = Math.max(4.6, Math.min(8.2, w / 10.5));
  const lines = wrap(name.toUpperCase(), Math.floor(w / (fs * 0.66)));
  const px = x + w * 0.09;
  const meta = fs * 0.56;
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#F8F7F3"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#111" stroke-opacity=".06"/>
    <g fill="#111" font-family="${SANS}">
      <text x="${px}" y="${y + h * 0.2}" font-family="${MONO}" font-size="${meta}" letter-spacing=".4">LE SENSIER</text>
      ${lines.map((l, i) => `<text x="${px}" y="${y + h * 0.43 + i * fs * 1.12}" font-size="${fs}" font-weight="500" letter-spacing=".2">${esc(l)}</text>`).join('')}
      <text x="${px}" y="${y + h * 0.88}" font-family="${MONO}" font-size="${meta}" letter-spacing=".4">${kind}</text>
      <text x="${x + w * 0.91}" y="${y + h * 0.88}" font-family="${MONO}" font-size="${meta}" letter-spacing=".4" text-anchor="end">${esc(size)}</text>
    </g>`;
}

function glassDefs(id, tint, cap) {
  return `<defs>
    <linearGradient id="g${id}" x1="0" x2="1">
      <stop offset="0" stop-color="#111" stop-opacity=".10"/><stop offset=".07" stop-color="#fff" stop-opacity=".55"/>
      <stop offset=".5" stop-color="#fff" stop-opacity=".18"/><stop offset=".93" stop-color="#fff" stop-opacity=".45"/>
      <stop offset="1" stop-color="#111" stop-opacity=".12"/>
    </linearGradient>
    <linearGradient id="j${id}" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="${shade(tint, 0.03)}" stop-opacity=".85"/><stop offset="1" stop-color="${shade(tint, -0.05)}" stop-opacity=".95"/>
    </linearGradient>
    <linearGradient id="c${id}" x1="0" x2="1">
      <stop offset="0" stop-color="${cap.low}"/><stop offset=".18" stop-color="${cap.top}"/><stop offset=".75" stop-color="${cap.mid}"/><stop offset="1" stop-color="${cap.low}"/>
    </linearGradient>
    <radialGradient id="s${id}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#111" stop-opacity=".16"/><stop offset="1" stop-color="#111" stop-opacity="0"/></radialGradient>
  </defs>`;
}

/** Frasco reto de vidro com tampa em bloco. */
function flacon({ id, tint, cap, cx, top, bw, bh, cw, ch, r, name, size, labelOn, shadow, kind }) {
  const bx = cx - bw / 2, by = top + ch + 8;
  const wall = Math.max(4, bw * 0.06);
  const base = Math.max(8, bh * 0.08);
  const fill = by + bh * 0.16;
  const lw = bw * 0.7, lh = Math.min(bh * 0.42, lw * 0.86);
  return `
    ${shadow ? `<ellipse cx="${cx}" cy="${by + bh + 2}" rx="${bw * 0.62}" ry="5" fill="url(#s${id})"/>` : ''}
    <rect x="${cx - cw / 2}" y="${top}" width="${cw}" height="${ch}" rx="2" fill="url(#c${id})"/>
    <rect x="${cx - 7}" y="${top + ch}" width="14" height="8" fill="#cfccc6"/>
    <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${r}" fill="url(#g${id})" stroke="#111" stroke-opacity=".14"/>
    <rect x="${bx + wall}" y="${fill}" width="${bw - wall * 2}" height="${by + bh - base - fill}" rx="${r * 0.4}" fill="url(#j${id})"/>
    <rect x="${bx + wall}" y="${fill}" width="${bw - wall * 2}" height="1.2" fill="#fff" opacity=".7"/>
    <line x1="${cx}" y1="${by + 2}" x2="${cx}" y2="${by + bh - base - 3}" stroke="#111" stroke-opacity=".12" stroke-width="1.2"/>
    <rect x="${bx + 3}" y="${by + 4}" width="${Math.max(2, bw * 0.025)}" height="${bh - 10}" rx="1" fill="#fff" opacity=".7"/>
    <rect x="${bx + 2}" y="${by + bh - base}" width="${bw - 4}" height="${base - 2}" rx="${r * 0.6}" fill="#fff" opacity=".35"/>
    ${labelOn ? label({ x: cx - lw / 2, y: by + bh * 0.3, w: lw, h: lh, name, size, kind }) : ''}`;
}

/**
 * format: '50' parfum, '5' miniatura, '200' cologne, 'jar' polpa
 */
export function bottle({ family = 'brume', line = 'autoral', name = '', format = '50', label: labelOn = true, shadow = true } = {}) {
  const id = ++uid;
  const tint = (families[family] || families.brume).tint;
  const cap = caps[line] || caps.autoral;
  let body;
  if (format === '5') {
    body = flacon({ id, tint, cap, cx: 100, top: 122, bw: 70, bh: 120, cw: 46, ch: 30, r: 5, name, size: '5 ML', labelOn, shadow });
  } else if (format === '200') {
    body = flacon({ id, tint, cap, cx: 100, top: 22, bw: 124, bh: 214, cw: 72, ch: 40, r: 7, name, size: '200 ML', labelOn, shadow, kind: 'COLOGNE' });
  } else if (format === 'jar') {
    const cx = 100, top = 150, bw = 150, bh = 104;
    body = `
      ${shadow ? `<ellipse cx="${cx}" cy="${top + 34 + bh + 2}" rx="96" ry="6" fill="url(#s${id})"/>` : ''}
      <rect x="${cx - bw / 2 - 2}" y="${top}" width="${bw + 4}" height="34" rx="3" fill="url(#c${id})"/>
      <rect x="${cx - bw / 2}" y="${top + 34}" width="${bw}" height="${bh}" rx="10" fill="url(#g${id})" stroke="#111" stroke-opacity=".14"/>
      <rect x="${cx - bw / 2 + 8}" y="${top + 40}" width="${bw - 16}" height="${bh - 18}" rx="6" fill="url(#j${id})"/>
      <rect x="${cx - bw / 2 + 3}" y="${top + 38}" width="3" height="${bh - 10}" rx="1" fill="#fff" opacity=".7"/>
      ${labelOn ? label({ x: cx - 52, y: top + 50, w: 104, h: 62, name, size: '', kind: 'POLPA' }) : ''}`;
  } else {
    body = flacon({ id, tint, cap, cx: 100, top: 46, bw: 128, bh: 186, cw: 82, ch: 46, r: 7, name, size: '50 ML', labelOn, shadow });
  }
  return `<svg class="bottle" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(name || 'Frasco Le Sensier')}">${glassDefs(id, tint, cap)}<g class="bottle__g">${body}</g></svg>`;
}

/** Caixa: papel da família, texto preto alinhado à esquerda como a etiqueta. */
export function boxFront({ family = 'brume', name = '', line = 'autoral', sub = '50 ML' } = {}) {
  const f = families[family] || families.brume;
  const lines = wrap(name.toUpperCase(), 14);
  return `<svg class="box" viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Caixa ${esc(name)}">
    <rect width="200" height="280" fill="${f.paper}"/>
    <rect width="200" height="280" fill="none" stroke="#111" stroke-opacity=".08"/>
    <g fill="#111" font-family="${SANS}">
      <text x="20" y="34" font-family="${MONO}" font-size="7" letter-spacing=".6">LE SENSIER</text>
      <text x="180" y="34" font-family="${MONO}" font-size="7" letter-spacing=".6" text-anchor="end">${line === 'autoral' ? 'AUTORAL' : 'RELEITURA'}</text>
      ${lines.map((l, i) => `<text x="20" y="${214 + i * 15}" font-size="13" font-weight="500">${esc(l)}</text>`).join('')}
      <text x="20" y="262" font-family="${MONO}" font-size="7" letter-spacing=".6">PARFUM</text>
      <text x="180" y="262" font-family="${MONO}" font-size="7" letter-spacing=".6" text-anchor="end">${esc(sub)}</text>
    </g>
  </svg>`;
}
