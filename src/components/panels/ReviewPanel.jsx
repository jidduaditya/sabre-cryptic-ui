import { C, sans, mono } from "../../tokens";
import { useBookingStore } from "../../store/bookingStore";

export function ReviewPanel() {
  const store = useBookingStore();
  const booking = useBookingStore(s => s.booking);
  const passengers = useBookingStore(s => s.passengers);
  const contact = useBookingStore(s => s.contact);
  const ssrs = useBookingStore(s => s.ssrs);
  const seats = useBookingStore(s => s.seats);
  const ticketing = useBookingStore(s => s.ticketing);
  const ffNumbers = useBookingStore(s => s.ffNumbers);
  const printStatus = useBookingStore(s => s.getPrintStatus());

  const allPrint = printStatus.P && printStatus.R && printStatus.I && printStatus.N && printStatus.T;

  const handleER = () => {
    store.endRetrieve("ui");
  };

  const handleIgnore = () => {
    store.resetBooking("ui");
  };

  const printItems = [
    { key: "P", label: "Phone", ok: printStatus.P },
    { key: "R", label: "Received From", ok: printStatus.R },
    { key: "I", label: "Itinerary", ok: printStatus.I },
    { key: "N", label: "Name", ok: printStatus.N },
    { key: "T", label: "Ticketing", ok: printStatus.T },
  ];

  return (
    <div style={{ height: "100%", overflow: "auto", padding: "20px 24px", fontFamily: sans }}>
      <h3 style={{ color: C.text, fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
        Review Booking
      </h3>
      <p style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>
        Verify all details before ending the transaction.
      </p>

      {/* PRINT checklist */}
      <div style={{
        display: "flex", gap: 8, marginBottom: 20, padding: "12px 16px",
        borderRadius: 8, background: C.surface, border: `1px solid ${C.border}`,
      }}>
        {printItems.map(item => (
          <div key={item.key} style={{
            flex: 1, textAlign: "center", padding: "6px 0",
            borderRadius: 4,
            background: item.ok ? C.greenDim : C.redDim,
            border: `1px solid ${item.ok ? C.greenBorder : C.redBorder}`,
          }}>
            <div style={{
              fontSize: 18, fontWeight: 700, fontFamily: mono,
              color: item.ok ? C.green : C.red,
            }}>
              {item.key}
            </div>
            <div style={{ fontSize: 9, color: item.ok ? C.green : C.red, marginTop: 2 }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Flight */}
      {booking.segment && (
        <Section title="FLIGHT">
          <Row label={booking.segment.flight} value={`${booking.fare?.cls} class · ${booking.segment.date} · ${booking.segment.route}`} />
          <Row label="Fare" value={`USD ${booking.fare?.price || 0} · ${booking.fare?.basis || ""}`} />
        </Section>
      )}

      {/* Passengers */}
      <Section title="PASSENGERS">
        {passengers.map(p => (
          <Row key={p.id} label={p.id} value={`${p.lastName}/${p.firstName} ${p.title} (${p.paxType})`} />
        ))}
      </Section>

      {/* Contact */}
      <Section title="CONTACT">
        {contact.phone && <Row label="Phone" value={`${contact.phone.city} ${contact.phone.number}-${contact.phone.type}`} />}
        {contact.email && <Row label="Email" value={contact.email} />}
      </Section>

      {/* SSRs */}
      {ssrs.length > 0 && (
        <Section title="SERVICES">
          {ssrs.map((s, i) => (
            <Row key={i} label={s.code} value={`Seg ${s.segment} · Pax ${s.pax}`} />
          ))}
        </Section>
      )}

      {/* Seats */}
      {seats.length > 0 && (
        <Section title="SEATS">
          {seats.map((s, i) => (
            <Row key={i} label={`Seat ${s.seat}`} value={`Seg ${s.segment} · Pax ${s.pax}`} />
          ))}
        </Section>
      )}

      {/* Ticketing */}
      <Section title="TICKETING">
        {ticketing.ttlDate && <Row label="TTL" value={ticketing.ttlDate} />}
        {ticketing.receivedFrom && <Row label="Received" value={ticketing.receivedFrom} />}
      </Section>

      {/* FF */}
      {ffNumbers.length > 0 && (
        <Section title="FREQUENT FLYER">
          {ffNumbers.map((ff, i) => (
            <Row key={i} label={ff.carrier} value={`${ff.number} · ${ff.pax}`} />
          ))}
        </Section>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <button onClick={handleIgnore} style={{
          flex: 1, padding: "12px", background: "transparent",
          color: C.red, border: `1px solid ${C.redBorder}`, borderRadius: 6,
          fontSize: 13, cursor: "pointer", fontFamily: sans,
        }}>
          Ignore (I)
        </button>
        <button onClick={handleER} disabled={!allPrint} style={{
          flex: 2, padding: "12px", borderRadius: 6, fontSize: 14, fontWeight: 700,
          cursor: allPrint ? "pointer" : "not-allowed", fontFamily: sans,
          background: allPrint ? C.green : C.surface,
          color: allPrint ? "#fff" : C.muted,
          border: allPrint ? "none" : `1px solid ${C.border}`,
        }}>
          End & Retrieve (ER)
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        color: C.muted, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
        marginBottom: 6, paddingBottom: 4, borderBottom: `1px solid ${C.border}`,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", padding: "4px 0", fontSize: 12 }}>
      <span style={{ color: C.accent, minWidth: 80, fontFamily: mono, fontSize: 11 }}>{label}</span>
      <span style={{ color: C.text }}>{value}</span>
    </div>
  );
}
