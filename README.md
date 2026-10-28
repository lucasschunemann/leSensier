# Le Sensier

Rebranding e novo site da Le Sensier, perfumaria brasileira com criações autorais e releituras.

## Páginas

- `/` palco 3D com o frasco em vidro (Three.js) passando pelas sete famílias, origem da marca, linha Linge, Brume de Bain, caixa que abre com a rolagem e kits.
- `/colecao.html` todas as fragrâncias, kits e polpas, com filtros por linha e família.
- `/produto.html?p=<slug>` página de produto com tamanhos, notas, intensidade e sacola.
- `/marca.html` identidade: logotipo, monograma, cores, tipografia, frascos, embalagens e tom de voz.

## Sistema

- Logotipo e monograma em vetor (`public/brand/`), desenhados a partir da Bodoni Moda (opsz 96).
- Tipografia: Bodoni Moda para nomes e títulos, Geist para texto.
- Cada família tem uma cor de líquido e uma cor de papel (`src/js/families.js`).
- Tampa de travertino nas autorais, preta fosca nas releituras.
- Frascos e caixas são gerados em SVG (`src/js/bottle.js`), sem fotos.

## Catálogo e compra

`src/js/catalog.js` foi gerado a partir do catálogo público da loja Shopify atual (nomes, preços e IDs de variante). A sacola fica no navegador e o botão "Finalizar compra" abre o checkout da Shopify com os itens via permalink de carrinho (`/cart/ID:QTD`). Preços e estoque não se atualizam sozinhos: ao mudar o catálogo, é preciso regenerar esse arquivo.

## Rodar

```bash
npm install
npm run dev
```

Deploy na Vercel: framework Vite, comando `npm run build`, saída `dist`.
