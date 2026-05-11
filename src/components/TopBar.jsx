import { C, sans } from "../tokens";
import { useBookingStore } from "../store/bookingStore";

const STAGE_LABELS = {
  IDLE: "Ready",
  SEARCHING: "Searching...",
  AVAILABILITY: "Availability",
  SELLING: "Selling...",
  PASSENGER_ENTRY: "Passenger Entry",
  CONTACT_ENTRY: "Contact Entry",
  SSR_ENTRY: "Services",
  SEAT_SELECTION: "Seat Selection",
  TICKETING: "Ticketing",
  REVIEW: "Review",
  CONFIRMED: "Confirmed",
  SERVICING: "Servicing",
};

export function TopBar() {
  const stage = useBookingStore(s => s.stage);
  const locator = useBookingStore(s => s.pnr.locator || s.servicing.activeLocator);

  return (
    <div style={{
      height: 36, background: "rgba(0,0,0,0.4)", borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", padding: "0 16px", gap: 12,
      fontFamily: sans, fontSize: 11, flexShrink: 0,
    }}>
      <span style={{ color: C.accent, fontWeight: 700, letterSpacing: "0.08em" }}>
        CY MOSAIC
      </span>
      <span style={{ color: C.muted }}>V2</span>
      <div style={{ flex: 1 }} />
      <span style={{
        color: stage === "IDLE" ? C.muted : C.accent,
        fontWeight: 500, letterSpacing: "0.05em",
      }}>
        {STAGE_LABELS[stage] || stage}
      </span>
      {locator && (
        <span style={{
          background: C.accentDim, border: `1px solid ${C.accentBorder}`,
          borderRadius: 4, padding: "2px 8px", color: C.accent,
          fontWeight: 600, fontSize: 10, letterSpacing: "0.1em",
        }}>
          {locator}
        </span>
      )}
      <span style={{ color: C.muted, fontSize: 10 }}>AGENT: ADITYA.S</span>
    </div>
  );
}
