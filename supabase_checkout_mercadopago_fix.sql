-- Correção de compatibilidade do checkout Mercado Pago.
-- Execute uma vez no Supabase > SQL Editor. É idempotente e preserva os dados existentes.

BEGIN;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS shipping_status TEXT NOT NULL DEFAULT 'not_shipped',
  ADD COLUMN IF NOT EXISTS store_notified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS store_notification_claimed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_provider TEXT;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS product_name TEXT;

UPDATE public.order_items
SET product_name = 'Produto'
WHERE product_name IS NULL OR BTRIM(product_name) = '';

CREATE INDEX IF NOT EXISTS idx_orders_user_created_at
  ON public.orders (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_shipping_status
  ON public.orders (shipping_status);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id
  ON public.order_items (order_id);

GRANT ALL ON public.orders, public.order_items TO service_role;
GRANT SELECT ON public.orders, public.order_items TO authenticated;

COMMENT ON COLUMN public.orders.shipping_status IS
  'Situação logística do pedido; não representa confirmação do pagamento.';
COMMENT ON COLUMN public.orders.store_notified_at IS
  'Momento em que a loja recebeu a notificação do pedido aprovado.';
COMMENT ON COLUMN public.orders.store_notification_claimed_at IS
  'Reserva temporária para evitar notificações duplicadas.';

COMMIT;
