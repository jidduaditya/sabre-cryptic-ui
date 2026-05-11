import { C, sans, mono } from "../../tokens";
import { useBookingStore } from "../../store/bookingStore";

export function ConfirmedPanel() {
  const pnr = useBookingStore(s => s.pnr);
  const booking = useBookingStore(s => s.booking);
  const passengers = useBookingStore(s => s.passengers);
  const contact = useBookingStore(s => s.contact);
  const ssrs = useBookingStore(s => s.ssrs);
  const seats = useBookingStore(s => s.seats);
  const ticketing = useBookingStore(s => s.ticketing);
  const store = useBookingStore();

  const handleRetrieve = () => {
    if (pnr.locator) {
      store.retrievePNR(pnr.locator, "ui");
    }
  };

  const handleNewBooking = () => {
    store.resetBooking("ui");
  };

  return (
    <div style={{
      height: "100%", overflow: "auto", padding: "20px 24px", fontFamily: sans,
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      {/* Success banner */}
      <div style={{
        width: "100%", maxWidth: 480, textAlign: "center", marginTop: 40, marginBottom: 32,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%", margin: "0 auto 16px",
          background: C.greenDim, border: `2px solid ${C.greenBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28,
        }}>
          ✓
        </div>
        <h2 style={{ color: C.text, fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
          PNR Created
        </h2>
        <div style={{
          fontSize: 32, fontWeight: 800, fontFamily: mono, color: C.accent,
          letterSpacing: "0.15em", marginTop: 8,
        }}>
          {pnr.locator}
        </div>
        <div style={{ color: C.green, fontSize: 12, marginTop: 8 }}>
          Status: {pnr.status}
        </div>
      </div>

      {/* PNR summary */}
      <div style={{
        width: "100%", maxWidth: 480, padding: 20, borderRadius: 8,
        background: C.surface, border: `1px solid ${C.border}`,
      }}>
        {/* Segment */}
        {booking.segment && (
          <div style={{
            padding: "10px 0", borderBottom: `1px solid ${C.border}`, marginBottom: 10,
          }}>
            <div style={{ color: C.text, fontSize: 14, fontWeight: 600 }}>
              {booking.segment.flight} · {booking.fare?.cls} class
            </div>
            <div style={{ color: C.muted, fontSize: 12 }}>
              {booking.segment.date} · {booking.segment.route} · {booking.segment.status}
            </div>
          </div>
        )}

        {/* Passengers */}
        {passengers.map(p => (
          <div key={p.id} style={{
            display: "flex", padding: "6px 0", fontSize: 12, gap: 8,
          }}>
            <span style={{ color: C.accent, fontFamily: mono }}>{p.id}</span>
            <span style={{ color: C.text }}>{p.lastName}/{p.firstName} {p.title}</span>
          </div>
        ))}

        {/* Contact, SSRs, Seats, Ticketing */}
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`, fontSize: 11 }}>
          {contact.phone && (
            <div style={{ color: C.sub, padding: "2px 0" }}>
              Phone: {contact.phone.city} {contact.phone.number}-{contact.phone.type}
            </div>
          )}
          {contact.email && (
            <div style={{ color: C.sub, padding: "2px 0" }}>Email: {contact.email}</div>
          )}
          {ssrs.map((s, i) => (
            <div key={i} style={{ color: C.sub, padding: "2px 0" }}>
              SSR: {s.code} Seg{s.segment} Pax{s.pax}
            </div>
          ))}
          {seats.map((s, i) => (
            <div key={i} style={{ color: C.sub, padding: "2px 0" }}>
              Seat: {s.seat} Seg{s.segment} Pax{s.pax}
            </div>
          ))}
          {ticketing.ttlDate && (
            <div style={{ color: C.sub, padding: "2px 0" }}>TTL: {ticketing.ttlDate}</div>
          )}
          {ticketing.receivedFrom && (
            <div style={{ color: C.sub, padding: "2px 0" }}>RF: {ticketing.receivedFrom}</div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, marginTop: 24, width: "100%", maxWidth: 480 }}>
        <button onClick={handleNewBooking} style={{
          flex: 1, padding: "10px", background: "transparent",
          color: C.muted, border: `1px solid ${C.border}`, borderRadius: 6,
          fontSize: 13, cursor: "pointer", fontFamily: sans,
        }}>
          New Booking
        </button>
        <button onClick={handleRetrieve} style={{
          flex: 2, padding: "10px", background: C.accent, color: "#fff",
          border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600,
          cursor: "pointer", fontFamily: sans,
        }}>
          Retrieve for Servicing →
        </button>
      </div>
    </div>
  );
}
