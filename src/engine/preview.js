const AUTOCOMPLETE = [
  "AN12JUNBOMJFK", "SS1Y1", "NM1", "7TAW", "6",
  "ER", "WP", "WPNC", "WPNI", "QC/",
  "QP/", "4G1*", "4G1/", "3VGML", "HELP",
];

export function getAutocomplete(partial) {
  if (!partial) return null;
  const upper = partial.toUpperCase();
  const match = AUTOCOMPLETE.find(c => c.startsWith(upper) && c !== upper);
  return match || null;
}
