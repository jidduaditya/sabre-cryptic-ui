// Import session (must load before commands)
import "./session";
// Import all command modules (order matters — more specific first)
import "./commands/availability";
import "./commands/sell";
import "./commands/names";
import "./commands/contact";
import "./commands/ssr";
import "./commands/seatmap";
import "./commands/ticketing";
import "./commands/pnr";
import "./commands/pricing";
import "./commands/segments";
import "./commands/queues";
import "./commands/misc";
import "./commands/help";

export { dispatch, getPreview } from "./registry";
