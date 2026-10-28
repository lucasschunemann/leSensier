import { boot } from '../shell.js';
import { catalogView } from '../catalogView.js';

boot();

const title = document.querySelector('[data-title]');
const titles = { kits: 'Kits', corpo: 'Corpo', colonias: 'Colônias' };
catalogView(document.querySelector('.shop'), {
  syncUrl: true,
  initial: new URLSearchParams(location.search).get('f') || 'todos',
  onChange: (f) => {
    title.textContent = titles[f] || 'Perfumes';
    document.title = `${title.textContent} · Le Sensier`;
  },
});
