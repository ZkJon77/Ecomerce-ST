import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../../../../lib/supabase-admin';
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
  let orderId = null;
  let checkoutStage = 'request_validation';
  try {
    const body = await req.json();
    const { cart, userData, paymentMethod = 'pix' } = body;
    if (!hasSupabaseAdminConfig || !supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase não está configurado para salvar pedidos. Confira SUPABASE_URL e a chave administrativa no ambiente do servidor.', diagnostic: { stage: 'supabase_configuration' } }, { status: 503 });
    }
    let authenticatedUserId = null;
    const authorization = req.headers.get('authorization');
    if (authorization?.startsWith('Bearer ')) {
      const accessToken = authorization.slice(7).trim();
      const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
      if (authError || !authData?.user) {
        return NextResponse.json({ error: 'Sua sessão expirou. Entre novamente para concluir a compra.' }, { status: 401 });
      }
      authenticatedUserId = authData.user.id;
    }

    if (!Array.isArray(cart) || !cart.length) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });
    }

    if (!userData || !userData.name || !userData.email || !userData.phone || !userData.address) {
      return NextResponse.json({ error: 'Dados do cliente incompletos' }, { status: 400 });
    }

    if (!['card', 'pix', 'boleto'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Forma de pagamento inválida' }, { status: 400 });
    }

    // Resolve produtos pelo banco primeiro: o catálogo do site usa UUIDs do Supabase.
    // Mantém o catálogo local apenas para itens antigos que ainda usam IDs legados.
    const requestedIds = [...new Set(cart.map((item) => String(item?.id ?? '')))];
    const databaseIds = requestedIds.filter((id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id));
    const databaseCatalog = new Map();

    if (databaseIds.length) {
      checkoutStage = 'product_lookup';
      const { data: databaseProducts, error: productsError } = await supabaseAdmin
        .from('products')
        .select('id,name,price')
        .in('id', databaseIds);
      if (productsError) {
        console.error('Checkout product lookup failed:', {
          code: productsError.code,
          message: productsError.message,
          details: productsError.details,
          hint: productsError.hint,
        });
        return NextResponse.json({ error: 'Não foi possível validar os produtos do carrinho. Tente novamente.' }, { status: 503 });
      }
      for (const product of databaseProducts || []) databaseCatalog.set(String(product.id), product);
    }

    const legacyCatalog = new Map([...PRODUCTS, ...KITS].map((product) => [String(product.id), product]));
    const verifiedCart = [];
    for (const item of cart) {
      const id = String(item?.id ?? '');
      const quantity = Number(item?.qty);
      const product = databaseCatalog.get(id) || legacyCatalog.get(id);
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return NextResponse.json({ error: 'O carrinho contém um produto indisponível ou quantidade inválida. Atualize a página e tente novamente.' }, { status: 400 });
      }
      const price = Number(product.price);
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json({ error: 'O preço de um produto está inválido. Atualize o catálogo e tente novamente.' }, { status: 400 });
      }
      verifiedCart.push({
        id,
        productId: databaseCatalog.has(id) ? id : null,
        name: product.name,
        price,
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
    checkoutStage = 'order_insert';

    try {
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          user_id: authenticatedUserId,
          customer_name: userData.name,
          customer_email: userData.email,
          customer_phone: userData.phone,
          customer_cpf: userData.cpf || null,
          customer_address: userData.address,
          total_amount: amount,
          payment_method: paymentMethod,
          status: 'pending',
          shipping_status: 'not_shipped',
        })
        .select()
        .single();

      if (orderError) throw orderError;
      if (!order) throw new Error('Supabase não retornou o pedido criado.');
      orderId = order.id;

      const orderItems = verifiedCart.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        quantity: item.qty,
        price: item.price,
      }));

      checkoutStage = 'order_items_insert';
      const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;
    } catch (dbError) {
      console.error('Failed to save checkout order:', {
        stage: checkoutStage,
        name: dbError?.name || null,
        code: dbError?.code || dbError?.cause?.code || null,
        message: dbError?.message || String(dbError),
        details: dbError?.details || null,
        hint: dbError?.hint || null,
        cause: dbError?.cause?.message || null,
        causeCode: dbError?.cause?.code || null,
        errno: dbError?.cause?.errno || null,
        syscall: dbError?.cause?.syscall || null,
        hostname: dbError?.cause?.hostname || null,
        orderId,
      });
      if (orderId) {
        const { error: rollbackError } = await supabaseAdmin.from('orders').delete().eq('id', orderId);
        if (rollbackError) console.error('Checkout order rollback failed:', { code: rollbackError.code, message: rollbackError.message, orderId });
        orderId = null;
      }
      const networkCause = dbError?.cause || null;
      const diagnosticCode = dbError?.code || networkCause?.code || networkCause?.errno || 'UNKNOWN';
      const safeDiagnostic = {
        stage: checkoutStage,
        code: diagnosticCode,
        message: dbError?.message || String(dbError),
        cause: networkCause?.message || null,
        hostname: networkCause?.hostname || null,
        syscall: networkCause?.syscall || null,
      };
      console.error('Checkout database diagnostic:', safeDiagnostic);
      return NextResponse.json({
        error: `Não foi possível registrar o pedido no banco (etapa: ${checkoutStage}; código: ${diagnosticCode}).`,
        diagnostic: safeDiagnostic,
      }, { status: 500 });
    }

    checkoutStage = 'mercadopago_preference';
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

    return NextResponse.json({
      ok: true,
      init_point: preferenceResult.init_point,
      preference_id: preferenceResult.id,
      orderId,
    });
  } catch (error) {
    if (orderId && supabaseAdmin) {
      const { error: statusError } = await supabaseAdmin
        .from('orders')
        .update({ status: 'payment_error' })
        .eq('id', orderId);
      if (statusError) console.error('Could not mark failed checkout order:', statusError);
    }
    console.error('Checkout Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor', diagnostic: { stage: checkoutStage } },
      { status: 500 },
    );
  }
}
