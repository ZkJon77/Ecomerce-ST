export interface Product {
  id: number
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
  {
    id: 1,
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
    id: 2,
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
  {
    id: 3,
    name: "Rolo de Pintura 23cm Atlas",
    price: 19.80,
    imageUrl: "https://images.tcdn.com.br/img/img_prod/650361/rolo_de_la_para_pintura_atlas_15cm_4025_1_20200422151912.jpg",
    category: "Ferramentas para Pintura",
    brand: "Eucatex",
    stars: 4,
    description: "Rolo de lã para aplicação uniforme."
  },
  {
    id: 4,
    name: "Acabamento Iquine 3,6L",
    price: 205.90,
    imageUrl: "https://cdn.awsli.com.br/2500x2500/1869/1869036/produto/153855114/3ca522bacc.jpg",
    category: "Tintas",
    brand: "Lucks Color",
    stars: 4,
    coverage: 360,
    description: "Acabamento semibrilho resistente a limpeza.",
    isBestSeller: true
  },
  {
    id: 5,
    name: "Tinta PU Automotiva Preto 3,6L",
    price: 189.90,
    imageUrl: "https://tse4.mm.bing.net/th/id/OIP.4zWZc9F3nS2uR6pTj6m0UQHaHa",
    category: "Tintas",
    brand: "Suvinil",
    stars: 5,
    coverage: 320
  },
  {
    id: 6,
    name: "Primer PU Cinza 3,6L",
    price: 149.90,
    imageUrl: "https://tse3.mm.bing.net/th/id/OIP.qO6MysNn7M8jYzY2wqKz6QHaHa",
    category: "Impermeabilizante",
    brand: "Suvinil",
    stars: 4,
    coverage: 280
  },
  {
    id: 7,
    name: "Verniz PU Alto Brilho 900ml",
    price: 59.90,
    imageUrl: "https://cdn.awsli.com.br/600x700/1347/1347540/produto/53873337/thinner-900ml-anjo.jpg",
    category: "Sprays",
    brand: "Autoluks",
    stars: 5
  },
  {
    id: 8,
    name: "Esmalte Sintético Branco 3,6L",
    price: 89.90,
    imageUrl: "https://m.media-amazon.com/images/I/5156f0sCGDL._AC_SX679_.jpg",
    category: "Tintas",
    brand: "I9",
    stars: 5,
    coverage: 350,
    isBestSeller: true
  },
  {
    id: 9,
    name: "Fita Crepe Profissional 48mm",
    price: 8.90,
    imageUrl: "https://m.media-amazon.com/images/I/71yh4R5VBPL._AC_SX679_.jpg",
    category: "Acessórios",
    brand: "Maxi Rubber",
    stars: 5,
    description: "Fita crepe para acabamentos precisos."
  },
  {
    id: 10,
    name: "Massa Corrida PVA 25kg",
    price: 89.90,
    imageUrl: "https://m.media-amazon.com/images/I/61b6sFNbKBL._AC_SX679_.jpg",
    category: "Acessórios",
    brand: "Suvinil",
    stars: 4,
    description: "Massa corrida para nivelamento de paredes."
  },
  {
    id: 11,
    name: "Bandeja para Rolo 23cm",
    price: 12.90,
    imageUrl: "https://m.media-amazon.com/images/I/51PNZjU8aRL._AC_SX679_.jpg",
    category: "Ferramentas para Pintura",
    brand: "Eucatex",
    stars: 4,
    description: "Bandeja plástica reforçada."
  },
  {
    id: 12,
    name: "Lona Plástica 4x4m",
    price: 24.90,
    imageUrl: "https://m.media-amazon.com/images/I/71Kl7e7y9ML._AC_SX679_.jpg",
    category: "Acessórios",
    brand: "Eucatex",
    stars: 4,
    description: "Proteção de piso e móveis durante pintura."
  },
  {
    id: 13,
    name: "Tinta Acrílica Premium Branco Neve 18L",
    price: 310.00,
    imageUrl: "https://images.tcdn.com.br/img/img_prod/650361/tinta_acrilica_fosco_completo_coral_branco_18l_4025_1_20200422151912.jpg",
    category: "Tintas",
    brand: "Suvinil",
    stars: 5,
    coverage: 420,
    description: "A melhor escolha para paredes internas e externas.",
    isBestSeller: true
  },
  {
    id: 14,
    name: "Tinta Acrílica Premium Cinza Platina 18L",
    price: 325.00,
    imageUrl: "https://m.media-amazon.com/images/I/61kJlFbPaoL._AC_SX679_.jpg",
    category: "Tintas",
    brand: "Suvinil",
    stars: 5,
    coverage: 390,
    description: "Tinta moderna com acabamento sofisticado.",
    isBestSeller: true
  },
  {
    id: 15,
    name: "Rolo de Lã Carneiro 15cm",
    price: 14.50,
    imageUrl: "https://images.tcdn.com.br/img/img_prod/650361/rolo_de_la_para_pintura_atlas_15cm_4025_1_20200422151912.jpg",
    category: "Ferramentas para Pintura",
    brand: "Eucatex",
    stars: 4,
    description: "Ideal para superfícies com textura."
  },
  {
    id: 16,
    name: "Selador Acrílico Branco 18L",
    price: 145.00,
    imageUrl: "https://cdn.awsli.com.br/2500x2500/1869/1869036/produto/153855114/3ca522bacc.jpg",
    category: "Impermeabilizante",
    brand: "Lucks Color",
    stars: 4,
    coverage: 300,
    description: "Prepara a superfície para receber a tinta."
  },
  {
    id: 17,
    name: "Verniz Marítimo Brilhante 900ml",
    price: 45.00,
    imageUrl: "https://cdn.awsli.com.br/600x700/1347/1347540/produto/53873337/thinner-900ml-anjo.jpg",
    category: "Sprays",
    brand: "Autoluks",
    stars: 5,
    description: "Proteção extrema contra sol e chuva."
  },
  {
    id: 18,
    name: "Tinta Esmalte Brilhante Preto 3,6L",
    price: 95.00,
    imageUrl: "https://m.media-amazon.com/images/I/5156f0sCGDL._AC_SX679_.jpg",
    category: "Tintas",
    brand: "I9",
    stars: 5,
    coverage: 340,
    description: "Ideal para metais e madeiras."
  },
  {
    id: 19,
    name: "Pincel Tramontina 2 polegadas",
    price: 12.00,
    imageUrl: "https://m.media-amazon.com/images/I/71yh4R5VBPL._AC_SX679_.jpg",
    category: "Ferramentas para Pintura",
    brand: "Lucks Color",
    stars: 4,
    description: "Cerdas macias para acabamento perfeito."
  },
  {
    id: 21,
    name: "Tinta Acrílica Azul Royal 18L",
    price: 310.00,
    imageUrl: "https://images.tcdn.com.br/img/img_prod/650361/tinta_acrilica_fosco_completo_coral_branco_18l_4025_1_20200422151912.jpg",
    category: "Tintas",
    brand: "Suvinil",
    stars: 5,
    coverage: 400,
    description: "Azul vibrante para destaque em ambientes.",
    isBestSeller: true
  },
  {
    id: 22,
    name: "Tinta Acrílica Amarelo Sol 18L",
    price: 310.00,
    imageUrl: "https://m.media-amazon.com/images/I/61kJlFbPaoL._AC_SX679_.jpg",
    category: "Tintas",
    brand: "Suvinil",
    stars: 5,
    coverage: 380,
    description: "Traz luminosidade e alegria para o ambiente.",
    isBestSeller: true
  },
  {
    id: 23,
    name: "Rolo de Lã Sintética 23cm",
    price: 22.90,
    imageUrl: "https://images.tcdn.com.br/img/img_prod/650361/rolo_de_la_para_pintura_atlas_15cm_4025_1_20200422151912.jpg",
    category: "Ferramentas para Pintura",
    brand: "Eucatex",
    stars: 4,
    description: "Ideal para superfícies lisas."
  },
  {
    id: 24,
    name: "Massa Acrílica Externa 25kg",
    price: 110.00,
    imageUrl: "https://m.media-amazon.com/images/I/61b6sFNbKBL._AC_SX679_.jpg",
    category: "Acessórios",
    brand: "Suvinil",
    stars: 5,
    description: "Resistente a intempéries para áreas externas."
  },
  {
    id: 25,
    name: "Tinta Acrílica Fosco Branco 3,6L",
    price: 115.90,
    imageUrl: "https://images.tcdn.com.br/img/img_prod/650361/tinta_acrilica_fosco_completo_coral_branco_18l_4025_1_20200422151912.jpg",
    category: "Tintas",
    brand: "Suvinil",
    stars: 4,
    description: "Acabamento fosco ideal para esconder imperfeições.",
    isBestSeller: true
  },
  {
    id: 26,
    name: "Tinta Acrílica Semibrilho Bege 18L",
    price: 275.00,
    imageUrl: "https://m.media-amazon.com/images/I/61kJlFbPaoL._AC_SX679_.jpg",
    category: "Tintas",
    brand: "Suvinil",
    stars: 5,
    coverage: 370,
    description: "Elegância e facilidade de limpeza para salas e quartos."
  },
  {
    id: 27,
    name: "Kit Pincéis Profissionais (3 un)",
    price: 34.90,
    imageUrl: "https://m.media-amazon.com/images/I/71yh4R5VBPL._AC_SX679_.jpg",
    category: "Ferramentas para Pintura",
    brand: "Lucks Color",
    stars: 4,
    description: "Conjunto com tamanhos variados para recortes perfeitos."
  },
  {
    id: 28,
    name: "Impermeabilizante Líquido 18L",
    price: 189.00,
    imageUrl: "https://cdn.awsli.com.br/2500x2500/1869/1869036/produto/153855114/3ca522bacc.jpg",
    category: "Impermeabilizante",
    brand: "Lucks Color",
    stars: 5,
    coverage: 250,
    description: "Ideal para lajes e áreas úmidas, evita infiltrações."
  },
  {
    id: 29,
    name: "Spray PU Preto Fosco 400ml",
    price: 42.00,
    imageUrl: "https://tse4.mm.bing.net/th/id/OIP.4zWZc9F3nS2uR6pTj6m0UQHaHa",
    category: "Sprays",
    brand: "Colorgin",
    stars: 5,
    description: "Secagem rápida e acabamento fosco profissional."
  },
  {
    id: 30,
    name: "Spray PU Prata Metálico 400ml",
    price: 42.00,
    imageUrl: "https://tse3.mm.bing.net/th/id/OIP.qO6MysNn7M8jYzY2wqKz6QHaHa",
    category: "Sprays",
    brand: "Colorgin",
    stars: 4,
    description: "Ideal para rodas e detalhes cromados."
  },
  {
    id: 31,
    name: "Lixa d'água Grão 220 (10 un)",
    price: 15.00,
    imageUrl: "https://m.media-amazon.com/images/I/71Kl7e7y9ML._AC_SX679_.jpg",
    category: "Acessórios",
    brand: "Maxi Rubber",
    stars: 5,
    description: "Lixa de alta qualidade para preparação de superfícies."
  },
  {
    id: 32,
    name: "Tinta Esmalte Branco Neve 3,6L",
    price: 98.00,
    imageUrl: "https://m.media-amazon.com/images/I/5156f0sCGDL._AC_SX679_.jpg",
    category: "Tintas",
    brand: "I9",
    stars: 5,
    coverage: 340,
    description: "Branco puro com alta resistência a riscos."
  },
  {
    id: 33,
    name: "Rolo de Espuma 10cm",
    price: 8.50,
    imageUrl: "https://images.tcdn.com.br/img/img_prod/650361/rolo_de_la_para_pintura_atlas_15cm_4025_1_20200422151912.jpg",
    category: "Ferramentas para Pintura",
    brand: "Eucatex",
    stars: 3,
    description: "Ideal para acabamentos finos em superfícies lisas."
  },
  {
    id: 34,
    name: "Tinta Acrílica Vermelho Vivo 3,6L",
    price: 129.90,
    imageUrl: "https://m.media-amazon.com/images/I/61kJlFbPaoL._AC_SX679_.jpg",
    category: "Tintas",
    brand: "Suvinil",
    stars: 4,
    coverage: 360,
    description: "Cor vibrante para paredes de destaque."
  },
  {
    id: 35,
    name: "Massa Niveladora 25kg",
    price: 85.00,
    imageUrl: "https://m.media-amazon.com/images/I/61b6sFNbKBL._AC_SX679_.jpg",
    category: "Acessórios",
    brand: "Suvinil",
    stars: 4,
    description: "Perfeita para correção de irregularidades em paredes."
  },
  {
    id: 36,
    name: "Verniz Acrílico Incolor 3,6L",
    price: 110.00,
    imageUrl: "https://cdn.awsli.com.br/600x700/1347/1347540/produto/53873337/thinner-900ml-anjo.jpg",
    category: "Tintas",
    brand: "Lucks Color",
    stars: 5,
    coverage: 300,
    description: "Proteção invisível e duradoura para madeiras."
  },
  {
    id: 37,
    name: "Fita Isolante Profissional 20m",
    price: 6.90,
    imageUrl: "https://m.media-amazon.com/images/I/71yh4R5VBPL._AC_SX679_.jpg",
    category: "Acessórios",
    brand: "Maxi Rubber",
    stars: 5,
    description: "Isolamento seguro para fiações elétricas."
  },
  {
    id: 38,
    name: "Tinta Acrílica Verde Água 18L",
    price: 295.00,
    imageUrl: "https://images.tcdn.com.br/img/img_prod/650361/tinta_acrilica_fosco_completo_coral_branco_18l_4025_1_20200422151912.jpg",
    category: "Tintas",
    brand: "Suvinil",
    stars: 4,
    coverage: 380,
    description: "Tonalidade relaxante para quartos e banheiros.",
    isBestSeller: true
  },
  {
    id: 39,
    name: "Misturador de Tinta para Furadeira",
    price: 24.00,
    imageUrl: "https://m.media-amazon.com/images/I/51PNZjU8aRL._AC_SX679_.jpg",
    category: "Ferramentas para Pintura",
    brand: "Eucatex",
    stars: 5,
    description: "Garante a homogeneidade perfeita da tinta."
  },
  {
    id: 40,
    name: "Spray PU Branco Neve 400ml",
    price: 42.00,
    imageUrl: "https://tse3.mm.bing.net/th/id/OIP.qO6MysNn7M8jYzY2wqKz6QHaHa",
    category: "Sprays",
    brand: "Colorgin",
    stars: 4,
    description: "Ideal para retoques rápidos em branco sólido."
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
  { name: "Colorgin", logo: null },
  { name: "I9", logo: null },
  { name: "Eucatex", logo: null },
  { name: "Autoluks", logo: null },
  { name: "Lucks Color", logo: null },
  { name: "Maxi Rubber", logo: null },
  { name: "Suvinil", logo: null },
]

export const HERO_SLIDES = [
  {
    bg: "#1a1464",
    image: "https://images.tcdn.com.br/img/img_prod/650361/tinta_acrilica_fosco_completo_coral_branco_18l_4025_1_20200422151912.jpg",
    backgroundImage: "https://images.unsplash.com/photo-1589939705385-2ec553977760?q=80&w=2070&auto=format&fit=crop",
    brand: "Suvinil",
    title: "renova",
    sub: "Creme de Pintura",
    fallback: "🎨"
  },
  {
    bg: "#0d4a1a",
    image: "https://m.media-amazon.com/images/I/61kJlFbPaoL._AC_SX679_.jpg",
    backgroundImage: "https://images.unsplash.com/photo-1560185127-6ed189654679?q=80&w=2069&auto=format&fit=crop",
    brand: "Suvinil",
    title: "Cor & Proteção",
    sub: "Interior e Exterior",
    fallback: "🪣"
  },
  {
    bg: "#b45309",
    image: "https://images.tcdn.com.br/img/img_prod/650361/rolo_de_la_para_pintura_atlas_15cm_4025_1_20200422151912.jpg",
    backgroundImage: "https://images.unsplash.com/photo-1595844730298-b955ed7774d3?q=80&w=2070&auto=format&fit=crop",
    brand: "Eucatex",
    title: "Qualidade",
    sub: "Ferramentas e Acabamentos Profissionais",
    fallback: "🖌️"
  },
]
