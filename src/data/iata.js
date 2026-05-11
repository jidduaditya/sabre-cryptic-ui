export const IATA = {
  BOM: "MUMBAI",
  JFK: "NEW YORK",
  DEL: "DELHI",
  DXB: "DUBAI",
  DOH: "DOHA",
  LHR: "LONDON",
  FRA: "FRANKFURT",
  SIN: "SINGAPORE",
  SYD: "SYDNEY",
  CDG: "PARIS",
  HKG: "HONG KONG",
  NRT: "TOKYO",
};

// Reverse lookup: city name → code
export const CITY_TO_CODE = Object.fromEntries(
  Object.entries(IATA).map(([code, city]) => [city, code])
);

export function decode(code) {
  return IATA[code?.toUpperCase()] || code;
}

export function encode(name) {
  return CITY_TO_CODE[name?.toUpperCase()] || name;
}
