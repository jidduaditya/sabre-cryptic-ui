import { register } from "../registry";
import { IATA } from "../../data/iata";

// 5REMARK — general remark
register({
  pattern: /^5([A-Z].+)$/,
  stages: "*",
  parse: (m) => ({ text: m[1] }),
  execute: (data) => ({ response: `REMARK ADDED: ${data.text}\n><` }),
});

// W/-CCLONDON — encode city
register({
  pattern: /^W\/-CC(.+)$/,
  stages: "*",
  parse: (m) => ({ name: m[1] }),
  execute: (data) => {
    const entry = Object.entries(IATA).find(([, city]) => city.includes(data.name));
    if (entry) return { response: `${entry[1]} - ${entry[0]}\n><` };
    return { response: `** CITY NOT FOUND - ${data.name}\n><` };
  },
});

// W/*BOM — decode city/airport
register({
  pattern: /^W\/\*([A-Z]{3})$/,
  stages: "*",
  parse: (m) => ({ code: m[1] }),
  execute: (data) => {
    const city = IATA[data.code];
    if (city) return { response: `${data.code} - ${city}\n><` };
    return { response: `** CODE NOT FOUND - ${data.code}\n><` };
  },
});

// W/*AA — decode airline
register({
  pattern: /^W\/\*([A-Z]{2})$/,
  stages: "*",
  parse: (m) => ({ code: m[1] }),
  execute: (data) => {
    const airlines = {
      AA: "AMERICAN AIRLINES", EK: "EMIRATES", AI: "AIR INDIA",
      LH: "LUFTHANSA", QR: "QATAR AIRWAYS", BA: "BRITISH AIRWAYS",
      SQ: "SINGAPORE AIRLINES",
    };
    const name = airlines[data.code];
    if (name) return { response: `${data.code} - ${name}\n><` };
    return { response: `** AIRLINE NOT FOUND - ${data.code}\n><` };
  },
});

// ET — end transaction (save and close)
register({
  pattern: /^ET$/,
  stages: ["REVIEW", "CONFIRMED"],
  stageWarning: "** NO PNR DATA TO END\n><",
  parse: () => ({}),
  execute: (data, store) => {
    const missing = store.getMissingPrint();
    if (missing.length > 0) {
      return { response: `** CANNOT END - MISSING: ${missing.join(", ")}\n><` };
    }
    return { response: store.endTransaction("terminal") };
  },
});

// IR — ignore and retrieve
register({
  pattern: /^IR$/,
  stages: "*",
  parse: () => ({}),
  execute: (data, store) => {
    const locator = store.servicing?.activeLocator || store.pnr?.locator || null;
    store.resetBooking("terminal");
    if (!locator) return { response: "** NO PNR IN WORK AREA\n><" };
    const result = store.retrievePNR(locator, "terminal");
    return { response: result || `** RECORD NOT FOUND - ${locator}\n><` };
  },
});
