import { E } from "../../tokens";

export function Tag({ children, color = "accent", style: extraStyle }) {
  const colors = {
    accent: { bg: E.accentDim, border: E.accentBorder, text: E.accent },
    green: { bg: E.greenDim, border: E.greenBorder, text: E.green },
    amber: { bg: E.amberDim, border: E.amberBorder, text: E.amber },
    red: { bg: E.redDim, border: E.redBorder, text: E.red },
    muted: { bg: E.surface, border: E.border, text: E.muted },
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
