# 🚀 Guia de Vinculação e Implementação - Ecommerce Silver Tintas

Este documento serve como o mapa mestre para vincular o Front-end, Back-end, Banco de Dados e Gateway de Pagamento.

## 🛠️ 1. Fluxo de Dados (Como tudo se conecta)

`Front-end (Checkout)` $\rightarrow$ `API Route (create-payment)` $\rightarrow$ `Supabase (DB)` $\rightarrow$ `Mercado Pago (API)` $\rightarrow$ `WhatsApp (Notificação)`

### Detalhes da Vinculação:
- **Front $\rightarrow$ Back**: O arquivo `checkout/page.tsx` envia um JSON com `cart`, `userData` (incluindo CPF) e `paymentMethod` para `/api/checkout/create-payment`.
- **Back $\rightarrow$ Banco**: A API `create-payment/route.ts` insere os dados na tabela `orders` e `order_items` do Supabase.
- **Back $\rightarrow$ Pagamento**: A API usa o `MP_ACCESS_TOKEN` para criar a cobrança no Mercado Pago e retorna o QR Code/Boleto para o Front.
- **Back $\rightarrow$ WhatsApp**: Após criar o pedido, a função `sendOrderNotification` é disparada para avisar o cliente.

---

## 🗄️ 2. Banco de Dados (Supabase)

Para vincular o banco, copie os códigos abaixo e execute-os no **SQL Editor** do Supabase.

### Parte 1: Estrutura do Banco (Tabelas)
```sql
-- 1. Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

-- 2. Tabela de Marcas
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

-- 3. Tabela de Produtos
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

-- 4. Tabela de Pedidos (Conectada ao Pagamento)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  customer_cpf TEXT, 
  customer_address TEXT,
  total_amount NUMERIC NOT NULL,
  payment_method TEXT, 
  payment_id TEXT,      
  status TEXT DEFAULT 'pending', 
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabela de Itens do Pedido
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL
);

-- 6. Tabela de Itens dos Kits
CREATE TABLE IF NOT EXISTS kit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER DEFAULT 1
);
```

### Parte 2: População de Dados (Produtos e Kits)
```sql
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
    INSERT INTO categories (name) VALUES
    ('Tintas'), ('Ferramentas para Pintura'), ('Impermeabilizante'), ('Sprays'), ('Acessórios'), ('Kits')
    ON CONFLICT (name) DO NOTHING;

    cat_tintas := (SELECT id FROM categories WHERE name = 'Tintas');
    cat_ferra := (SELECT id FROM categories WHERE name = 'Ferramentas para Pintura');
    cat_imper := (SELECT id FROM categories WHERE name = 'Impermeabilizante');
    cat_spray := (SELECT id FROM categories WHERE name = 'Sprays');
    cat_aces := (SELECT id FROM categories WHERE name = 'Acessórios');
    cat_kits := (SELECT id FROM categories WHERE name = 'Kits');

    INSERT INTO brands (name) VALUES
    ('Colorgin'), ('I9'), ('Eucatex'), ('Autoluks'), ('Lucks Color'), ('Maxi Rubber'), ('Suvinil')
    ON CONFLICT (name) DO NOTHING;

    br_suvinil := (SELECT id FROM brands WHERE name = 'Suvinil');
    br_euca := (SELECT id FROM brands WHERE name = 'Eucatex');
    br_lucks := (SELECT id FROM brands WHERE name = 'Lucks Color');
    br_maxi := (SELECT id FROM brands WHERE name = 'Maxi Rubber');
    br_i9 := (SELECT id FROM brands WHERE name = 'I9');
    br_auto := (SELECT id FROM brands WHERE name = 'Autoluks');
    br_colo := (SELECT id FROM brands WHERE name = 'Colorgin');

    INSERT INTO products (name, price, image_url, category_id, brand_id, stars, coverage, description) VALUES
    ('Suvinil Rende Muito 18L', 259.90, 'https://images.tcdn.com.br/img/img_prod/650361/tinta_acrilica_fosco_completo_coral_branco_18l_4025_1_20200422151912.jpg', cat_tintas, br_suvinil, 5, 400, 'Tinta acrílica fosco de alta cobertura.'),
    ('Suvinil Cor & Proteção 18L', 289.90, 'https://m.media-amazon.com/images/I/61kJlFbPaoL._AC_SX679_.jpg', cat_tintas, br_suvinil, 5, 380, 'Tinta premium com proteção UV.'),
    ('Rolo de Pintura 23cm Atlas', 19.80, 'https://images.tcdn.com.br/img/img_prod/650361/rolo_de_la_para_pintura_atlas_15cm_4025_1_20200422151912.jpg', cat_ferra, br_euca, 4, NULL, 'Rolo de lã para aplicação uniforme.'),
    ('Acabamento Iquine 3,6L', 205.90, 'https://cdn.awsli.com.br/2500x2500/1869/1869036/produto/153855114/3ca522bacc.jpg', cat_tintas, br_lucks, 4, 360, 'Acabamento semibrilho resistente.'),
    ('Tinta PU Automotiva Preto 3,6L', 189.90, 'https://tse4.mm.bing.net/th/id/OIP.4zWZc9F3nS2uR6pTj6m0UQHaHa', cat_tintas, br_suvinil, 5, 320, NULL),
    ('Primer PU Cinza 3,6L', 149.90, 'https://tse3.mm.bing.net/th/id/OIP.qO6MysNn7M8jYzY2wqKz6QHaHa', cat_imper, br_suvinil, 4, 280, NULL),
    ('Verniz PU Alto Brilho 900ml', 59.90, 'https://cdn.awsli.com.br/600x700/1347/1347540/produto/53873337/thinner-900ml-anjo.jpg', cat_spray, br_auto, 5, NULL, NULL),
    ('Esmalte Sintético Branco 3,6L', 89.90, 'https://m.media-amazon.com/images/I/5156f0sCGDL._AC_SX679_.jpg', cat_tintas, br_i9, 5, 350, NULL),
    ('Fita Crepe Profissional 48mm', 8.90, 'https://m.media-amazon.com/images/I/71yh4R5VBPL._AC_SX679_.jpg', cat_aces, br_maxi, 5, NULL, 'Fita crepe para acabamentos precisos.'),
    ('Massa Corrida PVA 25kg', 89.90, 'https://m.media-amazon.com/images/I/61b6sFNbKBL._AC_SX679_.jpg', cat_aces, br_suvinil, 4, NULL, 'Massa corrida para nivelamento.'),
    ('Bandeja para Rolo 23cm', 12.90, 'https://m.media-amazon.com/images/I/51PNZjU8aRL._AC_SX679_.jpg', cat_ferra, br_euca, 4, NULL, 'Bandeja plástica reforçada.'),
    ('Lona Plástica 4x4m', 24.90, 'https://m.media-amazon.com/images/I/71Kl7e7y9ML._AC_SX679_.jpg', cat_aces, br_euca, 4, NULL, 'Proteção de piso e móveis.'),
    ('Tinta Acrílica Premium Branco Neve 18L', 310.00, 'https://images.tcdn.com.br/img/img_prod/650361/tinta_acrilica_fosco_completo_coral_branco_18l_4025_1_20200422151912.jpg', cat_tintas, br_suvinil, 5, 420, 'A melhor escolha para paredes.'),
    ('Tinta Acrílica Premium Cinza Platina 18L', 325.00, 'https://m.media-amazon.com/images/I/61kJlFbPaoL._AC_SX679_.jpg', cat_tintas, br_suvinil, 5, 390, 'Tinta moderna sofisticada.'),
    ('Rolo de Lã Carneiro 15cm', 14.50, 'https://images.tcdn.com.br/img/img_prod/650361/rolo_de_la_para_pintura_atlas_15cm_4025_1_20200422151912.jpg', cat_ferra, br_euca, 4, NULL, 'Ideal para texturas.'),
    ('Selador Acrílico Branco 18L', 145.00, 'https://cdn.awsli.com.br/2500x2500/1869/1869036/produto/153855114/3ca522bacc.jpg', cat_imper, br_lucks, 4, 300, 'Prepara a superfície.'),
    ('Verniz Marítimo Brilhante 900ml', 45.00, 'https://cdn.awsli.com.br/600x700/1347/1347540/produto/53873337/thinner-900ml-anjo.jpg', cat_spray, br_auto, 5, NULL, 'Proteção contra sol e chuva.'),
    ('Tinta Esmalte Brilhante Preto 3,6L', 95.00, 'https://m.media-amazon.com/images/I/5156f0sCGDL._AC_SX679_.jpg', cat_tintas, br_i9, 5, 340, 'Ideal para metais.'),
    ('Pincel Tramontina 2 polegadas', 12.00, 'https://m.media-amazon.com/images/I/71yh4R5VBPL._AC_SX679_.jpg', cat_ferra, br_lucks, 4, NULL, 'Cerdas macias.'),
    ('Tinta Acrílica Azul Royal 18L', 310.00, 'https://images.tcdn.com.br/img/img_prod/650361/tinta_acrilica_fosco_completo_coral_branco_18l_4025_1_20200422151912.jpg', cat_tintas, br_suvinil, 5, 400, 'Azul vibrante.'),
    ('Tinta Acrílica Amarelo Sol 18L', 310.00, 'https://m.media-amazon.com/images/I/61kJlFbPaoL._AC_SX679_.jpg', cat_tintas, br_suvinil, 5, 380, 'Traz luminosidade.'),
    ('Rolo de Lã Sintética 23cm', 22.90, 'https://images.tcdn.com.br/img/img_prod/650361/rolo_de_la_para_pintura_atlas_15cm_4025_1_20200422151912.jpg', cat_ferra, br_euca, 4, NULL, 'Ideal para superfícies lisas.'),
    ('Massa Acrílica Externa 25kg', 110.00, 'https://m.media-amazon.com/images/I/61b6sFNbKBL._AC_SX679_.jpg', cat_aces, br_suvinil, 5, NULL, 'Resistente a intempéries.'),
    ('Tinta Acrílica Fosco Branco 3,6L', 115.90, 'https://images.tcdn.com.br/img/img_prod/650361/tinta_acrilica_fosco_completo_coral_branco_18l_4025_1_20200422151912.jpg', cat_tintas, br_suvinil, 4, NULL, 'Acabamento fosco.'),
    ('Tinta Acrílica Semibrilho Bege 18L', 275.00, 'https://m.media-amazon.com/images/I/61kJlFbPaoL._AC_SX679_.jpg', cat_tintas, br_suvinil, 5, 370, 'Elegância e facilidade de limpeza.'),
    ('Kit Pincéis Profissionais (3 un)', 34.90, 'https://m.media-amazon.com/images/I/71yh4R5VBPL._AC_SX679_.jpg', cat_ferra, br_lucks, 4, NULL, 'Conjunto variado.'),
    ('Impermeabilizante Líquido 18L', 189.00, 'https://cdn.awsli.com.br/2500x2500/1869/1869036/produto/153855114/3ca522bacc.jpg', cat_imper, br_lucks, 5, 250, 'Evita infiltrações.'),
    ('Spray PU Preto Fosco 400ml', 42.00, 'https://tse4.mm.bing.net/th/id/OIP.4zWZc9F3nS2uR6pTj6m0UQHaHa', cat_spray, br_colo, 5, NULL, 'Secagem rápida.'),
    ('Spray PU Prata Metálico 400ml', 42.00, 'https://tse3.mm.bing.net/th/id/OIP.qO6MysNn7M8jYzY2wqKz6QHaHa', cat_spray, br_colo, 4, NULL, 'Ideal para rodas.'),
    ('Lixa d''água Grão 220 (10 un)', 15.00, 'https://m.media-amazon.com/images/I/71yh4R5VBPL._AC_SX679_.jpg', cat_aces, br_maxi, 5, NULL, 'Preparação de superfícies.'),
    ('Tinta Esmalte Branco Neve 3,6L', 98.00, 'https://m.media-amazon.com/images/I/5156f0sCGDL._AC_SX679_.jpg', cat_tintas, br_i9, 5, 340, 'Alta resistência.'),
    ('Rolo de Espuma 10cm', 8.50, 'https://images.tcdn.com.br/img/img_prod/650361/rolo_de_la_para_pintura_atlas_15cm_4025_1_20200422151912.jpg', cat_ferra, br_euca, 3, NULL, 'Acabamentos finos.'),
    ('Tinta Acrílica Vermelho Vivo 3,6L', 129.90, 'https://m.media-amazon.com/images/I/61kJlFbPaoL._AC_SX679_.jpg', cat_tintas, br_suvinil, 4, 360, 'Cor vibrante.'),
    ('Massa Niveladora 25kg', 85.00, 'https://m.media-amazon.com/images/I/61b6sFNbKBL._AC_SX679_.jpg', cat_aces, br_suvinil, 4, NULL, 'Correção de irregularidades.'),
    ('Verniz Acrílico Incolor 3,6L', 110.00, 'https://cdn.awsli.com.br/600x700/1347/1347540/produto/53873337/thinner-900ml-anjo.jpg', cat_tintas, br_lucks, 5, 300, 'Proteção invisível.'),
    ('Fita Isolante Profissional 20m', 6.90, 'https://m.media-amazon.com/images/I/71yh4R5VBPL._AC_SX679_.jpg', cat_aces, br_maxi, 5, NULL, 'Isolamento seguro.'),
    ('Tinta Acrílica Verde Água 18L', 295.00, 'https://images.tcdn.com.br/img/img_prod/650361/tinta_acrilica_fosco_completo_coral_branco_18l_4025_1_20200422151912.jpg', cat_tintas, br_suvinil, 4, 380, 'Tonalidade relaxante.'),
    ('Misturador de Tinta para Furadeira', 24.00, 'https://m.media-amazon.com/images/I/51PNZjU8aRL._AC_SX679_.jpg', cat_ferra, br_euca, 5, NULL, 'Homogeneidade perfeita.'),
    ('Spray PU Branco Neve 400ml', 42.00, 'https://tse3.mm.bing.net/th/id/OIP.qO6MysNn7M8jYzY2wqKz6QHaHa', cat_spray, br_colo, 4, NULL, 'Retoques rápidos.'),
    ('Tinta Epóxi Piso Industrial 18L', 450.00, 'https://example.com/epoxi.jpg', cat_tintas, br_suvinil, 5, 200, 'Ultra resistência.'),
    ('Massa Plástica Alumínio 1kg', 35.00, 'https://example.com/massa-plast.jpg', cat_aces, br_maxi, 4, NULL, 'Reparos em lataria.'),
    ('Solvente Thinner 5L', 75.00, 'https://example.com.br/thinner.jpg', cat_aces, br_auto, 5, NULL, 'Diluente profissional.'),
    ('Lixa Ferro Grão 80 (5 un)', 12.00, 'https://example.com/lixa-ferro.jpg', cat_aces, br_maxi, 5, NULL, 'Remoção de ferrugem.'),
    ('Espátula de Aço 2 polegadas', 15.00, 'https://example.com/espatula.jpg', cat_ferra, br_lucks, 4, NULL, 'Aplicação de massas.'),
    ('Tinta Spray Ouro Metálico 400ml', 45.00, 'https://example.com/spray-ouro.jpg', cat_spray, br_colo, 5, NULL, 'Acabamento luxuoso.'),
    ('Rolo de Lã Carneiro 9cm', 11.00, 'https://example.com/rolo-9.jpg', cat_ferra, br_euca, 4, NULL, 'Recortes e áreas pequenas.'),
    ('Tinta Acrílica Terracota 3,6L', 135.00, 'https://example.com/terracota.jpg', cat_tintas, br_suvinil, 5, 360, 'Cor terrosa moderna.'),
    ('Verniz PU Fosco 900ml', 62.00, 'https://example.com/verniz-fosco.jpg', cat_spray, br_auto, 5, NULL, 'Acabamento elegante.'),
    ('Tinta Acrílica Grafite 18L', 310.00, 'https://example.com/grafite.jpg', cat_tintas, br_suvinil, 5, 390, 'Cinza para fachadas.');
);

    -- Inserindo Kits
    INSERT INTO products (name, price, image_url, category_id, brand_id, description)
    VALUES
    ('Kit Quarto Completo', 349.90, 'https://example.com/kit-quarto.jpg', cat_kits, NULL, 'Tudo para pintar um quarto de até 15m²'),
    ('Kit Banheiro Anti-mofo', 229.90, 'https://example.com/kit-banheiro.jpg', cat_kits, NULL, 'Proteção contra umidade e mofo'),
    ('Kit Fachada Premium', 479.90, 'https://example.com/kit-fachada.jpg', cat_kits, NULL, 'Proteção máxima para área externa');
END $$;

-- Vinculando itens aos Kits
INSERT INTO kit_items (kit_id, product_id, quantity)
SELECT (SELECT id FROM products WHERE name = 'Kit Quarto Completo'), id, 1 FROM products WHERE name IN ('Suvinil Rende Muito 18L', 'Rolo de Pintura 23cm Atlas', 'Bandeja para Rolo 23cm', 'Fita Crepe Profissional 48mm', 'Lona Plástica 4x4m');

INSERT INTO kit_items (kit_id, product_id, quantity)
SELECT (SELECT id FROM products WHERE name = 'Kit Banheiro Anti-mofo'), id, 1 FROM products WHERE name IN ('Tinta Acrílica Fosco Branco 3,6L', 'Pincel Tramontina 2 polegadas', 'Fita Crepe Profissional 48mm', 'Selador Acrílico Branco 18L');

INSERT INTO kit_items (kit_id, product_id, quantity)
SELECT (SELECT id FROM products WHERE name = 'Kit Fachada Premium'), id, 1 FROM products WHERE name IN ('Massa Acrílica Externa 25kg', 'Rolo de Lã Sintética 23cm', 'Bandeja para Rolo 23cm', 'Primer PU Cinza 3,6L', 'Lona Plástica 4x4m');
```

---

## 🔑 3. Variáveis de Ambiente (.env)

O projeto **SÓ FUNCIONARÁ** se estas chaves estiverem configuradas no arquivo `.env` ou no painel da Vercel:

```env
# --- SUPABASE (Conexão com Banco de Dados) ---
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui

# --- MERCADO PAGO (Processamento de Pagamentos) ---
MP_ACCESS_TOKEN=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# --- WHATSAPP (Notificações) ---
# (Configurado dentro de lib/whatsapp.ts)
```

---

## 📁 4. Mapa de Arquivos Atualizados

| Funcionalidade | Arquivo | Status | Responsabilidade |
| :--- | :--- | :--- | :--- |
| **Interface de Checkout** | `checkout/page.tsx` | ✅ | Coletar CPF, Dados e exibir QR Code/Boleto |
| **Lógica de Pagamento** | `api/checkout/create-payment/route.ts` | ✅ | Integrar Supabase $\leftrightarrow$ Mercado Pago |
| **Estrutura DB** | `supabase_setup.txt` | ✅ | Criar tabelas de Pedidos e Produtos |
| **Configuração DB** | `lib/supabase.ts` | ✅ | Inicializar cliente Supabase no App |
| **Notificações** | `lib/whatsapp.ts` | ✅ | Enviar confirmação de pedido ao cliente |

---

## 🏁 5. Passo a Passo para Ativar:
1. **Configurar DB**: Copie a **Parte 1** e depois a **Parte 2** do SQL acima e execute no SQL Editor do Supabase.
2. **Configurar Chaves**: Adicionar `MP_ACCESS_TOKEN` e chaves do Supabase no `.env`.
3. **Testar**: Adicionar item ao carrinho $\rightarrow$ Ir para Checkout $\rightarrow$ Preencher CPF $\rightarrow$ Finalizar Pagamento.
