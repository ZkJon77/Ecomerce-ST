import { NextResponse } from 'next/server';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../../../../lib/supabase-admin';
import { asaasBillingType, asaasRequest, hasAsaasConfig } from '../../../../lib/asaas';
import { KITS, PRODUCTS } from '../../../../lib/constants';

function dueDate(days = 3) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export async function POST(req) {
  let orderId = null;
  let paymentCreated = false;
  let checkoutStage = 'request_validation';

  try {
    const body = await req.json();
    const { cart, userData, paymentMethod = 'pix' } = body || {};

    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase não está configurado para salvar pedidos.' }, { status: 503 });
    }
    if (!hasAsaasConfig()) {
      return NextResponse.json({ error: 'ASAAS_API_KEY não está configurada no servidor.' }, { status: 503 });
    }

    let authenticatedUserId = null;
    const authorization = req.headers.get('authorization');
    if (authorization?.startsWith('Bearer ')) {
      const { data, error } = await supabaseAdmin.auth.getUser(authorization.slice(7).trim());
      if (error || !data?.user) {
        return NextResponse.json({ error: 'Sua sessão expirou. Entre novamente para concluir a compra.' }, { status: 401 });
      }
      authenticatedUserId = data.user.id;
    }

    if (!Array.isArray(cart) || !cart.length) {
      return NextResponse.json({ error: 'Carrinho vazio.' }, { status: 400 });
    }
    if (!userData?.name || !userData?.email || !userData?.phone || !userData?.address) {
      return NextResponse.json({ error: 'Dados do cliente incompletos.' }, { status: 400 });
    }
    if (!['card', 'pix', 'boleto'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Forma de pagamento inválida.' }, { status: 400 });
    }
    if (String(userData.cpf || '').replace(/\D/g, '').length !== 11) {
      return NextResponse.json({ error: 'Informe um CPF válido.' }, { status: 400 });
    }

    // Os preços são sempre consultados no banco; o navegador não define o valor cobrado.
    const requestedIds = [...new Set(cart.map(item => String(item?.id ?? '')))];
    const databaseIds = requestedIds.filter(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id));
    const databaseCatalog = new Map();

    if (databaseIds.length) {
      checkoutStage = 'product_lookup';
      const { data, error } = await supabaseAdmin.from('products').select('id,name,price').in('id', databaseIds);
      if (error) {
        console.error('Asaas checkout product lookup failed:', error);
        return NextResponse.json({ error: 'Não foi possível validar os produtos do carrinho.' }, { status: 503 });
      }
      for (const product of data || []) databaseCatalog.set(String(product.id), product);
    }

    const legacyCatalog = new Map([...PRODUCTS, ...KITS].map(product => [String(product.id), product]));
    const verifiedCart = [];
    for (const item of cart) {
      const id = String(item?.id ?? '');
      const qty = Number(item?.qty);
      const product = databaseCatalog.get(id) || legacyCatalog.get(id);
      if (!product || !Number.isInteger(qty) || qty < 1 || qty > 99) {
        return NextResponse.json({ error: 'O carrinho contém um produto indisponível ou quantidade inválida.' }, { status: 400 });
      }
      const price = Number(product.price);
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json({ error: 'Preço de produto inválido.' }, { status: 400 });
      }
      verifiedCart.push({ id, productId: databaseCatalog.has(id) ? id : null, name: product.name, price, qty });
    }

    const amount = Number(verifiedCart.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2));
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Valor total do pedido inválido.' }, { status: 400 });
    }

    checkoutStage = 'order_insert';
    const { data: order, error: orderError } = await supabaseAdmin.from('orders').insert({
      user_id: authenticatedUserId,
      customer_name: userData.name,
      customer_email: userData.email,
      customer_phone: userData.phone,
      customer_cpf: String(userData.cpf).replace(/\D/g, ''),
      customer_address: userData.address,
      total_amount: amount,
      payment_method: paymentMethod,
      payment_provider: 'asaas',
      status: 'pending',
      shipping_status: 'not_shipped',
    }).select().single();

    if (orderError || !order) {
      console.error('Asaas order insert failed:', orderError);
      return NextResponse.json({ error: 'Não foi possível registrar o pedido no Supabase.' }, { status: 500 });
    }
    orderId = order.id;

    checkoutStage = 'order_items_insert';
    const orderItems = verifiedCart.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      quantity: item.qty,
      price: item.price,
    }));
    const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    checkoutStage = 'asaas_customer';
    const customer = await asaasRequest('/customers', {
      method: 'POST',
      body: JSON.stringify({
        name: String(userData.name).trim(),
        email: String(userData.email).trim().toLowerCase(),
        cpfCnpj: String(userData.cpf).replace(/\D/g, ''),
        mobilePhone: String(userData.phone).replace(/\D/g, ''),
        externalReference: String(order.id),
      }),
    });

    checkoutStage = 'asaas_payment';
    const payment = await asaasRequest('/payments', {
      method: 'POST',
      body: JSON.stringify({
        customer: customer.id,
        billingType: asaasBillingType(paymentMethod),
        value: amount,
        dueDate: dueDate(paymentMethod === 'pix' ? 1 : 3),
        description: `Pedido #${String(order.id).slice(0, 8)} - Silver Tintas`,
        externalReference: String(order.id),
      }),
    });
    paymentCreated = true;

    const { error: paymentSaveError } = await supabaseAdmin.from('orders').update({
      payment_id: String(payment.id),
      payment_provider: 'asaas',
      asaas_customer_id: String(customer.id),
    }).eq('id', order.id);
    if (paymentSaveError) throw paymentSaveError;

    const result = {
      ok: true,
      orderId: order.id,
      paymentId: payment.id,
      paymentStatus: payment.status,
      checkout_url: paymentMethod === 'card' ? payment.invoiceUrl : null,
      ticket_url: paymentMethod === 'boleto' ? (payment.bankSlipUrl || payment.invoiceUrl) : null,
    };

    if (paymentMethod === 'pix') {
      checkoutStage = 'asaas_pix_qr';
      const qr = await asaasRequest(`/payments/${encodeURIComponent(payment.id)}/pixQrCode`, { method: 'GET' });
      result.qr_code = qr.encodedImage ? `data:image/png;base64,${qr.encodedImage}` : null;
      result.copyPaste = qr.payload || null;
      result.pixExpirationDate = qr.expirationDate || null;
      if (!result.qr_code && !result.copyPaste) throw new Error('O Asaas não retornou os dados do QR Code Pix.');
    }
    if (paymentMethod === 'card' && !payment.invoiceUrl) {
      throw new Error('O Asaas não retornou o endereço seguro de pagamento do cartão.');
    }
    if (paymentMethod === 'boleto' && !result.ticket_url) {
      throw new Error('O Asaas não retornou o endereço do boleto.');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Asaas checkout error:', {
      stage: checkoutStage,
      message: error?.message || String(error),
      status: error?.status,
      orderId,
    });
    if (orderId && supabaseAdmin && !paymentCreated) {
      await supabaseAdmin.from('orders').update({ status: 'payment_error' }).eq('id', orderId);
    }
    const message = error?.status && error.status < 500
      ? 'O Asaas não conseguiu criar a cobrança. Confira os dados do cliente e tente novamente.'
      : 'Não foi possível iniciar o pagamento. Verifique a configuração do Asaas e tente novamente.';
    return NextResponse.json({ error: message, diagnostic: { stage: checkoutStage } }, { status: 500 });
  }
}
