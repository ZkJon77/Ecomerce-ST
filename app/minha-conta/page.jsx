"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Package, UserRound, LogOut, Save, LoaderCircle, ArrowLeft } from "lucide-react";
import { supabase, hasSupabasePublicConfig } from "@/lib/supabase";

const money = (value) => Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const date = (value) => value ? new Date(value).toLocaleString("pt-BR") : "—";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ full_name: "", phone: "", address: "" });
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function loadAccount() {
      if (!hasSupabasePublicConfig) {
        router.replace("/login");
        return;
      }
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !currentUser) {
        router.replace("/login");
        return;
      }
      const [profileResult, ordersResult, wishlistResult] = await Promise.all([
        supabase.from("profiles").select("full_name, phone, address").eq("id", currentUser.id).maybeSingle(),
        supabase.from("orders").select("id, total_amount, status, payment_method, created_at, order_items(id, product_name, quantity, price)").eq("user_id", currentUser.id).order("created_at", { ascending: false }),
        supabase.from("wishlist_items").select("id, product_key, product_snapshot, created_at").eq("user_id", currentUser.id).order("created_at", { ascending: false }),
      ]);
      if (!active) return;
      setUser(currentUser);
      if (profileResult.data) setProfile({
        full_name: profileResult.data.full_name || currentUser.user_metadata?.full_name || "",
        phone: profileResult.data.phone || "",
        address: profileResult.data.address || "",
      });
      if (ordersResult.error) console.error("Falha ao carregar pedidos:", ordersResult.error);
      else setOrders(ordersResult.data || []);
      if (wishlistResult.error) console.error("Falha ao carregar favoritos:", wishlistResult.error);
      else setWishlist(wishlistResult.data || []);
      setLoading(false);
    }
    loadAccount();
    return () => { active = false; };
  }, [router]);

  async function saveProfile(event) {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage("");
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name.trim(),
      phone: profile.phone.trim() || null,
      address: profile.address.trim() || null,
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);
    setSaving(false);
    setMessage(error ? "Não foi possível salvar. Confira se executou a atualização SQL no Supabase." : "Dados atualizados com sucesso.");
  }

  async function removeFavorite(item) {
    const { error } = await supabase.from("wishlist_items").delete().eq("id", item.id);
    if (error) { setMessage("Não foi possível remover este favorito."); return; }
    setWishlist((current) => current.filter((entry) => entry.id !== item.id));
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (loading) return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#1a1464" }}><LoaderCircle className="animate-spin" /> Carregando sua conta...</main>;

  return (
    <main style={{ minHeight: "100vh", background: "#f5f6fb", padding: "32px 16px", color: "#202638" }}>
      <div style={{ maxWidth: 1050, margin: "0 auto" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#1a1464", textDecoration: "none", marginBottom: 22 }}><ArrowLeft size={17}/> Voltar à loja</Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <div><p style={{ color: "#737b91", margin: 0 }}>Área do cliente</p><h1 style={{ color: "#1a1464", fontSize: 30, margin: "5px 0" }}>Olá, {profile.full_name || user?.email}</h1><p style={{ color: "#737b91", margin: 0 }}>{user?.email}</p></div>
          <button onClick={logout} style={{ display: "inline-flex", gap: 8, alignItems: "center", border: "1px solid #d9ddea", borderRadius: 9, padding: "10px 14px", background: "white", color: "#374151", cursor: "pointer" }}><LogOut size={16}/> Sair</button>
        </div>
        {message && <p role="status" style={{ padding: 12, borderRadius: 9, background: "#eef2ff", color: "#29216d" }}>{message}</p>}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18, marginBottom: 22 }}>
          <form onSubmit={saveProfile} style={{ background: "white", padding: 22, borderRadius: 14, border: "1px solid #e5e7eb", display: "grid", gap: 12 }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: 9, color: "#1a1464", fontSize: 19, margin: 0 }}><UserRound size={19}/> Meus dados</h2>
            <label>Nome completo<input value={profile.full_name} onChange={e=>setProfile({...profile,full_name:e.target.value})} style={inputStyle}/></label>
            <label>Telefone<input value={profile.phone} onChange={e=>setProfile({...profile,phone:e.target.value})} style={inputStyle}/></label>
            <label>Endereço<input value={profile.address} onChange={e=>setProfile({...profile,address:e.target.value})} style={inputStyle}/></label>
            <button disabled={saving} style={primaryButton}><Save size={16}/>{saving ? "Salvando..." : "Salvar dados"}</button>
          </form>
          <section style={{ background: "white", padding: 22, borderRadius: 14, border: "1px solid #e5e7eb" }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: 9, color: "#1a1464", fontSize: 19, margin: "0 0 14px" }}><Package size={19}/> Resumo da conta</h2>
            <p style={{ color: "#626b80" }}>Pedidos registrados: <strong>{orders.length}</strong></p>
            <p style={{ color: "#626b80" }}>Produtos favoritos: <strong>{wishlist.length}</strong></p>
            <p style={{ color: "#8a91a2", fontSize: 13 }}>As compras feitas como visitante antes de vincular a conta não aparecem automaticamente no histórico.</p>
          </section>
        </section>
        <section style={{ background: "white", padding: 22, borderRadius: 14, border: "1px solid #e5e7eb", marginBottom: 20 }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: 9, color: "#1a1464", fontSize: 20, margin: "0 0 16px" }}><Package size={20}/> Histórico de compras</h2>
          {orders.length === 0 ? <p style={{ color: "#737b91" }}>Você ainda não tem pedidos associados a esta conta.</p> : orders.map(order => <article key={order.id} style={{ borderTop: "1px solid #edf0f5", padding: "15px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><strong>Pedido #{String(order.id).slice(0,8)}</strong><span style={{ color: "#626b80" }}>{date(order.created_at)}</span></div>
            <p style={{ margin: "7px 0", color: "#626b80" }}>Status: <strong>{order.status || "pending"}</strong> · Pagamento: {order.payment_method || "—"} · Total: <strong>{money(order.total_amount)}</strong></p>
            <ul style={{ margin: 0, paddingLeft: 20, color: "#626b80" }}>{(order.order_items || []).map(item => <li key={item.id}>{item.product_name} — {item.quantity} × {money(item.price)}</li>)}</ul>
          </article>)}
        </section>
        <section style={{ background: "white", padding: 22, borderRadius: 14, border: "1px solid #e5e7eb" }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: 9, color: "#1a1464", fontSize: 20, margin: "0 0 16px" }}><Heart size={20}/> Minha lista de desejos</h2>
          {wishlist.length === 0 ? <p style={{ color: "#737b91" }}>Você ainda não salvou produtos.</p> : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>{wishlist.map(item => <article key={item.id} style={{ border: "1px solid #edf0f5", borderRadius: 12, padding: 13 }}>
            {item.product_snapshot?.imageUrl && <img src={item.product_snapshot.imageUrl} alt="" style={{ width: "100%", height: 120, objectFit: "contain" }}/>}
            <strong>{item.product_snapshot?.name || item.product_key}</strong><p style={{ color: "#1a1464", fontWeight: 700 }}>{money(item.product_snapshot?.price)}</p>
            <button onClick={()=>removeFavorite(item)} style={{ border: "1px solid #e5b9bd", color: "#a33a45", background: "white", borderRadius: 8, padding: "8px 10px", cursor: "pointer" }}>Remover</button>
          </article>)}</div>}
        </section>
      </div>
    </main>
  );
}

const inputStyle = { display: "block", width: "100%", boxSizing: "border-box", marginTop: 6, padding: "11px 12px", border: "1px solid #d9deea", borderRadius: 8, fontSize: 14 };
const primaryButton = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, border: 0, borderRadius: 9, padding: "11px 14px", background: "#1a1464", color: "white", fontWeight: 700, cursor: "pointer" };
