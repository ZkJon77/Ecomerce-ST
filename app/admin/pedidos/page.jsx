"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, hasSupabasePublicConfig } from "@/lib/supabase";

const STATUS_OPTIONS = [
  ["not_shipped", "Aguardando envio"],
  ["preparing", "Em preparação"],
  ["shipped", "Enviado"],
  ["out_for_delivery", "Saiu para entrega"],
  ["delivered", "Entregue"],
  ["cancelled", "Entrega cancelada"],
];

const money = value => Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const date = value => value ? new Date(value).toLocaleString("pt-BR") : "—";

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [edits, setEdits] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");

  async function request(path, options = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      router.replace("/login");
      throw new Error("Entre na conta autorizada da loja.");
    }
    const response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + session.access_token,
        ...(options.headers || {}),
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Não foi possível concluir a operação.");
    return payload;
  }

  async function loadOrders() {
    setLoading(true);
    setMessage("");
    try {
      if (!hasSupabasePublicConfig) throw new Error("Supabase não configurado.");
      const payload = await request("/api/admin/orders");
      setOrders(payload.orders || []);
      setEdits(Object.fromEntries((payload.orders || []).map(order => [order.id, {
        shippingStatus: order.shipping_status || "not_shipped",
        trackingCode: order.tracking_code || "",
      }])));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadOrders(); }, []);

  async function saveOrder(orderId) {
    const edit = edits[orderId];
    if (!edit) return;
    setSaving(orderId);
    setMessage("");
    try {
      const result = await request("/api/admin/orders", {
        method: "PATCH",
        body: JSON.stringify({ orderId, ...edit }),
      });
      setOrders(current => current.map(order => order.id === orderId ? {
        ...order,
        shipping_status: result.order.shipping_status,
        tracking_code: result.order.tracking_code,
      } : order));
      setMessage(result.notification?.ok
        ? "Entrega atualizada e mensagem enviada ao cliente pelo WhatsApp."
        : "Entrega atualizada no banco. A notificação ao cliente não foi enviada; confira a configuração do WhatsApp.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving("");
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f5f6fb", padding: "30px 16px", color: "#202638" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: 0, color: "#747d91" }}>Silver Tintas · Área administrativa</p>
            <h1 style={{ margin: "5px 0 18px", color: "#1a1464", fontSize: 28 }}>Pedidos e entregas</h1>
          </div>
          <button onClick={loadOrders} style={buttonStyle}>Atualizar pedidos</button>
        </div>
        {message && <p role="status" style={{ padding: 12, borderRadius: 9, background: "#eef2ff", color: "#29216d" }}>{message}</p>}
        {loading ? <p>Carregando pedidos...</p> : orders.length === 0 ? (
          <section style={panelStyle}>Nenhum pedido registrado até o momento.</section>
        ) : orders.map(order => {
          const edit = edits[order.id] || { shippingStatus: "not_shipped", trackingCode: "" };
          return (
            <article key={order.id} style={{ ...panelStyle, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <strong style={{ color: "#1a1464" }}>Pedido #{order.id.slice(0, 8)}</strong>
                  <p style={{ margin: "5px 0", color: "#687188", fontSize: 13 }}>{date(order.created_at)} · Pagamento: {order.status} · {order.payment_method || "—"}</p>
                </div>
                <strong>{money(order.total_amount)}</strong>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginTop: 12 }}>
                <div>
                  <strong>{order.customer_name}</strong>
                  <p style={smallStyle}>{order.customer_email || "E-mail não informado"}</p>
                  <p style={smallStyle}>{order.customer_phone}</p>
                  <p style={smallStyle}>{order.customer_address}</p>
                </div>
                <div>
                  <strong>Itens do pedido</strong>
                  {(order.order_items || []).map(item => <p key={item.id} style={smallStyle}>{item.quantity} × {item.product_name} · {money(item.price)}</p>)}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 10, marginTop: 16, alignItems: "end" }}>
                <label style={smallStyle}>Status da entrega
                  <select value={edit.shippingStatus} onChange={event => setEdits(current => ({ ...current, [order.id]: { ...edit, shippingStatus: event.target.value } }))} style={inputStyle}>
                    {STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label style={smallStyle}>Código de rastreamento (opcional)
                  <input value={edit.trackingCode} onChange={event => setEdits(current => ({ ...current, [order.id]: { ...edit, trackingCode: event.target.value } }))} placeholder="Código de rastreio" style={inputStyle} />
                </label>
                <button disabled={saving === order.id} onClick={() => saveOrder(order.id)} style={buttonStyle}>
                  {saving === order.id ? "Salvando..." : "Salvar e notificar cliente"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}

const panelStyle = { background: "#fff", border: "1px solid #e5e7ef", borderRadius: 14, padding: 18 };
const smallStyle = { color: "#687188", fontSize: 12, lineHeight: 1.5, margin: "4px 0" };
const inputStyle = { display: "block", width: "100%", boxSizing: "border-box", marginTop: 6, padding: "10px 11px", border: "1px solid #d9deea", borderRadius: 8, background: "#fff" };
const buttonStyle = { border: 0, borderRadius: 9, padding: "11px 15px", background: "#1a1464", color: "#fff", fontWeight: 700, cursor: "pointer" };
