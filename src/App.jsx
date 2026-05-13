import { useState, useCallback, useEffect, Component } from "react";
import { C, E, sans, eSans, tMono } from "./tokens";
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

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: "center", fontFamily: eSans, color: E.text }}>
          <p style={{ fontSize: 14, marginBottom: 16 }}>Something went wrong.</p>
          <button onClick={() => {
            this.setState({ hasError: false });
            useBookingStore.getState().resetBooking("ui");
          }} style={{
            padding: "10px 20px", background: E.accent, color: "#fff",
            border: "none", borderRadius: 2, fontSize: 13, cursor: "pointer",
          }}>
            Reset & Start Over
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const VIEW_MODES = ["both", "cryptic", "ui"];

export default function App() {
  const stage = useBookingStore(s => s.stage);
  const [splitPct, setSplitPct] = useState(38);
  const [showTour, setShowTour] = useState(false);
  const [viewMode, setViewMode] = useState("both");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "true") {
      setShowTour(true);
    }
  }, []);

  // Escape key to reset (FEATURE 1)
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && stage !== "IDLE") {
        // TopBar handles the confirmation flow
        const topBarBtn = document.querySelector("[data-new-search]");
        if (topBarBtn) topBarBtn.click();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [stage]);

  const onDrag = useCallback((clientX) => {
    const pct = (clientX / window.innerWidth) * 100;
    setSplitPct(Math.min(75, Math.max(25, pct)));
  }, []);

  const RightPanel = PANEL_MAP[stage] || SearchPanel;

  const showCryptic = viewMode === "both" || viewMode === "cryptic";
  const showUI = viewMode === "both" || viewMode === "ui";

  return (
    <div style={{
      height: "100vh", background: C.bg, fontFamily: sans,
      color: C.text, display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <TopBar viewMode={viewMode} onViewModeChange={setViewMode} />

      {/* split body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* LEFT — cryptic */}
        {showCryptic && (
          <div style={{
            width: viewMode === "cryptic" ? "100%" : `${splitPct}%`, flexShrink: 0,
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
        )}

        {/* draggable divider */}
        {viewMode === "both" && <DragDivider onDrag={onDrag} />}

        {/* RIGHT — visual */}
        {showUI && (
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", background: E.bg, color: E.text }}>
            <StageBar />
            <div style={{ flex: 1, overflow: "hidden" }}>
              <ErrorBoundary>
                <RightPanel />
              </ErrorBoundary>
            </div>
          </div>
        )}
      </div>

      {/* Demo overlay */}
      {showTour && (
        <GuidedTour onComplete={() => setShowTour(false)} />
      )}
    </div>
  );
}
