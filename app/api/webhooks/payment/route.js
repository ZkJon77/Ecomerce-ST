import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment, WebhookSignatureValidator } from 'mercadopago';
import { hasSupabaseAdminConfig, supabaseAdmin } from '@/lib/supabase-admin';

function cents(value) {
  return Math.round(Number(value) * 100);
}

function mapPaymentStatus(status) {
  if (status === 'approved') return 'approved';
  if (status === 'rejected') return 'rejected';
  if (status === 'cancelled') return 'canceled';
  if (status === 'refunded' || status === 'charged_back') return 'refunded';
  return 'pending';
}

export async function POST(req) {
  try {
    const webhookSecret = process.env.MP_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('MP_WEBHOOK_SECRET não configurado.');
      return NextResponse.json({ error: 'Webhook não configurado.' }, { status: 503 });
    }

    const url = new URL(req.url);
    const xSignature = req.headers.get('x-signature');
    const xRequestId = req.headers.get('x-request-id');
    const dataId = url.searchParams.get('data.id') || url.searchParams.get('id');

    if (!xSignature || !xRequestId) {
      return NextResponse.json({ error: 'Assinatura do webhook ausente.' }, { status: 401 });
    }

    try {
      WebhookSignatureValidator.validate({
        xSignature,
        xRequestId,
        dataId,
        secret: webhookSecret,
      });
    } catch {
      return NextResponse.json({ error: 'Assinatura do webhook inválida.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const paymentId = dataId || body?.data?.id || body?.id;
    const eventType = url.searchParams.get('type') || body?.type ||
      (String(body?.action || '').startsWith('payment.') ? 'payment' : null);

    if (eventType !== 'payment' || !paymentId) {
      return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
    }

    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      console.error('Credenciais administrativas do Supabase não configuradas.');
      return NextResponse.json({ error: 'Banco de dados não configurado.' }, { status: 503 });
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: 'Mercado Pago não configurado.' }, { status: 503 });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: String(paymentId) });

    // O vínculo confiável é o external_reference devolvido pela API do Mercado Pago.
    const orderId = payment.external_reference;
    if (!orderId) {
      return NextResponse.json({ ok: true, ignored: true, reason: 'Pedido não identificado.' }, { status: 200 });
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id,total_amount,status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Pedido do webhook não encontrado:', orderError);
      return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    }

    if (payment.currency_id !== 'BRL' || cents(payment.transaction_amount) !== cents(order.total_amount)) {
      console.error('Valor/moeda do pagamento não corresponde ao pedido.', {
        orderId,
        paymentId,
        currency: payment.currency_id,
      });
      return NextResponse.json({ error: 'Pagamento não corresponde ao pedido.' }, { status: 409 });
    }

    const nextStatus = mapPaymentStatus(payment.status);
    // Uma notificação atrasada não pode rebaixar um pedido já aprovado.
    const finalStatus = order.status === 'approved' && nextStatus !== 'refunded'
      ? 'approved'
      : nextStatus;

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: finalStatus,
        payment_id: String(payment.id),
        payment_method: payment.payment_type_id || payment.payment_method_id || null,
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Falha ao atualizar o pedido:', updateError);
      return NextResponse.json({ error: 'Não foi possível atualizar o pedido.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Falha ao processar webhook.' }, { status: 500 });
  }
}
