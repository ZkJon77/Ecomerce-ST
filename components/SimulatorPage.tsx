"use client"
import React, { useState, useEffect, useRef } from "react"
import { Palette, Layers, Upload, X, Info, Check } from "lucide-react"
import { COLOR_PALETTE } from "@/lib/constants"
import { getHarmonies, ColorPalette, hexToHsl, hslToHex } from "@/lib/color-utils"

/**
 * ColorWheel Component: A visual HSL wheel for selecting a hue.
 */
const ColorWheel = ({ hue, onHueChange }: { hue: number; onHueChange: (h: number) => void }) => {
  const ref = useRef<SVGSVGElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;

    // Calculate angle in degrees (0-360)
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    angle = (angle + 360) % 360; // Shift to 0-360
    // In SVG coordinate system, 0 degrees is usually at 3 o'clock.
    // We rotate it slightly to align with standard color wheels if needed.
    onHueChange(angle);
  };

  return (
    <div style={{ position: "relative", width: 200, height: 200, margin: "0 auto" }}>
      <svg
        ref={ref}
        viewBox="0 0 100 100"
        style={{ width: "100%", height: "100%", cursor: "crosshair", borderRadius: "50%" }}
        onMouseMove={handleMouseMove}
        onClick={(e) => handleMouseMove(e as any)}
      >
        <defs>
          <linearGradient id="hueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="red" />
            <stop offset="17%" stopColor="#ffff00" />
            <stop offset="33%" stopColor="lime" />
            <stop offset="50%" stopColor="cyan" />
            <stop offset="67%" stopColor="blue" />
            <stop offset="83%" stopColor="magenta" />
            <stop offset="100%" stopColor="red" />
          </linearGradient>
        </defs>
        {/* Simplified color wheel using a conic gradient would be better, but SVG is more compatible.
            We'll use a CSS conic-gradient overlay for the wheel. */}
        <circle cx="50" cy="50" r="50" fill="url(#hueGradient)" opacity="0.2" />
      </svg>
      <div style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
        cursor: "crosshair"
      }}
      onMouseMove={handleMouseMove}
      onClick={(e) => handleMouseMove(e as any)}
      />
      <div style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 12,
        height: 12,
        borderRadius: "50%",
        border: "2px solid white",
        boxShadow: "0 0 4px rgba(0,0,0,0.5)",
        transform: "translate(-50%, -50%)",
        background: hslToHex(hue, 100, 50),
        transition: "background 0.1s",
        pointerEvents: "none"
      }} />
    </div>
  );
};

/**
 * PaletteCard Component: Adobe Color style harmony card.
 */
const PaletteCard = ({ title, colors, onSelectColor }: { title: string; colors: string[]; onSelectColor: (hex: string) => void }) => (
  <div style={{ background: "white", borderRadius: 12, padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1px solid #eee" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <Layers size={14} color="#666" />
      <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1464", textTransform: "uppercase" }}>{title}</span>
    </div>
    <div style={{ display: "flex", height: 40, borderRadius: 6, overflow: "hidden", cursor: "pointer" }}>
      {colors.map((color, i) => (
        <div
          key={i}
          onClick={() => onSelectColor(color)}
          style={{ flex: 1, background: color, transition: "flex 0.2s" }}
          title={color}
        />
      ))}
    </div>
  </div>
);

const SimulatorPage = () => {
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [selectedGroup, setSelectedGroup] = useState("Todos");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [harmonies, setHarmonies] = useState<ColorPalette | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHarmonies(getHarmonies(selectedColor.hex));
  }, [selectedColor]);

  const groups = ["Todos", ...Array.from(new Set(COLOR_PALETTE.map(c => c.group)))];
  const filtered = selectedGroup === "Todos" ? COLOR_PALETTE : COLOR_PALETTE.filter(c => c.group === selectedGroup);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setUploadedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleHueChange = (h: number) => {
    setSelectedColor({
      name: "Cor Personalizada",
      hex: hslToHex(h, 80, 60),
      group: "Personalizado"
    });
  };

  return (
    <div style={{ background: "#f7f8fc", minHeight: "100vh", padding: "0 0 80px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg, #1a1464 0%, #4c1d95 100%)", padding: "32px 16px 24px", color: "white", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
          <Palette size={24} color="#fbbf24" />
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Simulador Profissional</h1>
        </div>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", margin: 0, maxWidth: 600, margin: "0 auto" }}>
          Explore harmonias cromáticas inspiradas no Adobe Color e visualize a cor ideal para seu ambiente.
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px", display: "grid", gridTemplateColumns: "1fr 350px", gap: 24 }}>

        {/* Left Column: Visualization and Catalog */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Main Visualizer */}
          <div style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <div style={{ position: "relative", height: 400, background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {uploadedImage ? (
                <div style={{ position: "relative", width: "100%", height: "100%" }}>
                  <img src={uploadedImage} alt="Ambiente" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: selectedColor.hex, opacity: 0.4, mixBlendMode: "multiply" }} />
                </div>
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: selectedColor.hex, transition: "background 0.4s" }}>
                  <div style={{ background: "rgba(255,255,255,0.9)", borderRadius: 16, padding: "24px 32px", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>🏠</div>
                    <div style={{ fontSize: 14, color: "#666", fontWeight: 600 }}>Visualização de Cor</div>
                    <div style={{ fontSize: 20, color: "#1a1464", fontWeight: 800, marginTop: 4 }}>{selectedColor.name}</div>
                  </div>
                </div>
              )}
              <div style={{ position: "absolute", top: 20, right: 20, display: "flex", gap: 8 }}>
                <button onClick={() => fileRef.current?.click()}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: "white", border: "none", borderRadius: 30, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <Upload size={16} /> Upload Foto
                </button>
                {uploadedImage && (
                  <button onClick={() => setUploadedImage(null)}
                    style={{ background: "white", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#ef4444", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
            <div style={{ padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "white" }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1464" }}>{selectedColor.name}</div>
                <div style={{ fontSize: 13, color: "#888", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontWeight: 700, color: "#aaa" }}>HEX:</span> {selectedColor.hex}
                  <span style={{ margin: "0 8px", color: "#ddd" }}>|</span>
                  <span style={{ fontWeight: 700, color: "#aaa" }}>GRUPO:</span> {selectedColor.group}
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: "none" }} />
            </div>
          </div>

          {/* Catalog Section */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1a1464" }}>Catálogo de Cores</h3>
              <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "4px" }}>
                {groups.map(g => (
                  <button key={g} onClick={() => setSelectedGroup(g)}
                    style={{ whiteSpace: "nowrap", padding: "6px 14px", borderRadius: 20, border: selectedGroup === g ? "none" : "1px solid #d1d5db", background: selectedGroup === g ? "#1a1464" : "white", color: selectedGroup === g ? "white" : "#555", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr)", gap: 16 }}>
              {filtered.map(color => (
                <div key={color.hex}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    background: "white",
                    borderRadius: 12,
                    padding: "8px",
                    cursor: "pointer",
                    border: selectedColor.hex === color.hex ? "3px solid #1a1464" : "1px solid #eee",
                    transition: "all 0.2s",
                    boxShadow: selectedColor.hex === color.hex ? "0 4px 12px rgba(26,20,100,0.15)" : "none"
                  }}>
                  <div style={{ width: "100%", height: 60, borderRadius: 8, background: color.hex, marginBottom: 8, border: "1px solid rgba(0,0,0,0.05)" }} />
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#333", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{color.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Tools & Palettes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Color Wheel Box */}
          <div style={{ background: "white", borderRadius: 20, padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 16 }}>
              <Palette size={18} color="#1a1464" />
              <span style={{ fontSize: 16, fontWeight: 800, color: "#1a1464" }}>Roda de Cores</span>
            </div>
            <ColorWheel hue={hexToHsl(selectedColor.hex).h} onHueChange={handleHueChange} />
            <div style={{ marginTop: 16, fontSize: 12, color: "#666", fontStyle: "italic" }}>
              Clique e arraste na roda para criar sua própria cor.
            </div>
          </div>

          {/* Harmonies Box */}
          {harmonies && (
            <div style={{ background: "white", borderRadius: 20, padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <Layers size={18} color="#1a1464" />
                <span style={{ fontSize: 16, fontWeight: 800, color: "#1a1464" }}>Harmonias (Adobe Style)</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <PaletteCard
                  title="Complementar"
                  colors={[selectedColor.hex, harmonies.complementary]}
                  onSelectColor={(hex) => setSelectedColor({ name: "Sugerida", hex, group: "Harmonia" })}
                />
                <PaletteCard
                  title="Análogas"
                  colors={[harmonies.analogous[0], selectedColor.hex, harmonies.analogous[1]]}
                  onSelectColor={(hex) => setSelectedColor({ name: "Sugerida", hex, group: "Harmonia" })}
                />
                <PaletteCard
                  title="Tríade"
                  colors={[selectedColor.hex, harmonies.triadic[0], harmonies.triadic[1]]}
                  onSelectColor={(hex) => setSelectedColor({ name: "Sugerida", hex, group: "Harmonia" })}
                />
                <PaletteCard
                  title="Monocromática"
                  colors={[
                    hslToHex(hexToHsl(selectedColor.hex).h, hexToHsl(selectedColor.hex).s, 20),
                    hslToHex(hexToHsl(selectedColor.hex).h, hexToHsl(selectedColor.hex).s, 40),
                    selectedColor.hex,
                    hslToHex(hexToHsl(selectedColor.hex).h, hexToHsl(selectedColor.hex).s, 70),
                    hslToHex(hexToHsl(selectedColor.hex).h, hexToHsl(selectedColor.hex).s, 90),
                  ]}
                  onSelectColor={(hex) => setSelectedColor({ name: "Sugerida", hex, group: "Harmonia" })}
                />
              </div>
              <div style={{ marginTop: 20, padding: "12px", background: "#fefce8", borderRadius: 8, border: "1px solid #fef08a", display: "flex", gap: 8, alignItems: "start" }}>
                <Info size={16} color="#854d0e" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 11, color: "#854d0e", lineHeight: 1.4 }}>
                  As cores harmoniosas são calculadas matematicamente para garantir equilíbrio visual em seu ambiente.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SimulatorPage
