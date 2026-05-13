import { E, eSans, mono } from "../../tokens";
import { useBookingStore } from "../../store/bookingStore";
import { SEATMAP } from "../../data/seatmap";

export function SeatMapPanel() {
  const seats = useBookingStore(s => s.seats);
  const passengers = useBookingStore(s => s.passengers);
  const booking = useBookingStore(s => s.booking);
  const paxCount = useBookingStore(s => s.search.paxCount);
  const store = useBookingStore();

  const handleSeatClick = (seatKey) => {
    // If already assigned, deselect
    if (assignedSeatKeys.includes(seatKey)) {
      store.removeSeat(seatKey, "ui");
      return;
    }
    // If at cap with single pax, auto-replace
    if (paxCount === 1 && seats.length >= 1) {
      store.removeSeat(seats[0].seat, "ui");
    }
    // If at cap with multiple pax, block
    if (paxCount > 1 && seats.length >= paxCount) return;
    // Assign to first unassigned passenger
    const assignedPaxIds = seats.map(s => s.pax);
    const unassigned = passengers.find(p => !assignedPaxIds.includes(p.id));
    const pax = unassigned ? unassigned.id : passengers[0]?.id || "1.1";
    store.assignSeat(seatKey, 1, pax, "ui");
  };

  const handleSkip = () => {
    store.skipSeat("ui");
  };

  const handleContinue = () => {
    store.advanceFromSeat("ui");
  };

  const assignedSeatKeys = seats.map(s => s.seat);
  const allSeatsAssigned = seats.length >= paxCount;
  const bookedCls = booking?.fare?.cls || "Y";
  const isBiz = ["J", "C", "D"].includes(bookedCls);

  // Map seat key to passenger info for display
  const seatToPax = {};
  seats.forEach(s => {
    const pax = passengers.find(p => p.id === s.pax);
    seatToPax[s.seat] = pax ? `${pax.firstName} ${pax.lastName}` : s.pax;
  });

  return (
    <div style={{ height: "100%", overflow: "auto", padding: "20px 24px", fontFamily: eSans }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <h3 style={{ color: E.text, fontSize: 18, fontWeight: 400, margin: 0, fontFamily: "Georgia,serif" }}>
          Seat Selection
        </h3>
        <span style={{ color: E.muted, fontSize: 11 }}>{SEATMAP.aircraft}</span>
        {booking.segment && (
          <span style={{ color: E.accent, fontSize: 11 }}>
            {booking.segment.flight} · {bookedCls} class
          </span>
        )}
      </div>

      {/* Counter */}
      <div style={{ color: E.muted, fontSize: 12, marginBottom: 16 }}>
        Seats assigned: <span style={{ color: allSeatsAssigned ? E.green : E.text, fontWeight: 600 }}>
          {seats.length}/{paxCount}
        </span>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, marginBottom: 16, fontSize: 10 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <SeatBox letter="A" status="available" /> <span style={{ color: E.muted }}>Available</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <SeatBox letter="" status="occupied" /> <span style={{ color: E.muted }}>Occupied</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <SeatBox letter="A" status="selected" /> <span style={{ color: E.muted }}>Your selection</span>
        </span>
      </div>

      {/* Assigned seats summary */}
      {seats.length > 0 && (
        <div style={{
          padding: "8px 12px", marginBottom: 16,
          background: E.greenDim, borderBottom: `1px solid ${E.greenBorder}`,
          display: "flex", gap: 12, flexWrap: "wrap",
        }}>
          {seats.map(s => (
            <span key={`${s.segment}-${s.seat}`} style={{ color: E.green, fontSize: 12 }}>
              {seatToPax[s.seat] || s.pax}: Seat {s.seat}
            </span>
          ))}
        </div>
      )}

      {/* Seat maps */}
      {SEATMAP.cabins.map(cabin => {
        const showCabin = isBiz ? cabin.cls === "J" : cabin.cls === "Y";
        if (!showCabin) return null;

        return (
          <div key={cabin.name} style={{ marginBottom: 24 }}>
            {/* Cabin header */}
            <div style={{
              background: E.surface, padding: "8px 12px", marginBottom: 8,
              borderBottom: `1px solid ${E.border}`,
              color: E.text, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
            }}>
              {cabin.name.toUpperCase()} ({cabin.config}) · Rows {cabin.rows[0]}-{cabin.rows[1]}
            </div>

            {/* Seat header with aisle labels */}
            <div style={{ display: "flex", gap: 3, marginBottom: 6, paddingLeft: 32 }}>
              {cabin.seats.map((s, i) => {
                const isBeforeAisle = cabin.aisles.some(([a]) => s === a);
                return (
                  <div key={s} style={{ display: "flex", alignItems: "center" }}>
                    <div style={{
                      width: 32, textAlign: "center", fontSize: 10, color: E.muted, fontFamily: mono, fontWeight: 600,
                    }}>
                      {s}
                    </div>
                    {isBeforeAisle && (
                      <div style={{ width: 20, textAlign: "center", fontSize: 8, color: E.borderHi, letterSpacing: "0.05em" }}>
                        {i === 0 || cabin.aisles[0][0] === s ? "" : ""}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Rows */}
            {Array.from({ length: cabin.rows[1] - cabin.rows[0] + 1 }, (_, i) => {
              const row = cabin.rows[0] + i;
              return (
                <div key={row} style={{ display: "flex", gap: 3, marginBottom: 3, alignItems: "center" }}>
                  <span style={{
                    width: 28, textAlign: "right", fontSize: 10, color: E.muted,
                    fontFamily: mono, paddingRight: 4, fontWeight: 500,
                  }}>
                    {row}
                  </span>
                  {cabin.seats.map(s => {
                    const key = `${row}${s}`;
                    const mapVal = cabin.map[key] || "O";
                    const isAssigned = assignedSeatKeys.includes(key);
                    const isOccupied = mapVal === "X" && !isAssigned;
                    const isAvailable = mapVal === "O" && !isAssigned;
                    const isDimmed = isAvailable && allSeatsAssigned;
                    const isBeforeAisle = cabin.aisles.some(([a]) => s === a);

                    const tooltip = isOccupied
                      ? `Seat ${key} · Occupied`
                      : isAssigned
                        ? `Seat ${key} · ${seatToPax[key] || "Selected"} (click to deselect)`
                        : isDimmed
                          ? `All seats assigned. Deselect one to change.`
                          : `Seat ${key} · Available`;

                    return (
                      <div key={s} style={{ display: "flex", alignItems: "center" }}>
                        <div
                          title={tooltip}
                          onClick={() => {
                            if (isAssigned) { store.removeSeat(key, "ui"); return; }
                            if (isAvailable && !isDimmed) handleSeatClick(key);
                          }}
                          style={{
                            width: 32, height: 28, borderRadius: 3, fontSize: 10,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: isOccupied || isDimmed ? "default" : "pointer",
                            fontFamily: mono, fontWeight: 600,
                            background: isAssigned ? E.accentDim
                              : isOccupied ? E.surfaceHi
                              : isDimmed ? E.surface
                              : E.surface,
                            border: `1px solid ${isAssigned ? E.accent
                              : isOccupied ? E.borderHi
                              : isDimmed ? E.border
                              : E.border}`,
                            color: isAssigned ? E.accent
                              : isOccupied ? E.borderHi
                              : isDimmed ? E.borderHi
                              : E.sub,
                            opacity: isDimmed ? 0.4 : 1,
                            transition: "all 0.1s",
                          }}
                        >
                          {isAssigned ? s : isOccupied ? "" : s}
                        </div>
                        {isBeforeAisle && <div style={{ width: 20 }} />}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button onClick={handleSkip} style={{
          flex: 1, padding: "10px", background: "transparent",
          color: E.muted, border: `1px solid ${E.border}`, borderRadius: 2,
          fontSize: 13, cursor: "pointer", fontFamily: eSans,
        }}>
          Skip
        </button>
        <button onClick={handleContinue} style={{
          flex: 1, padding: "10px", background: "transparent",
          color: E.accent, border: `1px solid ${E.accentBorder}`, borderRadius: 2,
          fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: eSans,
        }}>
          Continue to Ticketing →
        </button>
      </div>
    </div>
  );
}

function SeatBox({ letter, status }) {
  const colors = {
    available: { bg: E.surface, border: E.border, color: E.sub },
    occupied: { bg: E.surfaceHi, border: E.borderHi, color: E.borderHi },
    selected: { bg: E.accentDim, border: E.accent, color: E.accent },
  };
  const c = colors[status];
  return (
    <div style={{
      width: 18, height: 16, borderRadius: 2, fontSize: 8,
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: mono, fontWeight: 600,
    }}>
      {letter}
    </div>
  );
}
