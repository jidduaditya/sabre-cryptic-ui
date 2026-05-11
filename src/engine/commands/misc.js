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

// ET — end transaction
register({
  pattern: /^ET$/,
  stages: "*",
  parse: () => ({}),
  execute: () => ({ response: "END OF TRANSACTION\n><" }),
});

// IR — ignore and retrieve
register({
  pattern: /^IR$/,
  stages: "*",
  parse: () => ({}),
  execute: (data, store) => ({ response: store.resetBooking("terminal") }),
});
