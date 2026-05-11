import { useState } from "react";
import { C, sans, mono } from "../../tokens";
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

  const canReview = ticketing.ttlDate && ticketing.receivedFrom;

  const inputStyle = {
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6,
    padding: "10px 14px", color: C.text, fontSize: 14, fontFamily: sans,
    outline: "none", width: "100%",
  };

  return (
    <div style={{ height: "100%", overflow: "auto", padding: "20px 24px", fontFamily: sans }}>
      <h3 style={{ color: C.text, fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
        Ticketing & Final Details
      </h3>
      <p style={{ color: C.muted, fontSize: 12, marginBottom: 24 }}>
        Set ticket time limit and received-from (both required for PRINT).
      </p>

      {/* TTL */}
      <div style={{
        padding: 16, marginBottom: 12, borderRadius: 8,
        border: `1px solid ${ticketing.ttlDate ? C.greenBorder : C.border}`,
        background: ticketing.ttlDate ? C.greenDim : "rgba(255,255,255,0.02)",
      }}>
        <label style={{ color: C.muted, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 10, display: "block" }}>
          TICKET TIME LIMIT {ticketing.ttlDate && "✓"}
        </label>
        {ticketing.ttlDate ? (
          <div style={{ color: C.green, fontSize: 13 }}>TAW {ticketing.ttlDate}</div>
        ) : (
          <div style={{ display: "flex", gap: 12 }}>
            <input value={ttlDate} onChange={e => setTtlDate(e.target.value.toUpperCase())}
              style={{ ...inputStyle, flex: 1 }} placeholder="14JUN" maxLength={5} />
            <button onClick={handleTTL} style={{
              padding: "8px 16px", background: C.accent, color: "#fff",
              border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600,
              cursor: "pointer",
            }}>
              Set
            </button>
          </div>
        )}
      </div>

      {/* Received From */}
      <div style={{
        padding: 16, marginBottom: 12, borderRadius: 8,
        border: `1px solid ${ticketing.receivedFrom ? C.greenBorder : C.border}`,
        background: ticketing.receivedFrom ? C.greenDim : "rgba(255,255,255,0.02)",
      }}>
        <label style={{ color: C.muted, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 10, display: "block" }}>
          RECEIVED FROM {ticketing.receivedFrom && "✓"}
        </label>
        {ticketing.receivedFrom ? (
          <div style={{ color: C.green, fontSize: 13 }}>{ticketing.receivedFrom}</div>
        ) : (
          <div style={{ display: "flex", gap: 12 }}>
            <input value={receivedFrom} onChange={e => setReceivedFrom(e.target.value)}
              onBlur={handleReceived}
              style={{ ...inputStyle, flex: 1 }} placeholder="RAJESH" />
            <button onClick={handleReceived} style={{
              padding: "8px 16px", background: C.accent, color: "#fff",
              border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600,
              cursor: "pointer",
            }}>
              Set
            </button>
          </div>
        )}
      </div>

      {/* FF Number (optional) */}
      <div style={{
        padding: 16, marginBottom: 16, borderRadius: 8,
        border: `1px solid ${ffNumbers.length > 0 ? C.greenBorder : C.border}`,
        background: ffNumbers.length > 0 ? C.greenDim : "rgba(255,255,255,0.02)",
      }}>
        <label style={{ color: C.muted, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 10, display: "block" }}>
          FREQUENT FLYER (OPTIONAL) {ffNumbers.length > 0 && "✓"}
        </label>
        {ffNumbers.map((ff, i) => (
          <div key={i} style={{ color: C.green, fontSize: 12, marginBottom: 4 }}>
            {ff.carrier} {ff.number} — {ff.pax}
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: ffNumbers.length > 0 ? 8 : 0 }}>
          <input value={ffCarrier} onChange={e => setFfCarrier(e.target.value.toUpperCase())}
            style={{ ...inputStyle, width: 60 }} placeholder="AA" maxLength={2} />
          <input value={ffNumber} onChange={e => setFfNumber(e.target.value)}
            style={{ ...inputStyle, flex: 1 }} placeholder="123456" />
          <button onClick={handleFF} style={{
            padding: "8px 12px", background: C.surface, color: C.accent,
            border: `1px solid ${C.accentBorder}`, borderRadius: 6,
            fontSize: 12, cursor: "pointer",
          }}>
            Add
          </button>
        </div>
      </div>

      <button onClick={handleReview} disabled={!canReview} style={{
        width: "100%", padding: "12px", borderRadius: 6, fontSize: 14, fontWeight: 600,
        cursor: canReview ? "pointer" : "not-allowed", fontFamily: sans,
        background: canReview ? C.accent : C.surface,
        color: canReview ? "#fff" : C.muted,
        border: canReview ? "none" : `1px solid ${C.border}`,
      }}>
        Review Booking →
      </button>
    </div>
  );
}
