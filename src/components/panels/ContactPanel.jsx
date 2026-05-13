import { useState } from "react";
import { E, eSans, mono } from "../../tokens";
import { useBookingStore } from "../../store/bookingStore";
const COUNTRIES = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "UK", name: "United Kingdom" },
  { code: "AE", name: "UAE" },
  { code: "SG", name: "Singapore" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "AU", name: "Australia" },
  { code: "CA", name: "Canada" },
  { code: "JP", name: "Japan" },
];

const PHONE_TYPES = [
  { value: "M", label: "Mobile" },
  { value: "H", label: "Home" },
  { value: "B", label: "Business" },
];

export function ContactPanel() {
  const contact = useBookingStore(s => s.contact);
  const store = useBookingStore();

  const [city, setCity] = useState("IN");
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
    background: E.surface, border: `1px solid ${E.border}`, borderRadius: 2,
    padding: "10px 14px", color: E.text, fontSize: 14, fontFamily: eSans,
    outline: "none", width: "100%",
  };

  return (
    <div style={{ height: "100%", overflow: "auto", padding: "20px 24px", fontFamily: eSans }}>
      <h3 style={{ color: E.text, fontSize: 18, fontWeight: 400, marginBottom: 4, fontFamily: "Georgia,serif" }}>
        Contact Information
      </h3>
      <p style={{ color: E.muted, fontSize: 12, marginBottom: 24 }}>
        Phone number is required (PRINT element P).
      </p>

      {/* Phone */}
      <div style={{
        padding: 16, borderBottom: `1px solid ${contact.phone ? E.greenBorder : E.border}`,
        background: contact.phone ? E.greenDim : "transparent", marginBottom: 16,
      }}>
        <label style={{ color: E.muted, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 10, display: "block" }}>
          PHONE {contact.phone && "✓"}
        </label>

        {contact.phone ? (
          <div style={{ color: E.green, fontSize: 13 }}>
            {contact.phone.city} {contact.phone.number}-{contact.phone.type}
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 160 }}>
                <select value={city} onChange={e => setCity(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}>
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                  ))}
                </select>
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
            <p style={{ color: E.muted, fontSize: 10, marginBottom: 8, fontStyle: "italic" }}>
              City code identifies the phone's location (standard GDS format)
            </p>
            <button onClick={handlePhone} style={{
              width: "100%", padding: "8px", background: E.accent, color: "#fff",
              border: "none", borderRadius: 2, fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: eSans,
            }}>
              Add Phone
            </button>
            {phone && (
              <div style={{ marginTop: 8, padding: "4px 8px", borderBottom: `1px solid ${E.border}` }}>
                <span style={{ color: E.muted, fontSize: 10, fontFamily: mono }}>
                  → 9{city} {phone}-{phoneType}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Email */}
      <div style={{
        padding: 16, borderBottom: `1px solid ${contact.email ? E.greenBorder : E.border}`,
        background: contact.email ? E.greenDim : "transparent", marginBottom: 16,
      }}>
        <label style={{ color: E.muted, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 10, display: "block" }}>
          EMAIL (OPTIONAL) {contact.email && "✓"}
        </label>

        {contact.email ? (
          <div style={{ color: E.green, fontSize: 13 }}>{contact.email}</div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 12 }}>
              <input value={email} onChange={e => setEmail(e.target.value)}
                style={{ ...inputStyle, flex: 1 }} placeholder="email@domain.com" />
              <button onClick={handleEmail} style={{
                padding: "8px 16px", background: "transparent", color: E.accent,
                border: `1px solid ${E.accentBorder}`, borderRadius: 2,
                fontSize: 12, cursor: "pointer", fontFamily: eSans,
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
          color: E.accent, border: `1px solid ${E.accentBorder}`, borderRadius: 2,
          fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: eSans,
        }}>
          Continue to Services →
        </button>
      )}
    </div>
  );
}
