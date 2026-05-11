export function exact(str) {
  return new RegExp(`^${str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`);
}

export function prefix(str) {
  return new RegExp(`^${str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(.*)$`);
}
