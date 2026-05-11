import { register } from "../registry";

// 7TAW14JUN/ — ticket time limit
register({
  pattern: /^7TAW(\d{1,2}[A-Z]{3})\/$/,
  stages: ["TICKETING", "PASSENGER_ENTRY", "CONTACT_ENTRY", "SSR_ENTRY", "SEAT_SELECTION", "REVIEW"],
  stageWarning: "** ADD NAME AND CONTACT FIRST\n><",
  parse: (m) => ({ date: m[1] }),
  execute: (data, store) => ({ response: store.setTTL(data.date, "terminal") }),
  preview: (cmd) => /^7TAW/.test(cmd) ? "ticket time limit" : null,
});

// 7TAW/ — same day
register({
  pattern: /^7TAW\/$/,
  stages: ["TICKETING", "PASSENGER_ENTRY", "CONTACT_ENTRY", "SSR_ENTRY", "SEAT_SELECTION", "REVIEW"],
  parse: () => {
    const now = new Date();
    const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    return { date: `${now.getDate()}${months[now.getMonth()]}` };
  },
  execute: (data, store) => ({ response: store.setTTL(data.date, "terminal") }),
});

// 6RAJESH — received from
register({
  pattern: /^6([A-Z][A-Z\s]*)$/,
  stages: "*",
  parse: (m) => ({ name: m[1].trim() }),
  execute: (data, store) => ({ response: store.setReceivedFrom(data.name, "terminal") }),
  preview: (cmd) => /^6[A-Z]/.test(cmd) ? "received from" : null,
});

// FFAA123456-1.1 — frequent flyer
register({
  pattern: /^FF([A-Z]{2})(\d+)-(\d+\.\d+)$/,
  stages: "*",
  parse: (m) => ({ carrier: m[1], number: m[2], pax: m[3] }),
  execute: (data, store) => ({ response: store.addFF(data.carrier, data.number, data.pax, "terminal") }),
  preview: (cmd) => /^FF[A-Z]/.test(cmd) ? "frequent flyer number" : null,
});
