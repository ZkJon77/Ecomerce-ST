import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendOrderNotification } from '@/lib/whatsapp';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cart, userData, paymentMethod } = body;
    if (!cart || !userData) return NextResponse.json({ error: 'Missing required data' }, { status: 400 });

    const amount = cart.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.qty || 0), 0);

    // 1. Salvar o Pedido no Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: userData.name,
        customer_email: userData.email,
        customer_phone: userData.phone,
        customer_address: userData.address,
        total_amount: amount,
        payment_method: paymentMethod,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Salvar os Itens do Pedido
    const orderItems = cart.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.qty,
      price: item.price,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    // 3. Enviar Notificação via WhatsApp
    await sendOrderNotification({
      name: userData.name,
      phone: userData.phone,
      address: userData.address,
      total: amount,
      paymentMethod,
    }, cart);

    // 4. Retornar resposta de pagamento (mantendo a lógica de mock para o frontend)
    const paymentId = `pay_${Math.random().toString(36).substring(2, 11)}`;
    const response: any = {
      id: paymentId,
      status: 'pending',
      amount,
      paymentMethod,
    };

    if (paymentMethod === 'pix') {
      response.qrCode = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PIX-MOCK-DATA';
      response.copyPaste = '00020126360014BR.GOV.BCB.PIX0000000000';
    } else if (paymentMethod === 'boleto') {
      response.boletoUrl = 'https://example.com/boleto-pdf';
    } else if (paymentMethod === 'card') {
      response.status = 'approved';
    }

    return NextResponse.json({ ok: true, payment: response, orderId: order.id });
  } catch (error: any) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
