import { boot, reveals, reduced, gsap } from '../shell.js';
import { families, familyOrder } from '../families.js';
import { fragrances } from '../catalog.js';
import { bottle, boxFront } from '../bottle.js';
import wordmark from '../../assets/wordmark-currentColor.svg?raw';
import split from '../../assets/wordmark-split.svg?raw';
import monogram from '../../assets/monogram-currentColor.svg?raw';

boot();

const $ = (s) => document.querySelector(s);
$('[data-mark]').innerHTML = split;
document.querySelectorAll('[data-wordmark]').forEach((el) => (el.innerHTML = wordmark));
$('[data-monogram]').innerHTML = monogram;

$('[data-tints]').innerHTML = familyOrder.map((k) => {
  const f = families[k];
  return `<div class="tint">
    <div class="tint__chip" style="background:${f.paper}"><span style="background:${f.tint}"></span></div>
    <p><strong>${f.name}</strong><code>Líquido ${f.tint}</code><code>Papel ${f.paper}</code></p>
  </div>`;
}).join('');

$('[data-flacons]').innerHTML = [
  ['50', 'Parfum 50 ml', 'Formato principal.', 'linge', 'Linge de Cachemire', 'autoral'],
  ['5', 'Miniatura 5 ml', 'Mesmo desenho, para kits e para experimentar.', 'sorbet', 'Sorbet Melon', 'autoral'],
  ['200', 'Cologne 200 ml', 'Colônias para o corpo.', 'brume', 'Brume de Bain', 'autoral'],
  ['jar', 'Polpa', 'Pote baixo de vidro, mesma regra de tampa.', 'brise', 'Brise de Lima', 'releitura'],
].map(([fmt, t, d, fam, name, line]) => `
  <figure class="flacon">
    <div class="flacon__img" style="background:${families[fam].paper}">${bottle({ family: fam, line, name, format: fmt })}</div>
    <h3>${t}</h3><p>${d}</p>
  </figure>`).join('');

$('[data-lineup]').innerHTML = familyOrder.flatMap((k) => fragrances.filter((f) => f.family === k))
  .map((f) => bottle({ family: f.family, line: f.line, name: f.name, label: false, shadow: false })).join('');

$('[data-pack]').innerHTML = [
  ['linge', 'Linge au Soleil', 'autoral'],
  ['sorbet', 'Sorbet Gingembre', 'autoral'],
  ['souffle', 'Soufflé de Matcha', 'releitura'],
  ['douceur', 'Douceur de Nectar', 'releitura'],
].map(([fam, name, line]) => `
  <figure>
    ${boxFront({ family: fam, name, line })}
    <figcaption>${families[fam].name} · papel ${families[fam].paper}</figcaption>
  </figure>`).join('');

if (!reduced) {
  gsap.from('[data-mark] path', { yPercent: 100, autoAlpha: 0, duration: 1.2, ease: 'expo.out', stagger: 0.04, delay: 0.2 });
  gsap.from('[data-lineup] .bottle', {
    y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.03,
    scrollTrigger: { trigger: '[data-lineup]', start: 'top 88%' },
  });
}

reveals();
