import { create } from "zustand";
import { FLIGHTS } from "../data/flights";
import { PNRS } from "../data/pnrs";
import { SEATMAP } from "../data/seatmap";
import { getFareQuote } from "../data/fares";
import { session, setPnrContext, resetSession } from "../engine/session";

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

  pnr: { locator: null, status: null, softLocator: null },

  _etBanner: null,

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

  searchAvailability: (origin, dest, date, source, airlineFilter = null, paxCount = null) => {
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
      search: { origin, destination: dest, date, paxCount: paxCount || get().search.paxCount },
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
    setPnrContext(true);
    set({
      stage: "PASSENGER_ENTRY",
      booking: { flightId, flight, fare, segment },
      _pendingEcho: source === "ui" ? { cmd: `SS1${cls}${lineNum}`, response } : null,
      _lastAction: { source, type: "sellFare" },
    });
    get()._checkSoftPNR();
    return response;
  },

  addPassenger: (lastName, firstName, title, paxType, source) => {
    const pax = get().passengers;
    const paxCount = get().search.paxCount;
    if (pax.length >= paxCount) {
      return `** MAX PASSENGERS REACHED - ${paxCount} ALREADY ENTERED\n><`;
    }
    const id = `${pax.length + 1}.1`;
    const response = ` ${id} ${lastName}/${firstName} ${title}\n><`;
    set({
      passengers: [...pax, { id, lastName, firstName, title, paxType }],
      _pendingEcho: source === "ui" ? { cmd: `NM1${lastName}/${firstName} ${title}`, response } : null,
      _lastAction: { source, type: "addPassenger" },
    });
    get()._checkSoftPNR();
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
    get()._checkSoftPNR();
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
    const state = get();
    const airline = state.booking?.flight?.code || state.servicing?.pnrData?.segments?.[0]?.flight?.split(" ")[0] || "AA";
    const response = `SSR ${code} ${airline} HK1\n><`;

    // If servicing, mutate the PNR data
    if (state.stage === "SERVICING" && state.servicing?.pnrData) {
      const pnr = state.servicing.pnrData;
      const nextLine = Math.max(
        ...(pnr.ssrs || []).map(s => s.line || 0),
        ...(pnr.remarks || []).map(r => r.line || 0),
        4
      ) + 1;
      pnr.ssrs = [...(pnr.ssrs || []), {
        line: nextLine, code, airline, status: "HK1",
        detail: `${pnr.segments?.[0]?.route || ""} ${segment} ${pax}`,
      }];

      // Update meal service display
      const MEAL_CODES = ["VGML", "MOML", "KSML", "HSML", "AVML", "VLML", "DBML", "LFML", "SFML", "BBML"];
      if (MEAL_CODES.includes(code)) {
        const mealSvc = pnr.services?.find(s => s.type === "Meal");
        if (mealSvc) {
          mealSvc.detail = `${mealSvc.detail}/${code}`;
        } else if (pnr.services) {
          pnr.services.push({ icon: "\uD83C\uDF7D\uFE0F", type: "Meal", detail: code, status: "Confirmed" });
        }
      }

      // Persist to session
      if (state.servicing.activeLocator) {
        session.pnrs[state.servicing.activeLocator] = pnr;
      }

      set({
        servicing: { ...state.servicing, pnrData: { ...pnr } },
        _pendingEcho: source === "ui" ? { cmd: `3${code}${segment}-${pax}`, response } : null,
        _lastAction: { source, type: "addSSR" },
      });
    } else {
      set({
        ssrs: [...state.ssrs, { code, segment, pax, detail: "" }],
        _pendingEcho: source === "ui" ? { cmd: `3${code}${segment}-${pax}`, response } : null,
        _lastAction: { source, type: "addSSR" },
      });
    }
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
    const state = get();

    // Validate seat availability against seatmap
    const rowNum = parseInt(seat);
    const colLetter = seat.replace(/^\d+/, "");
    let seatAvailable = true;
    for (const cabin of session.seatmap.cabins) {
      if (rowNum >= cabin.rows[0] && rowNum <= cabin.rows[1]) {
        const mapVal = cabin.map[seat];
        if (mapVal === "X") {
          // Check if it's the current pax's own seat being re-selected
          const ownSeat = state.servicing?.pnrData?.seats?.some(
            s => s.seat === seat && s.pax === pax
          );
          if (!ownSeat) seatAvailable = false;
        }
        break;
      }
    }
    if (!seatAvailable) {
      return `SEAT ${seat} NOT AVAILABLE - OCCUPIED\n><`;
    }

    const currentSeats = state.seats;
    const paxCount = state.search.paxCount;
    const isReplacement = currentSeats.some(s => s.segment === segment && s.pax === pax);
    if (!isReplacement && currentSeats.length >= paxCount && state.stage !== "SERVICING") {
      return `** ALL PASSENGERS HAVE SEATS ASSIGNED\n><`;
    }
    const filtered = currentSeats.filter(s => !(s.segment === segment && s.pax === pax));
    const response = `SEAT ${seat} ASSIGNED - ${pax}\n><`;

    // If servicing, mutate the PNR data and seatmap
    if (state.stage === "SERVICING" && state.servicing?.pnrData) {
      const pnr = state.servicing.pnrData;
      const oldSeat = pnr.seats?.find(s => s.seg === segment && s.pax === pax);

      // Update seatmap: free old seat, occupy new seat
      for (const cabin of session.seatmap.cabins) {
        if (oldSeat) cabin.map[oldSeat.seat] = "O";
        cabin.map[seat] = "X";
      }

      // Mutate PNR seats
      pnr.seats = (pnr.seats || []).filter(s => !(s.seg === segment && s.pax === pax));
      pnr.seats.push({ seg: segment, seat, pax });

      // Update services display
      const seatSvc = pnr.services?.find(s => s.type === "Seat");
      if (seatSvc) seatSvc.detail = `${seat} · Reassigned`;

      // Persist to session
      if (state.servicing.activeLocator) {
        session.pnrs[state.servicing.activeLocator] = pnr;
      }

      set({
        servicing: { ...state.servicing, pnrData: { ...pnr } },
        _pendingEcho: source === "ui" ? { cmd: `4G${segment}/${seat}-${pax}`, response } : null,
        _lastAction: { source, type: "assignSeat" },
      });
    } else {
      set({
        seats: [...filtered, { segment, seat, pax }],
        _pendingEcho: source === "ui" ? { cmd: `4G${segment}/${seat}-${pax}`, response } : null,
        _lastAction: { source, type: "assignSeat" },
      });
    }
    return response;
  },

  removeSeat: (seatKey, source) => {
    const response = `SEAT ${seatKey} REMOVED\n><`;
    set({
      seats: get().seats.filter(s => s.seat !== seatKey),
      _pendingEcho: source === "ui" ? { cmd: `4GX/${seatKey}`, response } : null,
      _lastAction: { source, type: "removeSeat" },
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
    get()._checkSoftPNR();
    return response;
  },

  setReceivedFrom: (name, source) => {
    const response = `RECEIVED FROM - ${name}\n><`;
    set({
      ticketing: { ...get().ticketing, receivedFrom: name },
      _pendingEcho: source === "ui" ? { cmd: `6${name}`, response } : null,
      _lastAction: { source, type: "setReceivedFrom" },
    });
    get()._checkSoftPNR();
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
    const missing = get().getMissingPrint();
    if (missing.length > 0) {
      const response = `** CANNOT REVIEW - MISSING: ${missing.join(", ")}\n><`;
      if (source === "ui") set({ _pendingEcho: { cmd: "", response } });
      return response;
    }
    set({
      stage: "REVIEW",
      _lastAction: { source, type: "advanceToReview" },
    });
  },

  endRetrieve: (source) => {
    const state = get();
    const locator = state.pnr.softLocator || generateLocator();
    const response = buildERResponse(locator, state);
    // Save PNR so it can be re-retrieved after navigation
    const pnrSnapshot = buildCurrentPNR({ ...state, pnr: { ...state.pnr, locator } });
    if (pnrSnapshot) {
      PNRS[locator] = pnrSnapshot;
      session.pnrs[locator] = pnrSnapshot;
    }
    set({
      stage: "CONFIRMED",
      pnr: { locator, status: "Confirmed", softLocator: null },
      _pendingEcho: source === "ui" ? { cmd: "ER", response } : null,
      _lastAction: { source, type: "endRetrieve" },
    });
    return response;
  },

  retrievePNR: (locator, source) => {
    const mockPNR = session.pnrs[locator] || PNRS[locator];
    const currentPNR = get().pnr.locator === locator ? buildCurrentPNR(get()) : null;
    const pnrData = mockPNR || currentPNR;
    if (!pnrData) return false;

    setPnrContext(true);
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
    // Try booking-flow fare first
    let fq = state.booking.flight
      ? getFareQuote(state.booking.flightId, state.booking.fare?.cls || "Y")
      : null;
    // Fall back to servicing PNR fare data
    let response;
    if (fq) {
      response = buildPriceResponse(fq, state);
    } else if (state.servicing?.pnrData?.fare) {
      const fare = state.servicing.pnrData.fare;
      response = `** PRICE QUOTE **\nBASE FARE:  ${fare.currency} ${fare.base.toFixed ? fare.base.toFixed(2) : fare.base + ".00"}\nTAXES:      ${fare.currency} ${fare.taxes.toFixed ? fare.taxes.toFixed(2) : fare.taxes + ".00"}\nTOTAL:      ${fare.currency} ${fare.total.toFixed ? fare.total.toFixed(2) : fare.total + ".00"}\n><`;
    } else {
      response = "** NO ITINERARY TO PRICE\n><";
    }
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

  sellLongSell: (flightNum, date, cls, origin, dest, source) => {
    const segment = {
      seg: 1, flight: flightNum, cls, date,
      route: `${origin}${dest}`, status: "NN1",
      depTime: "0000", arrTime: "0000",
    };
    const response = `SOLD 1${cls}  ${flightNum} ${date} ${origin}${dest} NN1\n><`;
    setPnrContext(true);
    set({
      stage: "PASSENGER_ENTRY",
      booking: { flightId: null, flight: null, fare: { cls, price: 0, name: "Manual", basis: "MANUAL", bags: "N/A", changes: "N/A" }, segment },
      _pendingEcho: source === "ui" ? { cmd: `0${flightNum}${cls}${date}${origin}${dest}NN1`, response } : null,
      _lastAction: { source, type: "sellLongSell" },
    });
    return response;
  },

  endTransaction: (source) => {
    const state = get();
    const locator = state.pnr.softLocator || state.pnr.locator || generateLocator();
    // Snapshot PNR data before resetting so it can be retrieved later
    const pnrSnapshot = buildCurrentPNR({ ...state, pnr: { ...state.pnr, locator } });
    if (pnrSnapshot) {
      PNRS[locator] = pnrSnapshot;
      session.pnrs[locator] = pnrSnapshot;
    }
    const response = `--- END OF TRANSACTION ---\n** ${locator} ** SAVED\n><`;
    setPnrContext(false);
    set({
      ...initialState,
      terminal: state.terminal,
      _etBanner: { locator, timestamp: Date.now() },
      _pendingEcho: source === "ui" ? { cmd: "ET", response } : null,
      _lastAction: { source, type: "endTransaction" },
    });
    return response;
  },

  _checkSoftPNR: () => {
    const s = get();
    if (s.pnr.softLocator) return;
    const print = s.getPrintStatus();
    if (print.P && print.R && print.I && print.N && print.T) {
      const loc = generateLocator();
      set({ pnr: { ...s.pnr, softLocator: loc } });
    }
  },

  navigateToStage: (targetStage, source) => {
    const targetIdx = STAGES.indexOf(targetStage);
    if (targetIdx < 0 || targetStage === get().stage) return;
    set({
      stage: targetStage,
      _pendingEcho: source === "ui" ? { cmd: "", response: `** NAVIGATED TO ${targetStage.replace(/_/g, " ")}\n><` } : null,
      _lastAction: { source, type: "navigateToStage" },
    });
  },

  resetBooking: (source) => {
    const response = "IGNORED\n><";
    resetSession();
    set({
      ...initialState,
      terminal: get().terminal,
      _etBanner: null,
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
  let out = `** AVAILABILITY - ${org}${dest} ${date} **\n`;
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
