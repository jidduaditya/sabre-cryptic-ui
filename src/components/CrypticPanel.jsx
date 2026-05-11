import { useState, useRef, useEffect, useCallback } from "react";
import { C, tMono } from "../tokens";
import { dispatch, getPreview } from "../engine/index";
import { getAutocomplete } from "../engine/preview";
import { useBookingStore } from "../store/bookingStore";

const BOOT_LINES = [
  { text: "CRYPTIC UI  |  BIDIRECTIONAL MODE  |  AGENT: ADITYA.S", type: "header" },
  { text: "------------------------------------------------------", type: "header" },
  { text: "COMMANDS ON LEFT ↔ INTERACTIONS ON RIGHT", type: "response" },
  { text: "BOTH PANELS STAY IN SYNC AT EVERY STEP", type: "response" },
  { text: "------------------------------------------------------", type: "header" },
  { text: "TRY: AN12JUNBOMJFK   SS1Y1   NM1SHARMA/RAJESH MR", type: "response" },
  { text: "><", type: "response" },
];

const STAGE_PROMPTS = {
  IDLE: ">", SEARCHING: ">", AVAILABILITY: "AN>", SELLING: ">",
  PASSENGER_ENTRY: "NM>", CONTACT_ENTRY: "9>", SSR_ENTRY: "3>",
  SEAT_SELECTION: "4G>", TICKETING: "TK>", REVIEW: "ER>",
  CONFIRMED: "*>", SERVICING: "SVC>",
};

const HINTS = [
  "AN12JUNBOMJFK", "SS1Y1", "NM1SHARMA/RAJESH MR",
  "*XKMT7Q", "WP", "4G1*", "QC/", "HELP",
];

export function CrypticPanel() {
  const store = useBookingStore();
  const stage = useBookingStore(s => s.stage);
  const pendingEcho = useBookingStore(s => s._pendingEcho);
  const terminalLines = useBookingStore(s => s.terminal.lines);

  const [localLines, setLocalLines] = useState(BOOT_LINES);
  const [input, setInput] = useState("");
  const [hist, setHist] = useState([]);
  const [histI, setHistI] = useState(-1);
  const [preview, setPreview] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Handle pending echo from UI actions
  useEffect(() => {
    if (pendingEcho) {
      setLocalLines(prev => [
        ...prev,
        { text: `>${pendingEcho.cmd}`, type: "cmd" },
        { text: pendingEcho.response, type: "response" },
      ]);
      store.clearPendingEcho();
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 40);
    }
  }, [pendingEcho]);

  const exec = useCallback((cmd) => {
    const storeState = useBookingStore.getState();
    const result = dispatch(cmd, storeState);
    const lines = [{ text: `>${cmd}`, type: "cmd" }];

    if (result.response) {
      lines.push({ text: result.response, type: "response" });
    }

    setLocalLines(prev => [...prev, ...lines]);
    setHist(prev => [cmd, ...prev]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 40);
  }, []);

  const submit = () => {
    if (!input.trim()) return;
    exec(input.trim());
    setHistI(-1);
    setInput("");
    setPreview(null);
  };

  const onInputChange = (e) => {
    const val = e.target.value.toUpperCase();
    setInput(val);
    setPreview(getPreview(val));
  };

  const onKey = (e) => {
    if (e.key === "Enter") { submit(); return; }
    if (e.key === "Tab") {
      e.preventDefault();
      const ac = getAutocomplete(input);
      if (ac) setInput(ac);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const i = Math.min(histI + 1, hist.length - 1);
      setHistI(i); setInput(hist[i] || "");
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const i = Math.max(histI - 1, -1);
      setHistI(i); setInput(i === -1 ? "" : hist[i] || "");
    }
  };

  const prompt = STAGE_PROMPTS[stage] || ">";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.termBg }}>
      {/* hints */}
      <div style={{
        padding: "5px 10px", borderBottom: `1px solid ${C.termBorder}`,
        background: "#070E07", display: "flex", gap: 5, flexWrap: "wrap",
      }}>
        {HINTS.map(h => (
          <button key={h} onClick={() => { setInput(h); inputRef.current?.focus(); }}
            style={{
              background: "none", border: `1px solid #1e3a1e`, borderRadius: 3,
              padding: "2px 8px", color: C.termHi, fontSize: 10, fontFamily: tMono, cursor: "pointer",
            }}>
            {h}
          </button>
        ))}
      </div>

      {/* output */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
        {localLines.map((line, i) => {
          const colorForType = (type, text) => {
            if (type === "cmd") return C.termCmd;
            if (type === "header") return C.termHi;
            if (type === "warning") return C.amber;
            if (type === "stage") return "#818CF8";
            if (type === "preview") return C.muted;
            // Auto-detect from text
            if (text.startsWith(">") && !text.startsWith("><")) return C.termCmd;
            if (text.startsWith("**") && (text.includes("CANNOT") || text.includes("MISSING") || text.includes("NOT"))) return C.amber;
            if (text.startsWith("**") || text.startsWith("---") || text.startsWith("CY")) return C.termHi;
            if (text.startsWith("===")) return "#818CF8";
            return C.termText;
          };

          return (
            <pre key={i} style={{
              margin: 0, padding: 0, fontSize: 12, lineHeight: 1.7,
              whiteSpace: "pre-wrap", wordBreak: "break-all", fontFamily: tMono,
              color: colorForType(line.type, line.text),
            }}>{line.text}</pre>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* preview hint */}
      {preview && (
        <div style={{
          padding: "2px 14px", background: "#070E07",
          borderTop: `1px solid ${C.termBorder}`,
        }}>
          <span style={{ color: C.muted, fontSize: 10, fontFamily: tMono, fontStyle: "italic" }}>
            → {preview}
          </span>
        </div>
      )}

      {/* input row */}
      <div style={{
        borderTop: `1px solid ${C.termBorder}`, padding: "8px 10px",
        display: "flex", alignItems: "center", gap: 7, background: "#070E07",
      }}>
        <span style={{ color: C.termHi, fontSize: 13, fontWeight: 700, fontFamily: tMono }}>
          {prompt}
        </span>
        <input ref={inputRef} value={input}
          onChange={onInputChange}
          onKeyDown={onKey} autoFocus placeholder="ENTER COMMAND..."
          style={{
            flex: 1, background: "none", border: "none", outline: "none",
            color: C.termCmd, fontFamily: tMono, fontSize: 12, caretColor: C.termHi,
          }} />
        <button onClick={submit}
          style={{
            background: "#1a3a1a", border: `1px solid #2d5a2d`, borderRadius: 3,
            padding: "4px 10px", color: C.termHi, fontFamily: tMono, fontSize: 11, cursor: "pointer",
          }}>ENT</button>
        <button onClick={() => { setLocalLines(BOOT_LINES); setHist([]); setInput(""); setHistI(-1); }}
          style={{
            background: "none", border: `1px solid ${C.termBorder}`, borderRadius: 3,
            padding: "4px 8px", color: "#2d5a2d", fontFamily: tMono, fontSize: 11, cursor: "pointer",
          }}>CLR</button>
      </div>
    </div>
  );
}
