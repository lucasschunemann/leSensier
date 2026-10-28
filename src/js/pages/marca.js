import { boot, reveals, reduced, gsap } from '../shell.js';
import { families, familyOrder } from '../families.js';
import { fragrances } from '../catalog.js';
import { bottle, boxFront } from '../bottle.js';
import wordmark from '../../assets/wordmark-currentColor.svg?raw';
import split from '../../assets/wordmark-split.svg?raw';
import monogram from '../../assets/monogram-currentColor.svg?raw';

boot({ dark: true });

const $ = (s) => document.querySelector(s);
$('[data-mark]').innerHTML = split;
document.querySelectorAll('[data-wordmark]').forEach((el) => (el.innerHTML = wordmark));
$('[data-monogram]').innerHTML = monogram;

$('[data-tints]').innerHTML = familyOrder.map((k) => {
  const f = families[k];
  return `<div class="tint">
    <div class="tint__chip" style="background:${f.paper}"><span style="background:${f.tint}"></span></div>
    <div><strong>${f.name}</strong><code>Líquido ${f.tint}</code><code>Papel ${f.paper}</code></div>
  </div>`;
}).join('');

$('[data-flacons]').innerHTML = [
  ['50', 'Parfum 50 ml', 'Formato principal. Vidro grosso, base pesada, tampa cilíndrica.', 'linge', 'Linge de Cachemire'],
  ['5', 'Miniatura 5 ml', 'Mesma proporção, para kits e para experimentar.', 'sorbet', 'Sorbet Melon'],
  ['200', 'Cologne 200 ml', 'Colônias e brumas de corpo.', 'brume', 'Brume de Bain'],
  ['jar', 'Polpa', 'Pote baixo de vidro. Segue a mesma regra de tampa.', 'brise', 'Brise de Lima'],
].map(([fmt, t, d, fam, name]) => `
  <figure class="flacon">
    <div class="flacon__img">${bottle({ family: fam, line: fam === 'brise' ? 'releitura' : 'autoral', name, format: fmt, shadow: false })}</div>
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
    <figcaption><strong>${families[fam].name}</strong>Papel ${families[fam].paper}</figcaption>
  </figure>`).join('');

const tray = $('[data-tray]');
tray.style.setProperty('--tray', families.linge.paper);
tray.innerHTML = fragrances.filter((f) => f.family === 'linge')
  .map((f) => bottle({ family: 'linge', line: 'autoral', name: f.name, format: '5', shadow: false })).join('');

if (!reduced) {
  gsap.from('[data-mark] path', { yPercent: 120, autoAlpha: 0, duration: 1.6, ease: 'expo.out', stagger: 0.05, delay: 0.3 });
  gsap.from('.bb-hero__row > *', { y: 30, autoAlpha: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, delay: 0.9 });
  gsap.from('[data-lineup] .bottle', {
    yPercent: 70, autoAlpha: 0, duration: 1.4, ease: 'expo.out', stagger: 0.04,
    scrollTrigger: { trigger: '[data-lineup]', start: 'top 85%' },
  });
  gsap.from('[data-tray] .bottle', {
    y: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07,
    scrollTrigger: { trigger: '[data-tray]', start: 'top 80%' },
  });
}

reveals();
