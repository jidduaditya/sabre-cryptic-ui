import { useState } from "react";
import { C, sans, mono } from "../../tokens";
import { useBookingStore } from "../../store/bookingStore";

const TITLES = ["MR", "MRS", "MS", "MISS", "MSTR", "DR"];
const PAX_TYPES = ["ADT", "CNN", "INF"];

export function PassengerPanel() {
  const passengers = useBookingStore(s => s.passengers);
  const booking = useBookingStore(s => s.booking);
  const store = useBookingStore();

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [title, setTitle] = useState("MR");
  const [paxType, setPaxType] = useState("ADT");

  const handleAdd = () => {
    if (!lastName.trim() || !firstName.trim()) return;
    store.addPassenger(lastName.trim().toUpperCase(), firstName.trim().toUpperCase(), title, paxType, "ui");
    setLastName("");
    setFirstName("");
  };

  const handleContinue = () => {
    store.advanceFromPassenger("ui");
  };

  const inputStyle = {
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6,
    padding: "10px 14px", color: C.text, fontSize: 14, fontFamily: sans,
    outline: "none", width: "100%",
  };

  const selectStyle = {
    ...inputStyle, cursor: "pointer", appearance: "none",
    backgroundImage: "none",
  };

  return (
    <div style={{ height: "100%", overflow: "auto", padding: "20px 24px", fontFamily: sans }}>
      {/* Segment summary */}
      {booking.segment && (
        <div style={{
          padding: "10px 14px", marginBottom: 20, borderRadius: 6,
          background: C.greenDim, border: `1px solid ${C.greenBorder}`,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ color: C.green, fontWeight: 600, fontSize: 12 }}>
            {booking.segment.flight}
          </span>
          <span style={{ color: C.green, fontSize: 12 }}>{booking.fare?.cls} class</span>
          <span style={{ color: C.green, fontSize: 12 }}>{booking.segment.date}</span>
          <span style={{ color: C.green, fontSize: 12 }}>{booking.segment.route}</span>
        </div>
      )}

      <h3 style={{ color: C.text, fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
        Passenger Details
      </h3>
      <p style={{ color: C.muted, fontSize: 12, marginBottom: 24 }}>
        Add passenger names. Each generates an NM command.
      </p>

      {/* Existing passengers */}
      {passengers.map((p, i) => (
        <div key={i} style={{
          padding: "10px 14px", marginBottom: 8, borderRadius: 6,
          background: C.surface, border: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ color: C.accent, fontFamily: mono, fontSize: 12, fontWeight: 600 }}>
            {p.id}
          </span>
          <span style={{ color: C.text, fontSize: 13 }}>
            {p.lastName}/{p.firstName} {p.title}
          </span>
          <span style={{ color: C.muted, fontSize: 10 }}>{p.paxType}</span>
        </div>
      ))}

      {/* Add form */}
      <div style={{
        padding: 16, borderRadius: 8, border: `1px solid ${C.border}`,
        background: "rgba(255,255,255,0.02)", marginTop: 16,
      }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ color: C.muted, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 6, display: "block" }}>
              LAST NAME
            </label>
            <input value={lastName} onChange={e => setLastName(e.target.value)}
              onBlur={() => { if (lastName) setLastName(lastName.toUpperCase()); }}
              style={inputStyle} placeholder="SHARMA" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ color: C.muted, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 6, display: "block" }}>
              FIRST NAME
            </label>
            <input value={firstName} onChange={e => setFirstName(e.target.value)}
              onBlur={() => { if (firstName) setFirstName(firstName.toUpperCase()); }}
              style={inputStyle} placeholder="RAJESH" />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={{ color: C.muted, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 6, display: "block" }}>
              TITLE
            </label>
            <select value={title} onChange={e => setTitle(e.target.value)} style={selectStyle}>
              {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ color: C.muted, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 6, display: "block" }}>
              TYPE
            </label>
            <select value={paxType} onChange={e => setPaxType(e.target.value)} style={selectStyle}>
              {PAX_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <button onClick={handleAdd} style={{
          width: "100%", padding: "10px", background: C.accent, color: "#fff",
          border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600,
          cursor: "pointer", fontFamily: sans,
        }}>
          Add Passenger
        </button>

        {lastName && firstName && (
          <div style={{ marginTop: 8, padding: "6px 10px", background: C.surface, borderRadius: 4 }}>
            <span style={{ color: C.muted, fontSize: 10, fontFamily: mono }}>
              → NM1{lastName.toUpperCase()}/{firstName.toUpperCase()} {title}
            </span>
          </div>
        )}
      </div>

      {passengers.length > 0 && (
        <button onClick={handleContinue} style={{
          width: "100%", marginTop: 16, padding: "10px", background: "transparent",
          color: C.accent, border: `1px solid ${C.accentBorder}`, borderRadius: 6,
          fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: sans,
        }}>
          Continue to Contact →
        </button>
      )}
    </div>
  );
}
