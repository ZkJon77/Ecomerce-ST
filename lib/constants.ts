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
    imageUrl: "data:image/webp;base64,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",
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
    imageUrl: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSZZRfYHWkKFIbSYteN6LR-Onp19zlffC5sdJF5C67yLeiqoEHKmQFydVytDKNUW-vHSuVwSbxwRZWRBeoylSO0q7e1u3UTzB-MNT6-b0Ngf52lkefX_ofewd-iMW3gupc_k5SEL8ICsKw&usqp=CAc",
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
    imageUrl: "https://http2.mlstatic.com/D_NQ_NP_613055-MLA85076998911_052025-O.webp",
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
    imageUrl: "https://d2byg56fbf6u3p.cloudfront.net/1114/imagens/18610384896365789a1c75f9.98539539.1667594394_l.jpg",
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
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcHUObe9_p3xHwpXd0SuF1MvETQfaP69thdmRZkcNPqv43kPdTKH5GfEc&s=10",
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
    imageUrl: "https://http2.mlstatic.com/D_NQ_NP_606908-MLB89348026399_082025-O.webp",
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
    imageUrl: "https://maxitintas.vteximg.com.br/arquivos/ids/155800-1000-1000/verniz-hs-pu-automotivo-21-c-catalisador-autoluks-900ml-228x228.jpg?v=637957323204870000",
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
    image: "https://verginia.vtexassets.com/arquivos/ids/158701/Tinta-Toque-Fosco-Suvinil-36L.png?v=638569020446500000",
    backgroundImage: "https://images.unsplash.com/photo-1562619667-d6d26d870e7c?q=80&w=2070&auto=format&fit=crop",
    brand: "Suvinil",
    title: "Cores que Inspiram",
    sub: "Transforme seus ambientes com a linha Premium da Suvinil.",
    fallback: "https://images.unsplash.com/photo-1589939705385-2ec553977760?q=80&w=500&auto=format&fit=crop"
  },
  {
    bg: "#0d4a1a",
    image: "https://cdn.iset.io/assets/52257/produtos/53/protecao_total_18l.png",
    backgroundImage: "https://images.unsplash.com/photo-1589939705385-2ec553977760?q=80&w=2070&auto=format&fit=crop",
    brand: "Suvinil",
    title: "Proteção Total",
    sub: "Tinta Cor & Proteção: a armadura ideal para sua casa.",
    fallback: "https://images.unsplash.com/photo-1562619667-d6d26d870e7c?q=80&w=500&auto=format&fit=crop"
  },
  {
    bg: "#b45309",
    image: "https://eucatex.cdn.aatb.com.br/Uploads/Produtos/Downloads/10142-imagem-embalagem-eucatex-protege-lumina-acrilico-premium-semibrilho-18-l.png",
    backgroundImage: "https://images.unsplash.com/photo-1595844730298-b955ed7774d3?q=80&w=2070&auto=format&fit=crop",
    brand: "Eucatex",
    title: "Acabamento Perfeito",
    sub: "Ferramentas profissionais para quem não abre mão da qualidade.",
    fallback: "https://images.unsplash.com/photo-1595844730298-b955ed7774d3?q=80&w=500&auto=format&fit=crop"
  },
]
