import { register } from "../registry";
import { SEATMAP } from "../../data/seatmap";

// 4G1* — display seat map
register({
  pattern: /^4G(\d)\*$/,
  stages: ["SEAT_SELECTION", "SERVICING", "PASSENGER_ENTRY", "CONTACT_ENTRY", "SSR_ENTRY", "TICKETING", "REVIEW"],
  stageWarning: "** NO SEGMENT IN CONTEXT\n><",
  parse: (m) => ({ segment: +m[1] }),
  execute: () => {
    let out = `** SEAT MAP - ${SEATMAP.aircraft} **\n`;
    for (const cabin of SEATMAP.cabins) {
      out += `--- ${cabin.name} (${cabin.config}) ---\n`;
      out += `   ${cabin.seats.join(" ")}\n`;
      for (let r = cabin.rows[0]; r <= cabin.rows[1]; r++) {
        let row = `${String(r).padStart(2)} `;
        for (const s of cabin.seats) {
          row += (cabin.map[`${r}${s}`] || "O") + " ";
        }
        out += row.trimEnd() + "\n";
      }
    }
    out += "><";
    return { response: out };
  },
  preview: (cmd) => /^4G\d\*/.test(cmd) ? "display seat map" : null,
});

// 4G1/24C-1.1 — assign seat
register({
  pattern: /^4G(\d)\/(\d+[A-K])-(\d+\.\d+)$/,
  stages: ["SEAT_SELECTION", "SERVICING", "PASSENGER_ENTRY", "CONTACT_ENTRY", "SSR_ENTRY", "TICKETING", "REVIEW"],
  stageWarning: "** NO SEGMENT IN CONTEXT\n><",
  parse: (m) => ({ segment: +m[1], seat: m[2], pax: m[3] }),
  execute: (data, store) => {
    let available = false;
    for (const cabin of SEATMAP.cabins) {
      if (cabin.map[data.seat] === "O") { available = true; break; }
    }
    if (!available) return { response: `** SEAT ${data.seat} NOT AVAILABLE\n><` };
    const resp = store.assignSeat(data.seat, data.segment, data.pax, "terminal");
    return { response: resp };
  },
  preview: (cmd) => /^4G\d\//.test(cmd) ? "assign seat" : null,
});

// 4G1/24C — assign seat without pax (assume 1.1)
register({
  pattern: /^4G(\d)\/(\d+[A-K])$/,
  stages: ["SEAT_SELECTION", "SERVICING", "PASSENGER_ENTRY", "CONTACT_ENTRY", "SSR_ENTRY", "TICKETING", "REVIEW"],
  stageWarning: "** NO SEGMENT IN CONTEXT\n><",
  parse: (m) => ({ segment: +m[1], seat: m[2], pax: "1.1" }),
  execute: (data, store) => {
    const resp = store.assignSeat(data.seat, data.segment, data.pax, "terminal");
    return { response: resp };
  },
});

// 4GX1 — cancel seats for segment
register({
  pattern: /^4GX(\d)$/,
  stages: ["SEAT_SELECTION", "SERVICING"],
  parse: (m) => ({ segment: +m[1] }),
  execute: (data) => ({ response: `SEATS CANCELLED FOR SEGMENT ${data.segment}\n><` }),
});

// 4GXALL — cancel all seats
register({
  pattern: /^4GXALL$/,
  stages: ["SEAT_SELECTION", "SERVICING"],
  parse: () => ({}),
  execute: () => ({ response: "ALL SEATS CANCELLED\n><" }),
});
