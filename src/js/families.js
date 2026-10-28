// Famílias olfativas. tint: cor do líquido no frasco. paper: fundo de foto e papel da caixa.
export const families = {
  linge: {
    name: 'Linge',
    state: 'Roupa limpa',
    text: 'Seis leituras do tecido: lavado, passado, secando ao sol, guardado com amaciante.',
    tint: '#ECE9EF',
    paper: '#ECEBE8',
  },
  brume: {
    name: 'Brume',
    state: 'Banho e pele',
    text: 'O cheiro de banho tomado. Fragrâncias que ficam perto da pele.',
    tint: '#E3EAEA',
    paper: '#E7EAE9',
  },
  sorbet: {
    name: 'Sorbet',
    state: 'Mar e céu nublado',
    text: 'Começa gelado e derrete na pele. Skinscents nascidos em dias calmos de praia.',
    tint: '#DCEAE2',
    paper: '#E6EBE7',
  },
  brise: {
    name: 'Brise',
    state: 'Clareza',
    text: 'Cítricos e florais leves. Perfumes para o dia.',
    tint: '#F1EBC9',
    paper: '#EEECE4',
  },
  souffle: {
    name: 'Soufflé',
    state: 'Madeira e textura',
    text: 'Amadeirados cremosos, de rastro seco. Sândalo, papiro, matcha.',
    tint: '#E2CDA8',
    paper: '#EBE7E0',
  },
  douceur: {
    name: 'Douceur',
    state: 'Doçura',
    text: 'Florais e frutados intensos. Lichia, rosa, flores brancas e baunilha.',
    tint: '#F0D9D3',
    paper: '#EEE8E5',
  },
  the: {
    name: 'Thé',
    state: 'Chá ao fim da tarde',
    text: 'Quatro miniaturas inspiradas nos rituais de chá japoneses.',
    tint: '#E6D3A6',
    paper: '#ECE8DF',
  },
};

export const familyOrder = ['linge', 'brume', 'sorbet', 'brise', 'souffle', 'douceur', 'the'];

// Tampa em bloco: branca nas criações autorais, preta nas releituras.
export const caps = {
  autoral: { name: 'Branca', top: '#FBFAF7', mid: '#EFEDE8', low: '#DCD9D2', ink: '#111111' },
  releitura: { name: 'Preta', top: '#3A3936', mid: '#1B1A19', low: '#0D0D0C', ink: '#F4F3F0' },
};
