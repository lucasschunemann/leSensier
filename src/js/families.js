// Famílias olfativas. Cada uma tem uma cor de líquido (tint) e um papel de embalagem (paper).
export const families = {
  brise: {
    name: 'Brise',
    state: 'Clareza',
    text: 'Cítricos e florais leves. Perfumes para o dia, que acompanham o movimento.',
    tint: '#E6DCA4',
    paper: '#EDE8D6',
  },
  brume: {
    name: 'Brume',
    state: 'Banho e pele',
    text: 'O cheiro de banho tomado. Fragrâncias que ficam perto da pele.',
    tint: '#C3D0D3',
    paper: '#E1E5E3',
  },
  linge: {
    name: 'Linge',
    state: 'Roupa limpa',
    text: 'Seis leituras do tecido: lavado, passado, secando ao sol, guardado com amaciante.',
    tint: '#E4E2EA',
    paper: '#ECEAE6',
  },
  sorbet: {
    name: 'Sorbet',
    state: 'Mar e céu nublado',
    text: 'Começa gelado e derrete na pele. Skinscents nascidos em dias calmos de praia.',
    tint: '#B9D3C9',
    paper: '#DFE8E3',
  },
  souffle: {
    name: 'Soufflé',
    state: 'Madeira e textura',
    text: 'Amadeirados cremosos, de rastro seco. Sândalo, papiro, matcha.',
    tint: '#B28A5C',
    paper: '#E0D6C7',
  },
  douceur: {
    name: 'Douceur',
    state: 'Doçura',
    text: 'Florais e frutados intensos. Lichia, rosa, flores brancas e baunilha.',
    tint: '#DFADA6',
    paper: '#EDDDD8',
  },
  the: {
    name: 'Thé',
    state: 'Chá ao fim da tarde',
    text: 'Quatro miniaturas inspiradas nos rituais de chá japoneses.',
    tint: '#C6A266',
    paper: '#E8DDC9',
  },
};

export const familyOrder = ['linge', 'brume', 'sorbet', 'brise', 'souffle', 'douceur', 'the'];

// Tampas: pedra (travertino) nas criações autorais, tinta (preto fosco) nas releituras.
export const caps = {
  autoral: { name: 'Travertino', top: '#E3DACB', mid: '#CFC4B2', low: '#B4A893' },
  releitura: { name: 'Preto fosco', top: '#3A3732', mid: '#1C1A17', low: '#0E0D0B' },
};
