// Boeing 777-300ER (77W) seat map
// Business: rows 1-8, 2-3-2 config (A C | D E G | J K)
// Economy: rows 20-45, 3-4-3 config (A B C | D E F G | H J K)

function generateCabin(rows, seats, occupancyRate) {
  const map = {};
  for (let r = rows[0]; r <= rows[1]; r++) {
    for (const s of seats) {
      const key = `${r}${s}`;
      map[key] = Math.random() < occupancyRate ? "X" : "O";
    }
  }
  return map;
}

// Pre-generate with fixed seed (deterministic for demo)
const BIZ_SEATS = ["A", "C", "D", "E", "G", "J", "K"];
const ECON_SEATS = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"];

const bizMap = {};
const econMap = {};

// Business: rows 1-8, ~30% occupied
const bizOccupied = new Set([
  "1A", "2C", "2D", "3G", "4K", "5A", "5E", "6D", "7J", "8C",
  "1G", "3A", "4E", "6K", "7D", "8A",
]);
for (let r = 1; r <= 8; r++) {
  for (const s of BIZ_SEATS) {
    const key = `${r}${s}`;
    bizMap[key] = bizOccupied.has(key) ? "X" : "O";
  }
}

// Economy: rows 20-45, ~40% occupied
const econOccupied = new Set([
  "20A","20B","20D","20E","20F","21C","21G","21H","22A","22B","22E","22F",
  "23D","23J","23K","24A","24B","24D","24G","25C","25E","25F","25H",
  "26A","26B","26D","26F","26J","27C","27E","27G","27K","28A","28D","28F",
  "29B","29E","29G","29J","30A","30C","30D","30F","30H","30K",
  "31B","31E","31G","32A","32D","32F","32J","33C","33E","33H",
  "34A","34B","34D","34G","34K","35C","35F","35H","35J",
  "36A","36E","36G","37B","37D","37F","37K","38A","38C","38E","38H",
  "39D","39F","39J","40A","40B","40E","40G","40K",
  "41C","41D","41F","41H","42A","42E","42G","42J",
  "43B","43D","43F","43K","44A","44C","44E","44H","44J",
  "45B","45D","45F","45G",
]);
for (let r = 20; r <= 45; r++) {
  for (const s of ECON_SEATS) {
    const key = `${r}${s}`;
    econMap[key] = econOccupied.has(key) ? "X" : "O";
  }
}

export const SEATMAP = {
  aircraft: "Boeing 777-300ER",
  equipment: "77W",
  cabins: [
    {
      name: "Business",
      cls: "J",
      rows: [1, 8],
      seats: BIZ_SEATS,
      aisles: [["C", "D"], ["G", "J"]], // aisle between these seat letters
      config: "2-3-2",
      map: bizMap,
    },
    {
      name: "Economy",
      cls: "Y",
      rows: [20, 45],
      seats: ECON_SEATS,
      aisles: [["C", "D"], ["G", "H"]],
      config: "3-4-3",
      map: econMap,
    },
  ],
};

export const BIZ_SEAT_LETTERS = BIZ_SEATS;
export const ECON_SEAT_LETTERS = ECON_SEATS;
