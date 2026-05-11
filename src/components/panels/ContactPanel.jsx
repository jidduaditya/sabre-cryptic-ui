import { useState } from "react";
import { C, sans, mono } from "../../tokens";
import { useBookingStore } from "../../store/bookingStore";

const PHONE_TYPES = [
  { value: "M", label: "Mobile" },
  { value: "H", label: "Home" },
  { value: "B", label: "Business" },
];

export function ContactPanel() {
  const contact = useBookingStore(s => s.contact);
  const store = useBookingStore();

  const [city, setCity] = useState("DEL");
  const [phone, setPhone] = useState("");
  const [phoneType, setPhoneType] = useState("M");
  const [email, setEmail] = useState("");

  const handlePhone = () => {
    if (!phone.trim() || !city.trim()) return;
    store.addContact(phone.trim(), phoneType, city.trim().toUpperCase(), "ui");
  };

  const handleEmail = () => {
    if (!email.trim()) return;
    store.addEmail(email.trim().toUpperCase(), "ui");
  };

  const handleContinue = () => {
    store.advanceFromContact("ui");
  };

  const inputStyle = {
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6,
    padding: "10px 14px", color: C.text, fontSize: 14, fontFamily: sans,
    outline: "none", width: "100%",
  };

  return (
    <div style={{ height: "100%", overflow: "auto", padding: "20px 24px", fontFamily: sans }}>
      <h3 style={{ color: C.text, fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
        Contact Information
      </h3>
      <p style={{ color: C.muted, fontSize: 12, marginBottom: 24 }}>
        Phone number is required (PRINT element P).
      </p>

      {/* Phone */}
      <div style={{
        padding: 16, borderRadius: 8, border: `1px solid ${contact.phone ? C.greenBorder : C.border}`,
        background: contact.phone ? C.greenDim : "rgba(255,255,255,0.02)", marginBottom: 16,
      }}>
        <label style={{ color: C.muted, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 10, display: "block" }}>
          PHONE {contact.phone && "✓"}
        </label>

        {contact.phone ? (
          <div style={{ color: C.green, fontSize: 13 }}>
            {contact.phone.city} {contact.phone.number}-{contact.phone.type}
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 80 }}>
                <input value={city} onChange={e => setCity(e.target.value.toUpperCase())}
                  style={inputStyle} placeholder="DEL" maxLength={3} />
              </div>
              <div style={{ flex: 1 }}>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  style={inputStyle} placeholder="9999999" />
              </div>
              <div style={{ width: 100 }}>
                <select value={phoneType} onChange={e => setPhoneType(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}>
                  {PHONE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <button onClick={handlePhone} style={{
              width: "100%", padding: "8px", background: C.accent, color: "#fff",
              border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: sans,
            }}>
              Add Phone
            </button>
            {phone && (
              <div style={{ marginTop: 8, padding: "4px 8px", background: C.surface, borderRadius: 4 }}>
                <span style={{ color: C.muted, fontSize: 10, fontFamily: mono }}>
                  → 9{city} {phone}-{phoneType}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Email */}
      <div style={{
        padding: 16, borderRadius: 8, border: `1px solid ${contact.email ? C.greenBorder : C.border}`,
        background: contact.email ? C.greenDim : "rgba(255,255,255,0.02)", marginBottom: 16,
      }}>
        <label style={{ color: C.muted, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 10, display: "block" }}>
          EMAIL (OPTIONAL) {contact.email && "✓"}
        </label>

        {contact.email ? (
          <div style={{ color: C.green, fontSize: 13 }}>{contact.email}</div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 12 }}>
              <input value={email} onChange={e => setEmail(e.target.value)}
                style={{ ...inputStyle, flex: 1 }} placeholder="email@domain.com" />
              <button onClick={handleEmail} style={{
                padding: "8px 16px", background: C.surface, color: C.accent,
                border: `1px solid ${C.accentBorder}`, borderRadius: 6,
                fontSize: 12, cursor: "pointer", fontFamily: sans,
              }}>
                Add
              </button>
            </div>
          </>
        )}
      </div>

      {contact.phone && (
        <button onClick={handleContinue} style={{
          width: "100%", marginTop: 8, padding: "10px", background: "transparent",
          color: C.accent, border: `1px solid ${C.accentBorder}`, borderRadius: 6,
          fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: sans,
        }}>
          Continue to Services →
        </button>
      )}
    </div>
  );
}
