import { useState, useRef, useEffect, useCallback } from "react";
import { C, sans, mono } from "../tokens";
import { dispatch } from "../engine/index";
import { useBookingStore } from "../store/bookingStore";
import { DEMO_SEQUENCE } from "./sequence";

export function GuidedTour({ onComplete }) {
  const [step, setStep] = useState(-1); // -1 = not started
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);
  const store = useBookingStore();

  const execStep = useCallback((idx) => {
    if (idx >= DEMO_SEQUENCE.length) {
      setDone(true);
      return;
    }

    const { cmd, delay } = DEMO_SEQUENCE[idx];
    setStep(idx);

    // Execute the command through the store
    const storeState = useBookingStore.getState();
    const result = dispatch(cmd, storeState);

    // Add to terminal
    store.appendTerminalLines([
      { text: `>${cmd}`, type: "cmd" },
      ...(result.response ? [{ text: result.response, type: "response" }] : []),
    ]);

    // Handle pendingEcho from store actions
    const newState = useBookingStore.getState();
    if (newState._pendingEcho) {
      store.appendTerminalLines([
        { text: newState._pendingEcho.response, type: "response" },
      ]);
      store.clearPendingEcho();
    }

    // Schedule next step
    timerRef.current = setTimeout(() => {
      execStep(idx + 1);
    }, delay);
  }, []);

  const start = () => {
    store.fullReset();
    setStep(0);
    setDone(false);
    execStep(0);
  };

  const togglePause = () => {
    if (paused) {
      // Resume from current step + 1
      execStep(step + 1);
      setPaused(false);
    } else {
      clearTimeout(timerRef.current);
      setPaused(true);
    }
  };

  const reset = () => {
    clearTimeout(timerRef.current);
    store.fullReset();
    setStep(-1);
    setDone(false);
    setPaused(false);
  };

  // Keyboard controls
  useEffect(() => {
    const handler = (e) => {
      if (e.key === " " && step >= 0 && !done) {
        e.preventDefault();
        togglePause();
      }
      if (e.key === "Escape") {
        reset();
        onComplete();
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      clearTimeout(timerRef.current);
    };
  }, [step, paused, done]);

  const progress = step >= 0 ? ((step + 1) / DEMO_SEQUENCE.length) * 100 : 0;
  const currentCaption = step >= 0 && step < DEMO_SEQUENCE.length
    ? DEMO_SEQUENCE[step].caption : "";

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      zIndex: 100, fontFamily: sans,
    }}>
      {/* Progress bar */}
      {step >= 0 && (
        <div style={{ height: 3, background: C.border }}>
          <div style={{
            height: "100%", width: `${progress}%`,
            background: C.accent, transition: "width 0.3s ease",
          }} />
        </div>
      )}

      {/* Control bar */}
      <div style={{
        padding: "10px 20px", background: "rgba(8,12,20,0.95)",
        borderTop: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", gap: 12,
        backdropFilter: "blur(8px)",
      }}>
        {step === -1 && !done && (
          <button onClick={start} style={{
            padding: "8px 20px", background: C.accent, color: "#fff",
            border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: sans,
          }}>
            ▶ Run Demo
          </button>
        )}

        {step >= 0 && !done && (
          <>
            <button onClick={togglePause} style={{
              padding: "6px 14px", background: C.surface, color: C.accent,
              border: `1px solid ${C.accentBorder}`, borderRadius: 4,
              fontSize: 12, cursor: "pointer", fontFamily: sans,
            }}>
              {paused ? "▶ Resume" : "⏸ Pause"}
            </button>
            <span style={{ color: C.muted, fontSize: 11 }}>
              Step {step + 1}/{DEMO_SEQUENCE.length}
            </span>
            <span style={{ color: C.text, fontSize: 12 }}>{currentCaption}</span>
            <span style={{ color: C.muted, fontSize: 10, fontFamily: mono }}>
              {DEMO_SEQUENCE[step]?.cmd}
            </span>
          </>
        )}

        {done && (
          <>
            <span style={{ color: C.green, fontSize: 13, fontWeight: 600 }}>
              Demo complete
            </span>
            <button onClick={start} style={{
              padding: "6px 14px", background: C.accent, color: "#fff",
              border: "none", borderRadius: 4, fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: sans,
            }}>
              Replay
            </button>
          </>
        )}

        <div style={{ flex: 1 }} />
        <button onClick={reset} style={{
          padding: "6px 12px", background: "transparent", color: C.muted,
          border: `1px solid ${C.border}`, borderRadius: 4,
          fontSize: 11, cursor: "pointer", fontFamily: sans,
        }}>
          Reset
        </button>
        <button onClick={() => { reset(); onComplete(); }} style={{
          padding: "6px 12px", background: "transparent", color: C.muted,
          border: `1px solid ${C.border}`, borderRadius: 4,
          fontSize: 11, cursor: "pointer", fontFamily: sans,
        }}>
          Close
        </button>
        <span style={{ color: C.muted, fontSize: 9 }}>Space: pause · Esc: close</span>
      </div>
    </div>
  );
}
