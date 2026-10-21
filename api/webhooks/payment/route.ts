import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.type === 'payment') {
      const paymentId = body.data.id;

      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      });
      const paymentInfo = await mpRes.json();

      if (paymentInfo.status === 'approved') {
        const orderId = paymentInfo.description.split('Pedido #')[1]?.split(' - ')[0];

        if (orderId) {
          const { error } = await supabase
            .from('orders')
            .update({ status: 'approved' })
            .eq('id', orderId);

          if (error) throw error;
          console.log(`Pedido ${orderId} confirmado.`);
        }
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('Erro no processamento do webhook:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
