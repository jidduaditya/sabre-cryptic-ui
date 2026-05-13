import { useState } from "react";
import { E, eSans, mono } from "../../tokens";
import { useBookingStore } from "../../store/bookingStore";

export function TicketingPanel() {
  const ticketing = useBookingStore(s => s.ticketing);
  const ffNumbers = useBookingStore(s => s.ffNumbers);
  const booking = useBookingStore(s => s.booking);
  const store = useBookingStore();

  const [ttlDate, setTtlDate] = useState("");
  const [receivedFrom, setReceivedFrom] = useState("");
  const [ffCarrier, setFfCarrier] = useState(booking?.flight?.code || "AA");
  const [ffNumber, setFfNumber] = useState("");

  const handleTTL = () => {
    if (!ttlDate.trim()) return;
    store.setTTL(ttlDate.trim().toUpperCase(), "ui");
  };

  const handleReceived = () => {
    if (!receivedFrom.trim()) return;
    store.setReceivedFrom(receivedFrom.trim().toUpperCase(), "ui");
  };

  const handleFF = () => {
    if (!ffNumber.trim()) return;
    store.addFF(ffCarrier.toUpperCase(), ffNumber.trim(), "1.1", "ui");
    setFfNumber("");
  };

  const handleReview = () => {
    store.advanceToReview("ui");
  };

  const passengers = useBookingStore(s => s.passengers);
  const canReview = ticketing.ttlDate && ticketing.receivedFrom && booking?.segment !== null && passengers.length > 0;

  const inputStyle = {
    background: E.surface, border: `1px solid ${E.border}`, borderRadius: 2,
    padding: "10px 14px", color: E.text, fontSize: 14, fontFamily: eSans,
    outline: "none", width: "100%",
  };

  return (
    <div style={{ height: "100%", overflow: "auto", padding: "20px 24px", fontFamily: eSans }}>
      <h3 style={{ color: E.text, fontSize: 18, fontWeight: 400, marginBottom: 4, fontFamily: "Georgia,serif" }}>
        Ticketing & Final Details
      </h3>
      <p style={{ color: E.muted, fontSize: 12, marginBottom: 24 }}>
        Set ticket time limit and received-from (both required for PRINT).
      </p>

      {/* TTL */}
      <div style={{
        padding: 16, marginBottom: 12,
        borderBottom: `1px solid ${ticketing.ttlDate ? E.greenBorder : E.border}`,
        background: ticketing.ttlDate ? E.greenDim : "transparent",
      }}>
        <label style={{ color: E.muted, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 10, display: "block" }}>
          TICKET TIME LIMIT {ticketing.ttlDate && "✓"}
        </label>
        {ticketing.ttlDate ? (
          <div style={{ color: E.green, fontSize: 13 }}>TAW {ticketing.ttlDate}</div>
        ) : (
          <div style={{ display: "flex", gap: 12 }}>
            <input value={ttlDate} onChange={e => setTtlDate(e.target.value.toUpperCase())}
              style={{ ...inputStyle, flex: 1 }} placeholder="14JUN" maxLength={5} />
            <button onClick={handleTTL} style={{
              padding: "8px 16px", background: E.accent, color: "#fff",
              border: "none", borderRadius: 2, fontSize: 12, fontWeight: 600,
              cursor: "pointer",
            }}>
              Set
            </button>
          </div>
        )}
      </div>

      {/* Received From */}
      <div style={{
        padding: 16, marginBottom: 12,
        borderBottom: `1px solid ${ticketing.receivedFrom ? E.greenBorder : E.border}`,
        background: ticketing.receivedFrom ? E.greenDim : "transparent",
      }}>
        <label style={{ color: E.muted, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 10, display: "block" }}>
          RECEIVED FROM {ticketing.receivedFrom && "✓"}
        </label>
        {ticketing.receivedFrom ? (
          <div style={{ color: E.green, fontSize: 13 }}>{ticketing.receivedFrom}</div>
        ) : (
          <div style={{ display: "flex", gap: 12 }}>
            <input value={receivedFrom} onChange={e => setReceivedFrom(e.target.value)}
              onBlur={handleReceived}
              style={{ ...inputStyle, flex: 1 }} placeholder="RAJESH" />
            <button onClick={handleReceived} style={{
              padding: "8px 16px", background: E.accent, color: "#fff",
              border: "none", borderRadius: 2, fontSize: 12, fontWeight: 600,
              cursor: "pointer",
            }}>
              Set
            </button>
          </div>
        )}
      </div>

      {/* FF Number (optional) */}
      <div style={{
        padding: 16, marginBottom: 16,
        borderBottom: `1px solid ${ffNumbers.length > 0 ? E.greenBorder : E.border}`,
        background: ffNumbers.length > 0 ? E.greenDim : "transparent",
      }}>
        <label style={{ color: E.muted, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 10, display: "block" }}>
          FREQUENT FLYER (OPTIONAL) {ffNumbers.length > 0 && "✓"}
        </label>
        {ffNumbers.map((ff, i) => (
          <div key={i} style={{ color: E.green, fontSize: 12, marginBottom: 4 }}>
            {ff.carrier} {ff.number} — {ff.pax}
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: ffNumbers.length > 0 ? 8 : 0 }}>
          <input value={ffCarrier} onChange={e => setFfCarrier(e.target.value.toUpperCase())}
            style={{ ...inputStyle, width: 60 }} placeholder="AA" maxLength={2} />
          <input value={ffNumber} onChange={e => setFfNumber(e.target.value)}
            style={{ ...inputStyle, flex: 1 }} placeholder="123456" />
          <button onClick={handleFF} style={{
            padding: "8px 12px", background: "transparent", color: E.accent,
            border: `1px solid ${E.accentBorder}`, borderRadius: 2,
            fontSize: 12, cursor: "pointer",
          }}>
            Add
          </button>
        </div>
      </div>

      <button onClick={handleReview} disabled={!canReview} style={{
        width: "100%", padding: "12px", borderRadius: 2, fontSize: 14, fontWeight: 600,
        cursor: canReview ? "pointer" : "not-allowed", fontFamily: eSans,
        background: canReview ? E.accent : E.surface,
        color: canReview ? "#fff" : E.muted,
        border: canReview ? "none" : `1px solid ${E.border}`,
      }}>
        Review Booking →
      </button>
    </div>
  );
}
