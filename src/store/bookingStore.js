import { create } from "zustand";
import { FLIGHTS } from "../data/flights";
import { PNRS } from "../data/pnrs";
import { SEATMAP } from "../data/seatmap";
import { getFareQuote } from "../data/fares";

const STAGES = [
  "IDLE", "SEARCHING", "AVAILABILITY", "SELLING",
  "PASSENGER_ENTRY", "CONTACT_ENTRY", "SSR_ENTRY",
  "SEAT_SELECTION", "TICKETING", "REVIEW", "CONFIRMED", "SERVICING",
];

function generateLocator() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let loc = "";
  for (let i = 0; i < 6; i++) loc += chars[Math.floor(Math.random() * chars.length)];
  return loc;
}

const initialState = {
  stage: "IDLE",

  search: { origin: null, destination: null, date: null, paxCount: 1 },

  availability: { flights: [], filterAirline: null },

  booking: {
    flightId: null,
    flight: null,
    fare: null,
    segment: null,
  },

  passengers: [],
  contact: { phone: null, email: null },
  ssrs: [],
  seats: [],
  ffNumbers: [],

  ticketing: { ttlDate: null, ttlQueue: 9, receivedFrom: null },

  pnr: { locator: null, status: null },

  servicing: { activeLocator: null, pnrData: null, history: [] },

  // Terminal state
  terminal: { lines: [], history: [] },

  // Sync mechanism
  _pendingEcho: null,
  _lastAction: null,
};

export const useBookingStore = create((set, get) => ({
  ...initialState,

  // --- Helpers ---
  getStage: () => get().stage,
  getPrintStatus: () => {
    const s = get();
    return {
      P: s.contact.phone !== null,
      R: s.ticketing.receivedFrom !== null,
      I: s.booking.segment !== null,
      N: s.passengers.length > 0,
      T: s.ticketing.ttlDate !== null,
    };
  },
  getMissingPrint: () => {
    const p = get().getPrintStatus();
    const missing = [];
    if (!p.P) missing.push("PHONE");
    if (!p.R) missing.push("RECEIVED FROM");
    if (!p.I) missing.push("ITINERARY");
    if (!p.N) missing.push("NAME");
    if (!p.T) missing.push("TICKETING");
    return missing;
  },

  // --- Terminal ---
  appendTerminalLine: (text, type = "response") => {
    set(s => ({
      terminal: {
        ...s.terminal,
        lines: [...s.terminal.lines, { text, type }],
      },
    }));
  },
  appendTerminalLines: (lines) => {
    set(s => ({
      terminal: {
        ...s.terminal,
        lines: [...s.terminal.lines, ...lines],
      },
    }));
  },
  pushHistory: (cmd) => {
    set(s => ({
      terminal: {
        ...s.terminal,
        history: [cmd, ...s.terminal.history],
      },
    }));
  },
  clearTerminal: () => {
    set(s => ({
      terminal: { lines: [], history: s.terminal.history },
    }));
  },
  clearPendingEcho: () => set({ _pendingEcho: null }),

  // --- Actions ---

  searchAvailability: (origin, dest, date, source, airlineFilter = null) => {
    const flights = FLIGHTS.filter(f => {
      const matchRoute = f.dep === origin && f.arr === dest;
      const matchAirline = airlineFilter ? f.code === airlineFilter : true;
      return matchRoute && matchAirline;
    });

    const response = buildAvailResponse(flights, date, origin, dest);
    const echo = source === "ui" ? {
      cmd: `AN${date}${origin}${dest}${airlineFilter || ""}`,
      response,
    } : null;

    set({
      stage: "AVAILABILITY",
      search: { origin, destination: dest, date, paxCount: get().search.paxCount },
      availability: { flights, filterAirline: airlineFilter },
      _pendingEcho: echo,
      _lastAction: { source, type: "searchAvailability" },
    });

    return response;
  },

  sellFare: (flightId, cls, source) => {
    const flight = FLIGHTS.find(f => f.id === flightId);
    if (!flight) return null;
    const fare = flight.fares.find(f => f.cls === cls);
    if (!fare) return null;
    const lineNum = get().availability.flights.findIndex(f => f.id === flightId) + 1;
    const date = get().search.date || "12JUN";

    const segment = {
      seg: 1, flight: flight.flight, cls, date,
      route: `${flight.dep}${flight.arr}`, status: "HK1",
      depTime: flight.depTime.replace(":", ""),
      arrTime: flight.arrTime.replace(":", ""),
    };

    const response = buildSellResponse(flight, cls, date);
    set({
      stage: "PASSENGER_ENTRY",
      booking: { flightId, flight, fare, segment },
      _pendingEcho: source === "ui" ? { cmd: `SS1${cls}${lineNum}`, response } : null,
      _lastAction: { source, type: "sellFare" },
    });
    return response;
  },

  addPassenger: (lastName, firstName, title, paxType, source) => {
    const pax = get().passengers;
    const id = `1.${pax.length + 1}`;
    const response = ` ${id} ${lastName}/${firstName} ${title}\n><`;
    set({
      passengers: [...pax, { id, lastName, firstName, title, paxType }],
      _pendingEcho: source === "ui" ? { cmd: `NM1${lastName}/${firstName} ${title}`, response } : null,
      _lastAction: { source, type: "addPassenger" },
    });
    return response;
  },

  advanceFromPassenger: (source) => {
    set({
      stage: "CONTACT_ENTRY",
      _lastAction: { source, type: "advanceFromPassenger" },
    });
  },

  addContact: (number, type, city, source) => {
    const response = `AP ${city} ${number}-${type}\n><`;
    set({
      contact: { ...get().contact, phone: { number, type, city } },
      _pendingEcho: source === "ui" ? { cmd: `9${city} ${number}-${type}`, response } : null,
      _lastAction: { source, type: "addContact" },
    });
    return response;
  },

  addEmail: (email, source) => {
    const response = `EMAIL-${email}\n><`;
    set({
      contact: { ...get().contact, email },
      _pendingEcho: source === "ui" ? { cmd: `PE‡${email}‡`, response } : null,
      _lastAction: { source, type: "addEmail" },
    });
    return response;
  },

  advanceFromContact: (source) => {
    set({
      stage: "SSR_ENTRY",
      _lastAction: { source, type: "advanceFromContact" },
    });
  },

  addSSR: (code, segment, pax, source) => {
    const response = `SSR ${code} ${get().booking?.flight?.code || "AA"} HK1\n><`;
    set({
      ssrs: [...get().ssrs, { code, segment, pax, detail: "" }],
      _pendingEcho: source === "ui" ? { cmd: `3${code}${segment}-${pax}`, response } : null,
      _lastAction: { source, type: "addSSR" },
    });
    return response;
  },

  skipSSR: (source) => {
    set({
      stage: "SEAT_SELECTION",
      _lastAction: { source, type: "skipSSR" },
    });
  },

  advanceFromSSR: (source) => {
    set({
      stage: "SEAT_SELECTION",
      _lastAction: { source, type: "advanceFromSSR" },
    });
  },

  assignSeat: (seat, segment, pax, source) => {
    const filtered = get().seats.filter(s => !(s.segment === segment && s.pax === pax));
    const response = `SEAT ${seat} ASSIGNED - ${pax}\n><`;
    set({
      seats: [...filtered, { segment, seat, pax }],
      _pendingEcho: source === "ui" ? { cmd: `4G${segment}/${seat}-${pax}`, response } : null,
      _lastAction: { source, type: "assignSeat" },
    });
    return response;
  },

  skipSeat: (source) => {
    set({
      stage: "TICKETING",
      _lastAction: { source, type: "skipSeat" },
    });
  },

  advanceFromSeat: (source) => {
    set({
      stage: "TICKETING",
      _lastAction: { source, type: "advanceFromSeat" },
    });
  },

  setTTL: (date, source) => {
    const response = `TK TAW${date}/DELBR2101\n><`;
    set({
      ticketing: { ...get().ticketing, ttlDate: date },
      _pendingEcho: source === "ui" ? { cmd: `7TAW${date}/`, response } : null,
      _lastAction: { source, type: "setTTL" },
    });
    return response;
  },

  setReceivedFrom: (name, source) => {
    const response = `RECEIVED FROM - ${name}\n><`;
    set({
      ticketing: { ...get().ticketing, receivedFrom: name },
      _pendingEcho: source === "ui" ? { cmd: `6${name}`, response } : null,
      _lastAction: { source, type: "setReceivedFrom" },
    });
    return response;
  },

  addFF: (carrier, number, pax, source) => {
    const response = `FF ${carrier} ${number} - ${pax}\n><`;
    set({
      ffNumbers: [...get().ffNumbers, { carrier, number, pax }],
      _pendingEcho: source === "ui" ? { cmd: `FF${carrier}${number}-${pax}`, response } : null,
      _lastAction: { source, type: "addFF" },
    });
    return response;
  },

  advanceToReview: (source) => {
    set({
      stage: "REVIEW",
      _lastAction: { source, type: "advanceToReview" },
    });
  },

  endRetrieve: (source) => {
    const state = get();
    const locator = generateLocator();
    const response = buildERResponse(locator, state);
    set({
      stage: "CONFIRMED",
      pnr: { locator, status: "Confirmed" },
      _pendingEcho: source === "ui" ? { cmd: "ER", response } : null,
      _lastAction: { source, type: "endRetrieve" },
    });
    return response;
  },

  retrievePNR: (locator, source) => {
    const mockPNR = PNRS[locator];
    const currentPNR = get().pnr.locator === locator ? buildCurrentPNR(get()) : null;
    const pnrData = mockPNR || currentPNR;
    if (!pnrData) return false;

    const response = buildPNRDisplay(pnrData);
    set({
      stage: "SERVICING",
      servicing: { activeLocator: locator, pnrData, history: [] },
      _pendingEcho: source === "ui" ? { cmd: `*${locator}`, response } : null,
      _lastAction: { source, type: "retrievePNR" },
    });
    return response;
  },

  priceItinerary: (source) => {
    const state = get();
    const fq = state.booking.flight
      ? getFareQuote(state.booking.flightId, state.booking.fare?.cls || "Y")
      : null;
    const response = fq ? buildPriceResponse(fq, state) : "** NO ITINERARY TO PRICE\n><";
    set({
      _pendingEcho: source === "ui" ? { cmd: "WP", response } : null,
      _lastAction: { source, type: "priceItinerary" },
    });
    return response;
  },

  changeClass: (segment, cls, source) => {
    const response = `SEG ${segment} CLASS CHANGED TO ${cls}\n><`;
    const booking = get().booking;
    const flight = booking.flight;
    const newFare = flight?.fares.find(f => f.cls === cls) || booking.fare;
    set({
      booking: { ...booking, fare: newFare, segment: booking.segment ? { ...booking.segment, cls } : null },
      _pendingEcho: source === "ui" ? { cmd: `WC${segment}${cls}`, response } : null,
      _lastAction: { source, type: "changeClass" },
    });
    return response;
  },

  cancelSegment: (segNum, source) => {
    const response = `SEGMENT ${segNum} CANCELLED\n><`;
    set({
      _pendingEcho: source === "ui" ? { cmd: `X${segNum}`, response } : null,
      _lastAction: { source, type: "cancelSegment" },
    });
    return response;
  },

  queuePlace: (queue, source) => {
    const response = `ON QUEUE ${queue} - ${get().pnr.locator || get().servicing.activeLocator || ""}\n><`;
    set({
      servicing: {
        ...get().servicing,
        history: [...get().servicing.history, { action: "QUEUE", detail: `Placed on Q${queue}` }],
      },
      _pendingEcho: source === "ui" ? { cmd: `QP/${queue}`, response } : null,
      _lastAction: { source, type: "queuePlace" },
    });
    return response;
  },

  resetBooking: (source) => {
    const response = "IGNORED\n><";
    set({
      ...initialState,
      terminal: get().terminal,
      _pendingEcho: source === "ui" ? { cmd: "I", response } : null,
      _lastAction: { source, type: "resetBooking" },
    });
    return response;
  },

  fullReset: () => {
    set({ ...initialState });
  },
}));

// --- Response builders ---

function buildAvailResponse(flights, date, org, dest) {
  if (flights.length === 0) return `** NO FLIGHTS FOUND ${org}${dest} ${date}\n><`;
  let out = `** SABRE AVAILABILITY - ${org}${dest} ${date} **\n`;
  flights.forEach((f, i) => {
    const inv = Object.entries(f.inventory)
      .map(([c, n]) => `${c}${n}`)
      .join(" ");
    out += `${i + 1}  ${f.flight}  ${f.dep} ${f.depTime} ${f.arr} ${f.arrTime}  ${f.equipment}  ${inv}`;
    if (f.stops > 0) out += `  /VIA ${f.stopCities.join(",")}`;
    out += `  [${f.source}]\n`;
  });
  out += "><";
  return out;
}

function buildSellResponse(flight, cls, date) {
  return `SOLD 1${cls}  ${flight.flight} ${date} ${flight.dep}${flight.arr} HK1\n` +
    ` ${flight.depTime}-${flight.arrTime}  ${flight.equipment}  E-TKT\n><`;
}

function buildERResponse(locator, state) {
  let out = `--- PNR CREATED ---\n`;
  out += `RP/DELBR2101/DELBR2101\n`;
  out += `** ${locator} **\n`;

  state.passengers.forEach((p, i) => {
    out += ` ${i + 1}.${p.lastName}/${p.firstName} ${p.title}\n`;
  });

  if (state.booking.segment) {
    const seg = state.booking.segment;
    out += ` 2 ${seg.flight} ${seg.cls} ${seg.date} ${seg.route} ${seg.status} ${seg.depTime} ${seg.arrTime}\n`;
  }

  if (state.contact.phone) {
    const ph = state.contact.phone;
    out += ` 3 AP ${ph.city} ${ph.number}-${ph.type}\n`;
  }

  if (state.ticketing.ttlDate) {
    out += ` 4 TK TAW${state.ticketing.ttlDate}/DELBR2101\n`;
  }

  if (state.ticketing.receivedFrom) {
    out += ` 5 RF-${state.ticketing.receivedFrom}\n`;
  }

  state.ssrs.forEach(ssr => {
    out += ` SSR ${ssr.code} HK1 ${ssr.segment}-${ssr.pax}\n`;
  });

  state.seats.forEach(seat => {
    out += ` SEAT ${seat.seat} ${seat.segment}-${seat.pax}\n`;
  });

  out += `><`;
  return out;
}

function buildCurrentPNR(state) {
  const locator = state.pnr.locator;
  if (!locator) return null;

  return {
    locator,
    status: "Confirmed",
    office: "DELBR2101",
    passengers: state.passengers.map(p => ({
      id: p.id,
      name: `${p.lastName}/${p.firstName} ${p.title}`,
      type: p.paxType,
    })),
    segments: state.booking.segment ? [{
      seg: state.booking.segment.seg,
      flight: state.booking.segment.flight,
      cls: state.booking.segment.cls,
      date: state.booking.segment.date,
      route: state.booking.segment.route,
      status: state.booking.segment.status,
      depTime: state.booking.segment.depTime,
      arrTime: state.booking.segment.arrTime,
    }] : [],
    phone: state.contact.phone ? [{ line: 3, detail: `AP ${state.contact.phone.city} ${state.contact.phone.number}-${state.contact.phone.type}` }] : [],
    ticketing: state.ticketing.ttlDate ? { line: 4, detail: `TK TAW${state.ticketing.ttlDate}/DELBR2101` } : null,
    ssrs: state.ssrs.map((ssr, i) => ({
      line: 5 + i,
      code: ssr.code,
      airline: state.booking.flight?.code || "AA",
      status: "HK1",
      detail: `${state.booking.segment?.route || ""} ${ssr.segment} ${ssr.pax}`,
    })),
    remarks: [],
    tickets: [],
    seats: state.seats.map(s => ({ seg: s.segment, seat: s.seat, pax: s.pax })),
    fare: state.booking.fare ? {
      base: state.booking.fare.price,
      taxes: Math.round(state.booking.fare.price * 0.26),
      total: Math.round(state.booking.fare.price * 1.26),
      currency: "USD",
    } : { base: 0, taxes: 0, total: 0, currency: "USD" },
    email: state.contact.email,
    ffNumbers: state.ffNumbers,
    services: [
      ...(state.seats.length > 0 ? [{ icon: "\uD83D\uDCBA", type: "Seat", detail: state.seats.map(s => s.seat).join("/"), status: "Confirmed" }] : []),
      ...(state.ssrs.length > 0 ? [{ icon: "\uD83C\uDF7D\uFE0F", type: "Meal", detail: state.ssrs.map(s => s.code).join("/"), status: "Confirmed" }] : []),
    ],
  };
}

function buildPNRDisplay(pnr) {
  let out = `--- ${pnr.locator} ---\n`;
  out += `RP/DELBR2101/${pnr.status?.toUpperCase() || "CONFIRMED"}\n`;
  pnr.passengers?.forEach((p, i) => {
    out += ` ${i + 1}.${p.name}\n`;
  });
  pnr.segments?.forEach(seg => {
    out += ` ${seg.seg} ${seg.flight} ${seg.cls} ${seg.date} ${seg.route} ${seg.status} ${seg.depTime} ${seg.arrTime}\n`;
  });
  pnr.phone?.forEach(ph => {
    out += ` ${ph.line} ${ph.detail}\n`;
  });
  if (pnr.ticketing) {
    out += ` ${pnr.ticketing.line} ${pnr.ticketing.detail}\n`;
  }
  out += `><`;
  return out;
}

function buildPriceResponse(fq, state) {
  let out = `** PRICE QUOTE **\n`;
  out += `FARE BASIS: ${fq.basis}\n`;
  out += `BASE FARE:  ${fq.currency} ${fq.baseFare.toFixed(2)}\n`;
  Object.entries(fq.taxes).forEach(([code, amt]) => {
    out += `TAX ${code}:     ${fq.currency} ${amt.toFixed(2)}\n`;
  });
  out += `TOTAL:      ${fq.currency} ${fq.total.toFixed(2)}\n`;
  out += `><`;
  return out;
}

export { STAGES };
