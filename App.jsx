import { useState, useRef } from “react”;

const fmt = (n) => parseFloat(n || 0).toFixed(2);
const currency = (n, sym = “$”) => `${sym}${fmt(n)}`;
const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const today = () => new Date().toISOString().split(“T”)[0];
const dueDate = (days = 30) => { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().split(“T”)[0]; };

const CURRENCIES = [”$”, “€”, “£”, “₦”, “¥”, “A$”, “C$”];
const TAX_RATES = [0, 5, 7.5, 10, 15, 20];

const PRINT_STYLES = ` @media print { body * { visibility: hidden !important; } #invoice-preview, #invoice-preview * { visibility: visible !important; } #invoice-preview { position: fixed !important; left: 0 !important; top: 0 !important; width: 100% !important; padding: 40px !important; font-size: 13px !important; } .no-print { display: none !important; } }`;

const SECTION_COLORS = [
{ bg: “linear-gradient(135deg, #667eea 0%, #764ba2 100%)”, light: “#EEF0FF” },
{ bg: “linear-gradient(135deg, #f093fb 0%, #f5576c 100%)”, light: “#FFF0F5” },
{ bg: “linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)”, light: “#EFF9FF” },
{ bg: “linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)”, light: “#EFFFF9” },
];

const Label = ({ children, color }) => (

  <div style={{ fontSize: "10px", fontWeight: "800", letterSpacing: "1.5px", color: color || "#9B8BB4", textTransform: "uppercase", marginBottom: "6px" }}>{children}</div>
);

const Input = ({ label, value, onChange, placeholder, type = “text”, small, color }) => (

  <div style={{ marginBottom: small ? "8px" : "14px" }}>
    {label && <Label color={color}>{label}</Label>}
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: small ? "9px 12px" : "11px 14px", background: "rgba(255,255,255,0.9)", border: "2px solid rgba(255,255,255,0.4)", borderRadius: "10px", color: "#1a1a2e", fontSize: small ? "12px" : "13px", fontFamily: "inherit", outline: "none", boxSizing: "border-box", backdropFilter: "blur(10px)", transition: "all 0.2s" }}
      onFocus={e => { e.target.style.borderColor = "#667eea"; e.target.style.boxShadow = "0 0 0 3px rgba(102,126,234,0.2)"; }}
      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.4)"; e.target.style.boxShadow = "none"; }}
    />
  </div>
);

const Textarea = ({ label, value, onChange, placeholder, rows = 3, color }) => (

  <div style={{ marginBottom: "14px" }}>
    {label && <Label color={color}>{label}</Label>}
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.9)", border: "2px solid rgba(255,255,255,0.4)", borderRadius: "10px", color: "#1a1a2e", fontSize: "13px", fontFamily: "inherit", outline: "none", boxSizing: "border-box", resize: "vertical", backdropFilter: "blur(10px)" }}
      onFocus={e => { e.target.style.borderColor = "#667eea"; e.target.style.boxShadow = "0 0 0 3px rgba(102,126,234,0.2)"; }}
      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.4)"; e.target.style.boxShadow = "none"; }}
    />
  </div>
);

const Card = ({ children, gradient, style = {} }) => (

  <div style={{ background: gradient || "rgba(255,255,255,0.12)", backdropFilter: "blur(20px)", borderRadius: "20px", padding: "24px", border: "1px solid rgba(255,255,255,0.25)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", marginBottom: "20px", ...style }}>
    {children}
  </div>
);

const SectionTitle = ({ children, icon, color }) => (

  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
    <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: color || "linear-gradient(135deg,#667eea,#764ba2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>{icon}</div>
    <div style={{ fontSize: "13px", fontWeight: "800", letterSpacing: "1px", color: "#fff", textTransform: "uppercase" }}>{children}</div>
  </div>
);

export default function App() {
const previewRef = useRef(null);
const [inv, setInv] = useState({ number: `INV-${uid()}`, date: today(), due: dueDate(30), currency: “$”, taxRate: 0, discount: 0, notes: “Thank you for your business.”, terms: “Payment due within 30 days of invoice date.” });
const [from, setFrom] = useState({ name: “”, email: “”, address: “”, phone: “” });
const [to, setTo] = useState({ name: “”, email: “”, address: “”, phone: “” });
const [items, setItems] = useState([{ id: 1, desc: “”, qty: 1, rate: 0 }]);
const [tab, setTab] = useState(“edit”);

const setF = (obj, setObj, key) => val => setObj({ …obj, [key]: val });
const setI = (key) => val => setInv(p => ({ …p, [key]: val }));
const addItem = () => setItems(it => […it, { id: Date.now(), desc: “”, qty: 1, rate: 0 }]);
const removeItem = (id) => setItems(it => it.filter(i => i.id !== id));
const updateItem = (id, key, val) => setItems(it => it.map(i => i.id === id ? { …i, [key]: val } : i));

const subtotal = items.reduce((s, i) => s + (parseFloat(i.qty) || 0) * (parseFloat(i.rate) || 0), 0);
const discountAmt = subtotal * (parseFloat(inv.discount) || 0) / 100;
const taxAmt = (subtotal - discountAmt) * (parseFloat(inv.taxRate) || 0) / 100;
const total = subtotal - discountAmt + taxAmt;

const handlePrint = () => {
const style = document.createElement(“style”);
style.innerHTML = PRINT_STYLES;
document.head.appendChild(style);
window.print();
setTimeout(() => document.head.removeChild(style), 1000);
};

const selectStyle = { width: “100%”, padding: “11px 14px”, background: “rgba(255,255,255,0.9)”, border: “2px solid rgba(255,255,255,0.4)”, borderRadius: “10px”, color: “#1a1a2e”, fontSize: “13px”, fontFamily: “inherit”, outline: “none”, marginBottom: “14px”, appearance: “none” };

return (
<div style={{ minHeight: “100vh”, background: “linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)”, color: “#fff”, fontFamily: “‘Plus Jakarta Sans’, ‘Segoe UI’, sans-serif” }}>
<style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } ::placeholder { color: #aaa !important; } ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; } select { -webkit-appearance: none; } @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } } .fadein { animation: fadeIn 0.3s ease forwards; }`}</style>

```
  {/* Header */}
  <div style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 30 }}>
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "linear-gradient(135deg,#f093fb,#f5576c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", boxShadow: "0 4px 15px rgba(240,147,251,0.4)" }}>🧾</div>
      <div>
        <div style={{ fontWeight: "800", fontSize: "16px", background: "linear-gradient(135deg,#f093fb,#4facfe)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>InvoiceFlow</div>
        <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.5px" }}>Professional Invoice Generator</div>
      </div>
    </div>
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.08)", padding: "5px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.12)" }}>
        {[["edit", "✏️", "Edit"], ["preview", "👁️", "Preview"]].map(([t, icon, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "12px", fontFamily: "inherit", transition: "all 0.2s", background: tab === t ? "linear-gradient(135deg,#667eea,#764ba2)" : "transparent", color: tab === t ? "#fff" : "rgba(255,255,255,0.5)", boxShadow: tab === t ? "0 4px 12px rgba(102,126,234,0.4)" : "none" }}>{icon} {label}</button>
        ))}
      </div>
      {tab === "preview" && (
        <button onClick={handlePrint} className="no-print" style={{ background: "linear-gradient(135deg,#43e97b,#38f9d7)", color: "#000", border: "none", borderRadius: "10px", padding: "9px 18px", fontWeight: "800", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 15px rgba(67,233,123,0.4)" }}>⬇ PDF</button>
      )}
    </div>
  </div>

  {tab === "edit" && (
    <div className="fadein" style={{ maxWidth: "860px", margin: "0 auto", padding: "28px 16px" }}>

      {/* Invoice Details */}
      <Card gradient="linear-gradient(135deg, rgba(102,126,234,0.3) 0%, rgba(118,75,162,0.3) 100%)">
        <SectionTitle icon="📋" color="linear-gradient(135deg,#667eea,#764ba2)">Invoice Details</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <Input label="Invoice Number" value={inv.number} onChange={setI("number")} color="#a78bfa" />
          <div>
            <Label color="#a78bfa">Currency</Label>
            <select value={inv.currency} onChange={e => setInv(p => ({ ...p, currency: e.target.value }))} style={selectStyle}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Input label="Invoice Date" value={inv.date} onChange={setI("date")} type="date" color="#a78bfa" />
          <Input label="Due Date" value={inv.due} onChange={setI("due")} type="date" color="#a78bfa" />
        </div>
      </Card>

      {/* From / To */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <Card gradient="linear-gradient(135deg, rgba(240,147,251,0.25) 0%, rgba(245,87,108,0.25) 100%)">
          <SectionTitle icon="👤" color="linear-gradient(135deg,#f093fb,#f5576c)">From</SectionTitle>
          <Input label="Name / Company" value={from.name} onChange={setF(from, setFrom, "name")} placeholder="Sylvester Francis" small color="#f093fb" />
          <Input label="Email" value={from.email} onChange={setF(from, setFrom, "email")} placeholder="sylvafrancis6@gmail.com" small color="#f093fb" />
          <Input label="Phone" value={from.phone} onChange={setF(from, setFrom, "phone")} placeholder="+234..." small color="#f093fb" />
          <Textarea label="Address" value={from.address} onChange={setF(from, setFrom, "address")} placeholder="Lagos, Nigeria" rows={2} color="#f093fb" />
        </Card>
        <Card gradient="linear-gradient(135deg, rgba(79,172,254,0.25) 0%, rgba(0,242,254,0.25) 100%)">
          <SectionTitle icon="🏢" color="linear-gradient(135deg,#4facfe,#00f2fe)">Bill To</SectionTitle>
          <Input label="Client Name" value={to.name} onChange={setF(to, setTo, "name")} placeholder="Client Name" small color="#4facfe" />
          <Input label="Email" value={to.email} onChange={setF(to, setTo, "email")} placeholder="client@email.com" small color="#4facfe" />
          <Input label="Phone" value={to.phone} onChange={setF(to, setTo, "phone")} placeholder="+1..." small color="#4facfe" />
          <Textarea label="Address" value={to.address} onChange={setF(to, setTo, "address")} placeholder="Client Address" rows={2} color="#4facfe" />
        </Card>
      </div>

      {/* Line Items */}
      <Card gradient="linear-gradient(135deg, rgba(67,233,123,0.2) 0%, rgba(56,249,215,0.2) 100%)">
        <SectionTitle icon="📦" color="linear-gradient(135deg,#43e97b,#38f9d7)">Line Items</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "3fr 0.8fr 1.2fr 1.2fr auto", gap: "8px", marginBottom: "10px" }}>
          {["Description", "Qty", "Rate", "Amount", ""].map((h, i) => (
            <div key={i} style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", padding: "0 2px" }}>{h}</div>
          ))}
        </div>
        {items.map((item, idx) => {
          const amt = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
          return (
            <div key={item.id} style={{ display: "grid", gridTemplateColumns: "3fr 0.8fr 1.2fr 1.2fr auto", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
              <input value={item.desc} onChange={e => updateItem(item.id, "desc", e.target.value)} placeholder={`Service ${idx + 1}`}
                style={{ padding: "10px 12px", background: "rgba(255,255,255,0.9)", border: "2px solid rgba(255,255,255,0.3)", borderRadius: "10px", color: "#1a1a2e", fontSize: "12px", fontFamily: "inherit", outline: "none" }} />
              <input type="number" value={item.qty} onChange={e => updateItem(item.id, "qty", e.target.value)}
                style={{ padding: "10px 8px", background: "rgba(255,255,255,0.9)", border: "2px solid rgba(255,255,255,0.3)", borderRadius: "10px", color: "#1a1a2e", fontSize: "12px", fontFamily: "inherit", outline: "none", textAlign: "center" }} />
              <input type="number" value={item.rate} onChange={e => updateItem(item.id, "rate", e.target.value)} placeholder="0.00"
                style={{ padding: "10px 12px", background: "rgba(255,255,255,0.9)", border: "2px solid rgba(255,255,255,0.3)", borderRadius: "10px", color: "#1a1a2e", fontSize: "12px", fontFamily: "inherit", outline: "none" }} />
              <div style={{ padding: "10px 12px", background: "rgba(67,233,123,0.2)", border: "2px solid rgba(67,233,123,0.3)", borderRadius: "10px", color: "#43e97b", fontSize: "12px", fontWeight: "700", textAlign: "right" }}>{currency(amt, inv.currency)}</div>
              <button onClick={() => removeItem(item.id)} style={{ width: "36px", height: "36px", background: "rgba(245,87,108,0.2)", border: "2px solid rgba(245,87,108,0.3)", borderRadius: "10px", color: "#f5576c", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
          );
        })}
        <button onClick={addItem} style={{ marginTop: "4px", background: "rgba(67,233,123,0.15)", border: "2px dashed rgba(67,233,123,0.4)", borderRadius: "10px", color: "#43e97b", cursor: "pointer", padding: "11px", width: "100%", fontSize: "13px", fontFamily: "inherit", fontWeight: "700" }}>＋ Add Line Item</button>
      </Card>

      {/* Totals */}
      <Card gradient="linear-gradient(135deg, rgba(255,236,120,0.2) 0%, rgba(255,160,50,0.2) 100%)">
        <SectionTitle icon="💰" color="linear-gradient(135deg,#FFEC78,#FFA032)">Totals & Adjustments</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
          <div>
            <Label color="#FFD700">Tax Rate</Label>
            <select value={inv.taxRate} onChange={e => setInv(p => ({ ...p, taxRate: e.target.value }))} style={selectStyle}>
              {TAX_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
            </select>
          </div>
          <Input label="Discount (%)" value={inv.discount} onChange={setI("discount")} type="number" placeholder="0" color="#FFD700" />
        </div>
        <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "14px", padding: "18px", border: "1px solid rgba(255,255,255,0.1)" }}>
          {[["Subtotal", subtotal, "#fff"], inv.discount > 0 && [`Discount (${inv.discount}%)`, -discountAmt, "#f5576c"], inv.taxRate > 0 && [`Tax (${inv.taxRate}%)`, taxAmt, "#4facfe"]].filter(Boolean).map(([label, val, col]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "13px" }}>
              <span style={{ color: "rgba(255,255,255,0.6)" }}>{label}</span>
              <span style={{ color: col, fontWeight: "600" }}>{val < 0 ? "- " : ""}{currency(Math.abs(val), inv.currency)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: "14px", marginTop: "6px" }}>
            <span style={{ fontWeight: "800", fontSize: "16px", color: "#fff" }}>TOTAL DUE</span>
            <span style={{ fontWeight: "900", fontSize: "24px", background: "linear-gradient(135deg,#FFEC78,#FFA032)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{currency(total, inv.currency)}</span>
          </div>
        </div>
      </Card>

      {/* Notes */}
      <Card gradient="linear-gradient(135deg, rgba(160,220,255,0.15) 0%, rgba(200,180,255,0.15) 100%)">
        <SectionTitle icon="📝" color="linear-gradient(135deg,#a0dcff,#c8b4ff)">Notes & Terms</SectionTitle>
        <Textarea label="Notes" value={inv.notes} onChange={setI("notes")} placeholder="Thank you for your business." color="#c8b4ff" />
        <Textarea label="Payment Terms" value={inv.terms} onChange={setI("terms")} placeholder="Payment due within 30 days." color="#c8b4ff" />
      </Card>

      <button onClick={() => setTab("preview")} style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg,#f093fb 0%,#f5576c 50%,#4facfe 100%)", color: "#fff", border: "none", borderRadius: "14px", fontWeight: "800", fontSize: "15px", cursor: "pointer", fontFamily: "inherit", marginBottom: "32px", boxShadow: "0 8px 30px rgba(240,147,251,0.4)", letterSpacing: "0.5px" }}>
        Preview & Download Invoice →
      </button>
    </div>
  )}

  {tab === "preview" && (
    <div className="fadein" style={{ maxWidth: "860px", margin: "0 auto", padding: "28px 16px" }}>
      <div id="invoice-preview" ref={previewRef} style={{ background: "#fff", color: "#111", borderRadius: "20px", overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
        {/* Colourful top bar */}
        <div style={{ height: "8px", background: "linear-gradient(90deg,#667eea,#f093fb,#f5576c,#4facfe,#43e97b,#FFEC78)" }} />
        <div style={{ padding: "40px" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "36px" }}>
            <div>
              <div style={{ fontSize: "38px", fontWeight: "900", background: "linear-gradient(135deg,#667eea,#f5576c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-2px", fontFamily: "Georgia, serif" }}>INVOICE</div>
              <div style={{ fontSize: "13px", color: "#888", marginTop: "4px", fontWeight: "600" }}>{inv.number}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "inline-block", background: "linear-gradient(135deg,#667eea20,#764ba220)", border: "1px solid #667eea40", borderRadius: "10px", padding: "10px 16px" }}>
                <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>Issued</div>
                <div style={{ fontWeight: "700", color: "#333" }}>{inv.date}</div>
                <div style={{ fontSize: "12px", color: "#888", marginTop: "8px", marginBottom: "4px" }}>Due By</div>
                <div style={{ fontWeight: "700", color: "#f5576c" }}>{inv.due}</div>
              </div>
            </div>
          </div>

          {/* From / To */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "36px" }}>
            {[["From", from, "#667eea"], ["Bill To", to, "#f5576c"]].map(([title, data, color]) => (
              <div key={title} style={{ background: `${color}10`, borderLeft: `4px solid ${color}`, borderRadius: "0 12px 12px 0", padding: "16px 20px" }}>
                <div style={{ fontSize: "10px", fontWeight: "800", letterSpacing: "2px", color: color, textTransform: "uppercase", marginBottom: "10px" }}>{title}</div>
                <div style={{ fontWeight: "700", fontSize: "15px", color: "#111" }}>{data.name || (title === "From" ? "Your Name" : "Client Name")}</div>
                {data.email && <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>{data.email}</div>}
                {data.phone && <div style={{ fontSize: "12px", color: "#666" }}>{data.phone}</div>}
                {data.address && <div style={{ fontSize: "12px", color: "#666", marginTop: "4px", whiteSpace: "pre-line" }}>{data.address}</div>}
              </div>
            ))}
          </div>

          {/* Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "28px" }}>
            <thead>
              <tr style={{ background: "linear-gradient(135deg,#667eea,#764ba2)", color: "#fff" }}>
                {["Description", "Qty", "Rate", "Amount"].map((h, i) => (
                  <th key={h} style={{ padding: "13px 16px", textAlign: i === 0 ? "left" : "right", fontSize: "11px", fontWeight: "800", letterSpacing: "1.5px", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const amount = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
                return (
                  <tr key={item.id} style={{ background: i % 2 === 0 ? "#f8f7ff" : "#fff", borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "13px 16px", fontSize: "13px", color: "#333" }}>{item.desc || `Service ${i + 1}`}</td>
                    <td style={{ padding: "13px 16px", textAlign: "right", fontSize: "13px", color: "#666" }}>{item.qty}</td>
                    <td style={{ padding: "13px 16px", textAlign: "right", fontSize: "13px", color: "#666" }}>{currency(item.rate, inv.currency)}</td>
                    <td style={{ padding: "13px 16px", textAlign: "right", fontSize: "13px", fontWeight: "700", color: "#667eea" }}>{currency(amount, inv.currency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "32px" }}>
            <div style={{ width: "280px" }}>
              {[["Subtotal", subtotal, "#555"], inv.discount > 0 && [`Discount (${inv.discount}%)`, -discountAmt, "#f5576c"], inv.taxRate > 0 && [`Tax (${inv.taxRate}%)`, taxAmt, "#667eea"]].filter(Boolean).map(([label, val, col]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f0f0f0", fontSize: "13px" }}>
                  <span style={{ color: "#888" }}>{label}</span>
                  <span style={{ color: col, fontWeight: "600" }}>{val < 0 ? "- " : ""}{currency(Math.abs(val), inv.currency)}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 18px", background: "linear-gradient(135deg,#667eea,#f5576c)", color: "#fff", borderRadius: "12px", marginTop: "10px" }}>
                <span style={{ fontWeight: "700", fontSize: "14px" }}>TOTAL DUE</span>
                <span style={{ fontWeight: "900", fontSize: "20px" }}>{currency(total, inv.currency)}</span>
              </div>
            </div>
          </div>

          {/* Notes / Terms */}
          {(inv.notes || inv.terms) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", borderTop: "2px solid #f0f0f0", paddingTop: "20px" }}>
              {inv.notes && <div><div style={{ fontSize: "10px", fontWeight: "800", letterSpacing: "2px", color: "#667eea", textTransform: "uppercase", marginBottom: "8px" }}>Notes</div><div style={{ fontSize: "12px", color: "#666", lineHeight: "1.7" }}>{inv.notes}</div></div>}
              {inv.terms && <div><div style={{ fontSize: "10px", fontWeight: "800", letterSpacing: "2px", color: "#f5576c", textTransform: "uppercase", marginBottom: "8px" }}>Terms</div><div style={{ fontSize: "12px", color: "#666", lineHeight: "1.7" }}>{inv.terms}</div></div>}
            </div>
          )}

          <div style={{ marginTop: "28px", textAlign: "center", fontSize: "11px", color: "#ccc", borderTop: "1px solid #f5f5f5", paddingTop: "16px" }}>
            Generated by InvoiceFlow · {from.name || "Sylvester Francis"}
          </div>
        </div>
        {/* Bottom bar */}
        <div style={{ height: "6px", background: "linear-gradient(90deg,#43e97b,#38f9d7,#4facfe,#667eea)" }} />
      </div>

      <button onClick={handlePrint} className="no-print" style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg,#43e97b,#38f9d7)", color: "#000", border: "none", borderRadius: "14px", fontWeight: "800", fontSize: "15px", cursor: "pointer", fontFamily: "inherit", marginTop: "20px", marginBottom: "32px", boxShadow: "0 8px 30px rgba(67,233,123,0.4)" }}>
        ⬇ Download as PDF
      </button>
    </div>
  )}
</div>
```

);
}
