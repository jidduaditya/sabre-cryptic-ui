import { useState } from "react";
import { C, sans, mono } from "../../tokens";
import { useBookingStore } from "../../store/bookingStore";
import { SEATMAP } from "../../data/seatmap";

const MEALS = [
  { code: "VGML", name: "Vegetarian" }, { code: "MOML", name: "Muslim" },
  { code: "KSML", name: "Kosher" }, { code: "HSML", name: "Hindu" },
  { code: "AVML", name: "Asian Veg" },
];

const TABS = ["Overview", "Seats", "Services", "Pricing", "Queue"];

export function ServicingPanel() {
  const servicing = useBookingStore(s => s.servicing);
  const store = useBookingStore();
  const [tab, setTab] = useState("Overview");

  const pnr = servicing.pnrData;
  if (!pnr) {
    return (
      <div style={{ padding: 40, textAlign: "center", fontFamily: sans, color: C.muted }}>
        No PNR in work area. Retrieve a PNR to begin servicing.
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: sans }}>
      {/* PNR header */}
      <div style={{
        padding: "12px 20px", borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <span style={{ color: C.accent, fontWeight: 700, fontFamily: mono, fontSize: 16 }}>
          {pnr.locator}
        </span>
        <span style={{
          padding: "2px 8px", borderRadius: 4, fontSize: 10,
          background: C.greenDim, color: C.green, border: `1px solid ${C.greenBorder}`,
        }}>
          {pnr.status}
        </span>
        <div style={{ flex: 1 }} />
        {pnr.passengers?.map((p, i) => (
          <span key={i} style={{ color: C.sub, fontSize: 12 }}>{p.name}</span>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", borderBottom: `1px solid ${C.border}`, padding: "0 20px",
      }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "10px 16px", background: "none", border: "none",
            borderBottom: tab === t ? `2px solid ${C.accent}` : "2px solid transparent",
            color: tab === t ? C.accent : C.muted, fontSize: 12, fontWeight: 500,
            cursor: "pointer", fontFamily: sans,
          }}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: "auto", padding: "16px 20px" }}>
        {tab === "Overview" && <OverviewTab pnr={pnr} />}
        {tab === "Seats" && <SeatsTab pnr={pnr} store={store} />}
        {tab === "Services" && <ServicesTab pnr={pnr} store={store} />}
        {tab === "Pricing" && <PricingTab pnr={pnr} store={store} />}
        {tab === "Queue" && <QueueTab pnr={pnr} store={store} />}
      </div>
    </div>
  );
}

function OverviewTab({ pnr }) {
  return (
    <div>
      {/* Segments */}
      <SectionLabel text="ITINERARY" />
      {pnr.segments?.map(seg => (
        <div key={seg.seg} style={{
          padding: "10px 14px", marginBottom: 6, borderRadius: 6,
          background: C.surface, border: `1px solid ${C.border}`,
          display: "flex", gap: 14, alignItems: "center",
        }}>
          <span style={{ color: C.muted, fontFamily: mono, fontSize: 11 }}>{seg.seg}</span>
          <span style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{seg.flight}</span>
          <span style={{ color: C.accent, fontFamily: mono }}>{seg.cls}</span>
          <span style={{ color: C.sub, fontSize: 12 }}>{seg.date}</span>
          <span style={{ color: C.sub, fontSize: 12 }}>{seg.route}</span>
          <span style={{
            padding: "1px 6px", borderRadius: 3, fontSize: 10,
            background: C.greenDim, color: C.green, border: `1px solid ${C.greenBorder}`,
          }}>{seg.status}</span>
          <span style={{ color: C.muted, fontSize: 11 }}>{seg.depTime}-{seg.arrTime}</span>
        </div>
      ))}

      {/* Passengers */}
      <SectionLabel text="PASSENGERS" />
      {pnr.passengers?.map((p, i) => (
        <div key={i} style={{ padding: "4px 0", fontSize: 12, display: "flex", gap: 8 }}>
          <span style={{ color: C.accent, fontFamily: mono }}>{p.id}</span>
          <span style={{ color: C.text }}>{p.name}</span>
          <span style={{ color: C.muted }}>({p.type})</span>
        </div>
      ))}

      {/* Contact */}
      <SectionLabel text="CONTACT" />
      {pnr.phone?.map((ph, i) => (
        <div key={i} style={{ color: C.sub, fontSize: 12, padding: "2px 0" }}>{ph.detail}</div>
      ))}
      {pnr.email && <div style={{ color: C.sub, fontSize: 12, padding: "2px 0" }}>EMAIL: {pnr.email}</div>}

      {/* Ticketing */}
      {pnr.ticketing && (
        <>
          <SectionLabel text="TICKETING" />
          <div style={{ color: C.sub, fontSize: 12 }}>{pnr.ticketing.detail}</div>
        </>
      )}

      {/* Services */}
      {pnr.services?.length > 0 && (
        <>
          <SectionLabel text="SERVICES" />
          {pnr.services.map((svc, i) => (
            <div key={i} style={{
              display: "flex", gap: 10, padding: "6px 0", fontSize: 12, alignItems: "center",
            }}>
              <span>{svc.icon}</span>
              <span style={{ color: C.text, fontWeight: 500 }}>{svc.type}</span>
              <span style={{ color: C.sub }}>{svc.detail}</span>
              <span style={{
                marginLeft: "auto", fontSize: 10, color: C.green,
                padding: "1px 6px", borderRadius: 3,
                background: C.greenDim, border: `1px solid ${C.greenBorder}`,
              }}>
                {svc.status}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function SeatsTab({ pnr, store }) {
  const handleSeat = (seat) => {
    const pax = pnr.passengers?.[0]?.id || "1.1";
    store.assignSeat(seat, 1, pax, "ui");
  };

  return (
    <div>
      <SectionLabel text="CURRENT SEATS" />
      {pnr.seats?.map((s, i) => (
        <div key={i} style={{
          padding: "8px 12px", marginBottom: 6, borderRadius: 6,
          background: C.accentDim, border: `1px solid ${C.accentBorder}`,
          fontSize: 12, display: "flex", gap: 8,
        }}>
          <span style={{ color: C.accent, fontWeight: 600 }}>Seat {s.seat}</span>
          <span style={{ color: C.sub }}>Seg {s.seg} · Pax {s.pax}</span>
        </div>
      ))}

      <SectionLabel text="CHANGE SEAT" />
      <p style={{ color: C.muted, fontSize: 11, marginBottom: 12 }}>
        Click an available seat below or type 4G command in terminal.
      </p>

      {/* Mini seat map */}
      {SEATMAP.cabins.map(cabin => (
        <div key={cabin.name} style={{ marginBottom: 16 }}>
          <div style={{ color: C.muted, fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 6 }}>
            {cabin.name.toUpperCase()} ({cabin.config})
          </div>
          <div style={{ display: "flex", gap: 2, marginBottom: 4, paddingLeft: 24 }}>
            {cabin.seats.map(s => (
              <div key={s} style={{
                width: 20, textAlign: "center", fontSize: 8, color: C.muted, fontFamily: mono,
                marginRight: cabin.aisles.some(([a]) => s === a) ? 8 : 0,
              }}>
                {s}
              </div>
            ))}
          </div>
          {Array.from({ length: Math.min(cabin.rows[1] - cabin.rows[0] + 1, 10) }, (_, i) => {
            const row = cabin.rows[0] + i;
            return (
              <div key={row} style={{ display: "flex", gap: 2, marginBottom: 1, alignItems: "center" }}>
                <span style={{ width: 20, textAlign: "right", fontSize: 8, color: C.muted, fontFamily: mono, paddingRight: 4 }}>
                  {row}
                </span>
                {cabin.seats.map(s => {
                  const key = `${row}${s}`;
                  const isOccupied = cabin.map[key] === "X";
                  const isCurrentSeat = pnr.seats?.some(ps => ps.seat === key);
                  return (
                    <div key={s}
                      onClick={() => !isOccupied && !isCurrentSeat && handleSeat(key)}
                      style={{
                        width: 20, height: 16, borderRadius: 2, fontSize: 7,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: isOccupied || isCurrentSeat ? "default" : "pointer",
                        fontFamily: mono,
                        background: isCurrentSeat ? C.accentDim : isOccupied ? "rgba(255,255,255,0.03)" : C.surface,
                        border: `1px solid ${isCurrentSeat ? C.accentBorder : isOccupied ? "rgba(255,255,255,0.05)" : C.border}`,
                        color: isCurrentSeat ? C.accent : isOccupied ? "rgba(255,255,255,0.12)" : C.sub,
                        marginRight: cabin.aisles.some(([a]) => s === a) ? 8 : 0,
                      }}
                    >
                      {isCurrentSeat ? "●" : isOccupied ? "×" : ""}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function ServicesTab({ pnr, store }) {
  const handleMeal = (code) => {
    const pax = pnr.passengers?.[0]?.id || "1.1";
    store.addSSR(code, 1, pax, "ui");
  };

  return (
    <div>
      <SectionLabel text="CURRENT SSRS" />
      {pnr.ssrs?.map((s, i) => (
        <div key={i} style={{ padding: "4px 0", fontSize: 12, color: C.sub }}>
          {s.code} · {s.airline} · {s.status} · {s.detail}
        </div>
      ))}

      <SectionLabel text="ADD MEAL" />
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {MEALS.map(m => (
          <button key={m.code} onClick={() => handleMeal(m.code)} style={{
            padding: "6px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer",
            background: "transparent", border: `1px solid ${C.border}`, color: C.text, fontFamily: sans,
          }}>
            {m.code}
          </button>
        ))}
      </div>
    </div>
  );
}

function PricingTab({ pnr, store }) {
  const handlePrice = () => {
    store.priceItinerary("ui");
  };

  return (
    <div>
      <SectionLabel text="FARE" />
      {pnr.fare && (
        <div style={{
          padding: 16, borderRadius: 8, background: C.surface, border: `1px solid ${C.border}`,
          marginBottom: 16,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: C.muted, fontSize: 12 }}>Base Fare</span>
            <span style={{ color: C.text, fontSize: 12 }}>{pnr.fare.currency} {pnr.fare.base}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: C.muted, fontSize: 12 }}>Taxes</span>
            <span style={{ color: C.text, fontSize: 12 }}>{pnr.fare.currency} {pnr.fare.taxes}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
            <span style={{ color: C.text, fontSize: 14, fontWeight: 600 }}>Total</span>
            <span style={{ color: C.accent, fontSize: 14, fontWeight: 700 }}>{pnr.fare.currency} {pnr.fare.total}</span>
          </div>
        </div>
      )}

      <button onClick={handlePrice} style={{
        width: "100%", padding: "10px", background: C.surface, color: C.accent,
        border: `1px solid ${C.accentBorder}`, borderRadius: 6,
        fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: sans,
      }}>
        Re-Price (WP)
      </button>
    </div>
  );
}

function QueueTab({ pnr, store }) {
  const queues = [
    { q: 1, label: "Ticketing" },
    { q: 9, label: "General" },
    { q: 25, label: "Invoices" },
    { q: 60, label: "Personal" },
  ];

  const handleQueue = (q) => {
    store.queuePlace(q, "ui");
  };

  return (
    <div>
      <SectionLabel text="QUEUE PLACEMENT" />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {queues.map(q => (
          <button key={q.q} onClick={() => handleQueue(q.q)} style={{
            padding: "10px 16px", borderRadius: 6, cursor: "pointer",
            background: C.surface, border: `1px solid ${C.border}`,
            color: C.text, fontFamily: sans, fontSize: 12,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          }}>
            <span style={{ fontFamily: mono, fontWeight: 600, color: C.accent }}>Q{q.q}</span>
            <span style={{ color: C.muted, fontSize: 10 }}>{q.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionLabel({ text }) {
  return (
    <div style={{
      color: C.muted, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
      margin: "16px 0 8px", paddingBottom: 4, borderBottom: `1px solid ${C.border}`,
    }}>
      {text}
    </div>
  );
}
