# tonikRacer

Real-time multiplayer typing competition. Multiple players race to type the same sentence — live progress, WPM and accuracy sync across all connected clients instantly.

**[Live demo →](https://tonik-typeracer.vercel.app)**

---

## Stack

- **Next.js 15** — App Router, TypeScript
- **Firebase Realtime Database** — live race state (player positions, WPM, round timer)
- **Firestore** — persistent player stats between sessions
- **Tailwind CSS + shadcn/ui** — UI
- **TanStack Table v8** — sortable, paginated competitors table
- **nuqs** — URL-synced table sort state (survives page refresh)
- **Zod** — player name validation
- **Vitest** — unit tests for game logic

---

## Approach

Priority was getting something live and playable fast. Once the MVP was running — real-time sync working, rounds advancing, players visible across tabs — shifted to debugging and polish. Ship first, fix after.

---

## Key decisions

**RTDB vs Firestore split**
RTDB handles every keystroke (high frequency, sub-100ms latency). Firestore stores end-of-round stats — written once per round, read rarely. Different access patterns warrant different tools.

**Round transition race condition**
Every connected client detects round end simultaneously via the timer. Solved with `runTransaction` on the `/game` node — Firebase guarantees only one write wins, the rest abort. Without this multiple clients would write conflicting new rounds.

**Player session persistence**
`onDisconnect` marks the player inactive server-side when a tab closes or refreshes — no client involvement needed. Problem discovered: on refresh the name modal is skipped (name in localStorage) so the player never gets re-written to RTDB. Fixed by calling `writePlayerToRTDB` on mount when a saved name is found.

**WPM and accuracy**
WPM counts only fully correct words — a single typo in a word zeroes it out, matching the standard typeracer convention. Arena progress is based on the longest correct character prefix, so errors stop the car rather than advancing it.

**Architecture**
Logic lives in custom hooks (`useTyping`, `useGameState`, `usePlayers`, `usePlayerSession`), components only render. Makes each piece testable and replaceable independently.

---

## Running locally

```bash
cp .env.local.example .env.local
# fill in Firebase credentials
npm install
npm run dev
```

```bash
npm run test   # 22 unit tests
```

---

## What AI assisted with

Config files and boilerplate (Next.js, Tailwind, Vitest setup), shadcn/ui component wiring, basic HTML scaffolding of UI components.

Architecture decisions, data modelling, the real-time sync strategy, transaction logic, WPM/accuracy calculations, player session handling, lobby mechanic and debugging were prototyped and refined by hand.

---

## What I'd add next

- **Cloud Functions** for round management — move transaction logic server-side, remove client-side coordination entirely
- **Rate limiting** on player writes to RTDB
- **Rooms** — separate game sessions with invite links instead of one global instance
- **Playwright e2e tests** covering multi-tab race scenarios
