-- =============================================================================
-- SILVER TINTAS - SUPABASE DATABASE SETUP
-- Este arquivo contém todos os scripts necessários para configurar o banco de dados.
-- Execute este arquivo uma vez no SQL Editor do Supabase.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- SEÇÃO 1: CRIAÇÃO DAS TABELAS (ESTRUTURA)
-- -----------------------------------------------------------------------------

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

-- Tabela de Marcas
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image_url TEXT,
  category_id UUID REFERENCES categories(id),
  brand_id UUID REFERENCES brands(id),
  stars NUMERIC,
  description TEXT,
  coverage TEXT
);

-- Tabela de Pedidos (CONECTADA AO PAGAMENTO)
-- Esta tabela armazena a transação principal e o status do pagamento do Mercado Pago
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  customer_cpf TEXT, -- Adicionado para compatibilidade com Mercado Pago
  customer_address TEXT,
  total_amount NUMERIC NOT NULL,
  payment_method TEXT, -- 'pix', 'card', 'boleto'
  payment_id TEXT,      -- ID da transação no Mercado Pago (MP_ID)
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Itens do Pedido
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL DEFAULT 'Produto',
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL
);

-- Tabela para vincular produtos aos kits
CREATE TABLE IF NOT EXISTS kit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER DEFAULT 1
);

-- Perfil público vinculado a cada conta criada no Supabase Auth.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Compatibilidade para projetos que já tenham criado as tabelas.
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS stars NUMERIC;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS coverage TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_cpf TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount NUMERIC;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE CASCADE;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS quantity INTEGER;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS price NUMERIC;
ALTER TABLE kit_items ADD COLUMN IF NOT EXISTS kit_id UUID REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE kit_items ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id);
ALTER TABLE kit_items ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_kit_items_kit_id ON kit_items(kit_id);


-- -----------------------------------------------------------------------------
-- SEÇÃO 2: POPULAÇÃO de DADOS (CATEGORIAS, MARCAS E PRODUTOS)
-- -----------------------------------------------------------------------------

DO $$
DECLARE
    cat_tintas UUID := (SELECT id FROM categories WHERE name = 'Tintas');
    cat_ferra UUID := (SELECT id FROM categories WHERE name = 'Ferramentas para Pintura');
    cat_imper UUID := (SELECT id FROM categories WHERE name = 'Impermeabilizante');
    cat_spray UUID := (SELECT id FROM categories WHERE name = 'Sprays');
    cat_aces UUID := (SELECT id FROM categories WHERE name = 'Acessórios');
    cat_kits UUID := (SELECT id FROM categories WHERE name = 'Kits');

    br_suvinil UUID := (SELECT id FROM brands WHERE name = 'Suvinil');
    br_euca UUID := (SELECT id FROM brands WHERE name = 'Eucatex');
    br_lucks UUID := (SELECT id FROM brands WHERE name = 'Lucks Color');
    br_maxi UUID := (SELECT id FROM brands WHERE name = 'Maxi Rubber');
    br_i9 UUID := (SELECT id FROM brands WHERE name = 'I9');
    br_auto UUID := (SELECT id FROM brands WHERE name = 'Autoluks');
    br_colo UUID := (SELECT id FROM brands WHERE name = 'Colorgin');
BEGIN
    -- Inserindo Categorias
    INSERT INTO categories (name) VALUES
    ('Tintas'), ('Ferramentas para Pintura'), ('Impermeabilizante'), ('Sprays'), ('Acessórios'), ('Kits')
    ON CONFLICT (name) DO NOTHING;

    -- Atualizando variáveis de categoria após a inserção
    cat_tintas := (SELECT id FROM categories WHERE name = 'Tintas');
    cat_ferra := (SELECT id FROM categories WHERE name = 'Ferramentas para Pintura');
    cat_imper := (SELECT id FROM categories WHERE name = 'Impermeabilizante');
    cat_spray := (SELECT id FROM categories WHERE name = 'Sprays');
    cat_aces := (SELECT id FROM categories WHERE name = 'Acessórios');
    cat_kits := (SELECT id FROM categories WHERE name = 'Kits');

    -- Inserindo Marcas
    INSERT INTO brands (name) VALUES
    ('Colorgin'), ('I9'), ('Eucatex'), ('Autoluks'), ('Lucks Color'), ('Maxi Rubber'), ('Suvinil')
    ON CONFLICT (name) DO NOTHING;

    -- Atualizando variáveis de marca
    br_suvinil := (SELECT id FROM brands WHERE name = 'Suvinil');
    br_euca := (SELECT id FROM brands WHERE name = 'Eucatex');
    br_lucks := (SELECT id FROM brands WHERE name = 'Lucks Color');
    br_maxi := (SELECT id FROM brands WHERE name = 'Maxi Rubber');
    br_i9 := (SELECT id FROM brands WHERE name = 'I9');
    br_auto := (SELECT id FROM brands WHERE name = 'Autoluks');
    br_colo := (SELECT id FROM brands WHERE name = 'Colorgin');

    -- Insere o catálogo de exemplo uma única vez.
    IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Suvinil Rende Muito 18L') THEN
    INSERT INTO products (name, price, image_url, category_id, brand_id, stars, coverage, description) VALUES
    ('Suvinil Rende Muito 18L', 259.90, 'https://images.tcdn.com.br/img/img_prod/650361/tinta_acrilica_fosco_completo_coral_branco_18l_4025_1_20200422151912.jpg', cat_tintas, br_suvinil, 5, 400, 'Tinta acrílica fosco de alta cobertura e durabilidade.'),
    ('Suvinil Cor & Proteção 18L', 289.90, 'https://m.media-amazon.com/images/I/61kJlFbPaoL._AC_SX679_.jpg', cat_tintas, br_suvinil, 5, 380, 'Tinta premium com proteção UV e resistência à umidade.'),
    ('Rolo de Pintura 23cm Atlas', 19.80, 'https://images.tcdn.com.br/img/img_prod/650361/rolo_de_la_para_pintura_atlas_15cm_4025_1_20200422151912.jpg', cat_ferra, br_euca, 4, NULL, 'Rolo de lã para aplicação uniforme.'),
    ('Acabamento Iquine 3,6L', 205.90, 'https://cdn.awsli.com.br/2500x2500/1869/1869036/produto/153855114/3ca522bacc.jpg', cat_tintas, br_lucks, 4, 360, 'Acabamento semibrilho resistente a limpeza.'),
    ('Tinta PU Automotiva Preto 3,6L', 189.90, 'https://tse4.mm.bing.net/th/id/OIP.4zWZc9F3nS2uR6pTj6m0UQHaHa', cat_tintas, br_suvinil, 5, 320, NULL),
    ('Primer PU Cinza 3,6L', 149.90, 'https://tse3.mm.bing.net/th/id/OIP.qO6MysNn7M8jYzY2wqKz6QHaHa', cat_imper, br_suvinil, 4, 280, NULL),
    ('Verniz PU Alto Brilho 900ml', 59.90, 'https://cdn.awsli.com.br/600x700/1347/1347540/produto/53873337/thinner-900ml-anjo.jpg', cat_spray, br_auto, 5, NULL, NULL),
    ('Esmalte Sintético Branco 3,6L', 89.90, 'https://m.media-amazon.com/images/I/5156f0sCGDL._AC_SX679_.jpg', cat_tintas, br_i9, 5, 350, NULL),
    ('Fita Crepe Profissional 48mm', 8.90, 'https://m.media-amazon.com/images/I/71yh4R5VBPL._AC_SX679_.jpg', cat_aces, br_maxi, 5, NULL, 'Fita crepe para acabamentos precisos.'),
    ('Massa Corrida PVA 25kg', 89.90, 'https://m.media-amazon.com/images/I/61b6sFNbKBL._AC_SX679_.jpg', cat_aces, br_suvinil, 4, NULL, 'Massa corrida para nivelamento de paredes.'),
    ('Bandeja para Rolo 23cm', 12.90, 'https://m.media-amazon.com/images/I/51PNZjU8aRL._AC_SX679_.jpg', cat_ferra, br_euca, 4, NULL, 'Bandeja plástica reforçada.'),
    ('Lona Plástica 4x4m', 24.90, 'https://m.media-amazon.com/images/I/71Kl7e7y9ML._AC_SX679_.jpg', cat_aces, br_euca, 4, NULL, 'Proteção de piso e móveis durante pintura.'),
    ('Tinta Acrílica Premium Branco Neve 18L', 310.00, 'https://images.tcdn.com.br/img/img_prod/650361/tinta_acrilica_fosco_completo_coral_branco_18l_4025_1_20200422151912.jpg', cat_tintas, br_suvinil, 5, 420, 'A melhor escolha para paredes internas e externas.'),
    ('Tinta Acrílica Premium Cinza Platina 18L', 325.00, 'https://m.media-amazon.com/images/I/61kJlFbPaoL._AC_SX679_.jpg', cat_tintas, br_suvinil, 5, 390, 'Tinta moderna com acabamento sofisticado.'),
    ('Rolo de Lã Carneiro 15cm', 14.50, 'https://images.tcdn.com.br/img/img_prod/650361/rolo_de_la_para_pintura_atlas_15cm_4025_1_20200422151912.jpg', cat_ferra, br_euca, 4, NULL, 'Ideal para superfícies com textura.'),
    ('Selador Acrílico Branco 18L', 145.00, 'https://cdn.awsli.com.br/2500x2500/1869/1869036/produto/153855114/3ca522bacc.jpg', cat_imper, br_lucks, 4, 300, 'Prepara a superfície para receber a tinta.'),
    ('Verniz Marítimo Brilhante 900ml', 45.00, 'https://cdn.awsli.com.br/600x700/1347/1347540/produto/53873337/thinner-900ml-anjo.jpg', cat_spray, br_auto, 5, NULL, 'Proteção extrema contra sol e chuva.'),
    ('Tinta Esmalte Brilhante Preto 3,6L', 95.00, 'https://m.media-amazon.com/images/I/5156f0sCGDL._AC_SX679_.jpg', cat_tintas, br_i9, 5, 340, 'Ideal para metais e madeiras.'),
    ('Pincel Tramontina 2 polegadas', 12.00, 'https://m.media-amazon.com/images/I/71yh4R5VBPL._AC_SX679_.jpg', cat_ferra, br_lucks, 4, NULL, 'Cerdas macias para acabamento perfeito.'),
    ('Tinta Acrílica Azul Royal 18L', 310.00, 'https://images.tcdn.com.br/img/img_prod/650361/tinta_acrilica_fosco_completo_coral_branco_18l_4025_1_20200422151912.jpg', cat_tintas, br_suvinil, 5, 400, 'Azul vibrante para destaque em ambientes.'),
    ('Tinta Acrílica Amarelo Sol 18L', 310.00, 'https://m.media-amazon.com/images/I/61kJlFbPaoL._AC_SX679_.jpg', cat_tintas, br_suvinil, 5, 380, 'Traz luminosidade e alegria para o ambiente.'),
    ('Rolo de Lã Sintética 23cm', 22.90, 'https://images.tcdn.com.br/img/img_prod/650361/rolo_de_la_para_pintura_atlas_15cm_4025_1_20200422151912.jpg', cat_ferra, br_euca, 4, NULL, 'Ideal para superfícies lisas.'),
    ('Massa Acrílica Externa 25kg', 110.00, 'https://m.media-amazon.com/images/I/61b6sFNbKBL._AC_SX679_.jpg', cat_aces, br_suvinil, 5, NULL, 'Resistente a intempéries para áreas externas.'),
    ('Tinta Acrílica Fosco Branco 3,6L', 115.90, 'https://images.tcdn.com.br/img/img_prod/650361/tinta_acrilica_fosco_completo_coral_branco_18l_4025_1_20200422151912.jpg', cat_tintas, br_suvinil, 4, NULL, 'Acabamento fosco ideal para esconder imperfeições.'),
    ('Tinta Acrílica Semibrilho Bege 18L', 275.00, 'https://m.media-amazon.com/images/I/61kJlFbPaoL._AC_SX679_.jpg', cat_tintas, br_suvinil, 5, 370, 'Elegância e facilidade de limpeza para salas e quartos.'),
    ('Kit Pincéis Profissionais (3 un)', 34.90, 'https://m.media-amazon.com/images/I/71yh4R5VBPL._AC_SX679_.jpg', cat_ferra, br_lucks, 4, NULL, 'Conjunto com tamanhos variados para recortes perfeitos.'),
    ('Impermeabilizante Líquido 18L', 189.00, 'https://cdn.awsli.com.br/2500x2500/1869/1869036/produto/153855114/3ca522bacc.jpg', cat_imper, br_lucks, 5, 250, 'Ideal para lajes e áreas úmidas, evita infiltrações.'),
    ('Spray PU Preto Fosco 400ml', 42.00, 'https://tse4.mm.bing.net/th/id/OIP.4zWZc9F3nS2uR6pTj6m0UQHaHa', cat_spray, br_colo, 5, NULL, 'Secagem rápida e acabamento fosco profissional.'),
    ('Spray PU Prata Metálico 400ml', 42.00, 'https://tse3.mm.bing.net/th/id/OIP.qO6MysNn7M8jYzY2wqKz6QHaHa', cat_spray, br_colo, 4, NULL, 'Ideal para rodas e detalhes cromados.'),
    ('Lixa d''água Grão 220 (10 un)', 15.00, 'https://m.media-amazon.com/images/I/71yh4R5VBPL._AC_SX679_.jpg', cat_aces, br_maxi, 5, NULL, 'Lixa de alta qualidade para preparação de superfícies.'),
    ('Tinta Esmalte Branco Neve 3,6L', 98.00, 'https://m.media-amazon.com/images/I/5156f0sCGDL._AC_SX679_.jpg', cat_tintas, br_i9, 5, 340, 'Branco puro com alta resistência a riscos.'),
    ('Rolo de Espuma 10cm', 8.50, 'https://images.tcdn.com.br/img/img_prod/650361/rolo_de_la_para_pintura_atlas_15cm_4025_1_20200422151912.jpg', cat_ferra, br_euca, 3, NULL, 'Ideal para acabamentos finos em superfícies lisas.'),
    ('Tinta Acrílica Vermelho Vivo 3,6L', 129.90, 'https://m.media-amazon.com/images/I/61kJlFbPaoL._AC_SX679_.jpg', cat_tintas, br_suvinil, 4, 360, 'Cor vibrante para paredes de destaque.'),
    ('Massa Niveladora 25kg', 85.00, 'https://m.media-amazon.com/images/I/61b6sFNbKBL._AC_SX679_.jpg', cat_aces, br_suvinil, 4, NULL, 'Perfeita para correção de irregularidades em paredes.'),
    ('Verniz Acrílico Incolor 3,6L', 110.00, 'https://cdn.awsli.com.br/600x700/1347/1347540/produto/53873337/thinner-900ml-anjo.jpg', cat_tintas, br_lucks, 5, 300, 'Proteção invisível e duradoura para madeiras.'),
    ('Fita Isolante Profissional 20m', 6.90, 'https://m.media-amazon.com/images/I/71yh4R5VBPL._AC_SX679_.jpg', cat_aces, br_maxi, 5, NULL, 'Isolamento seguro para fiações elétricas.'),
    ('Tinta Acrílica Verde Água 18L', 295.00, 'https://images.tcdn.com.br/img/img_prod/650361/tinta_acrilica_fosco_completo_coral_branco_18l_4025_1_20200422151912.jpg', cat_tintas, br_suvinil, 4, 380, 'Tonalidade relaxante para quartos e banheiros.'),
    ('Misturador de Tinta para Furadeira', 24.00, 'https://m.media-amazon.com/images/I/51PNZjU8aRL._AC_SX679_.jpg', cat_ferra, br_euca, 5, NULL, 'Garante a homogeneidade perfeita da tinta.'),
    ('Spray PU Branco Neve 400ml', 42.00, 'https://tse3.mm.bing.net/th/id/OIP.qO6MysNn7M8jYzY2wqKz6QHaHa', cat_spray, br_colo, 4, NULL, 'Ideal para retoques rápidos em branco sólido.'),
    ('Tinta Epóxi Piso Industrial 18L', 450.00, 'https://example.com/epoxi.jpg', cat_tintas, br_suvinil, 5, 200, 'Ultra resistência para garagens e oficinas.'),
    ('Massa Plástica Alumínio 1kg', 35.00, 'https://example.com/massa-plast.jpg', cat_aces, br_maxi, 4, NULL, 'Ideal para reparos em lataria e superfícies rígidas.'),
    ('Solvente Thinner 5L', 75.00, 'https://example.com.br/thinner.jpg', cat_aces, br_auto, 5, NULL, 'Diluente profissional para tintas PU e esmaltes.'),
    ('Lixa Ferro Grão 80 (5 un)', 12.00, 'https://example.com/lixa-ferro.jpg', cat_aces, br_maxi, 5, NULL, 'Lixa grossa para remoção de ferrugem.'),
    ('Espátula de Aço 2 polegadas', 15.00, 'https://example.com/espatula.jpg', cat_ferra, br_lucks, 4, NULL, 'Para aplicação de massas e raspagem.'),
    ('Tinta Spray Ouro Metálico 400ml', 45.00, 'https://example.com/spray-ouro.jpg', cat_spray, br_colo, 5, NULL, 'Acabamento luxuoso em ouro.'),
    ('Rolo de Lã Carneiro 9cm', 11.00, 'https://example.com/rolo-9.jpg', cat_ferra, br_euca, 4, NULL, 'Para recortes e áreas pequenas.'),
    ('Tinta Acrílica Terracota 3,6L', 135.00, 'https://example.com/terracota.jpg', cat_tintas, br_suvinil, 5, 360, 'Cor terrosa moderna para salas.'),
    ('Verniz PU Fosco 900ml', 62.00, 'https://example.com/verniz-fosco.jpg', cat_spray, br_auto, 5, NULL, 'Acabamento elegante e sem brilho.'),
    ('Tinta Acrílica Grafite 18L', 310.00, 'https://example.com/grafite.jpg', cat_tintas, br_suvinil, 5, 390, 'O cinza mais pedido para fachadas modernas.');
    END IF;

    -- Inserindo Kits (como produtos especiais)
    IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Kit Quarto Completo') THEN
    INSERT INTO products (name, price, image_url, category_id, brand_id, description)
    VALUES
    ('Kit Quarto Completo', 349.90, 'https://example.com/kit-quarto.jpg', cat_kits, NULL, 'Tudo para pintar um quarto de até 15m²'),
    ('Kit Banheiro Anti-mofo', 229.90, 'https://example.com/kit-banheiro.jpg', cat_kits, NULL, 'Proteção contra umidade e mofo'),
    ('Kit Fachada Premium', 479.90, 'https://example.com/kit-fachada.jpg', cat_kits, NULL, 'Proteção máxima para área externa');
    END IF;
END $$;


-- -----------------------------------------------------------------------------
-- SEÇÃO 3: VINCULANDO PRODUTOS AOS KITS
-- -----------------------------------------------------------------------------

-- Vinculando itens ao Kit Quarto Completo
INSERT INTO kit_items (kit_id, product_id, quantity)
SELECT
  (SELECT id FROM products WHERE name = 'Kit Quarto Completo'),
  product.id, 1
FROM products AS product
WHERE product.name IN ('Suvinil Rende Muito 18L', 'Rolo de Pintura 23cm Atlas', 'Bandeja para Rolo 23cm', 'Fita Crepe Profissional 48mm', 'Lona Plástica 4x4m')
  AND NOT EXISTS (
    SELECT 1 FROM kit_items existing
    WHERE existing.kit_id = (SELECT id FROM products WHERE name = 'Kit Quarto Completo')
      AND existing.product_id = product.id
  );

-- Vinculando itens ao Kit Banheiro
INSERT INTO kit_items (kit_id, product_id, quantity)
SELECT
  (SELECT id FROM products WHERE name = 'Kit Banheiro Anti-mofo'),
  product.id, 1
FROM products AS product
WHERE product.name IN ('Tinta Acrílica Fosco Branco 3,6L', 'Pincel Tramontina 2 polegadas', 'Fita Crepe Profissional 48mm', 'Selador Acrílico Branco 18L')
  AND NOT EXISTS (
    SELECT 1 FROM kit_items existing
    WHERE existing.kit_id = (SELECT id FROM products WHERE name = 'Kit Banheiro Anti-mofo')
      AND existing.product_id = product.id
  );

-- Vinculando itens ao Kit Fachada
INSERT INTO kit_items (kit_id, product_id, quantity)
SELECT
  (SELECT id FROM products WHERE name = 'Kit Fachada Premium'),
  product.id, 1
FROM products AS product
WHERE product.name IN ('Massa Acrílica Externa 25kg', 'Rolo de Lã Sintética 23cm', 'Bandeja para Rolo 23cm', 'Primer PU Cinza 3,6L', 'Lona Plástica 4x4m')
  AND NOT EXISTS (
    SELECT 1 FROM kit_items existing
    WHERE existing.kit_id = (SELECT id FROM products WHERE name = 'Kit Fachada Premium')
      AND existing.product_id = product.id
  );

-- -----------------------------------------------------------------------------
-- SEÇÃO 4: SEGURANÇA (RLS)
-- Catálogo: leitura pública. Perfis: cada usuário acessa somente o próprio.
-- Pedidos: somente o backend com service role.
-- -----------------------------------------------------------------------------

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON categories, brands, products, kit_items TO anon, authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON categories, brands, products, orders, order_items, kit_items, public.profiles TO service_role;
REVOKE INSERT, UPDATE, DELETE ON categories, brands, products, kit_items FROM anon, authenticated;
REVOKE ALL ON orders, order_items FROM anon, authenticated;
REVOKE ALL ON public.profiles FROM anon;

-- Cria um perfil quando o cadastro por e-mail inserir um usuário no Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    NULLIF(BTRIM(NEW.raw_user_meta_data ->> 'full_name'), '')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Cria perfis para contas que já existiam antes da instalação deste script.
INSERT INTO public.profiles (id, full_name)
SELECT
  id,
  NULLIF(BTRIM(raw_user_meta_data ->> 'full_name'), '')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Public can read categories" ON categories;
CREATE POLICY "Public can read categories" ON categories
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public can read brands" ON brands;
CREATE POLICY "Public can read brands" ON brands
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public can read products" ON products;
CREATE POLICY "Public can read products" ON products
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public can read kit items" ON kit_items;
CREATE POLICY "Public can read kit items" ON kit_items
  FOR SELECT TO anon, authenticated USING (true);

COMMIT;
