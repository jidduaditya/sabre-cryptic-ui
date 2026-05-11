import { useState } from "react";
import { C, sans, mono } from "../../tokens";
import { useBookingStore } from "../../store/bookingStore";

export function AvailPanel() {
  const flights = useBookingStore(s => s.availability.flights);
  const filterAirline = useBookingStore(s => s.availability.filterAirline);
  const booking = useBookingStore(s => s.booking);
  const search = useBookingStore(s => s.search);
  const store = useBookingStore();
  const [expanded, setExpanded] = useState(null);

  const airlines = [...new Set(flights.map(f => f.code))];

  const handleFilter = (code) => {
    store.searchAvailability(search.origin, search.destination, search.date, "ui", code === filterAirline ? null : code);
  };

  const handleSell = (flight, fare, lineNum) => {
    store.sellFare(flight.id, fare.cls, "ui");
  };

  return (
    <div style={{ height: "100%", overflow: "auto", padding: "16px 20px", fontFamily: sans }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <h3 style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: 0 }}>
          {search.origin} → {search.destination}
        </h3>
        <span style={{ color: C.muted, fontSize: 12 }}>{search.date}</span>
        <span style={{ color: C.muted, fontSize: 12 }}>{flights.length} flights</span>
        <div style={{ flex: 1 }} />
        {/* Airline filter chips */}
        {airlines.map(code => (
          <button key={code} onClick={() => handleFilter(code)} style={{
            padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 600,
            cursor: "pointer", border: `1px solid ${code === filterAirline ? C.accentBorder : C.border}`,
            background: code === filterAirline ? C.accentDim : "transparent",
            color: code === filterAirline ? C.accent : C.muted,
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
            marginBottom: 10, borderRadius: 8,
            border: `1px solid ${isSold ? C.greenBorder : C.border}`,
            background: isSold ? C.greenDim : C.surface,
            overflow: "hidden",
          }}>
            {/* Flight header */}
            <div
              onClick={() => setExpanded(isExpanded ? null : flight.id)}
              style={{
                padding: "12px 16px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 14,
              }}
            >
              <span style={{ color: C.muted, fontSize: 11, fontFamily: mono, minWidth: 16 }}>
                {lineNum}
              </span>
              <div style={{ minWidth: 60 }}>
                <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{flight.flight}</div>
                <div style={{ color: C.muted, fontSize: 10 }}>{flight.airline}</div>
              </div>
              <div style={{ minWidth: 80 }}>
                <div style={{ color: C.text, fontSize: 13 }}>{flight.depTime}</div>
                <div style={{ color: C.muted, fontSize: 10 }}>{flight.dep}</div>
              </div>
              <span style={{ color: C.muted, fontSize: 10 }}>→</span>
              <div style={{ minWidth: 80 }}>
                <div style={{ color: C.text, fontSize: 13 }}>{flight.arrTime}</div>
                <div style={{ color: C.muted, fontSize: 10 }}>{flight.arr}</div>
              </div>
              <div style={{ color: C.muted, fontSize: 11 }}>{flight.duration}</div>
              {flight.stops > 0 && (
                <span style={{
                  padding: "1px 6px", borderRadius: 4, fontSize: 9,
                  background: C.amberDim, color: C.amber, border: `1px solid ${C.amberBorder}`,
                }}>
                  {flight.stops} stop · {flight.stopCities.join(",")}
                </span>
              )}
              {flight.stops === 0 && (
                <span style={{
                  padding: "1px 6px", borderRadius: 4, fontSize: 9,
                  background: C.greenDim, color: C.green, border: `1px solid ${C.greenBorder}`,
                }}>
                  Direct
                </span>
              )}
              <div style={{ flex: 1 }} />
              <span style={{
                padding: "2px 8px", borderRadius: 4, fontSize: 9,
                background: flight.source === "NDC" ? C.accentDim : C.surface,
                color: flight.source === "NDC" ? C.accent : C.muted,
                border: `1px solid ${flight.source === "NDC" ? C.accentBorder : C.border}`,
              }}>
                {flight.source}
              </span>
              {isSold && (
                <span style={{
                  padding: "2px 8px", borderRadius: 4, fontSize: 9, fontWeight: 700,
                  background: C.greenDim, color: C.green, border: `1px solid ${C.greenBorder}`,
                }}>
                  SOLD {booking.fare?.cls}
                </span>
              )}
              <span style={{ color: C.muted, fontSize: 14 }}>{isExpanded ? "▾" : "▸"}</span>
            </div>

            {/* Expanded: fare tiers */}
            {isExpanded && (
              <div style={{ padding: "0 16px 12px", borderTop: `1px solid ${C.border}` }}>
                {/* Inventory row */}
                <div style={{
                  padding: "8px 0", display: "flex", gap: 8, flexWrap: "wrap",
                  borderBottom: `1px solid ${C.border}`, marginBottom: 8,
                }}>
                  {Object.entries(flight.inventory).map(([cls, n]) => (
                    <span key={cls} style={{
                      fontSize: 10, fontFamily: mono,
                      color: n > 0 ? C.text : C.muted,
                      opacity: n > 0 ? 1 : 0.4,
                    }}>
                      {cls}{n}
                    </span>
                  ))}
                </div>

                {/* Fare cards */}
                {flight.fares.map((fare, fi) => {
                  const isFareSold = isSold && booking.fare?.cls === fare.cls;
                  return (
                    <div key={fi}
                      onClick={() => !isSold && handleSell(flight, fare, lineNum)}
                      style={{
                        padding: "10px 14px", marginBottom: 6, borderRadius: 6, cursor: isSold ? "default" : "pointer",
                        border: `1px solid ${isFareSold ? C.greenBorder : C.border}`,
                        background: isFareSold ? C.greenDim : "transparent",
                        display: "flex", alignItems: "center", gap: 14,
                        opacity: isSold && !isFareSold ? 0.4 : 1,
                      }}
                    >
                      <span style={{
                        fontFamily: mono, fontSize: 14, fontWeight: 700,
                        color: isFareSold ? C.green : C.accent, minWidth: 20,
                      }}>
                        {fare.cls}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: C.text, fontSize: 12, fontWeight: 500 }}>{fare.name}</div>
                        <div style={{ color: C.muted, fontSize: 10 }}>
                          {fare.basis} · {fare.bags} · {fare.changes}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: C.text, fontSize: 14, fontWeight: 600 }}>
                          USD {fare.price}
                        </div>
                        <div style={{ color: C.muted, fontSize: 9, fontFamily: mono }}>
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
