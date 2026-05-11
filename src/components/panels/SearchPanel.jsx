import { useState } from "react";
import { C, sans, mono } from "../../tokens";
import { useBookingStore } from "../../store/bookingStore";
import { IATA } from "../../data/iata";

const cities = Object.entries(IATA).map(([code, name]) => ({ code, name }));

export function SearchPanel() {
  const store = useBookingStore();
  const [origin, setOrigin] = useState("BOM");
  const [dest, setDest] = useState("JFK");
  const [date, setDate] = useState("12JUN");
  const [paxCount, setPaxCount] = useState(1);
  const [showOriginDrop, setShowOriginDrop] = useState(false);
  const [showDestDrop, setShowDestDrop] = useState(false);

  const handleSearch = () => {
    if (!origin || !dest || !date) return;
    store.searchAvailability(origin, dest, date, "ui");
  };

  const inputStyle = {
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6,
    padding: "10px 14px", color: C.text, fontSize: 14, fontFamily: sans,
    outline: "none", width: "100%",
  };

  const labelStyle = {
    color: C.muted, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
    marginBottom: 6, display: "block",
  };

  return (
    <div style={{
      height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 40, fontFamily: sans,
    }}>
      <div style={{ maxWidth: 420, width: "100%" }}>
        <h2 style={{ color: C.text, fontSize: 22, fontWeight: 600, marginBottom: 6 }}>
          Search Flights
        </h2>
        <p style={{ color: C.muted, fontSize: 13, marginBottom: 32 }}>
          Find availability for your route. This generates an AN command.
        </p>

        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          {/* Origin */}
          <div style={{ flex: 1, position: "relative" }}>
            <label style={labelStyle}>FROM</label>
            <input value={origin} onChange={e => setOrigin(e.target.value.toUpperCase())}
              onFocus={() => setShowOriginDrop(true)} onBlur={() => setTimeout(() => setShowOriginDrop(false), 150)}
              style={inputStyle} placeholder="BOM" maxLength={3} />
            {showOriginDrop && (
              <Dropdown items={cities} filter={origin} onSelect={(c) => { setOrigin(c); setShowOriginDrop(false); }} />
            )}
          </div>

          {/* Dest */}
          <div style={{ flex: 1, position: "relative" }}>
            <label style={labelStyle}>TO</label>
            <input value={dest} onChange={e => setDest(e.target.value.toUpperCase())}
              onFocus={() => setShowDestDrop(true)} onBlur={() => setTimeout(() => setShowDestDrop(false), 150)}
              style={inputStyle} placeholder="JFK" maxLength={3} />
            {showDestDrop && (
              <Dropdown items={cities} filter={dest} onSelect={(c) => { setDest(c); setShowDestDrop(false); }} />
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
          {/* Date */}
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>DATE</label>
            <input value={date} onChange={e => setDate(e.target.value.toUpperCase())}
              style={inputStyle} placeholder="12JUN" maxLength={5} />
          </div>

          {/* Pax count */}
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>PASSENGERS</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setPaxCount(Math.max(1, paxCount - 1))}
                style={btnSmall}>−</button>
              <span style={{ color: C.text, fontSize: 18, fontWeight: 600, minWidth: 20, textAlign: "center" }}>
                {paxCount}
              </span>
              <button onClick={() => setPaxCount(Math.min(9, paxCount + 1))}
                style={btnSmall}>+</button>
            </div>
          </div>
        </div>

        <button onClick={handleSearch} style={{
          width: "100%", padding: "12px 0", background: C.accent, color: "#fff",
          border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600,
          cursor: "pointer", fontFamily: sans, letterSpacing: "0.03em",
        }}>
          Search Flights
        </button>

        <div style={{
          marginTop: 20, padding: "10px 14px", background: C.surface,
          borderRadius: 6, border: `1px solid ${C.border}`,
        }}>
          <span style={{ color: C.muted, fontSize: 11, fontFamily: mono }}>
            → AN{date}{origin}{dest}
          </span>
        </div>
      </div>
    </div>
  );
}

const btnSmall = {
  width: 32, height: 32, background: C.surface, border: `1px solid ${C.border}`,
  borderRadius: 6, color: C.text, fontSize: 16, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
};

function Dropdown({ items, filter, onSelect }) {
  const filtered = items.filter(i =>
    i.code.includes(filter) || i.name.toLowerCase().includes(filter.toLowerCase())
  ).slice(0, 6);

  if (filtered.length === 0) return null;

  return (
    <div style={{
      position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10,
      background: "#0F172A", border: `1px solid ${C.border}`, borderRadius: 6,
      marginTop: 4, overflow: "hidden",
    }}>
      {filtered.map(i => (
        <div key={i.code}
          onMouseDown={() => onSelect(i.code)}
          style={{
            padding: "8px 12px", cursor: "pointer", fontSize: 12,
            color: C.text, borderBottom: `1px solid ${C.border}`,
          }}
          onMouseEnter={e => e.currentTarget.style.background = C.surface}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <span style={{ color: C.accent, fontWeight: 600 }}>{i.code}</span>
          <span style={{ color: C.muted, marginLeft: 8 }}>{i.name}</span>
        </div>
      ))}
    </div>
  );
}
