import { NextResponse } from 'next/server';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/lib/supabase-admin';
import { sendCustomerShippingNotification } from '@/lib/whatsapp';

const SHIPPING_STATUSES = new Set([
  'not_shipped',
  'preparing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
]);

async function authorizeStore(request) {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return { response: NextResponse.json({ error: 'Banco de dados indisponível.' }, { status: 503 }) };
  }
  const storeEmail = (process.env.STORE_ADMIN_EMAIL || '').trim().toLowerCase();
  if (!storeEmail) {
    return { response: NextResponse.json({ error: 'Configure STORE_ADMIN_EMAIL no ambiente da Vercel.' }, { status: 503 }) };
  }
  const authorization = request.headers.get('authorization') || '';
  if (!authorization.startsWith('Bearer ')) {
    return { response: NextResponse.json({ error: 'Faça login para acessar os pedidos.' }, { status: 401 }) };
  }
  const { data, error } = await supabaseAdmin.auth.getUser(authorization.slice(7).trim());
  if (error || !data?.user) {
    return { response: NextResponse.json({ error: 'Sessão inválida. Entre novamente.' }, { status: 401 }) };
  }
  if ((data.user.email || '').trim().toLowerCase() !== storeEmail) {
    return { response: NextResponse.json({ error: 'Esta conta não tem permissão para administrar pedidos.' }, { status: 403 }) };
  }
  return { user: data.user };
}

export async function GET(request) {
  const auth = await authorizeStore(request);
  if (auth.response) return auth.response;

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id,customer_name,customer_email,customer_phone,customer_address,total_amount,status,payment_method,shipping_status,tracking_code,created_at,order_items(id,product_name,quantity,price)')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Admin orders read failed:', error);
    return NextResponse.json({ error: 'Não foi possível carregar os pedidos.' }, { status: 500 });
  }
  return NextResponse.json({ orders: data || [] });
}

export async function PATCH(request) {
  const auth = await authorizeStore(request);
  if (auth.response) return auth.response;

  const body = await request.json().catch(() => ({}));
  const orderId = String(body.orderId || '').trim();
  const shippingStatus = String(body.shippingStatus || '').trim();
  const trackingCode = String(body.trackingCode || '').trim().slice(0, 120);
  if (!orderId || !SHIPPING_STATUSES.has(shippingStatus)) {
    return NextResponse.json({ error: 'Pedido ou status de entrega inválido.' }, { status: 400 });
  }

  const { data: before, error: readError } = await supabaseAdmin
    .from('orders')
    .select('id,customer_phone,shipping_status')
    .eq('id', orderId)
    .maybeSingle();
  if (readError || !before) {
    return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
  }

  const update = { shipping_status: shippingStatus, tracking_code: trackingCode || null };
  if (shippingStatus === 'shipped' || shippingStatus === 'out_for_delivery') {
    update.shipped_at = new Date().toISOString();
  }
  if (shippingStatus === 'delivered') {
    update.delivered_at = new Date().toISOString();
  }

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .update(update)
    .eq('id', orderId)
    .select('id,customer_name,customer_phone,shipping_status,tracking_code')
    .single();
  if (error) {
    console.error('Admin order update failed:', error);
    return NextResponse.json({ error: 'Não foi possível atualizar a entrega.' }, { status: 500 });
  }

  let notification = { ok: false, skipped: true };
  if (before.shipping_status !== shippingStatus && ['shipped', 'out_for_delivery', 'delivered'].includes(shippingStatus)) {
    notification = await sendCustomerShippingNotification({
      orderId: order.id,
      phone: order.customer_phone,
      shippingStatus,
      trackingCode: order.tracking_code,
    });
  }

  return NextResponse.json({ ok: true, order, notification });
}
