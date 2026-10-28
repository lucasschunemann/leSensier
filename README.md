# Le Sensier

Rebranding e novo site da Le Sensier, perfumaria brasileira com criações autorais e releituras.

## Páginas

- `/` frasco 3D (Three.js) que troca de família, e logo abaixo a grade com todos os perfumes, filtros e busca.
- `/colecao.html` todas as fragrâncias, kits e polpas, com filtros por linha, família e formato.
- `/produto.html?p=<slug>` página de produto com tamanhos, notas, intensidade e sacola.
- `/marca.html` identidade: logotipo, monograma, cores, tipografia, frascos, embalagens e tom de voz.

## Sistema

- Logotipo e monograma em vetor (`public/brand/`), desenhados a partir da Geist Medium.
- Tipografia: Geist, com Geist Mono nas etiquetas e preços.
- Cada família tem uma cor de líquido e uma cor de papel (`src/js/families.js`).
- Vidro reto, tampa em bloco e etiqueta de papel. Tampa branca nas autorais, preta nas releituras.
- Frascos e caixas são gerados em SVG (`src/js/bottle.js`), sem fotos.

## Catálogo e compra

`src/js/catalog.js` foi gerado a partir do catálogo público da loja Shopify atual (nomes, preços e IDs de variante). A sacola fica no navegador e o botão "Finalizar compra" abre o checkout da Shopify com os itens via permalink de carrinho (`/cart/ID:QTD`). Preços e estoque não se atualizam sozinhos: ao mudar o catálogo, é preciso regenerar esse arquivo.

## Rodar

```bash
npm install
npm run dev
```

Deploy na Vercel: framework Vite, comando `npm run build`, saída `dist`.
