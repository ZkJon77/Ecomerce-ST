export const COLOR_MAP = {
  // --- TOYOTA ---
  "040": { name: "Branco Polar", hex: "#FDFDFD", description: "Branco sólido clássico da Toyota." },
  "209": { name: "Preto Eclipse", hex: "#0A0A0A", description: "Preto sólido profundo e intenso." },
  "1G3": { name: "Cinza Granito", hex: "#7D7D7D", description: "Cinza metálico médio com reflexos neutros." },
  "1E7": { name: "Prata Supernova", hex: "#C0C0C0", description: "Prata metálico brilhante e moderno." },
  "089": { name: "Branco Lunar", hex: "#F5F5F5", description: "Branco perolizado com profundidade e brilho." },
  "1K3": { name: "Cinza Celestial", hex: "#A9A9A9", description: "Cinza metálico claro e sofisticado." },
  "3R3": { name: "Vermelho Granada", hex: "#B22222", description: "Vermelho perolizado vibrante e elegante." },
  "215": { name: "Preto Infinito", hex: "#000000", description: "Preto profundo com acabamento premium." },
  "1H6": { name: "Prata Lua Nova", hex: "#D3D3D3", description: "Prata metálico claro com reflexos frios." },

  // --- CHEVROLET ---
  "GAZ": { name: "Branco Summit", hex: "#FFFFFF", description: "Branco sólido moderno utilizado na linha Onix e Tracker." },
  "GR2": { name: "Prata Shark", hex: "#BCC6CC", description: "Prata metálico contemporâneo com tom levemente azulado." },
  "GB8": { name: "Preto Ouro Negro", hex: "#121212", description: "Preto metálico com partículas sutis de brilho." },
  "GR9": { name: "Azul Boreal", hex: "#2B4561", description: "Azul metálico escuro e sofisticado." },
  "648G": { name: "Verde Safari", hex: "#4B5320", description: "Verde militar fosco/metálico para Tracker e Montana." },
  "GFP": { name: "Vermelho Scarlet", hex: "#D2042D", description: "Vermelho sólido vibrante e chamativo." },
  "694D": { name: "Cinza Topázio", hex: "#5A5A5A", description: "Cinza escuro metálico industrial." },

  // --- FIAT ---
  "1424": { name: "Branco Ártico", hex: "#FDFDFD", description: "Branco sólido clássico da linha Fiat." },
  "8565": { name: "Preto Vulcano", hex: "#0D0D0D", description: "Preto sólido intenso." },
  "3065": { name: "Vermelho Modena", hex: "#A52A2A", description: "Vermelho metálico elegante." },
  "6198": { name: "Amarelo Vibrante", hex: "#FFD700", description: "Amarelo sólido de alta visibilidade." },
  "647": { name: "Cinza Steel", hex: "#808080", description: "Cinza metálico moderno e sóbrio." },
  "RL2565": { name: "Azul Allegro", hex: "#003366", description: "Azul metálico profundo e sofisticado." },

  // --- VOLKSWAGEN ---
  "LC9X": { name: "Branco Puro", hex: "#FFFFFF", description: "Branco sólido padrão VW." },
  "LY9B": { name: "Preto Profundo", hex: "#050505", description: "Preto sólido intenso." },
  "LA7W": { name: "Prata Tungstênio", hex: "#BFC1C2", description: "Prata metálico clássico da linha Gol/Polo." },
  "LS7Y": { name: "Cinza Platinum", hex: "#708090", description: "Cinza metálico médio com reflexos frios." },

  // --- JEEP & RENAULT ---
  "PZZ": { name: "Branco Polar (Jeep)", hex: "#FDFDFD", description: "Branco sólido comum em Renegade e Compass." },
  "PBN": { name: "Preto Diamond", hex: "#0A0A0A", description: "Preto metálico premium da Jeep." },
  "N42": { name: "Branco Glacier (Renault)", hex: "#FDFDFD", description: "Branco sólido padrão Renault." },
  "N67": { name: "Preto Nacré (Renault)", hex: "#1A1A1A", description: "Preto metálico com reflexos perolados." },

  // --- PREMIUM (BMW, MERCEDES, AUDI) ---
  "300": { name: "Alpine White", hex: "#FFFFFF", description: "Branco puro icônico da BMW." },
  "400": { name: "Black Sapphire", hex: "#0D0D0D", description: "Preto metálico profundo da BMW." },
  "C1": { name: "Polar White", hex: "#FDFDFD", description: "Branco sólido clássico Mercedes-Benz." },
  "040": { name: "Obsidian Black", hex: "#0A0A0A", description: "Preto metálico sofisticado Mercedes-Benz." },
  "LY9C": { name: "Glacier White", hex: "#FDFDFD", description: "Branco perolizado Audi." },
};

export const CAR_MODELS = [
  // TOYOTA
  { brand: "Toyota", model: "Corolla", years: { "2014-2019": "1G3", "2020-2026": "089" } },
  { brand: "Toyota", model: "Corolla Cross", years: { "2021-2026": "215" } },
  { brand: "Toyota", model: "Yaris", years: { "2018-2026": "1E7" } },
  { brand: "Toyota", model: "Hilux", years: { "2016-2026": "1H6" } },

  // CHEVROLET
  { brand: "Chevrolet", model: "Onix", years: { "2013-2019": "GR2", "2020-2026": "GAZ" } },
  { brand: "Chevrolet", model: "Tracker", years: { "2020-2026": "GB8" } },
  { brand: "Chevrolet", model: "S10", years: { "2012-2026": "694D" } },
  { brand: "Chevrolet", model: "Montana", years: { "2023-2026": "648G" } },

  // FIAT
  { brand: "Fiat", model: "Argo", years: { "2017-2026": "1424" } },
  { brand: "Fiat", model: "Cronos", years: { "2018-2026": "647" } },
  { brand: "Fiat", model: "Strada", years: { "2020-2026": "8565" } },
  { brand: "Fiat", model: "Toro", years: { "2016-2026": "RL2565" } },
  { brand: "Fiat", model: "Uno", years: { "2010-2021": "3065" } },

  // VOLKSWAGEN
  { brand: "Volkswagen", model: "Gol", years: { "2008-2022": "LA7W" } },
  { brand: "Volkswagen", model: "Polo", years: { "2018-2026": "LC9X" } },
  { brand: "Volkswagen", model: "T-Cross", years: { "2019-2026": "LS7Y" } },
  { brand: "Volkswagen", model: "Nivus", years: { "2020-2026": "LY9B" } },

  // JEEP & RENAULT
  { brand: "Jeep", model: "Renegade", years: { "2015-2026": "PZZ" } },
  { brand: "Jeep", model: "Compass", years: { "2016-2026": "PBN" } },
  { brand: "Renault", model: "Kwid", years: { "2017-2026": "N42" } },
  { brand: "Renault", model: "Sandero", years: { "2012-2023": "N67" } },
  { brand: "Renault", model: "Duster", years: { "2012-2026": "N42" } },

  // NISSAN
  { brand: "Nissan", model: "Kicks", years: { "2016-2026": "1E7" } },
  { brand: "Nissan", model: "Versa", years: { "2011-2026": "040" } },

  // PREMIUM
  { brand: "BMW", model: "320i", years: { "2019-2026": "300" } },
  { brand: "BMW", model: "X1", years: { "2015-2026": "400" } },
  { brand: "Mercedes-Benz", model: "C180", years: { "2014-2026": "C1" } },
  { brand: "Mercedes-Benz", model: "GLA", years: { "2015-2026": "040" } },
  { brand: "Audi", model: "A3", years: { "2017-2026": "LY9C" } },
];