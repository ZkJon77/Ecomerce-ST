import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../../../../lib/supabase-admin';
import { sendOrderNotification } from '../../../../lib/whatsapp';
import { KITS, PRODUCTS } from '../../../../lib/constants';

function getPublicBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
  const value = configuredUrl || vercelUrl;

  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || ['localhost', '127.0.0.1'].includes(url.hostname)) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { cart, userData, paymentMethod = 'pix' } = body;

    if (!Array.isArray(cart) || !cart.length) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });
    }

    if (!userData || !userData.name || !userData.email || !userData.phone || !userData.address) {
      return NextResponse.json({ error: 'Dados do cliente incompletos' }, { status: 400 });
    }

    if (!['card', 'pix', 'boleto'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Forma de pagamento inválida' }, { status: 400 });
    }

    const catalog = new Map([...PRODUCTS, ...KITS].map((product) => [String(product.id), product]));
    const verifiedCart = [];
    for (const item of cart) {
      const product = item && catalog.get(String(item.id));
      const quantity = Number(item?.qty);
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return NextResponse.json({ error: 'O carrinho contém um produto ou quantidade inválida. Atualize a página e tente novamente.' }, { status: 400 });
      }
      verifiedCart.push({
        id: String(product.id),
        name: product.name,
        price: Number(product.price),
        qty: quantity,
      });
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({
        error: 'MP_ACCESS_TOKEN não configurado. Defina a variável no ambiente antes de iniciar a aplicação.'
      }, { status: 500 });
    }

    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return NextResponse.json({
        error: 'Supabase não está configurado para salvar pedidos. Configure SUPABASE_SECRET_KEY (ou SUPABASE_SERVICE_ROLE_KEY) no servidor antes de ativar o checkout.'
      }, { status: 503 });
    }

    const amount = verifiedCart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const baseUrl = getPublicBaseUrl();

    let orderId;
    try {
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          customer_name: userData.name,
          customer_email: userData.email,
          customer_phone: userData.phone,
          customer_cpf: userData.cpf || null,
          customer_address: userData.address,
          total_amount: amount,
          payment_method: paymentMethod,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;
      if (!order) throw new Error('Supabase não retornou o pedido criado.');
      orderId = order.id;

      const orderItems = verifiedCart.map((item) => ({
        order_id: order.id,
        product_id: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.id) ? item.id : null,
        product_name: item.name,
        quantity: item.qty,
        price: item.price,
      }));

      const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;
    } catch (dbError) {
      console.error('Failed to save checkout order:', dbError);
      throw new Error('Não foi possível registrar o pedido. Verifique a configuração do Supabase.');
    }

    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const preferenceBody = {
      items: verifiedCart.map((item) => ({
        id: item.id,
        title: item.name,
        quantity: item.qty,
        unit_price: item.price,
        currency_id: 'BRL',
      })),
      payer: {
        name: userData.name,
        email: userData.email,
      },
      metadata: {
        orderId: orderId || 'guest-order',
        paymentMethod,
      },
    };
    if (orderId) preferenceBody.external_reference = orderId;

    if (baseUrl) {
      preferenceBody.back_urls = {
        success: `${baseUrl}/checkout/success`,
        failure: `${baseUrl}/checkout/failure`,
        pending: `${baseUrl}/checkout/pending`,
      };
      preferenceBody.notification_url = `${baseUrl}/api/webhooks/payment`;
      preferenceBody.auto_return = 'approved';
    }

    const preferenceResult = await preference.create({ body: preferenceBody });

    try {
      await sendOrderNotification(
        {
          name: userData.name,
          phone: userData.phone,
          address: userData.address,
          total: amount,
          paymentMethod,
        },
        verifiedCart,
      );
    } catch (notificationError) {
      console.warn('WhatsApp notification skipped:', notificationError.message || notificationError);
    }

    return NextResponse.json({
      ok: true,
      init_point: preferenceResult.init_point,
      preference_id: preferenceResult.id,
      orderId,
    });
  } catch (error) {
    console.error('Checkout Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 },
    );
  }
}
