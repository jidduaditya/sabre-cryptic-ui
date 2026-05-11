import { register } from "../registry";

const HELP_TOPICS = {
  AN: "AVAILABILITY:\n AN{DATE}{ORIGIN}{DEST}  e.g. AN12JUNBOMJFK\n AN{DATE}{ORIGIN}{DEST}{AL}  e.g. AN12JUNBOMJFKAA\n 1*  More availability\n 1*OA  Original availability\n 1*R  Redisplay",
  SS: "SELLING:\n SS{N}{CLS}{LINE}  e.g. SS1Y1\n 0{N}{CLS}{LINE}   e.g. 01Y1\n Long sell: 0AA101Y12JUNBOMJFKNN1",
  NM: "NAMES:\n NM1{LAST}/{FIRST} {TITLE}  e.g. NM1SHARMA/RAJESH MR\n NM3{LAST}/{FIRST} {TITLE} {FIRST2} {TITLE2}",
  WP: "PRICING:\n WP  Price as booked\n WPNC  Lowest available fare\n WPNI  Lowest fare, alternate flights\n PQ  Retain price\n *PQ  Display stored fares",
  Q: "QUEUES:\n QC/  Queue count\n Q/{N}  Access queue\n QP/{N}  Queue place\n QXI  Exit queue\n QA/  Queue analysis",
  "4G": "SEATS:\n 4G{SEG}*  Display seat map\n 4G{SEG}/{SEAT}-{PAX}  Assign seat\n 4GX{SEG}  Cancel seats\n 4GXALL  Cancel all seats\n *B  Display booked seats",
  "7T": "TICKETING:\n 7TAW{DATE}/  Ticket time limit\n 7TAW/  Same day TTL",
  "3": "SSR:\n 3{CODE}{SEG}-{PAX}  e.g. 3VGML1-1.1\n DU*/SPM  Display meal codes\n Codes: VGML MOML KSML HSML AVML",
  ER: "END/IGNORE:\n E  End transaction\n ER  End and retrieve\n I  Ignore\n IR  Ignore and retrieve",
  FF: "FREQUENT FLYER:\n FF{AL}{NUM}-{PAX}  e.g. FFAA123456-1.1\n *FF  Display FF numbers",
};

// HELP or ?
register({
  pattern: /^(HELP|\?)$/,
  stages: "*",
  parse: () => ({}),
  execute: () => {
    let out = "** SABRE FORMAT FINDER **\n";
    out += "TOPICS: AN  SS  NM  WP  Q  4G  7T  3  ER  FF\n";
    out += "TYPE HELP {TOPIC} FOR DETAILS\n\n";
    out += "QUICK REFERENCE:\n";
    out += " AN12JUNBOMJFK    Availability\n";
    out += " SS1Y1            Sell 1 seat Y class line 1\n";
    out += " NM1LAST/FIRST MR Add passenger\n";
    out += " 9DEL 999999-M    Add phone\n";
    out += " 7TAW14JUN/       Ticket time limit\n";
    out += " 6NAME            Received from\n";
    out += " ER               End and retrieve\n";
    out += " *LOCATOR         Retrieve PNR\n";
    out += " WP               Price itinerary\n";
    out += " 4G1*             Seat map\n";
    out += " QC/              Queue count\n";
    out += "><";
    return { response: out };
  },
});

// HELP AN, HELP SS, etc.
register({
  pattern: /^HELP\s+(.+)$/,
  stages: "*",
  parse: (m) => ({ topic: m[1].trim() }),
  execute: (data) => {
    const help = HELP_TOPICS[data.topic];
    if (help) return { response: `** HELP: ${data.topic} **\n${help}\n><` };
    return { response: `** NO HELP FOR: ${data.topic}\nAVAILABLE: ${Object.keys(HELP_TOPICS).join("  ")}\n><` };
  },
});
