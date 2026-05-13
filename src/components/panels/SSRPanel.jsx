import { E, eSans, mono } from "../../tokens";
import { useBookingStore } from "../../store/bookingStore";

const MEALS = [
  { code: "VGML", name: "Vegetarian (Strict)" },
  { code: "AVML", name: "Asian Vegetarian" },
  { code: "MOML", name: "Muslim" },
  { code: "KSML", name: "Kosher" },
  { code: "HSML", name: "Hindu Non-Veg" },
  { code: "DBML", name: "Diabetic" },
  { code: "LFML", name: "Low Fat" },
  { code: "SFML", name: "Seafood" },
];

export function SSRPanel() {
  const passengers = useBookingStore(s => s.passengers);
  const ssrs = useBookingStore(s => s.ssrs);
  const booking = useBookingStore(s => s.booking);
  const store = useBookingStore();

  const handleMeal = (code, pax) => {
    store.addSSR(code, 1, pax, "ui");
  };

  const handleSkip = () => {
    store.skipSSR("ui");
  };

  const handleContinue = () => {
    store.advanceFromSSR("ui");
  };

  const getPaxMeal = (paxId) => {
    return ssrs.find(s => s.pax === paxId && MEALS.some(m => m.code === s.code));
  };

  return (
    <div style={{ height: "100%", overflow: "auto", padding: "20px 24px", fontFamily: eSans }}>
      <h3 style={{ color: E.text, fontSize: 18, fontWeight: 400, marginBottom: 4, fontFamily: "Georgia,serif" }}>
        Special Services
      </h3>
      <p style={{ color: E.muted, fontSize: 12, marginBottom: 24 }}>
        Optional — add meal preferences or skip to seat selection.
      </p>

      {passengers.map(pax => {
        const meal = getPaxMeal(pax.id);
        return (
          <div key={pax.id} style={{
            padding: 16, marginBottom: 12,
            borderBottom: `1px solid ${meal ? E.greenBorder : E.border}`,
            background: meal ? E.greenDim : "transparent",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10, marginBottom: 12,
            }}>
              <span style={{ color: E.accent, fontFamily: mono, fontSize: 11 }}>{pax.id}</span>
              <span style={{ color: E.text, fontSize: 13 }}>
                {pax.lastName}/{pax.firstName} {pax.title}
              </span>
              {meal && (
                <span style={{
                  marginLeft: "auto", padding: "2px 8px", borderRadius: 4,
                  background: E.greenDim, color: E.green, fontSize: 10,
                  border: `1px solid ${E.greenBorder}`,
                }}>
                  {meal.code}
                </span>
              )}
            </div>

            {!meal && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {MEALS.map(m => (
                  <button key={m.code} onClick={() => handleMeal(m.code, pax.id)}
                    style={{
                      padding: "6px 10px", borderRadius: 2, fontSize: 11, cursor: "pointer",
                      background: "transparent", border: `1px solid ${E.border}`,
                      color: E.text, fontFamily: eSans,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = E.accentBorder; e.currentTarget.style.color = E.accent; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = E.border; e.currentTarget.style.color = E.text; }}
                  >
                    <span style={{ fontWeight: 600 }}>{m.code}</span>
                    <span style={{ color: E.muted, marginLeft: 6, fontSize: 10 }}>{m.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
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
          Continue to Seats →
        </button>
      </div>
    </div>
  );
}
