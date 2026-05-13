import { useState } from "react";
import { E, eSans, mono } from "../../tokens";
import { useBookingStore } from "../../store/bookingStore";
import { IATA } from "../../data/iata";

const cities = Object.entries(IATA).map(([code, name]) => ({ code, name }));

export function SearchPanel() {
  const store = useBookingStore();
  const etBanner = useBookingStore(s => s._etBanner);
  const [origin, setOrigin] = useState("BOM");
  const [dest, setDest] = useState("JFK");
  const [date, setDate] = useState("12JUN");
  const [paxCount, setPaxCount] = useState(1);
  const [showOriginDrop, setShowOriginDrop] = useState(false);
  const [showDestDrop, setShowDestDrop] = useState(false);

  const handleSearch = () => {
    if (!origin || !dest || !date) return;
    store.searchAvailability(origin, dest, date, "ui", null, paxCount);
  };

  const inputStyle = {
    background: E.surface, border: `1px solid ${E.border}`, borderRadius: 2,
    padding: "10px 14px", color: E.text, fontSize: 14, fontFamily: eSans,
    outline: "none", width: "100%",
  };

  const labelStyle = {
    color: E.muted, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
    marginBottom: 6, display: "block",
  };

  return (
    <div style={{
      height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 40, fontFamily: eSans,
    }}>
      <div style={{ maxWidth: 420, width: "100%" }}>
        {etBanner && (
          <div style={{
            padding: "10px 14px", marginBottom: 20, background: E.greenDim,
            borderBottom: `1px solid ${E.greenBorder}`, display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ color: E.green, fontSize: 12 }}>PNR {etBanner.locator} saved</span>
            <button onClick={() => store.retrievePNR(etBanner.locator, "ui")} style={{
              padding: "4px 10px", background: "transparent", border: `1px solid ${E.greenBorder}`,
              borderRadius: 2, color: E.green, fontSize: 11, cursor: "pointer", fontFamily: eSans,
            }}>
              Retrieve *{etBanner.locator}
            </button>
          </div>
        )}
        <h2 style={{ color: E.text, fontSize: 24, fontWeight: 400, marginBottom: 6, fontFamily: "Georgia,serif" }}>
          Search Flights
        </h2>
        <p style={{ color: E.muted, fontSize: 13, marginBottom: 32 }}>
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
              <span style={{ color: E.text, fontSize: 18, fontWeight: 600, minWidth: 20, textAlign: "center" }}>
                {paxCount}
              </span>
              <button onClick={() => setPaxCount(Math.min(9, paxCount + 1))}
                style={btnSmall}>+</button>
            </div>
          </div>
        </div>

        <button onClick={handleSearch} style={{
          width: "100%", padding: "12px 0", background: E.accent, color: "#fff",
          border: "none", borderRadius: 2, fontSize: 14, fontWeight: 600,
          cursor: "pointer", fontFamily: eSans, letterSpacing: "0.03em",
        }}>
          Search Flights
        </button>

        <div style={{
          marginTop: 20, padding: "10px 14px",
          borderBottom: `1px solid ${E.border}`,
        }}>
          <span style={{ color: E.muted, fontSize: 11, fontFamily: mono }}>
            → AN{date}{origin}{dest}
          </span>
        </div>
      </div>
    </div>
  );
}

const btnSmall = {
  width: 32, height: 32, background: E.surface, border: `1px solid ${E.border}`,
  borderRadius: 2, color: E.text, fontSize: 16, cursor: "pointer",
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
      background: E.bg, border: `1px solid ${E.border}`, borderRadius: 2,
      marginTop: 4, overflow: "hidden",
    }}>
      {filtered.map(i => (
        <div key={i.code}
          onMouseDown={() => onSelect(i.code)}
          style={{
            padding: "8px 12px", cursor: "pointer", fontSize: 12,
            color: E.text, borderBottom: `1px solid ${E.border}`,
          }}
          onMouseEnter={e => e.currentTarget.style.background = E.surface}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <span style={{ color: E.accent, fontWeight: 600 }}>{i.code}</span>
          <span style={{ color: E.muted, marginLeft: 8 }}>{i.name}</span>
        </div>
      ))}
    </div>
  );
}
