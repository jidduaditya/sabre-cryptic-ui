export const FARE_QUOTES = [
  { flightId: 1, cls: "Y", baseFare: 980, taxes: { YQ: 120, YR: 45, IN: 55, XT: 40 }, total: 1240, basis: "YLOWUS", currency: "USD" },
  { flightId: 1, cls: "B", baseFare: 1490, taxes: { YQ: 120, YR: 45, IN: 85, XT: 60 }, total: 1800, basis: "BLOWUS", currency: "USD" },
  { flightId: 1, cls: "J", baseFare: 3200, taxes: { YQ: 180, YR: 90, IN: 120, XT: 80 }, total: 3670, basis: "JCBUS", currency: "USD" },
  { flightId: 2, cls: "Y", baseFare: 980, taxes: { YQ: 110, YR: 50, IN: 55, XT: 45 }, total: 1240, basis: "YECSAV", currency: "USD" },
  { flightId: 2, cls: "B", baseFare: 1340, taxes: { YQ: 110, YR: 50, IN: 70, XT: 50 }, total: 1620, basis: "BECFLX", currency: "USD" },
  { flightId: 2, cls: "J", baseFare: 3500, taxes: { YQ: 180, YR: 90, IN: 130, XT: 80 }, total: 3980, basis: "JCBUS", currency: "USD" },
  { flightId: 3, cls: "Y", baseFare: 890, taxes: { YQ: 100, YR: 40, IN: 50, XT: 35 }, total: 1115, basis: "YOWRT", currency: "USD" },
  { flightId: 3, cls: "J", baseFare: 2800, taxes: { YQ: 160, YR: 80, IN: 110, XT: 70 }, total: 3220, basis: "JCBUS", currency: "USD" },
  { flightId: 4, cls: "Y", baseFare: 1050, taxes: { YQ: 130, YR: 55, IN: 60, XT: 45 }, total: 1340, basis: "YOWEU", currency: "USD" },
  { flightId: 4, cls: "B", baseFare: 1580, taxes: { YQ: 130, YR: 55, IN: 80, XT: 55 }, total: 1900, basis: "BOWEU", currency: "USD" },
  { flightId: 4, cls: "J", baseFare: 3400, taxes: { YQ: 180, YR: 90, IN: 125, XT: 75 }, total: 3870, basis: "JCBUS", currency: "USD" },
  { flightId: 5, cls: "Y", baseFare: 920, taxes: { YQ: 115, YR: 45, IN: 55, XT: 40 }, total: 1175, basis: "YLITE", currency: "USD" },
  { flightId: 5, cls: "B", baseFare: 1380, taxes: { YQ: 115, YR: 45, IN: 75, XT: 50 }, total: 1665, basis: "BCLAS", currency: "USD" },
  { flightId: 5, cls: "J", baseFare: 3600, taxes: { YQ: 180, YR: 90, IN: 135, XT: 80 }, total: 4085, basis: "JCBUS", currency: "USD" },
];

export function getFareQuote(flightId, cls) {
  return FARE_QUOTES.find(f => f.flightId === flightId && f.cls === cls);
}
