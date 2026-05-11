import { register } from "../registry";

// SS1Y1 — short sell
register({
  pattern: /^SS(\d)([A-Z])(\d)$/,
  stages: ["AVAILABILITY"],
  stageWarning: "** NO AVAILABILITY DISPLAYED\n><",
  parse: (m) => ({ count: +m[1], cls: m[2], line: +m[3] }),
  execute: (data, store) => {
    const flights = store.availability?.flights || [];
    const flight = flights[data.line - 1];
    if (!flight) return { response: `** INVALID LINE NUMBER ${data.line}\n><` };
    if ((flight.inventory[data.cls] || 0) < data.count) {
      return { response: `** ${data.cls} CLASS NOT AVAILABLE ON ${flight.flight}\n><` };
    }
    const resp = store.sellFare(flight.id, data.cls, "terminal");
    return { response: resp };
  },
  preview: (cmd) => /^SS\d/.test(cmd) ? "sell seats" : null,
});

// 01Y1 — short sell alternative format
register({
  pattern: /^0(\d)([A-Z])(\d)$/,
  stages: ["AVAILABILITY"],
  stageWarning: "** NO AVAILABILITY DISPLAYED\n><",
  parse: (m) => ({ count: +m[1], cls: m[2], line: +m[3] }),
  execute: (data, store) => {
    const flights = store.availability?.flights || [];
    const flight = flights[data.line - 1];
    if (!flight) return { response: `** INVALID LINE NUMBER ${data.line}\n><` };
    const resp = store.sellFare(flight.id, data.cls, "terminal");
    return { response: resp };
  },
  preview: (cmd) => /^0\d[A-Z]/.test(cmd) ? "sell seats" : null,
});
