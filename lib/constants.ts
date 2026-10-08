export interface Product {
  id: string
  name: string
  price: number
  imageUrl: string
  category: string
  brand: string
  stars: number
  description?: string
  coverage?: number // Paint coverage in m2/L
  isBestSeller?: boolean
}

export interface CartItem extends Product {
  qty: number
}

export interface ToastData {
  message: string
  type: "success" | "error" | "info"
}

export const PRODUCTS: Product[] = [
  // SUVINIL
  {
    id: "suv-1",
    name: "Suvinil Rende Muito 18L",
    price: 259.90,
    imageUrl: "https://images.tcdn.com.br/img/img_prod/650361/tinta_acrilica_fosco_completo_coral_branco_18l_4025_1_20200422151912.jpg",
    category: "Tintas",
    brand: "Suvinil",
    stars: 5,
    coverage: 400,
    description: "Tinta acrílica fosco de alta cobertura e durabilidade.",
    isBestSeller: true
  },
  {
    id: "suv-2",
    name: "Suvinil Cor & Proteção 18L",
    price: 289.90,
    imageUrl: "https://m.media-amazon.com/images/I/61kJlFbPaoL._AC_SX679_.jpg",
    category: "Tintas",
    brand: "Suvinil",
    stars: 5,
    coverage: 380,
    description: "Tinta premium com proteção UV e resistência à umidade.",
    isBestSeller: true
  },
  // BRAZZILIAN (Simulated as high-end specialized)
  {
    id: "braz-1",
    name: "Brazilian Premium Gloss 3.6L",
    price: 199.90,
    imageUrl: "https://m.media-amazon.com/images/I/61sA6N67yDL._AC_SX679_.jpg",
    category: "Tintas",
    brand: "Brazilian",
    stars: 5,
    coverage: 350,
    description: "Acabamento espelhado com tecnologia brasileira de ponta.",
  },
  // LUTKSCOLOR / LUKS COLOR
  {
    id: "luks-1",
    name: "Lukscolor Acabamento Semibrilho 3.6L",
    price: 205.90,
    imageUrl: "https://cdn.awsli.com.br/2500x2500/1869/1869036/produto/153855114/3ca522bacc.jpg",
    category: "Tintas",
    brand: "Lukscolor",
    stars: 4,
    coverage: 360,
    description: "Acabamento semibrilho resistente a limpeza.",
    isBestSeller: true
  },
  // I9
  {
    id: "i9-1",
    name: "I9 Esmalte Sintético Branco 3.6L",
    price: 89.90,
    imageUrl: "https://m.media-amazon.com/images/I/5156f0sCGDL._AC_SX679_.jpg",
    category: "Tintas",
    brand: "I9",
    stars: 5,
    coverage: 350,
    description: "Alta durabilidade para metais e madeiras.",
    isBestSeller: true
  },
  // FARBEN
  {
    id: "far-1",
    name: "Farben Ultra Cover 18L",
    price: 245.00,
    imageUrl: "https://m.media-amazon.com/images/I/61R8KjL8eRL._AC_SX679_.jpg",
    category: "Tintas",
    brand: "Farben",
    stars: 5,
    coverage: 390,
    description: "Máxima cobertura com menos demãos.",
  },
  // EUCATEX
  {
    id: "euc-1",
    name: "Eucatex Selador Acrílico 18L",
    price: 145.00,
    imageUrl: "https://cdn.awsli.com.br/2500x2500/1869/1869036/produto/153855114/3ca522bacc.jpg",
    category: "Impermeabilizante",
    brand: "Eucatex",
    stars: 4,
    coverage: 300,
    description: "Prepara a superfície para receber a tinta.",
  },
  // WEG
  {
    id: "weg-1",
    name: "WEG Epóxi Industrial Cinza 18L",
    price: 480.00,
    imageUrl: "https://m.media-amazon.com/images/I/61kJlFbPaoL._AC_SX679_.jpg",
    category: "Tintas",
    brand: "WEG",
    stars: 5,
    coverage: 280,
    description: "Resistência industrial extrema para pisos e máquinas.",
    isBestSeller: true
  },
  // AUTOLUKS
  {
    id: "auto-1",
    name: "Autoluks Verniz PU Alto Brilho 900ml",
    price: 59.90,
    imageUrl: "https://cdn.awsli.com.br/600x700/1347/1347540/produto/53873337/thinner-900ml-anjo.jpg",
    category: "Sprays",
    brand: "Autoluks",
    stars: 5,
    description: "Proteção cristalina com brilho intenso.",
  },
]

export const KITS = [
  {
    id: "quarto",
    name: "Kit Quarto Completo",
    icon: "🛏️",
    description: "Tudo para pintar um quarto de até 15m²",
    items: ["Tinta 18L", "Rolo 23cm", "Bandeja", "Fita Crepe", "Lona Plástica"],
    price: 349.90,
    originalPrice: 420.00,
    color: "#6366f1",
  },
  {
    id: "banheiro",
    name: "Kit Banheiro Anti-mofo",
    icon: "🚿",
    description: "Proteção contra umidade e mofo",
    items: ["Tinta Anti-Mofo 3,6L", "Pincel", "Fita Crepe", "Selador"],
    price: 229.90,
    originalPrice: 280.00,
    color: "#0ea5e9",
  },
  {
    id: "fachada",
    name: "Kit Fachada Premium",
    icon: "🏠",
    description: "Proteção máxima para área externa",
    items: ["Tinta Textura 25kg", "Rolo Médio", "Bandeja", "Primer", "Lona"],
    price: 479.90,
    originalPrice: 560.00,
    color: "#f59e0b",
  },
  {
    id: "sala_luxo",
    name: "Kit Sala Luxo",
    icon: "🛋️",
    description: "Acabamento premium para salas amplas",
    items: ["Tinta Semibrilho 18L", "Rolo Lã Carneiro", "Bandeja Profissional", "Fita Crepe", "Massa Corrida"],
    price: 599.90,
    originalPrice: 720.00,
    color: "#8b5cf6",
  },
  {
    id: "automotivo",
    name: "Kit Renovação Auto",
    icon: "🚗",
    description: "Tudo para pintura de peças automotivas",
    items: ["Tinta PU", "Primer PU", "Verniz PU", "Lixa d'água", "Fita Crepe"],
    price: 399.90,
    originalPrice: 480.00,
    color: "#ef4444",
  },
  {
    id: "madeira",
    name: "Kit Restauração Madeira",
    icon: "🪵",
    description: "Proteção e brilho para móveis e decks",
    items: ["Verniz Marítimo", "Lixa Grão 220", "Pincel Tramontina", "Thinner"],
    price: 189.90,
    originalPrice: 230.00,
    color: "#78350f",
  }
]

export const COLOR_PALETTE = [
  { name: "Branco neve", hex: "#F5F5F0", group: "Branco" },
  { name: "Creme suave", hex: "#FDF6E3", group: "Bege" },
  { name: "Areia dourada", hex: "#D4B483", group: "Bege" },
  { name: "Cinza pérola", hex: "#C9C9C9", group: "Cinza" },
  { name: "Grafite urbano", hex: "#555555", group: "Cinza" },
  { name: "Azul sereno", hex: "#B8D4E8", group: "Azul" },
  { name: "Azul oceano", hex: "#2563EB", group: "Azul" },
  { name: "Azul marinho", hex: "#1E3A5F", group: "Azul" },
  { name: "Verde salvia", hex: "#A7C5A1", group: "Verde" },
  { name: "Verde musgo", hex: "#4A7C59", group: "Verde" },
  { name: "Verde oliva", hex: "#6B7A3E", group: "Verde" },
  { name: "Rosa blush", hex: "#F4C2C2", group: "Rosa" },
  { name: "Terracota", hex: "#C1705A", group: "Laranja" },
  { name: "Amarelo palha", hex: "#F0D080", group: "Amarelo" },
  { name: "Roxo lavanda", hex: "#C4B0D8", group: "Roxo" },
  { name: "Preto ônix", hex: "#1A1A1A", group: "Preto" },
]

export const CATEGORIES = [
  { name: "Tintas", icon: "🪣" },
  { name: "Ferramentas para Pintura", icon: "🖌️" },
  { name: "Impermeabilizante", icon: "💧" },
  { name: "Sprays", icon: "🔵" },
  { name: "Acessórios", icon: "🧰" },
]

export const BRANDS = [
  { name: "Suvinil", logo: null },
  { name: "Brazilian", logo: null },
  { name: "Lukscolor", logo: null },
  { name: "I9", logo: null },
  { name: "Farben", logo: null },
  { name: "Eucatex", logo: null },
  { name: "WEG", logo: null },
  { name: "Autoluks", logo: null },
]

export const HERO_SLIDES = [
  {
    bg: "#1a1464",
    image: "https://copafer.vtexassets.com/arquivos/ids/207022-800-auto?v=638997608427070000&width=800&height=auto&aspect=true",
    backgroundImage: "https://images.unsplash.com/photo-1562619667-d6d26d870e7c?q=80&w=2070&auto=format&fit=crop",
    brand: "Suvinil",
    title: "Cores que Inspiram",
    sub: "Transforme seus ambientes com a linha Premium da Suvinil.",
    fallback: "https://images.unsplash.com/photo-1589939705385-2ec553977760?q=80&w=500&auto=format&fit=crop"
  },
  {
    bg: "#0d4a1a",
    image: "https://casatoni.vteximg.com.br/arquivos/ids/159634-1000-1000/Suv-Esmalte-Cor-e-Protecao-900ml.jpg?v=637021578813970000",
    backgroundImage: "https://images.unsplash.com/photo-1589939705385-2ec553977760?q=80&w=2070&auto=format&fit=crop",
    brand: "Suvinil",
    title: "Proteção Total",
    sub: "Tinta Cor & Proteção: a armadura ideal para sua casa.",
    fallback: "https://images.unsplash.com/photo-1562619667-d6d26d870e7c?q=80&w=500&auto=format&fit=crop"
  },
  {
    bg: "#b45309",
    image: "https://acdn-us.mitiendanube.com/stores/006/950/691/products/644373-0829297-dccdcd47e8e4477bad17721328207578-1024-1024.webp",
    backgroundImage: "https://images.unsplash.com/photo-1595844730298-b955ed7774d3?q=80&w=2070&auto=format&fit=crop",
    brand: "Eucatex",
    title: "Acabamento Perfeito",
    sub: "Ferramentas profissionais para quem não abre mão da qualidade.",
    fallback: "https://images.unsplash.com/photo-1595844730298-b955ed7774d3?q=80&w=500&auto=format&fit=crop"
  },
]
