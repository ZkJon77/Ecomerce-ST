import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendOrderNotification } from '@/lib/whatsapp';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });
const payment = new Payment(client);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cart, userData, paymentMethod } = body;

    if (!cart || !userData) {
      return NextResponse.json({ error: 'Dados insuficientes para o processamento do pedido' }, { status: 400 });
    }

    const amount = cart.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.qty || 0), 0);

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

    const orderItems = cart.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.qty,
      price: item.price,
    }));
    await supabase.from('order_items').insert(orderItems);

    const paymentData = {
      body: {
        transaction_amount: amount,
        description: `Pedido #${order.id} - ${userData.name}`,
        payment_method_id: paymentMethod === 'pix' ? 'pix' : paymentMethod === 'card' ? 'visa' : 'bolbr',
        payer: {
          email: userData.email,
          first_name: userData.name,
          identification: {
            type: 'CPF',
            number: userData.cpf || '00000000000',
          },
        },
      },
    };

    const mpResponse = await payment.create(paymentData);

    await sendOrderNotification({
      name: userData.name,
      phone: userData.phone,
      address: userData.address,
      total: amount,
      paymentMethod: paymentMethod.toUpperCase(),
    }, cart);

    return NextResponse.json({
      ok: true,
      payment: {
        id: mpResponse.id,
        status: mpResponse.status,
        qr_code: mpResponse.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: mpResponse.point_of_interaction?.transaction_data?.qr_code_base64,
        ticket_url: mpResponse.point_of_interaction?.ticket_url,
      },
      orderId: order.id
    });

  } catch (error: any) {
    console.error('Erro no processamento do checkout:', error);
    return NextResponse.json({ error: error.message || 'Erro interno no servidor' }, { status: 500 });
  }
}
