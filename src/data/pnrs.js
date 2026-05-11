export const PNRS = {
  XKMT7Q: {
    locator: "XKMT7Q", status: "Confirmed", office: "DELBR2101",
    passengers: [{ id: "1.1", name: "SHARMA/RAJESH MR", type: "ADT" }],
    segments: [
      { seg: 1, flight: "AA 101", cls: "Y", date: "12JUN", route: "BOMJFK",
        status: "HK1", depTime: "0815", arrTime: "1430+1" },
    ],
    phone: [{ line: 3, detail: "AP DEL 011-23456789-B" }],
    ticketing: { line: 4, detail: "TK OK12JUN/DELBR2101" },
    ssrs: [
      { line: 5, code: "VGML", airline: "AA", status: "HK1", detail: "BOMJFK 0101 Y 12JUN" },
      { line: 6, code: "RQST", airline: "AA", status: "HK1", detail: "24C BOMJFK 0101 Y 12JUN-1SHARMA" },
    ],
    remarks: [{ line: 7, text: "CHECK PASSPORT EXPIRY" }],
    tickets: [{ line: 8, detail: "FA PAX 125-7264678006/ETAA/12JUN26/DELBR2101/S2" }],
    seats: [{ seg: 1, seat: "24C", pax: "1.1" }],
    fare: { base: 980, taxes: 260, total: 1240, currency: "USD" },
    email: "RAJESH@EMAIL.COM",
    ffNumbers: [{ carrier: "AA", number: "123456", pax: "1.1" }],
    services: [
      { icon: "\uD83D\uDCBA", type: "Seat", detail: "24C \u00B7 Economy \u00B7 Window", status: "Confirmed" },
      { icon: "\uD83C\uDF7D\uFE0F", type: "Meal", detail: "VGML \u00B7 Vegetarian", status: "Confirmed" },
      { icon: "\uD83E\uDDF3", type: "Baggage", detail: "1\u00D723kg checked", status: "Confirmed" },
    ],
  },

  YBCN3P: {
    locator: "YBCN3P", status: "Confirmed", office: "DELBR2101",
    passengers: [
      { id: "1.1", name: "PATEL/ANITA MRS", type: "ADT" },
      { id: "1.2", name: "PATEL/VIKRAM MR", type: "ADT" },
    ],
    segments: [
      { seg: 1, flight: "EK 502", cls: "B", date: "15JUL", route: "BOMJFK",
        status: "HK2", depTime: "0345", arrTime: "1320+1" },
      { seg: 2, flight: "EK 501", cls: "B", date: "28JUL", route: "JFKBOM",
        status: "HK2", depTime: "2200", arrTime: "2215+1" },
    ],
    phone: [{ line: 3, detail: "AP BOM 022-87654321-M" }],
    ticketing: { line: 4, detail: "TK TAW15JUN/DELBR2101" },
    ssrs: [
      { line: 5, code: "VGML", airline: "EK", status: "HK2", detail: "BOMJFK 0502 B 15JUL" },
      { line: 6, code: "MOML", airline: "EK", status: "HK2", detail: "JFKBOM 0501 B 28JUL" },
    ],
    remarks: [
      { line: 7, text: "HONEYMOON TRIP" },
      { line: 8, text: "LOUNGE ACCESS CONFIRMED" },
    ],
    tickets: [],
    seats: [{ seg: 1, seat: "12A", pax: "1.1" }, { seg: 1, seat: "12B", pax: "1.2" }],
    fare: { base: 2680, taxes: 520, total: 3200, currency: "USD" },
    email: "PATEL.TRAVEL@EMAIL.COM",
    ffNumbers: [{ carrier: "EK", number: "789012", pax: "1.1" }],
    queueItems: [{ queue: 60, reason: "PENDING TICKETING" }],
    services: [
      { icon: "\uD83D\uDCBA", type: "Seat", detail: "12A/12B \u00B7 Flex \u00B7 Window/Middle", status: "Confirmed" },
      { icon: "\uD83C\uDF7D\uFE0F", type: "Meal", detail: "VGML/MOML", status: "Confirmed" },
      { icon: "\uD83E\uDDF3", type: "Baggage", detail: "2\u00D723kg each", status: "Confirmed" },
    ],
  },
};
