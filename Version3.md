# Cryptic UI — Version 3

## What Changed (V2 → V3)

Complete visual overhaul, 9 bug fixes from PM user testing, mandatory GDS PNR flow enforcement, and new navigation features. The app was rebranded from "Sabre Mosaic" to "Cryptic UI".

---

## Visual Overhaul: Editorial Theme

### Split Aesthetic (Option B)
- **Left (Terminal)**: Unchanged — dark GDS green theme, monospace font, authentic cryptic feel
- **Right (Panels)**: Magazine editorial theme — warm, premium, high-contrast

### Editorial Design Tokens (`E` object in `tokens.js`)
| Token | Value | Usage |
|-------|-------|-------|
| `E.bg` | `#F2EFE9` | Warm cream background |
| `E.text` | `#1A1917` | Near-black body text |
| `E.accent` | `#C41E3A` | Crimson accent (buttons, links, highlights) |
| `E.border` | `#D8D4CC` | Warm gray grid lines |
| `E.green` | `#1A7A42` | Confirmation/success |
| `E.muted` | `#7A756B` | Secondary text |
| `E.surface` | `#EDEAE3` | Input backgrounds, cards |

### Typography
- **Headers**: Georgia, serif (editorial feel)
- **Body**: system-ui, -apple-system, sans-serif (`eSans`)
- **Code/data**: Monospace (`mono`)

### Card → Grid-Line Conversion
All panels replaced `borderRadius` + `background` card patterns with `borderBottom` grid-line dividers for a cleaner editorial look.

---

## Architecture Changes

### State Management (V2 → V3)
- **V2**: `useReducer` in App.jsx with workspace modes
- **V3**: Zustand 5 store (`bookingStore.js`) with 12-stage state machine

### Stage Machine
```
IDLE → SEARCHING → AVAILABILITY → SELLING → PASSENGER_ENTRY →
CONTACT_ENTRY → SSR_ENTRY → SEAT_SELECTION → TICKETING →
REVIEW → CONFIRMED → SERVICING
```

### Mandatory PNR Flow (PRINT Elements)
PNR is only generated on explicit ER/ET. Requires all 5 PRINT elements:
1. **P** — Phone (AP command / Contact panel)
2. **R** — Received From (RF command / Ticketing panel)
3. **I** — Itinerary (SS command / Sell fare)
4. **N** — Name (NM command / Passenger panel)
5. **T** — Ticketing time limit (TKTL command / Ticketing panel)

### Soft PNR
Draft PNR locator generated when all 5 PRINT elements complete. Shows in TopBar with dashed border and "(draft)" label. Real locator assigned only on ER/ET.

### Bidirectional Sync
Terminal ↔ UI sync via `_pendingEcho` + source tagging pattern. Every UI action echoes the equivalent GDS command to the terminal. Every terminal command updates the visual panels.

---

## Bug Fixes (9 Items)

### BUG 1 — No flights found = dead end
- **Before**: Empty availability list, no escape
- **After**: "No Flights Found" message with "Search Again" button and "Enter Segment Manually" form
- **Files**: `AvailPanel.jsx`, `bookingStore.js`, `sell.js`
- **New**: Long-sell command `0AA101Y12JUNBOMJFKNN1` for manual segment entry

### BUG 2 — Phone country code unclear
- **Before**: Raw IATA city code text input (DEL, BOM)
- **After**: Country code dropdown showing "India (IN)", "United States (US)", etc.
- **Files**: `ContactPanel.jsx`

### BUG 3 — Seat map unreadable
- **Before**: Small dots (●, ×) on light theme, no labels
- **After**: Larger seats (32×28), letters inside squares, hover tooltips, cabin header bars with class/config/rows, pax names in assigned seats banner
- **Files**: `SeatMapPanel.jsx`

### BUG 4 — Unlimited seat selection
- **Before**: No cap check, allowed infinite seat assignments
- **After**: `paxCount` enforcement, click-to-deselect, dimmed seats when cap reached, counter showing `{n}/{paxCount}`
- **Files**: `bookingStore.js`, `SeatMapPanel.jsx`

### BUG 5 — PNR not visible until ER
- **Before**: Locator null throughout booking flow
- **After**: Soft PNR draft locator generated when all 5 PRINT elements complete, visible in TopBar
- **Files**: `bookingStore.js`, `TopBar.jsx`

### BUG 6 — Review screen crashes
- **Before**: Missing null checks caused React render crash, ErrorBoundary showed "Something went wrong"
- **After**: Inline PRINT status computation (no store method in selector), null guards on booking data, ErrorBoundary wrapper in App.jsx
- **Files**: `ReviewPanel.jsx`, `App.jsx`, `bookingStore.js`

### BUG 7 — paxCount not enforced on name entry
- **Before**: `addPassenger` had no cap, unlimited names
- **After**: Guard in store + terminal (`NM` command) rejects when `passengers.length >= paxCount`
- **Files**: `bookingStore.js`, `PassengerPanel.jsx`, `names.js`

### FEATURE 1 — No way back to home
- **Before**: No reset button outside CONFIRMED stage
- **After**: "NEW SEARCH" button in TopBar with confirmation flow, Escape key shortcut
- **Files**: `TopBar.jsx`, `App.jsx`

### FEATURE 2 — ET (End Transaction) functional
- **Before**: ET returned static text, no state change
- **After**: ET saves PNR, resets to IDLE, shows retrieval banner in SearchPanel. Both `E` and `ET` commands wired up.
- **Files**: `bookingStore.js`, `misc.js`, `pnr.js`, `ReviewPanel.jsx`, `SearchPanel.jsx`

---

## New Features

### Clickable Stage Bar
- Completed stages (green, underlined) are clickable to navigate back
- After PNR exists (soft or confirmed), all stages become clickable
- State fully preserved when navigating — passengers, contact, seats, etc. stay in memory
- `navigateToStage` action in store changes stage without resetting data

### PNR Snapshot Persistence
- ER and ET save PNR snapshots to the `PNRS` data store
- Previously generated PNRs can be retrieved with `*{LOCATOR}` after ET resets to IDLE
- "Retrieve" button on ET banner in SearchPanel

### New Terminal Commands
| Command | Description |
|---------|-------------|
| `0AA101Y12JUNBOMJFKNN1` | Long-sell (manual segment entry) |
| `ET` | End Transaction (save + close) |
| `E` | End Transaction (alias) |
| `I` | Ignore (reset booking) |

### Phone Contact — Country Codes
Dropdown with 10 country codes: IN, US, UK, AE, SG, DE, FR, AU, CA, JP

### IATA City Database
19 cities for search dropdowns: DEL, BOM, JFK, LHR, DXB, SIN, FRA, CDG, HKG, NRT, SYD, DOH, MAA, BLR, HYD, CCU, LAX, ORD, NYC

---

## File Structure

```
sabre-mosaic-v2/
├── index.html
├── package.json
├── vite.config.js
├── Version3.md
├── src/
│   ├── main.jsx
│   ├── App.jsx                     — Root layout, ErrorBoundary, Escape key handler
│   ├── tokens.js                   — C (terminal) + E (editorial) design tokens
│   ├── store/
│   │   └── bookingStore.js         — Zustand store, 12-stage state machine, all actions
│   ├── components/
│   │   ├── CrypticPanel.jsx        — Terminal input/output, command history
│   │   ├── DragDivider.jsx         — Draggable split pane divider
│   │   ├── StageBar.jsx            — Clickable stage breadcrumb bar
│   │   ├── TopBar.jsx              — App header, New Search, PNR locator badge
│   │   ├── panels/
│   │   │   ├── SearchPanel.jsx     — Flight search form, pax count, ET banner
│   │   │   ├── AvailPanel.jsx      — Flight list, fare tiers, empty state, manual sell
│   │   │   ├── PassengerPanel.jsx  — Name entry with paxCount cap
│   │   │   ├── ContactPanel.jsx    — Phone (country code dropdown) + email
│   │   │   ├── SSRPanel.jsx        — Meal preference selection per passenger
│   │   │   ├── SeatMapPanel.jsx    — Interactive seat grid, cabin headers, tooltips
│   │   │   ├── TicketingPanel.jsx  — TTL, Received From, Frequent Flyer
│   │   │   ├── ReviewPanel.jsx     — PRINT checklist, ER/ET buttons, PNR summary
│   │   │   ├── ConfirmedPanel.jsx  — PNR success display, retrieve/new booking
│   │   │   └── ServicingPanel.jsx  — PNR servicing (post-retrieval modifications)
│   │   └── primitives/
│   │       ├── Tag.jsx
│   │       └── Dividers.jsx
│   ├── engine/
│   │   ├── index.js                — Command module imports + re-exports
│   │   ├── registry.js             — register() + dispatch() + getPreview()
│   │   ├── matchers.js             — exact(), prefix(), regex() helpers
│   │   ├── preview.js              — Command preview/autocomplete
│   │   └── commands/
│   │       ├── availability.js     — AN search
│   │       ├── sell.js             — SS short sell, long sell (0-prefix)
│   │       ├── names.js            — NM name entry (with paxCount guard)
│   │       ├── contact.js          — AP phone, PE email
│   │       ├── ssr.js              — 3VGML/MOML meal SSRs
│   │       ├── seatmap.js          — 4G seat commands
│   │       ├── ticketing.js        — 7TAW TTL, 6RF received from
│   │       ├── pnr.js              — ER, E, I, *locator, *R, *A, *I, *N, *T, *B
│   │       ├── pricing.js          — WP price itinerary
│   │       ├── segments.js         — X cancel, WC class change
│   │       ├── queues.js           — QP queue place
│   │       ├── misc.js             — ET, IR, remarks, encode/decode
│   │       └── help.js             — HELP, ?
│   ├── data/
│   │   ├── flights.js              — 4 flights (AA, EK, AI, LH) with fares
│   │   ├── pnrs.js                 — 2 mock PNRs + runtime-saved PNRs
│   │   ├── seatmap.js              — 777-300ER: Business (2-3-2) + Economy (3-4-3)
│   │   ├── fares.js                — Fare quote builder
│   │   └── iata.js                 — 19 IATA city codes
│   └── demo/
│       ├── GuidedTour.jsx          — Demo overlay with captions
│       └── sequence.js             — Auto-play demo sequence
```

---

## Run

```bash
cd sabre-mosaic-v2
npm run dev
```

## Deploy

```bash
cd sabre-mosaic-v2
npx vercel --prod
```

**Live URL**: https://cryptic-ui.vercel.app

---

## Commit History (V3)

| SHA | Description |
|-----|-------------|
| `598026d` | Change phone field from IATA city codes to country codes |
| `c58d82f` | Remove auto-commit — enforce mandatory GDS PNR flow |
| `fba39cc` | Editorial theme + 9 bug fixes + clickable stages |
| `3cd7317` | Rename to Cryptic UI |
| `8ab214e` | Rebrand from Sabre to Cy, update favicon |

---

## Key Differences from V1

| Aspect | V1 | V3 |
|--------|----|----|
| **State** | `useReducer` with workspace modes | Zustand 5 store with 12-stage machine |
| **Theme** | Dark cyan on black (both sides) | Split — dark terminal + editorial panels |
| **PNR Flow** | No structured flow | Mandatory 5-element PRINT → ER/ET |
| **Navigation** | Mode-based, no breadcrumbs | Clickable stage bar with back/forward |
| **Seat Map** | Small dots, no labels | Full grid with letters, tooltips, cabin headers |
| **Error Handling** | None | ErrorBoundary, null guards, stage guards |
| **Phone Input** | Free text | Country code dropdown (IN, US, UK, etc.) |
| **Empty States** | Dead ends | "No flights" with manual sell, reset buttons |
| **PNR Visibility** | Only after ER | Soft PNR draft shown when PRINT complete |
| **ET Command** | Static text response | Functional — saves PNR, resets, shows banner |
