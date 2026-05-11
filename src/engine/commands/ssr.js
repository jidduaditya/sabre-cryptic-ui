import { register } from "../registry";

const MEAL_CODES = ["VGML", "MOML", "KSML", "HSML", "AVML", "VLML", "DBML", "LFML", "SFML", "BBML"];

// 3VGML1-1.1
register({
  pattern: /^3([A-Z]{4})(\d+)-(\d+\.\d+)$/,
  stages: ["SSR_ENTRY", "PASSENGER_ENTRY", "CONTACT_ENTRY", "SEAT_SELECTION", "TICKETING", "REVIEW", "SERVICING"],
  stageWarning: "** NO SEGMENT IN CONTEXT\n><",
  parse: (m) => ({ code: m[1], segment: +m[2], pax: m[3] }),
  execute: (data, store) => {
    const resp = store.addSSR(data.code, data.segment, data.pax, "terminal");
    return { response: resp };
  },
  preview: (cmd) => {
    const m = cmd.match(/^3([A-Z]{4})/);
    if (m) return MEAL_CODES.includes(m[1]) ? `meal request: ${m[1]}` : `special service: ${m[1]}`;
    if (/^3[A-Z]/.test(cmd)) return "special service request";
    return null;
  },
});

// 3VGML1-2.1,3.1 — multiple pax (simplified: just first pax)
register({
  pattern: /^3([A-Z]{4})(\d+)-(\d+\.\d+),/,
  stages: ["SSR_ENTRY", "PASSENGER_ENTRY", "CONTACT_ENTRY", "SEAT_SELECTION", "TICKETING", "REVIEW", "SERVICING"],
  parse: (m) => ({ code: m[1], segment: +m[2], pax: m[3] }),
  execute: (data, store) => {
    const resp = store.addSSR(data.code, data.segment, data.pax, "terminal");
    return { response: resp };
  },
});

// DU*/SPM — display meal codes
register({
  pattern: /^DU\*\/SPM/,
  stages: "*",
  parse: () => ({}),
  execute: () => ({
    response: "** SPECIAL MEAL CODES **\nAVML - ASIAN VEGETARIAN\nBBML - BABY MEAL\nDBML - DIABETIC\nHSML - HINDU (NON-VEG)\nKSML - KOSHER\nLFML - LOW FAT\nMOML - MUSLIM\nSFML - SEAFOOD\nVGML - VEGETARIAN (STRICT)\nVLML - VEGETARIAN LACTO-OVO\n><",
  }),
});
