import { register } from "../registry";

// WP — price itinerary
register({
  pattern: /^WP$/,
  stages: ["SERVICING", "CONFIRMED", "REVIEW", "TICKETING", "SSR_ENTRY", "SEAT_SELECTION"],
  stageWarning: "** NO ITINERARY TO PRICE\n><",
  parse: () => ({}),
  execute: (data, store) => ({ response: store.priceItinerary("terminal") }),
  preview: (cmd) => cmd === "WP" ? "price itinerary" : null,
});

// WPNC — bargain finder
register({
  pattern: /^WPNC$/,
  stages: ["SERVICING", "CONFIRMED", "REVIEW", "TICKETING"],
  parse: () => ({}),
  execute: (data, store) => ({ response: store.priceItinerary("terminal") }),
  preview: (cmd) => cmd.startsWith("WPNC") ? "lowest available fare" : null,
});

// WPNI — lowest fare alternate
register({
  pattern: /^WPNI$/,
  stages: ["SERVICING", "CONFIRMED", "REVIEW", "TICKETING"],
  parse: () => ({}),
  execute: (data, store) => ({ response: store.priceItinerary("terminal") }),
  preview: (cmd) => cmd.startsWith("WPNI") ? "lowest fare, alternate flights" : null,
});

// PQ — retain price
register({
  pattern: /^PQ$/,
  stages: ["SERVICING", "CONFIRMED", "REVIEW"],
  parse: () => ({}),
  execute: () => ({ response: "PRICE QUOTE RETAINED - PQ1\n><" }),
});

// *PQ — display stored fares
register({
  pattern: /^\*PQ$/,
  stages: "*",
  parse: () => ({}),
  execute: (data, store) => ({ response: store.priceItinerary("terminal") }),
});

// PQD-ALL — delete all stored fares
register({
  pattern: /^PQD-ALL$/,
  stages: "*",
  parse: () => ({}),
  execute: () => ({ response: "ALL PRICE QUOTES DELETED\n><" }),
});
