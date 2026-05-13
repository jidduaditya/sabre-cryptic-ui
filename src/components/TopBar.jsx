import { useState } from "react";
import { C, E, sans } from "../tokens";
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

export function TopBar({ viewMode, onViewModeChange }) {
  const stage = useBookingStore(s => s.stage);
  const locator = useBookingStore(s => s.pnr.locator || s.servicing.activeLocator);
  const softLocator = useBookingStore(s => s.pnr.softLocator);
  const store = useBookingStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleNewSearch = () => {
    if (stage === "CONFIRMED" || stage === "IDLE") {
      store.resetBooking("ui");
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
    }
  };

  const confirmReset = () => {
    store.resetBooking("ui");
    setShowConfirm(false);
  };

  const displayLocator = locator || softLocator;

  return (
    <div style={{
      height: 36, background: "rgba(0,0,0,0.4)", borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", padding: "0 16px", gap: 12,
      fontFamily: sans, fontSize: 11, flexShrink: 0,
    }}>
      <span style={{ color: E.accent, fontWeight: 700, letterSpacing: "0.08em" }}>
        CRYPTIC UI
      </span>
      <span style={{ color: C.muted }}>V2</span>

      {stage !== "IDLE" && !showConfirm && (
        <button data-new-search onClick={handleNewSearch} style={{
          padding: "3px 10px", borderRadius: 12, fontSize: 9, fontWeight: 600,
          background: "transparent", border: `1px solid ${C.border}`,
          color: C.muted, cursor: "pointer", letterSpacing: "0.05em",
        }}>
          NEW SEARCH
        </button>
      )}

      {showConfirm && (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: C.muted, fontSize: 10 }}>Discard booking?</span>
          <button onClick={confirmReset} style={{
            padding: "2px 8px", borderRadius: 4, fontSize: 9,
            background: E.accent, border: "none", color: "#fff", cursor: "pointer",
          }}>
            Yes
          </button>
          <button onClick={() => setShowConfirm(false)} style={{
            padding: "2px 8px", borderRadius: 4, fontSize: 9,
            background: "transparent", border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer",
          }}>
            No
          </button>
        </span>
      )}

      {/* View mode toggle */}
      <div style={{
        display: "flex", borderRadius: 4, overflow: "hidden",
        border: `1px solid ${C.border}`, marginLeft: 4,
      }}>
        {[
          { key: "cryptic", label: "Cryptic" },
          { key: "both", label: "Both" },
          { key: "ui", label: "UI" },
        ].map(opt => (
          <button key={opt.key} onClick={() => onViewModeChange(opt.key)} style={{
            padding: "2px 10px", fontSize: 9, fontWeight: 600, cursor: "pointer",
            border: "none", letterSpacing: "0.04em",
            background: viewMode === opt.key ? E.accent : "transparent",
            color: viewMode === opt.key ? "#fff" : C.muted,
          }}>
            {opt.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }} />
      <span style={{
        color: stage === "IDLE" ? C.muted : E.accent,
        fontWeight: 500, letterSpacing: "0.05em",
      }}>
        {STAGE_LABELS[stage] || stage}
      </span>
      {displayLocator && (
        <span style={{
          background: softLocator && !locator ? "transparent" : E.accentDim,
          border: `1px ${softLocator && !locator ? "dashed" : "solid"} ${E.accentBorder}`,
          borderRadius: 4, padding: "2px 8px", color: E.accent,
          fontWeight: 600, fontSize: 10, letterSpacing: "0.1em",
        }}>
          {displayLocator}{softLocator && !locator ? " (draft)" : ""}
        </span>
      )}
      <span style={{ color: C.muted, fontSize: 10 }}>AGENT: ADITYA.S</span>
    </div>
  );
}
