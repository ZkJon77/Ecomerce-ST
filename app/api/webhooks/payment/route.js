import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/lib/supabase-admin';
import { asaasRequest, mapAsaasStatus, normalizeAsaasMethod } from '@/lib/asaas';
import { sendOrderNotification } from '@/lib/whatsapp';

function validWebhookToken(received, expected) {
  if (!received || !expected) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function cents(value) {
  return Math.round(Number(value) * 100);
}

export async function POST(req) {
  try {
    const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN?.trim();
    const receivedToken = req.headers.get('asaas-access-token');
    if (!validWebhookToken(receivedToken, expectedToken)) {
      return NextResponse.json({ error: 'Webhook não autorizado.' }, { status: 401 });
    }
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return NextResponse.json({ error: 'Banco de dados indisponível.' }, { status: 503 });
    }

    const body = await req.json().catch(() => ({}));
    const event = String(body.event || '');
    const paymentId = body.payment?.id;
    if (!event || !paymentId) return NextResponse.json({ ok: true, ignored: true });

    // O payload recebido serve apenas para localizar a cobrança; a API do Asaas confirma os dados.
    const payment = await asaasRequest(`/payments/${encodeURIComponent(String(paymentId))}`, { method: 'GET' });
    const orderId = String(payment.externalReference || '');
    if (!orderId) return NextResponse.json({ ok: true, ignored: true });

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id,total_amount,status,customer_name,customer_email,customer_phone,customer_address,store_notified_at')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Asaas webhook order not found:', orderError);
      return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    }

    if (cents(payment.value) !== cents(order.total_amount)) {
      console.error('Asaas payment amount mismatch:', { orderId, paymentId });
      return NextResponse.json({ error: 'Pagamento não corresponde ao pedido.' }, { status: 409 });
    }

    const nextStatus = mapAsaasStatus(event, payment.status);
    const finalStatus = order.status === 'approved' && !['refunded', 'canceled'].includes(nextStatus)
      ? 'approved'
      : nextStatus;

    const update = {
      status: finalStatus,
      payment_id: String(payment.id),
      payment_provider: 'asaas',
    };
    const method = normalizeAsaasMethod(payment.billingType);
    if (method) update.payment_method = method;

    const { error: updateError } = await supabaseAdmin.from('orders').update(update).eq('id', orderId);
    if (updateError) {
      console.error('Asaas order update failed:', updateError);
      return NextResponse.json({ error: 'Não foi possível atualizar o pedido.' }, { status: 500 });
    }

    // A reivindicação no banco impede que reenvios do mesmo evento notifiquem a loja duas vezes.
    if (finalStatus === 'approved' && !order.store_notified_at) {
      const staleClaim = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { data: claim, error: claimError } = await supabaseAdmin.from('orders')
        .update({ store_notification_claimed_at: new Date().toISOString() })
        .eq('id', orderId)
        .is('store_notified_at', null)
        .or('store_notification_claimed_at.is.null,store_notification_claimed_at.lt.' + staleClaim)
        .select('id')
        .maybeSingle();

      if (claimError) {
        console.error('Asaas notification claim failed:', claimError);
      } else if (claim) {
        const { data: items, error: itemsError } = await supabaseAdmin.from('order_items')
          .select('product_name,quantity,price').eq('order_id', orderId);

        if (!itemsError) {
          const notification = await sendOrderNotification({
            orderId,
            name: order.customer_name,
            email: order.customer_email,
            phone: order.customer_phone,
            address: order.customer_address,
            total: Number(order.total_amount),
            paymentMethod: method || 'Asaas',
          }, (items || []).map(item => ({
            name: item.product_name,
            qty: item.quantity,
            price: Number(item.price),
          })));

          if (notification?.ok) {
            await supabaseAdmin.from('orders').update({
              store_notified_at: new Date().toISOString(),
              store_notification_claimed_at: null,
            }).eq('id', orderId);
          } else {
            await supabaseAdmin.from('orders').update({ store_notification_claimed_at: null }).eq('id', orderId);
          }
        } else {
          await supabaseAdmin.from('orders').update({ store_notification_claimed_at: null }).eq('id', orderId);
        }
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Asaas webhook error:', error);
    return NextResponse.json({ error: 'Falha ao processar webhook.' }, { status: 500 });
  }
}
