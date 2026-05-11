import { register } from "../registry";

// AN12JUNBOMJFK or AN12JUNBOMJFKAA
register({
  pattern: /^AN(\d{1,2}[A-Z]{3})([A-Z]{3})([A-Z]{3})([A-Z]{2})?$/,
  stages: "*",
  parse: (m) => ({
    date: m[1], origin: m[2], dest: m[3], airline: m[4] || null,
  }),
  execute: (data, store) => {
    const resp = store.searchAvailability(data.origin, data.dest, data.date, "terminal", data.airline);
    return { response: resp };
  },
  preview: (cmd) => {
    if (/^AN\d/.test(cmd)) return "availability search";
    return null;
  },
});

// 1* — more availability
register({
  pattern: /^1\*$/,
  stages: ["AVAILABILITY"],
  parse: () => ({}),
  execute: () => ({ response: "** END OF DISPLAY\n><" }),
  preview: (cmd) => cmd.startsWith("1*") ? "more availability" : null,
});

// 1*OA — original availability
register({
  pattern: /^1\*OA$/,
  stages: ["AVAILABILITY"],
  parse: () => ({}),
  execute: (data, store) => {
    if (store.search?.origin) {
      const resp = store.searchAvailability(store.search.origin, store.search.destination, store.search.date, "terminal");
      return { response: resp };
    }
    return { response: "** NO PREVIOUS AVAILABILITY\n><" };
  },
});

// 1*R — redisplay
register({
  pattern: /^1\*R$/,
  stages: ["AVAILABILITY"],
  parse: () => ({}),
  execute: (data, store) => {
    if (store.search?.origin) {
      const resp = store.searchAvailability(store.search.origin, store.search.destination, store.search.date, "terminal", store.availability?.filterAirline);
      return { response: resp };
    }
    return { response: "** NO AVAILABILITY TO REDISPLAY\n><" };
  },
});
