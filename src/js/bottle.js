import { families, caps } from './families.js';

let uid = 0;

function lum(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + amt * 255)));
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

function wrap(name, max = 15) {
  const words = name.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; }
    else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function defs(id, tint, cap) {
  return `
  <defs>
    <linearGradient id="cap${id}" x1="0" x2="1">
      <stop offset="0" stop-color="${cap.low}"/><stop offset=".32" stop-color="${cap.top}"/>
      <stop offset=".6" stop-color="${cap.mid}"/><stop offset="1" stop-color="${cap.low}"/>
    </linearGradient>
    <linearGradient id="collar${id}" x1="0" x2="1">
      <stop offset="0" stop-color="#9d978b"/><stop offset=".35" stop-color="#e8e4dc"/><stop offset="1" stop-color="#8f897d"/>
    </linearGradient>
    <linearGradient id="glass${id}" x1="0" x2="1">
      <stop offset="0" stop-color="#141311" stop-opacity=".16"/><stop offset=".12" stop-color="#ffffff" stop-opacity=".35"/>
      <stop offset=".5" stop-color="#ffffff" stop-opacity=".12"/><stop offset=".88" stop-color="#ffffff" stop-opacity=".3"/>
      <stop offset="1" stop-color="#141311" stop-opacity=".18"/>
    </linearGradient>
    <linearGradient id="juice${id}" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="${shade(tint, 0.08)}"/><stop offset="1" stop-color="${shade(tint, -0.06)}"/>
    </linearGradient>
    <linearGradient id="juiceSide${id}" x1="0" x2="1">
      <stop offset="0" stop-color="#141311" stop-opacity=".16"/><stop offset=".25" stop-color="#141311" stop-opacity="0"/>
      <stop offset=".8" stop-color="#ffffff" stop-opacity=".1"/><stop offset="1" stop-color="#141311" stop-opacity=".14"/>
    </linearGradient>
    <linearGradient id="base${id}" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".5"/><stop offset="1" stop-color="#ffffff" stop-opacity=".15"/>
    </linearGradient>
    <radialGradient id="shadow${id}" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#141311" stop-opacity=".22"/><stop offset="1" stop-color="#141311" stop-opacity="0"/>
    </radialGradient>
  </defs>`;
}

function printed({ cx, y, name, sizeLabel, ink, scale = 1 }) {
  const lines = wrap(name, scale < 0.7 ? 11 : 15);
  const lh = 15 * scale;
  const startY = y + 26 * scale;
  return `
  <g fill="${ink}" text-anchor="middle" class="b-print">
    <text x="${cx}" y="${y}" font-family="Geist, sans-serif" font-size="${6.4 * scale}" letter-spacing="${2.6 * scale}" opacity=".85">LE SENSIER</text>
    ${lines.map((l, i) => `<text x="${cx}" y="${startY + i * lh}" font-family="'Bodoni Moda', serif" font-size="${12.5 * scale}">${esc(l)}</text>`).join('')}
    <text x="${cx}" y="${startY + lines.length * lh + 10 * scale}" font-family="Geist, sans-serif" font-size="${5.6 * scale}" letter-spacing="${1.8 * scale}" opacity=".7">${esc(sizeLabel.toUpperCase())}</text>
  </g>`;
}

/**
 * Frasco em SVG.
 * format: '50' (flacon), '5' (miniatura), '200' (cologne), 'jar' (polpa)
 */
export function bottle({ family = 'brume', line = 'autoral', name = '', format = '50', label = true, shadow = true } = {}) {
  const id = ++uid;
  const tint = (families[family] || families.brume).tint;
  const cap = caps[line] || caps.autoral;
  const ink = lum(tint) < 0.5 ? '#F3F0EA' : '#141311';
  let body = '';

  if (format === '5') {
    body = `
    ${shadow ? `<ellipse cx="100" cy="286" rx="40" ry="6" fill="url(#shadow${id})"/>` : ''}
    <rect x="84" y="34" width="32" height="70" rx="2" fill="url(#cap${id})"/>
    <rect x="89" y="104" width="22" height="6" fill="url(#collar${id})"/>
    <rect x="74" y="110" width="52" height="172" rx="6" fill="url(#glass${id})" stroke="#141311" stroke-opacity=".16"/>
    <rect x="80" y="122" width="40" height="138" rx="3" fill="url(#juice${id})"/>
    <rect x="80" y="122" width="40" height="138" rx="3" fill="url(#juiceSide${id})"/>
    <rect x="76" y="262" width="48" height="18" rx="4" fill="url(#base${id})"/>
    <rect x="78" y="116" width="3" height="160" rx="1.5" fill="#fff" opacity=".6"/>
    ${label ? printed({ cx: 100, y: 150, name, sizeLabel: '5 ml', ink, scale: 0.52 }) : ''}`;
  } else if (format === '200') {
    body = `
    ${shadow ? `<ellipse cx="100" cy="292" rx="80" ry="7" fill="url(#shadow${id})"/>` : ''}
    <rect x="74" y="4" width="52" height="58" rx="2" fill="url(#cap${id})"/>
    <rect x="84" y="62" width="32" height="8" fill="url(#collar${id})"/>
    <rect x="38" y="70" width="124" height="218" rx="10" fill="url(#glass${id})" stroke="#141311" stroke-opacity=".16"/>
    <rect x="49" y="84" width="102" height="172" rx="4" fill="url(#juice${id})"/>
    <rect x="49" y="84" width="102" height="172" rx="4" fill="url(#juiceSide${id})"/>
    <rect x="42" y="258" width="116" height="26" rx="7" fill="url(#base${id})"/>
    <rect x="44" y="78" width="5" height="200" rx="2.5" fill="#fff" opacity=".55"/>
    <rect x="153" y="82" width="1.6" height="190" fill="#fff" opacity=".4"/>
    ${label ? printed({ cx: 100, y: 128, name, sizeLabel: 'Cologne 200 ml', ink, scale: 0.85 }) : ''}`;
  } else if (format === 'jar') {
    body = `
    ${shadow ? `<ellipse cx="100" cy="284" rx="86" ry="7" fill="url(#shadow${id})"/>` : ''}
    <rect x="28" y="132" width="144" height="34" rx="4" fill="url(#cap${id})"/>
    <rect x="32" y="166" width="136" height="114" rx="16" fill="url(#glass${id})" stroke="#141311" stroke-opacity=".16"/>
    <rect x="42" y="172" width="116" height="88" rx="10" fill="url(#juice${id})"/>
    <rect x="42" y="172" width="116" height="88" rx="10" fill="url(#juiceSide${id})"/>
    <rect x="38" y="170" width="4" height="100" rx="2" fill="#fff" opacity=".55"/>
    ${label ? printed({ cx: 100, y: 196, name, sizeLabel: 'Polpa', ink, scale: 0.7 }) : ''}`;
  } else {
    body = `
    ${shadow ? `<ellipse cx="100" cy="290" rx="92" ry="8" fill="url(#shadow${id})"/>` : ''}
    <rect x="70" y="16" width="60" height="76" rx="2" fill="url(#cap${id})"/>
    <rect x="70" y="16" width="60" height="2" fill="#fff" opacity=".25"/>
    <rect x="82" y="92" width="36" height="8" fill="url(#collar${id})"/>
    <rect x="24" y="100" width="152" height="186" rx="12" fill="url(#glass${id})" stroke="#141311" stroke-opacity=".16"/>
    <rect x="38" y="116" width="124" height="136" rx="5" fill="url(#juice${id})"/>
    <rect x="38" y="116" width="124" height="136" rx="5" fill="url(#juiceSide${id})"/>
    <rect x="38" y="116" width="124" height="2" fill="#fff" opacity=".35"/>
    <rect x="28" y="254" width="144" height="28" rx="8" fill="url(#base${id})"/>
    <rect x="40" y="262" width="120" height="5" rx="2.5" fill="${tint}" opacity=".35"/>
    <rect x="31" y="108" width="6" height="170" rx="3" fill="#fff" opacity=".55"/>
    <rect x="166" y="110" width="2" height="160" fill="#fff" opacity=".35"/>
    ${label ? printed({ cx: 100, y: 146, name, sizeLabel: 'Parfum 50 ml', ink }) : ''}`;
  }

  return `<svg class="bottle" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(name)}">${defs(id, tint, cap)}<g class="bottle__g">${body}</g></svg>`;
}

/** Caixa rígida (frente), papel na cor da família, logotipo em relevo seco. */
export function boxFront({ family = 'brume', name = '', line = 'autoral', sub = 'Parfum 50 ml' } = {}) {
  const f = families[family] || families.brume;
  const id = ++uid;
  const p = f.paper;
  const lines = wrap(name, 16);
  return `<svg class="box" viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Caixa ${esc(name)}">
    <defs>
      <linearGradient id="bx${id}" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${shade(p, 0.03)}"/><stop offset="1" stop-color="${shade(p, -0.04)}"/></linearGradient>
    </defs>
    <rect width="200" height="280" fill="url(#bx${id})"/>
    <rect x="0" y="0" width="200" height="280" fill="none" stroke="#141311" stroke-opacity=".08"/>
    <g text-anchor="middle">
      <text x="100.6" y="61" font-family="'Bodoni Moda', serif" font-size="15" letter-spacing="4" fill="#fff" opacity=".7">LE SENSIER</text>
      <text x="100" y="60" font-family="'Bodoni Moda', serif" font-size="15" letter-spacing="4" fill="${shade(p, -0.09)}">LE SENSIER</text>
      ${lines.map((l, i) => `<text x="100" y="${206 + i * 15}" font-family="'Bodoni Moda', serif" font-size="12" fill="#141311">${esc(l)}</text>`).join('')}
      <text x="100" y="${206 + lines.length * 15 + 12}" font-family="Geist, sans-serif" font-size="5.6" letter-spacing="1.8" fill="#141311" opacity=".6">${esc(sub.toUpperCase())}</text>
    </g>
    <rect x="96" y="250" width="8" height="8" fill="${(caps[line] || caps.autoral).mid}"/>
  </svg>`;
}
