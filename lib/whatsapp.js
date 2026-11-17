export async function sendOrderNotification(orderData, items) {
  const phone = process.env.STORE_PHONE;
  const apiUrl = process.env.WHATSAPP_API_URL;
  const apiKey = process.env.WHATSAPP_API_KEY;

  if (!phone || !apiUrl) {
    console.error('WhatsApp configuration missing in .env.local');
    return { ok: false, error: 'Configuration missing' };
  }

  // Formatando a lista de produtos
  const itemsList = items
    .map((item) => `- ${item.name} (x${item.qty}) - R$ ${item.price.toFixed(2)}`)
    .join('\n');

  const message = `*Pagamento aprovado — novo pedido*\n` +
    (orderData.orderId ? `*Pedido:* #${String(orderData.orderId).slice(0, 8)}\n\n` : `\n`) +
    `*Cliente:* ${orderData.name}\n` +
    `*Telefone:* ${orderData.phone}\n` +
    `*Endereço:* ${orderData.address}\n\n` +
    `*Produtos:*\n${itemsList}\n\n` +
    `*Total:* R$ ${orderData.total.toFixed(2)}\n` +
    `*Pagamento:* ${orderData.paymentMethod}\n\n` +
    `*Status:* Pagamento aprovado — aguardando preparação`;

  try {
    const response = await fetch(`${apiUrl}/message/sendText/${phone}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey || '',
      },
      body: JSON.stringify({
        number: phone,
        text: message,
      }),
    });

    if (!response.ok) throw new Error('Failed to send WhatsApp message');
    return { ok: true };
  } catch (error) {
    console.error('WhatsApp API Error:', error);
    return { ok: false, error: error.message };
  }
}


const SHIPPING_LABELS = {
  preparing: 'Seu pedido está em preparação.',
  shipped: 'Seu pedido foi enviado.',
  out_for_delivery: 'Seu pedido saiu para entrega.',
  delivered: 'Seu pedido foi entregue.',
};

export async function sendCustomerShippingNotification(order) {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const apiKey = process.env.WHATSAPP_API_KEY;
  const rawPhone = String(order.phone || '').replace(/\\D/g, '');
  const phone = rawPhone.length === 10 || rawPhone.length === 11 ? '55' + rawPhone : rawPhone;
  if (!apiUrl || !phone || !SHIPPING_LABELS[order.shippingStatus]) {
    return { ok: false, error: 'WhatsApp do cliente não configurado ou telefone inválido.' };
  }

  const statusText = SHIPPING_LABELS[order.shippingStatus];
  const message = [
    '*Atualização do seu pedido Silver Tintas*',
    '',
    order.orderId ? '*Pedido:* #' + String(order.orderId).slice(0, 8) : '',
    statusText,
    order.trackingCode ? '*Rastreamento:* ' + order.trackingCode : '',
    '',
    'Obrigado por comprar na Silver Tintas.',
  ].filter(Boolean).join('\\n');

  try {
    const response = await fetch(`${apiUrl}/message/sendText/${phone}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey || '',
      },
      body: JSON.stringify({ number: phone, text: message }),
    });
    if (!response.ok) throw new Error('Falha ao enviar atualização pelo WhatsApp.');
    return { ok: true };
  } catch (error) {
    console.error('Customer WhatsApp notification error:', error);
    return { ok: false, error: error.message };
  }
}
