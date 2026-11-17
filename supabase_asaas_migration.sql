-- Execute uma vez no SQL Editor do Supabase.
-- Mantém payment_id/payment_method e todos os pedidos antigos intactos.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_provider TEXT;

UPDATE public.orders
SET payment_provider = 'mercadopago'
WHERE payment_provider IS NULL AND payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_payment_provider
  ON public.orders(payment_provider);

COMMENT ON COLUMN public.orders.payment_provider IS
  'Provedor que criou a cobrança: asaas para novos pedidos; mercadopago para registros antigos.';
