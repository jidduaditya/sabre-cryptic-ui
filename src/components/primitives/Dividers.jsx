import { C } from "../../tokens";

export function HDivider({ style }) {
  return <div style={{ height: 1, background: C.border, ...style }} />;
}

export function VDivider({ style }) {
  return <div style={{ width: 1, background: C.border, alignSelf: "stretch", ...style }} />;
}
