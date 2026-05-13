import { useState } from "react";
import { E, eSans, mono } from "../../tokens";
import { useBookingStore } from "../../store/bookingStore";

export function AvailPanel() {
  const flights = useBookingStore(s => s.availability.flights);
  const filterAirline = useBookingStore(s => s.availability.filterAirline);
  const booking = useBookingStore(s => s.booking);
  const search = useBookingStore(s => s.search);
  const store = useBookingStore();
  const [expanded, setExpanded] = useState(null);
  const [showManualSell, setShowManualSell] = useState(false);
  const [manualFlight, setManualFlight] = useState("");
  const [manualDate, setManualDate] = useState(search.date || "");
  const [manualCls, setManualCls] = useState("Y");
  const [manualOrigin, setManualOrigin] = useState(search.origin || "");
  const [manualDest, setManualDest] = useState(search.destination || "");

  const airlines = [...new Set(flights.map(f => f.code))];

  const handleFilter = (code) => {
    store.searchAvailability(search.origin, search.destination, search.date, "ui", code === filterAirline ? null : code);
  };

  const handleSell = (flight, fare, lineNum) => {
    store.sellFare(flight.id, fare.cls, "ui");
  };

  const handleManualSell = () => {
    if (!manualFlight || !manualDate || !manualCls || !manualOrigin || !manualDest) return;
    store.sellLongSell(manualFlight.toUpperCase(), manualDate.toUpperCase(), manualCls.toUpperCase(), manualOrigin.toUpperCase(), manualDest.toUpperCase(), "ui");
  };

  const manualInputStyle = {
    background: E.surface, border: `1px solid ${E.border}`, borderRadius: 2,
    padding: "8px 10px", color: E.text, fontSize: 12, fontFamily: eSans,
    outline: "none", width: "100%",
  };

  // Empty state — no flights found
  if (flights.length === 0) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 40, fontFamily: eSans }}>
        <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
          <h3 style={{ color: E.text, fontSize: 18, fontWeight: 400, marginBottom: 8, fontFamily: "Georgia,serif" }}>
            No Flights Found
          </h3>
          <p style={{ color: E.muted, fontSize: 13, marginBottom: 24 }}>
            {search.origin} → {search.destination} on {search.date}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 24 }}>
            <button onClick={() => store.resetBooking("ui")} style={{
              padding: "10px 20px", background: E.accent, color: "#fff",
              border: "none", borderRadius: 2, fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: eSans,
            }}>
              Search Again
            </button>
            <button onClick={() => setShowManualSell(!showManualSell)} style={{
              padding: "10px 20px", background: "transparent", color: E.accent,
              border: `1px solid ${E.accentBorder}`, borderRadius: 2, fontSize: 13,
              cursor: "pointer", fontFamily: eSans,
            }}>
              Enter Segment Manually
            </button>
          </div>

          {showManualSell && (
            <div style={{ textAlign: "left", borderTop: `1px solid ${E.border}`, paddingTop: 16 }}>
              <div style={{ color: E.muted, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 12 }}>
                MANUAL SEGMENT ENTRY
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 2 }}>
                  <label style={{ color: E.muted, fontSize: 9, display: "block", marginBottom: 4 }}>FLIGHT</label>
                  <input value={manualFlight} onChange={e => setManualFlight(e.target.value.toUpperCase())}
                    style={manualInputStyle} placeholder="AA101" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: E.muted, fontSize: 9, display: "block", marginBottom: 4 }}>CLASS</label>
                  <input value={manualCls} onChange={e => setManualCls(e.target.value.toUpperCase())}
                    style={manualInputStyle} placeholder="Y" maxLength={1} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: E.muted, fontSize: 9, display: "block", marginBottom: 4 }}>DATE</label>
                  <input value={manualDate} onChange={e => setManualDate(e.target.value.toUpperCase())}
                    style={manualInputStyle} placeholder="12JUN" maxLength={5} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: E.muted, fontSize: 9, display: "block", marginBottom: 4 }}>FROM</label>
                  <input value={manualOrigin} onChange={e => setManualOrigin(e.target.value.toUpperCase())}
                    style={manualInputStyle} placeholder="BOM" maxLength={3} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: E.muted, fontSize: 9, display: "block", marginBottom: 4 }}>TO</label>
                  <input value={manualDest} onChange={e => setManualDest(e.target.value.toUpperCase())}
                    style={manualInputStyle} placeholder="JFK" maxLength={3} />
                </div>
              </div>
              <button onClick={handleManualSell} style={{
                width: "100%", padding: "8px", background: E.accent, color: "#fff",
                border: "none", borderRadius: 2, fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>
                Sell Segment
              </button>
              <div style={{ marginTop: 8, color: E.muted, fontSize: 10, fontFamily: mono }}>
                → 0{manualFlight}{manualCls}{manualDate}{manualOrigin}{manualDest}NN1
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", overflow: "auto", padding: "16px 20px", fontFamily: eSans }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <h3 style={{ color: E.text, fontSize: 17, fontWeight: 400, margin: 0, fontFamily: "Georgia,serif" }}>
          {search.origin} → {search.destination}
        </h3>
        <span style={{ color: E.muted, fontSize: 12 }}>{search.date}</span>
        <span style={{ color: E.muted, fontSize: 12 }}>{flights.length} flights</span>
        <div style={{ flex: 1 }} />
        {/* Airline filter chips */}
        {airlines.map(code => (
          <button key={code} onClick={() => handleFilter(code)} style={{
            padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 600,
            cursor: "pointer", border: `1px solid ${code === filterAirline ? E.accentBorder : E.border}`,
            background: code === filterAirline ? E.accentDim : "transparent",
            color: code === filterAirline ? E.accent : E.muted,
          }}>
            {code}
          </button>
        ))}
      </div>

      {flights.map((flight, idx) => {
        const lineNum = idx + 1;
        const isSold = booking.flightId === flight.id;
        const isExpanded = expanded === flight.id;

        return (
          <div key={flight.id} style={{
            marginBottom: 0,
            borderBottom: `1px solid ${isSold ? E.greenBorder : E.border}`,
            background: isSold ? E.greenDim : "transparent",
          }}>
            {/* Flight header */}
            <div
              onClick={() => setExpanded(isExpanded ? null : flight.id)}
              style={{
                padding: "12px 16px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 14,
              }}
            >
              <span style={{ color: E.muted, fontSize: 11, fontFamily: mono, minWidth: 16 }}>
                {lineNum}
              </span>
              <div style={{ minWidth: 60 }}>
                <div style={{ color: E.text, fontSize: 13, fontWeight: 600 }}>{flight.flight}</div>
                <div style={{ color: E.muted, fontSize: 10 }}>{flight.airline}</div>
              </div>
              <div style={{ minWidth: 80 }}>
                <div style={{ color: E.text, fontSize: 13 }}>{flight.depTime}</div>
                <div style={{ color: E.muted, fontSize: 10 }}>{flight.dep}</div>
              </div>
              <span style={{ color: E.muted, fontSize: 10 }}>→</span>
              <div style={{ minWidth: 80 }}>
                <div style={{ color: E.text, fontSize: 13 }}>{flight.arrTime}</div>
                <div style={{ color: E.muted, fontSize: 10 }}>{flight.arr}</div>
              </div>
              <div style={{ color: E.muted, fontSize: 11 }}>{flight.duration}</div>
              {flight.stops > 0 && (
                <span style={{
                  padding: "1px 6px", borderRadius: 4, fontSize: 9,
                  background: E.amberDim, color: E.amber, border: `1px solid ${E.amberBorder}`,
                }}>
                  {flight.stops} stop · {flight.stopCities.join(",")}
                </span>
              )}
              {flight.stops === 0 && (
                <span style={{
                  padding: "1px 6px", borderRadius: 4, fontSize: 9,
                  background: E.greenDim, color: E.green, border: `1px solid ${E.greenBorder}`,
                }}>
                  Direct
                </span>
              )}
              <div style={{ flex: 1 }} />
              <span style={{
                padding: "2px 8px", borderRadius: 4, fontSize: 9,
                background: flight.source === "NDC" ? E.accentDim : E.surface,
                color: flight.source === "NDC" ? E.accent : E.muted,
                border: `1px solid ${flight.source === "NDC" ? E.accentBorder : E.border}`,
              }}>
                {flight.source}
              </span>
              {isSold && (
                <span style={{
                  padding: "2px 8px", borderRadius: 4, fontSize: 9, fontWeight: 700,
                  background: E.greenDim, color: E.green, border: `1px solid ${E.greenBorder}`,
                }}>
                  SOLD {booking.fare?.cls}
                </span>
              )}
              <span style={{ color: E.muted, fontSize: 14 }}>{isExpanded ? "▾" : "▸"}</span>
            </div>

            {/* Expanded: fare tiers */}
            {isExpanded && (
              <div style={{ padding: "0 16px 12px", borderTop: `1px solid ${E.border}` }}>
                {/* Inventory row */}
                <div style={{
                  padding: "8px 0", display: "flex", gap: 8, flexWrap: "wrap",
                  borderBottom: `1px solid ${E.border}`, marginBottom: 8,
                }}>
                  {Object.entries(flight.inventory).map(([cls, n]) => (
                    <span key={cls} style={{
                      fontSize: 10, fontFamily: mono,
                      color: n > 0 ? E.text : E.muted,
                      opacity: n > 0 ? 1 : 0.4,
                    }}>
                      {cls}{n}
                    </span>
                  ))}
                </div>

                {/* Fare rows */}
                {flight.fares.map((fare, fi) => {
                  const isFareSold = isSold && booking.fare?.cls === fare.cls;
                  return (
                    <div key={fi}
                      onClick={() => !isSold && handleSell(flight, fare, lineNum)}
                      style={{
                        padding: "10px 14px", marginBottom: 0, cursor: isSold ? "default" : "pointer",
                        borderBottom: `1px solid ${isFareSold ? E.greenBorder : E.border}`,
                        background: isFareSold ? E.greenDim : "transparent",
                        display: "flex", alignItems: "center", gap: 14,
                        opacity: isSold && !isFareSold ? 0.4 : 1,
                      }}
                    >
                      <span style={{
                        fontFamily: mono, fontSize: 14, fontWeight: 700,
                        color: isFareSold ? E.green : E.accent, minWidth: 20,
                      }}>
                        {fare.cls}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: E.text, fontSize: 12, fontWeight: 500 }}>{fare.name}</div>
                        <div style={{ color: E.muted, fontSize: 10 }}>
                          {fare.basis} · {fare.bags} · {fare.changes}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: E.text, fontSize: 14, fontWeight: 600 }}>
                          USD {fare.price}
                        </div>
                        <div style={{ color: E.muted, fontSize: 9, fontFamily: mono }}>
                          SS1{fare.cls}{lineNum} →
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
