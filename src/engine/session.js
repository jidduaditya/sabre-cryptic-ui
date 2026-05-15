import { PNRS } from "../data/pnrs";
import { SEATMAP } from "../data/seatmap";

// Deep-clone static data so mutations don't touch originals
const livePnrs = JSON.parse(JSON.stringify(PNRS));
const liveSeatmap = JSON.parse(JSON.stringify(SEATMAP));

export const session = {
  pnrs: livePnrs,
  seatmap: liveSeatmap,
  hasPnrContext: false,
};

export function setPnrContext(has) {
  session.hasPnrContext = has;
}

export function requirePnr() {
  if (!session.hasPnrContext) {
    return "NO ACTIVE PNR - RETRIEVE OR CREATE FIRST\n><";
  }
  return null;
}

export function resetSession() {
  session.hasPnrContext = false;
  Object.assign(session.pnrs, JSON.parse(JSON.stringify(PNRS)));
  Object.assign(session.seatmap, JSON.parse(JSON.stringify(SEATMAP)));
}
