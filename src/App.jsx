import { useState, useCallback, useEffect } from "react";
import { C, sans, tMono } from "./tokens";
import { useBookingStore } from "./store/bookingStore";
import { TopBar } from "./components/TopBar";
import { StageBar } from "./components/StageBar";
import { CrypticPanel } from "./components/CrypticPanel";
import { DragDivider } from "./components/DragDivider";
import { SearchPanel } from "./components/panels/SearchPanel";
import { AvailPanel } from "./components/panels/AvailPanel";
import { PassengerPanel } from "./components/panels/PassengerPanel";
import { ContactPanel } from "./components/panels/ContactPanel";
import { SSRPanel } from "./components/panels/SSRPanel";
import { SeatMapPanel } from "./components/panels/SeatMapPanel";
import { TicketingPanel } from "./components/panels/TicketingPanel";
import { ReviewPanel } from "./components/panels/ReviewPanel";
import { ConfirmedPanel } from "./components/panels/ConfirmedPanel";
import { ServicingPanel } from "./components/panels/ServicingPanel";
import { GuidedTour } from "./demo/GuidedTour";

const PANEL_MAP = {
  IDLE: SearchPanel,
  SEARCHING: SearchPanel,
  AVAILABILITY: AvailPanel,
  SELLING: AvailPanel,
  PASSENGER_ENTRY: PassengerPanel,
  CONTACT_ENTRY: ContactPanel,
  SSR_ENTRY: SSRPanel,
  SEAT_SELECTION: SeatMapPanel,
  TICKETING: TicketingPanel,
  REVIEW: ReviewPanel,
  CONFIRMED: ConfirmedPanel,
  SERVICING: ServicingPanel,
};

export default function App() {
  const stage = useBookingStore(s => s.stage);
  const [splitPct, setSplitPct] = useState(38);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "true") {
      setShowTour(true);
    }
  }, []);

  const onDrag = useCallback((clientX) => {
    const pct = (clientX / window.innerWidth) * 100;
    setSplitPct(Math.min(75, Math.max(25, pct)));
  }, []);

  const RightPanel = PANEL_MAP[stage] || SearchPanel;

  return (
    <div style={{
      height: "100vh", background: C.bg, fontFamily: sans,
      color: C.text, display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <TopBar />

      {/* split body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* LEFT — cryptic */}
        <div style={{
          width: `${splitPct}%`, flexShrink: 0,
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          <div style={{
            padding: "5px 12px", borderBottom: `1px solid ${C.termBorder}`,
            fontSize: 9, color: "#2d5a2d", letterSpacing: "0.12em",
            background: "#070E07", fontFamily: tMono,
          }}>
            CRYPTIC TERMINAL
          </div>
          <CrypticPanel />
        </div>

        {/* draggable divider */}
        <DragDivider onDrag={onDrag} />

        {/* RIGHT — visual */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <StageBar />
          <div style={{ flex: 1, overflow: "hidden" }}>
            <RightPanel />
          </div>
        </div>
      </div>

      {/* Demo overlay */}
      {showTour && (
        <GuidedTour onComplete={() => setShowTour(false)} />
      )}
    </div>
  );
}
