-- Silver Tintas: perfil, favoritos persistentes e historico de compras.
-- Idempotente: pode ser executado novamente sem apagar dados.

BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_user_created_at
  ON public.orders (user_id, created_at DESC);

INSERT INTO public.profiles (id, full_name)
SELECT u.id, NULLIF(BTRIM(u.raw_user_meta_data ->> 'full_name'), '')
FROM auth.users AS u
ON CONFLICT (id) DO NOTHING;

UPDATE public.orders AS o
SET user_id = u.id
FROM auth.users AS u
WHERE o.user_id IS NULL
  AND o.customer_email IS NOT NULL
  AND lower(trim(o.customer_email)) = lower(trim(u.email));

CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_key TEXT NOT NULL,
  product_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT wishlist_items_user_product_unique UNIQUE (user_id, product_key)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_created_at
  ON public.wishlist_items (user_id, created_at DESC);

ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

GRANT SELECT, INSERT, DELETE ON public.wishlist_items TO authenticated;

DROP POLICY IF EXISTS "Users manage own wishlist" ON public.wishlist_items;
CREATE POLICY "Users manage own wishlist"
  ON public.wishlist_items FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

GRANT SELECT ON public.orders, public.order_items TO authenticated;

DROP POLICY IF EXISTS "Users read own orders" ON public.orders;
CREATE POLICY "Users read own orders"
  ON public.orders FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users read own order items" ON public.order_items;
CREATE POLICY "Users read own order items"
  ON public.order_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.orders AS o
      WHERE o.id = order_items.order_id
        AND o.user_id = (SELECT auth.uid())
    )
  );

-- Pedidos/itens são criados pelo backend com chave administrativa.
-- Remover INSERT autenticado impede inserção direta de pedidos falsos pelo navegador.
DROP POLICY IF EXISTS "Pedidos autenticados" ON public.orders;
DROP POLICY IF EXISTS "Itens de pedidos autenticados" ON public.order_items;

COMMIT;
