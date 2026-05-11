import { register } from "../registry";

// QC/ — queue count
register({
  pattern: /^QC\/$/,
  stages: "*",
  parse: () => ({}),
  execute: () => ({
    response: "** QUEUE COUNT **\nQ  1  TKT/TL    4 ITEMS\nQ  7  SCHEDULE   2 ITEMS\nQ  9  GENERAL    7 ITEMS\nQ 25  INVOICES   1 ITEMS\nQ 60  PERSONAL   3 ITEMS\nTOTAL           17 ITEMS\n><",
  }),
  preview: (cmd) => cmd.startsWith("QC") ? "queue count" : null,
});

// QP/1 — queue place
register({
  pattern: /^QP\/(\d+)$/,
  stages: "*",
  parse: (m) => ({ queue: +m[1] }),
  execute: (data, store) => ({ response: store.queuePlace(data.queue, "terminal") }),
  preview: (cmd) => cmd.startsWith("QP/") ? "queue place" : null,
});

// Q/17 — access queue
register({
  pattern: /^Q\/(\d+)$/,
  stages: "*",
  parse: (m) => ({ queue: +m[1] }),
  execute: (data) => ({
    response: `** QUEUE ${data.queue} **\n 1. XKMT7Q  SHARMA/RAJESH      AA101 12JUN BOMJFK\n 2. YBCN3P  PATEL/ANITA        EK502 15JUL BOMJFK\n><`,
  }),
});

// QXI — exit queue
register({
  pattern: /^QXI$/,
  stages: "*",
  parse: () => ({}),
  execute: () => ({ response: "QUEUE EXITED\n><" }),
});

// QA/ — queue analysis
register({
  pattern: /^QA\//,
  stages: "*",
  parse: () => ({}),
  execute: () => ({
    response: "** QUEUE ANALYSIS **\nQ  1  TKT/TL    TODAY:2  TOMORROW:2\nQ  9  GENERAL    TODAY:5  TOMORROW:2\n><",
  }),
});
