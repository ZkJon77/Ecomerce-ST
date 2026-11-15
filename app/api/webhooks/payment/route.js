import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/lib/supabase';

async function updateOrderStatus(orderId, status, paymentId, paymentMethod) {
  if (!orderId || !hasSupabaseAdminConfig || !supabaseAdmin) {
    throw new Error('Supabase service role is not configured or order ID is missing.');
  }

  try {
    const orderQuery = supabaseAdmin.from('orders');
    const { error } = await orderQuery
      .update({
        status,
        payment_id: paymentId || null,
        payment_method: paymentMethod || null,
      })
      .eq('id', orderId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to update order status:', error);
    throw error;
  }
}

function extractOrderIdFromPayment(payment) {
  if (!payment) return null;

  if (payment.metadata && payment.metadata.orderId) {
    return payment.metadata.orderId;
  }
  if (payment.external_reference) return payment.external_reference;

  const description = payment.description || '';
  const match = description.match(/Pedido\s*#?([A-Za-z0-9-]+)/i);
  return match ? match[1] : null;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const paymentId = body?.data?.id || body?.id;
    const paymentType = body?.type || body?.action;

    if (!paymentId || paymentType !== 'payment') {
      return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('MP_ACCESS_TOKEN não está configurado para processar o webhook.');
    }

    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: String(paymentId) });

    const orderId = extractOrderIdFromPayment(paymentData);
    const status = paymentData.status === 'approved' ? 'approved' : (paymentData.status === 'rejected' ? 'rejected' : 'pending');

    if (!orderId || orderId === 'guest-order') {
      return NextResponse.json({ ok: true, ignored: true, reason: 'Order reference not found' }, { status: 200 });
    }

    await updateOrderStatus(orderId, status, paymentId, paymentData.payment_method?.id || null);

    return NextResponse.json({ ok: true, paymentId, status, orderId }, { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ ok: false, error: error.message || 'Webhook failed' }, { status: 500 });
  }
}
