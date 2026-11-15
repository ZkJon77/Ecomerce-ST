"use client";

import Link from 'next/link';
import { Clock3 } from 'lucide-react';

export default function PendingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f6f7fb', padding: 24 }}>
      <div style={{ maxWidth: 520, width: '100%', background: '#fff', borderRadius: 16, padding: 32, textAlign: 'center', boxShadow: '0 12px 32px rgba(10, 20, 60, 0.08)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: '50%', background: '#fff7ed', color: '#f59e0b', marginBottom: 20 }}>
          <Clock3 size={36} />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a1464', marginBottom: 12 }}>Pagamento pendente</h1>
        <p style={{ color: '#4b5563', lineHeight: 1.6, marginBottom: 28 }}>
          Seu pagamento está em análise. Você pode acompanhar o status e confirmar a compra em alguns minutos.
        </p>
        <Link href="/" style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', padding: '12px 22px', borderRadius: 10, background: '#1a1464', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
          Voltar para a loja
        </Link>
      </div>
    </div>
  );
}
