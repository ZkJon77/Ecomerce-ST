"use client"
import React, { useEffect } from "react"
import { Check } from "lucide-react"
import { ToastData } from "@/lib/constants"

const Toast = ({ message, type, onClose }: { message: string; type: string; onClose: () => void }) => {
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t) }, [onClose])
  const bg = type === "success" ? "#059669" : type === "error" ? "#dc2626" : "#1a1464"
  return (
    <div style={{ position: "fixed", top: 70, right: 12, background: bg, color: "white", padding: "10px 16px", borderRadius: 10, zIndex: 400, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 16px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 8, maxWidth: 280 }}>
      <Check size={16} />{message}
    </div>
  )
}

export default Toast
