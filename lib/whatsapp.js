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

  const message = `🚀 *Novo Pedido Recebido!* 🚀\n\n` +
    `👤 *Cliente:* ${orderData.name}\n` +
    `📞 *Telefone:* ${orderData.phone}\n` +
    `📍 *Endereço:* ${orderData.address}\n\n` +
    `📦 *Produtos:*\n${itemsList}\n\n` +
    `💰 *Total:* R$ ${orderData.total.toFixed(2)}\n` +
    `💳 *Pagamento:* ${orderData.paymentMethod}\n\n` +
    `✅ *Status:* Pendente de Confirmação`;

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
