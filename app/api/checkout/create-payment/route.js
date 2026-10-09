import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { sendOrderNotification } from '../../../../lib/whatsapp';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { cart, userData, paymentMethod } = body;
    if (!cart || !userData) return NextResponse.json({ error: 'Missing required data' }, { status: 400 });

    const amount = cart.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 0), 0);

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
    const orderItems = cart.map((item) => ({
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

    // 4. Processar Pagamento Real via Mercado Pago
    const payment = new Payment(client);

    let paymentResponse;
    if (paymentMethod === 'pix') {
      paymentResponse = await payment.create({
        body: {
          transaction_amount: amount,
          description: `Pedido #${order.id}`,
          payment_method_id: 'pix',
          payer: {
            email: userData.email,
            first_name: userData.name,
          },
        }
      });
    } else if (paymentMethod === 'boleto') {
      paymentResponse = await payment.create({
        body: {
          transaction_amount: amount,
          description: `Pedido #${order.id}`,
          payment_method_id: 'bolbradesco',
          payer: {
            email: userData.email,
            first_name: userData.name,
          },
        }
      });
    } else {
      // Para cartão, normalmente usaríamos o Checkout Pro ou integraríamos o SDK de cards.
      // Aqui simulamos a aprovação ou redirecionamos para o Checkout Pro.
      return NextResponse.json({
        ok: true,
        payment: { id: order.id, status: 'approved', amount },
        orderId: order.id
      });
    }

    const response = {
      id: paymentResponse.id,
      status: paymentResponse.status,
      amount: paymentResponse.transaction_amount,
      paymentMethod,
    };

    if (paymentMethod === 'pix') {
      response.qrCode = paymentResponse.point_of_interaction.transaction_data.qr_code_base64;
      response.copyPaste = paymentResponse.point_of_interaction.transaction_data.qr_code;
    } else if (paymentMethod === 'boleto') {
      response.boletoUrl = paymentResponse.point_of_interaction.transaction_details.external_resource_url;
    }

    return NextResponse.json({ ok: true, payment: response, orderId: order.id });
  } catch (error) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
