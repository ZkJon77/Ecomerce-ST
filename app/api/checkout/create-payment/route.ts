import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cart, userData, paymentMethod } = body;
    if (!cart || !userData) return NextResponse.json({ error: 'Missing required data' }, { status: 400 });

    const paymentId = `pay_${Math.random().toString(36).substring(2, 11)}`;
    const amount = cart.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.qty || 0), 0);
    
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

    return NextResponse.json({ ok: true, payment: response });
  } catch (error) {
    console.error('Payment Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
