import { C, sans, mono } from "../../tokens";
import { useBookingStore } from "../../store/bookingStore";
import { SEATMAP } from "../../data/seatmap";

export function SeatMapPanel() {
  const seats = useBookingStore(s => s.seats);
  const passengers = useBookingStore(s => s.passengers);
  const booking = useBookingStore(s => s.booking);
  const store = useBookingStore();

  const handleSeatClick = (seatKey) => {
    // Find first passenger without a seat, or default to 1.1
    const assignedPaxIds = seats.map(s => s.pax);
    const unassigned = passengers.find(p => !assignedPaxIds.includes(p.id));
    const pax = unassigned ? unassigned.id : "1.1";
    store.assignSeat(seatKey, 1, pax, "ui");
  };

  const handleSkip = () => {
    store.skipSeat("ui");
  };

  const handleContinue = () => {
    store.advanceFromSeat("ui");
  };

  const assignedSeatKeys = seats.map(s => s.seat);

  // Determine which cabin to show based on booked class
  const bookedCls = booking?.fare?.cls || "Y";
  const isBiz = ["J", "C", "D"].includes(bookedCls);

  return (
    <div style={{ height: "100%", overflow: "auto", padding: "20px 24px", fontFamily: sans }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <h3 style={{ color: C.text, fontSize: 16, fontWeight: 600, margin: 0 }}>
          Seat Selection
        </h3>
        <span style={{ color: C.muted, fontSize: 11 }}>{SEATMAP.aircraft}</span>
        {booking.segment && (
          <span style={{ color: C.accent, fontSize: 11 }}>
            {booking.segment.flight} · {bookedCls} class
          </span>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16, fontSize: 10 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <SeatIcon status="available" small /> <span style={{ color: C.muted }}>Available</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <SeatIcon status="occupied" small /> <span style={{ color: C.muted }}>Occupied</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <SeatIcon status="selected" small /> <span style={{ color: C.muted }}>Selected</span>
        </span>
      </div>

      {/* Assigned seats */}
      {seats.length > 0 && (
        <div style={{
          padding: "8px 12px", marginBottom: 16, borderRadius: 6,
          background: C.greenDim, border: `1px solid ${C.greenBorder}`,
          display: "flex", gap: 12,
        }}>
          {seats.map(s => (
            <span key={`${s.segment}-${s.seat}`} style={{ color: C.green, fontSize: 12 }}>
              {s.pax}: Seat {s.seat}
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
            <div style={{
              color: C.muted, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
              marginBottom: 8,
            }}>
              {cabin.name.toUpperCase()} ({cabin.config})
            </div>

            {/* Seat header */}
            <div style={{ display: "flex", gap: 2, marginBottom: 4, paddingLeft: 28 }}>
              {cabin.seats.map((s, i) => {
                const isAisle = cabin.aisles.some(([a, b]) => s === a || s === b);
                return (
                  <div key={s} style={{
                    width: 28, textAlign: "center", fontSize: 9, color: C.muted, fontFamily: mono,
                    marginRight: cabin.aisles.some(([a]) => s === a) ? 12 : 0,
                  }}>
                    {s}
                  </div>
                );
              })}
            </div>

            {/* Rows */}
            {Array.from({ length: cabin.rows[1] - cabin.rows[0] + 1 }, (_, i) => {
              const row = cabin.rows[0] + i;
              return (
                <div key={row} style={{ display: "flex", gap: 2, marginBottom: 2, alignItems: "center" }}>
                  <span style={{
                    width: 24, textAlign: "right", fontSize: 9, color: C.muted,
                    fontFamily: mono, paddingRight: 4,
                  }}>
                    {row}
                  </span>
                  {cabin.seats.map(s => {
                    const key = `${row}${s}`;
                    const mapVal = cabin.map[key] || "O";
                    const isAssigned = assignedSeatKeys.includes(key);
                    const isOccupied = mapVal === "X" && !isAssigned;
                    const isAvailable = mapVal === "O" && !isAssigned;

                    return (
                      <div key={s} style={{
                        marginRight: cabin.aisles.some(([a]) => s === a) ? 12 : 0,
                      }}>
                        <div
                          onClick={() => isAvailable && handleSeatClick(key)}
                          style={{
                            width: 28, height: 24, borderRadius: 4, fontSize: 8,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: isAvailable ? "pointer" : "default",
                            fontFamily: mono, fontWeight: 600,
                            background: isAssigned ? C.accentDim
                              : isOccupied ? "rgba(255,255,255,0.04)"
                              : C.surface,
                            border: `1px solid ${isAssigned ? C.accentBorder
                              : isOccupied ? "rgba(255,255,255,0.06)"
                              : C.border}`,
                            color: isAssigned ? C.accent
                              : isOccupied ? "rgba(255,255,255,0.15)"
                              : C.sub,
                          }}
                        >
                          {isAssigned ? "●" : isOccupied ? "×" : ""}
                        </div>
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
          color: C.muted, border: `1px solid ${C.border}`, borderRadius: 6,
          fontSize: 13, cursor: "pointer", fontFamily: sans,
        }}>
          Skip
        </button>
        <button onClick={handleContinue} style={{
          flex: 1, padding: "10px", background: "transparent",
          color: C.accent, border: `1px solid ${C.accentBorder}`, borderRadius: 6,
          fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: sans,
        }}>
          Continue to Ticketing →
        </button>
      </div>
    </div>
  );
}

function SeatIcon({ status, small }) {
  const size = small ? 12 : 20;
  const colors = {
    available: { bg: C.surface, border: C.border },
    occupied: { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.06)" },
    selected: { bg: C.accentDim, border: C.accentBorder },
  };
  const c = colors[status];
  return (
    <div style={{
      width: size, height: size, borderRadius: 3,
      background: c.bg, border: `1px solid ${c.border}`,
    }} />
  );
}
