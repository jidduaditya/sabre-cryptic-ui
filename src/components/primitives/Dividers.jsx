import { E } from "../../tokens";

export function HDivider({ style }) {
  return <div style={{ height: 1, background: E.border, ...style }} />;
}

export function VDivider({ style }) {
  return <div style={{ width: 1, background: E.border, alignSelf: "stretch", ...style }} />;
}
