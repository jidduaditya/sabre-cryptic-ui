import { C } from "../../tokens";

export function Tag({ children, color = "accent", style: extraStyle }) {
  const colors = {
    accent: { bg: C.accentDim, border: C.accentBorder, text: C.accent },
    green: { bg: C.greenDim, border: C.greenBorder, text: C.green },
    amber: { bg: C.amberDim, border: C.amberBorder, text: C.amber },
    red: { bg: C.redDim, border: C.redBorder, text: C.red },
    muted: { bg: C.surface, border: C.border, text: C.muted },
  };

  const c = colors[color] || colors.accent;

  return (
    <span style={{
      padding: "2px 8px", borderRadius: 4, fontSize: 10,
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      fontWeight: 600, display: "inline-block",
      ...extraStyle,
    }}>
      {children}
    </span>
  );
}
