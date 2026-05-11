import { register } from "../registry";

// X1 — cancel segment
register({
  pattern: /^X(\d)$/,
  stages: ["SERVICING"],
  stageWarning: "** NO ITINERARY IN WORK AREA\n><",
  parse: (m) => ({ segment: +m[1] }),
  execute: (data, store) => ({ response: store.cancelSegment(data.segment, "terminal") }),
});

// XI — cancel whole itinerary
register({
  pattern: /^XI$/,
  stages: ["SERVICING"],
  parse: () => ({}),
  execute: () => ({ response: "ITINERARY CANCELLED\n><" }),
});

// WC1J — change class
register({
  pattern: /^WC(\d)([A-Z])$/,
  stages: ["SERVICING"],
  stageWarning: "** NO ITINERARY IN WORK AREA\n><",
  parse: (m) => ({ segment: +m[1], cls: m[2] }),
  execute: (data, store) => ({ response: store.changeClass(data.segment, data.cls, "terminal") }),
  preview: (cmd) => /^WC\d/.test(cmd) ? "change class" : null,
});

// .1HK — confirm segment
register({
  pattern: /^\.(\d)HK$/,
  stages: ["SERVICING"],
  parse: (m) => ({ segment: +m[1] }),
  execute: (data) => ({ response: `SEGMENT ${data.segment} CONFIRMED HK\n><` }),
});
