import { register } from "../registry";
import { PNRS } from "../../data/pnrs";

// ER — end and retrieve
register({
  pattern: /^ER$/,
  stages: ["REVIEW", "TICKETING", "SSR_ENTRY", "SEAT_SELECTION", "CONTACT_ENTRY", "PASSENGER_ENTRY"],
  stageWarning: "** NO PNR DATA TO END\n><",
  parse: () => ({}),
  execute: (data, store) => {
    const missing = store.getMissingPrint();
    if (missing.length > 0) {
      return { response: `** CANNOT END - MISSING: ${missing.join(", ")}\n><` };
    }
    return { response: store.endRetrieve("terminal") };
  },
  preview: (cmd) => cmd === "ER" ? "end and retrieve PNR" : null,
});

// E — end transaction
register({
  pattern: /^E$/,
  stages: "*",
  parse: () => ({}),
  execute: (data, store) => {
    const missing = store.getMissingPrint();
    if (missing.length > 0 && store.getStage() !== "IDLE") {
      return { response: `** CANNOT END - MISSING: ${missing.join(", ")}\n><` };
    }
    return { response: "END OF TRANSACTION\n><" };
  },
});

// I — ignore
register({
  pattern: /^I$/,
  stages: "*",
  parse: () => ({}),
  execute: (data, store) => ({ response: store.resetBooking("terminal") }),
});

// *XKMT7Q — retrieve by locator
register({
  pattern: /^\*([A-Z0-9]{6})$/,
  stages: "*",
  parse: (m) => ({ locator: m[1] }),
  execute: (data, store) => {
    const result = store.retrievePNR(data.locator, "terminal");
    if (result === false) {
      return { response: `** RECORD NOT FOUND - ${data.locator}\n><` };
    }
    return { response: result };
  },
  preview: (cmd) => /^\*[A-Z0-9]/.test(cmd) ? "retrieve PNR" : null,
});

// *R — redisplay current PNR
register({
  pattern: /^\*R$/,
  stages: ["SERVICING", "CONFIRMED"],
  parse: () => ({}),
  execute: (data, store) => {
    const pnr = store.servicing?.pnrData;
    if (!pnr) return { response: "** NO PNR IN WORK AREA\n><" };
    const result = store.retrievePNR(pnr.locator, "terminal");
    return { response: result || "** NO PNR IN WORK AREA\n><" };
  },
});

// *A — display full PNR
register({
  pattern: /^\*A$/,
  stages: ["SERVICING", "CONFIRMED"],
  parse: () => ({}),
  execute: (data, store) => {
    const pnr = store.servicing?.pnrData;
    if (!pnr) return { response: "** NO PNR IN WORK AREA\n><" };
    const result = store.retrievePNR(pnr.locator, "terminal");
    return { response: result || "** NO PNR IN WORK AREA\n><" };
  },
});

// *I — display itinerary
register({
  pattern: /^\*I$/,
  stages: ["SERVICING", "CONFIRMED"],
  parse: () => ({}),
  execute: (data, store) => {
    const pnr = store.servicing?.pnrData;
    if (!pnr) return { response: "** NO PNR IN WORK AREA\n><" };
    let out = "** ITINERARY **\n";
    pnr.segments?.forEach(seg => {
      out += ` ${seg.seg} ${seg.flight} ${seg.cls} ${seg.date} ${seg.route} ${seg.status} ${seg.depTime} ${seg.arrTime}\n`;
    });
    out += "><";
    return { response: out };
  },
});

// *N — display names
register({
  pattern: /^\*N$/,
  stages: ["SERVICING", "CONFIRMED"],
  parse: () => ({}),
  execute: (data, store) => {
    const pnr = store.servicing?.pnrData;
    if (!pnr) return { response: "** NO PNR IN WORK AREA\n><" };
    let out = "** NAMES **\n";
    pnr.passengers?.forEach((p, i) => { out += ` ${i + 1}.${p.name}\n`; });
    out += "><";
    return { response: out };
  },
});

// *T — display ticket field
register({
  pattern: /^\*T$/,
  stages: ["SERVICING", "CONFIRMED"],
  parse: () => ({}),
  execute: (data, store) => {
    const pnr = store.servicing?.pnrData;
    if (!pnr) return { response: "** NO PNR IN WORK AREA\n><" };
    let out = "** TICKET FIELD **\n";
    if (pnr.ticketing) out += ` ${pnr.ticketing.detail}\n`;
    pnr.tickets?.forEach(t => { out += ` ${t.detail}\n`; });
    out += "><";
    return { response: out };
  },
});

// *B — display seats
register({
  pattern: /^\*B$/,
  stages: ["SERVICING", "CONFIRMED"],
  parse: () => ({}),
  execute: (data, store) => {
    const pnr = store.servicing?.pnrData;
    if (!pnr) return { response: "** NO PNR IN WORK AREA\n><" };
    let out = "** PRE-RESERVED SEATS **\n";
    pnr.seats?.forEach(s => { out += ` SEG ${s.seg} SEAT ${s.seat} PAX ${s.pax}\n`; });
    if (!pnr.seats?.length) out += " NO SEATS ASSIGNED\n";
    out += "><";
    return { response: out };
  },
});

// *-SHARMA — retrieve by name
register({
  pattern: /^\*-([A-Z]+)$/,
  stages: "*",
  parse: (m) => ({ name: m[1] }),
  execute: (data, store) => {
    for (const [loc, pnr] of Object.entries(PNRS)) {
      if (pnr.passengers?.some(p => p.name.includes(data.name))) {
        const result = store.retrievePNR(loc, "terminal");
        return { response: result || `** NO PNR FOUND FOR ${data.name}\n><` };
      }
    }
    return { response: `** NO PNR FOUND FOR ${data.name}\n><` };
  },
});
