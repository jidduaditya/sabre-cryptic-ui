import { E, eSans } from "../tokens";
import { useBookingStore, STAGES } from "../store/bookingStore";

const DISPLAY_STAGES = [
  { key: "IDLE", label: "Search" },
  { key: "AVAILABILITY", label: "Select" },
  { key: "PASSENGER_ENTRY", label: "Passenger" },
  { key: "CONTACT_ENTRY", label: "Contact" },
  { key: "SSR_ENTRY", label: "Services" },
  { key: "SEAT_SELECTION", label: "Seat" },
  { key: "TICKETING", label: "Ticketing" },
  { key: "REVIEW", label: "Review" },
  { key: "CONFIRMED", label: "Confirmed" },
];

const STAGE_HINTS = {
  IDLE: "search for flights or type AN command",
  SEARCHING: "loading results...",
  AVAILABILITY: "select a fare or type SS command",
  SELLING: "processing...",
  PASSENGER_ENTRY: "enter passenger name or type NM command",
  CONTACT_ENTRY: "add phone number or type 9{city} command",
  SSR_ENTRY: "add meal/services or skip",
  SEAT_SELECTION: "click a seat or type 4G command",
  TICKETING: "set ticket time limit and received from",
  REVIEW: "review booking and end-retrieve or type ER",
  CONFIRMED: "PNR created — retrieve for servicing",
  SERVICING: "modify booking — seat, meal, class, queue",
};

export function StageBar() {
  const stage = useBookingStore(s => s.stage);
  const hasPNR = useBookingStore(s => s.pnr.locator || s.pnr.softLocator);
  const store = useBookingStore();
  const stageIdx = STAGES.indexOf(stage);

  return (
    <div style={{
      borderBottom: `1px solid ${E.border}`, padding: "6px 16px",
      display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
      fontFamily: eSans, fontSize: 10, background: E.bg,
    }}>
      {DISPLAY_STAGES.map((ds, i) => {
        const dsIdx = STAGES.indexOf(ds.key);
        const isCurrent = ds.key === stage ||
          (ds.key === "IDLE" && stage === "SEARCHING") ||
          (ds.key === "AVAILABILITY" && stage === "SELLING");
        const isCompleted = dsIdx < stageIdx && !isCurrent;
        const isFuture = dsIdx > stageIdx;
        // Completed stages always clickable; if PNR exists, all stages are clickable
        const canClick = !isCurrent && (isCompleted || (hasPNR && isFuture));

        return (
          <div key={ds.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {i > 0 && (
              <span style={{
                color: isCompleted ? E.green : E.border,
                fontSize: 8, margin: "0 2px",
              }}>
                ›
              </span>
            )}
            <span
              onClick={canClick ? () => store.navigateToStage(ds.key, "ui") : undefined}
              style={{
                color: isCurrent ? E.accent : isCompleted ? E.green : canClick ? E.sub : E.muted,
                fontWeight: isCurrent ? 600 : 400,
                letterSpacing: "0.03em",
                opacity: (isFuture && !canClick) ? 0.4 : 1,
                cursor: canClick ? "pointer" : "default",
                textDecoration: canClick ? "underline" : "none",
                textUnderlineOffset: 3,
              }}
            >
              {ds.label}
            </span>
          </div>
        );
      })}
      <div style={{ flex: 1 }} />
      <span style={{ color: E.muted, fontStyle: "italic", fontSize: 10 }}>
        {STAGE_HINTS[stage] || ""}
      </span>
    </div>
  );
}
