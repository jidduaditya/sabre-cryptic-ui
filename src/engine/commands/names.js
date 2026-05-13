import { register } from "../registry";

// NM1SHARMA/RAJESH MR
register({
  pattern: /^NM(\d)([A-Z]+)\/([A-Z]+(?:\s[A-Z]+)*)\s+(MR|MRS|MS|MISS|MSTR|DR)$/,
  stages: ["PASSENGER_ENTRY", "CONTACT_ENTRY", "SSR_ENTRY", "SEAT_SELECTION", "TICKETING", "REVIEW"],
  stageWarning: "** NO SEGMENT SOLD - SELL FIRST\n><",
  parse: (m) => ({ count: +m[1], lastName: m[2], firstName: m[3], title: m[4] }),
  execute: (data, store) => {
    const { passengers, search } = store;
    if (passengers.length >= search.paxCount) {
      return { response: `** MAX PASSENGERS REACHED - ${search.paxCount} ALREADY ENTERED\n><` };
    }
    const resp = store.addPassenger(data.lastName, data.firstName, data.title, "ADT", "terminal");
    return { response: resp };
  },
  preview: (cmd) => /^NM\d/.test(cmd) ? "add passenger name" : null,
});

// Simpler name format: NM1LASTNAME/FIRSTNAME (no title — default MR)
register({
  pattern: /^NM(\d)([A-Z]+)\/([A-Z]+(?:\s[A-Z]+)*)$/,
  stages: ["PASSENGER_ENTRY", "CONTACT_ENTRY", "SSR_ENTRY", "SEAT_SELECTION", "TICKETING", "REVIEW"],
  stageWarning: "** NO SEGMENT SOLD - SELL FIRST\n><",
  parse: (m) => ({ count: +m[1], lastName: m[2], firstName: m[3], title: "MR" }),
  execute: (data, store) => {
    const { passengers, search } = store;
    if (passengers.length >= search.paxCount) {
      return { response: `** MAX PASSENGERS REACHED - ${search.paxCount} ALREADY ENTERED\n><` };
    }
    const resp = store.addPassenger(data.lastName, data.firstName, data.title, "ADT", "terminal");
    return { response: resp };
  },
});
