import { useCallback, useRef } from "react";
import { C } from "../tokens";

export function DragDivider({ onDrag }) {
  const dragging = useRef(false);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMouseMove = (e) => {
      if (!dragging.current) return;
      onDrag(e.clientX);
    };

    const onMouseUp = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [onDrag]);

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        width: 6, flexShrink: 0, cursor: "col-resize",
        background: C.border, display: "flex", alignItems: "center",
        justifyContent: "center", transition: "background 0.15s",
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = C.accentBorder}
      onMouseLeave={(e) => { if (!dragging.current) e.currentTarget.style.background = C.border; }}
    >
      <div style={{
        width: 2, height: 32, borderRadius: 1,
        background: C.accentBorder,
      }} />
    </div>
  );
}
