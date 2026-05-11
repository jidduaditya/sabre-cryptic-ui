import { C, sans } from "../tokens";
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
  const stageIdx = STAGES.indexOf(stage);

  return (
    <div style={{
      borderBottom: `1px solid ${C.border}`, padding: "6px 16px",
      display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
      fontFamily: sans, fontSize: 10, background: "rgba(0,0,0,0.2)",
    }}>
      {DISPLAY_STAGES.map((ds, i) => {
        const dsIdx = STAGES.indexOf(ds.key);
        const isCurrent = ds.key === stage ||
          (ds.key === "IDLE" && stage === "SEARCHING") ||
          (ds.key === "AVAILABILITY" && stage === "SELLING");
        const isCompleted = dsIdx < stageIdx && !isCurrent;
        const isFuture = dsIdx > stageIdx;

        return (
          <div key={ds.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {i > 0 && (
              <span style={{
                color: isCompleted ? C.green : C.border,
                fontSize: 8, margin: "0 2px",
              }}>
                ›
              </span>
            )}
            <span style={{
              color: isCurrent ? C.accent : isCompleted ? C.green : C.muted,
              fontWeight: isCurrent ? 600 : 400,
              letterSpacing: "0.03em",
              opacity: isFuture ? 0.4 : 1,
            }}>
              {ds.label}
            </span>
          </div>
        );
      })}
      <div style={{ flex: 1 }} />
      <span style={{ color: C.muted, fontStyle: "italic", fontSize: 10 }}>
        {STAGE_HINTS[stage] || ""}
      </span>
    </div>
  );
}
