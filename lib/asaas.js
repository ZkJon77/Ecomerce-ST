import 'server-only';

const API_URL = (process.env.ASAAS_API_URL || (
  process.env.ASAAS_ENV === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://api-sandbox.asaas.com/v3'
)).replace(/\\/$/, '');

export function hasAsaasConfig() {
  return Boolean(process.env.ASAAS_API_KEY?.trim());
}

export async function asaasRequest(path, options = {}) {
  const apiKey = process.env.ASAAS_API_KEY?.trim();
  if (!apiKey) throw new Error('ASAAS_API_KEY não configurada no servidor.');

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'access_token': apiKey,
      ...(options.headers || {}),
    },
    cache: 'no-store',
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = Array.isArray(data.errors)
      ? data.errors.map(item => item.description || item.code).filter(Boolean).join('; ')
      : '';
    const error = new Error(detail || `Asaas retornou HTTP ${response.status}.`);
    error.status = response.status;
    error.asaasErrors = data.errors || [];
    throw error;
  }
  return data;
}

export function asaasBillingType(method) {
  return ({ pix: 'PIX', card: 'CREDIT_CARD', boleto: 'BOLETO' })[method] || null;
}

export function mapAsaasStatus(event, paymentStatus) {
  if (['PAYMENT_REFUNDED', 'PAYMENT_PARTIALLY_REFUNDED', 'PAYMENT_CHARGEBACK_REQUESTED'].includes(event)) return 'refunded';
  if (['PAYMENT_DELETED', 'PAYMENT_BANK_SLIP_CANCELLED'].includes(event)) return 'canceled';
  if (['PAYMENT_OVERDUE'].includes(event) || paymentStatus === 'OVERDUE') return 'overdue';
  if (['PAYMENT_CREDIT_CARD_CAPTURE_REFUSED', 'PAYMENT_REPROVED_BY_RISK_ANALYSIS'].includes(event)) return 'rejected';
  if (['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED', 'PAYMENT_APPROVED_BY_RISK_ANALYSIS'].includes(event)
    || ['CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH'].includes(paymentStatus)) return 'approved';
  if (paymentStatus === 'REFUNDED') return 'refunded';
  if (paymentStatus === 'DELETED') return 'canceled';
  if (paymentStatus === 'CONFIRMED' || paymentStatus === 'RECEIVED') return 'approved';
  return 'pending';
}

export function normalizeAsaasMethod(billingType) {
  return ({ PIX: 'pix', CREDIT_CARD: 'card', BOLETO: 'boleto' })[billingType] || null;
}
