import { E, eSans, mono } from "../../tokens";
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

  // Compute PRINT status inline (avoid calling store method in selector)
  const hasPhone = contact?.phone !== null;
  const hasReceived = ticketing?.receivedFrom !== null;
  const hasItinerary = booking?.segment !== null;
  const hasName = passengers?.length > 0;
  const hasTTL = ticketing?.ttlDate !== null;
  const printStatus = { P: hasPhone, R: hasReceived, I: hasItinerary, N: hasName, T: hasTTL };
  const allPrint = hasPhone && hasReceived && hasItinerary && hasName && hasTTL;

  const softLocator = useBookingStore(s => s.pnr?.softLocator);
  const locator = useBookingStore(s => s.pnr?.locator);

  const handleER = () => {
    store.endRetrieve("ui");
  };

  const handleET = () => {
    store.endTransaction("ui");
  };

  const handleIgnore = () => {
    store.resetBooking("ui");
  };

  // Null guard (BUG 6)
  if (!booking?.segment) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: eSans }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: E.muted, fontSize: 14, marginBottom: 16 }}>No booking data available.</p>
          <button onClick={handleIgnore} style={{
            padding: "10px 20px", background: E.accent, color: "#fff",
            border: "none", borderRadius: 2, fontSize: 13, cursor: "pointer", fontFamily: eSans,
          }}>
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const printItems = [
    { key: "P", label: "Phone", ok: printStatus.P },
    { key: "R", label: "Received From", ok: printStatus.R },
    { key: "I", label: "Itinerary", ok: printStatus.I },
    { key: "N", label: "Name", ok: printStatus.N },
    { key: "T", label: "Ticketing", ok: printStatus.T },
  ];

  return (
    <div style={{ height: "100%", overflow: "auto", padding: "20px 24px", fontFamily: eSans }}>
      <h3 style={{ color: E.text, fontSize: 18, fontWeight: 400, marginBottom: 4, fontFamily: "Georgia,serif" }}>
        Review Booking
      </h3>
      <p style={{ color: E.muted, fontSize: 12, marginBottom: 20 }}>
        Verify all details before ending the transaction.
      </p>

      {/* PRINT checklist */}
      <div style={{
        display: "flex", gap: 8, marginBottom: 20, padding: "12px 16px",
        borderBottom: `1px solid ${E.border}`,
      }}>
        {printItems.map(item => (
          <div key={item.key} style={{
            flex: 1, textAlign: "center", padding: "6px 0",
            borderRadius: 4,
            background: item.ok ? E.greenDim : E.redDim,
            border: `1px solid ${item.ok ? E.greenBorder : E.redBorder}`,
          }}>
            <div style={{
              fontSize: 18, fontWeight: 700, fontFamily: mono,
              color: item.ok ? E.green : E.red,
            }}>
              {item.key}
            </div>
            <div style={{ fontSize: 9, color: item.ok ? E.green : E.red, marginTop: 2 }}>
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
      {softLocator && (
        <div style={{ padding: "8px 0", marginTop: 16, color: E.muted, fontSize: 11, fontFamily: mono }}>
          Draft PNR: {softLocator}
        </div>
      )}
      <div style={{ display: "flex", gap: 12, marginTop: softLocator ? 8 : 24 }}>
        <button onClick={handleIgnore} style={{
          padding: "12px", background: "transparent",
          color: E.red, border: `1px solid ${E.redBorder}`, borderRadius: 2,
          fontSize: 13, cursor: "pointer", fontFamily: eSans,
        }}>
          Ignore (I)
        </button>
        <button onClick={handleET} disabled={!allPrint} style={{
          flex: 1, padding: "12px", borderRadius: 2, fontSize: 13,
          cursor: allPrint ? "pointer" : "not-allowed", fontFamily: eSans,
          background: "transparent",
          color: allPrint ? E.accent : E.muted,
          border: `1px solid ${allPrint ? E.accentBorder : E.border}`,
        }}>
          End Transaction (ET)
        </button>
        <button onClick={handleER} disabled={!allPrint} style={{
          flex: 1, padding: "12px", borderRadius: 2, fontSize: 14, fontWeight: 700,
          cursor: allPrint ? "pointer" : "not-allowed", fontFamily: eSans,
          background: allPrint ? E.green : E.surface,
          color: allPrint ? "#fff" : E.muted,
          border: allPrint ? "none" : `1px solid ${E.border}`,
        }}>
          End & Retrieve (ER)
        </button>
      </div>
      <p style={{ color: E.muted, fontSize: 10, marginTop: 8, fontStyle: "italic" }}>
        ER brings PNR back to workspace. ET saves and closes — retrieve later with the locator.
      </p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        color: E.muted, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
        marginBottom: 6, paddingBottom: 4, borderBottom: `1px solid ${E.border}`,
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
      <span style={{ color: E.accent, minWidth: 80, fontFamily: mono, fontSize: 11 }}>{label}</span>
      <span style={{ color: E.text }}>{value}</span>
    </div>
  );
}
