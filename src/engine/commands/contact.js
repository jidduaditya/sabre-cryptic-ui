import { register } from "../registry";

// 9DEL 9999999-M — phone
register({
  pattern: /^9([A-Z]{3})\s+([\d-]+)-([MHBA])$/,
  stages: ["CONTACT_ENTRY", "PASSENGER_ENTRY", "SSR_ENTRY", "SEAT_SELECTION", "TICKETING", "REVIEW"],
  stageWarning: "** ADD NAME FIRST\n><",
  parse: (m) => ({ city: m[1], number: m[2], type: m[3] }),
  execute: (data, store) => {
    const resp = store.addContact(data.number, data.type, data.city, "terminal");
    return { response: resp };
  },
  preview: (cmd) => /^9[A-Z]/.test(cmd) ? "add phone number" : null,
});

// 9DEL 9999999 AGENCY REF-A — agent phone (simplified)
register({
  pattern: /^9([A-Z]{3})\s+([\d-]+)\s+.*-([MHBA])$/,
  stages: ["CONTACT_ENTRY", "PASSENGER_ENTRY", "SSR_ENTRY", "SEAT_SELECTION", "TICKETING", "REVIEW"],
  parse: (m) => ({ city: m[1], number: m[2], type: m[3] }),
  execute: (data, store) => {
    const resp = store.addContact(data.number, data.type, data.city, "terminal");
    return { response: resp };
  },
});

// PE‡EMAIL@DOMAIN.COM‡ — email
register({
  pattern: /^PE‡(.+)‡$/,
  stages: "*",
  parse: (m) => ({ email: m[1] }),
  execute: (data, store) => {
    const resp = store.addEmail(data.email, "terminal");
    return { response: resp };
  },
  preview: (cmd) => cmd.startsWith("PE") ? "add email" : null,
});

// PE EMAIL — simplified (no special chars)
register({
  pattern: /^PE([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})$/,
  stages: "*",
  parse: (m) => ({ email: m[1] }),
  execute: (data, store) => {
    const resp = store.addEmail(data.email, "terminal");
    return { response: resp };
  },
});
