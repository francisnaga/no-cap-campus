<p align="center">
  <img src="public/nocap-mark.svg" alt="NO CAP Brand Mark" width="100" height="100" />
</p>

<h1 align="center">NO CAP</h1>

<p align="center">
  <strong>Campus multiplayer social gaming platform for Nigerian university students.</strong>
</p>

---

# NO CAP  -  Campus Social Gaming Platform

**“Your people. Your score. Your campus.”**

NO CAP is a mobile-first campus gaming platform designed for Nigerian university students (starting with Nigerian Maritime University circles). It combines quick 2-minute daily challenges, private friend circles, and live multiplayer party games.

---

## 🚀 Key Features

1. **Daily Showdown (Habit Loop)**
   - 2-minute challenge with 3 stages: *Campus Quickfire*, *Real or Fake Course?*, and *Campus Read / Majority Dilemma*.
   - Canonical time in `Africa/Lagos` timezone.
   - Authoritative scoring (30 max points, 10 per stage) with idempotent submissions.
   - Consecutive-day streak tracking.
   - WhatsApp-friendly result cards with 1-click sharing.

2. **Private Circles (Immediate Squad Play)**
   - Friends, roommates, or classes can create a circle with a 6-character code (e.g. `HT4MUH`).
   - Private daily leaderboard with exact participation counts.
   - Does not require university-wide adoption to be fully competitive.

3. **Live Multiplayer Party Games**
   - **Undercover**: Social deduction with Civilian vs Undercover roles, secret words, private viewing toggles, clue turns, voting, and elimination logic.
   - **Who Said That?**: Anonymous answers to campus prompts, author guessing, and bonus points for fooling friends.
   - **Most Likely To**: Campus scenario voting with consensus reveals and podiums.
   - **Campus & Naija Quiz**: Real-time trivia on maritime navigation, grading scales, and Nigerian student culture.
   - Real-time updates via Server-Sent Events (SSE) with fallback polling across devices.
   - Secret information isolation: hidden words and answer keys are never leaked to public room state.

4. **Honest Rankings & Moderation**
   - Scopes: Personal, My Circles, Level (e.g. 300L), Department (e.g. Marine Engineering), and University-Wide.
   - True sample sizes and provisional badges when cohort counts are below minimum thresholds.
   - Report modal for offensive prompts, nicknames, or room abuse.

---

## 🛠 Tech Stack

- **Client**: React 19 + TypeScript, Tailwind CSS v4, Lucide icons, Motion.
- **Server**: Node.js + Express 4.21 with `vite.middlewares` in development (`server.ts`).
- **Data & State**: Persistent atomic JSON database (`.data/db.json`), SSE room state synchronization.
- **AI Content**: Server-side `@google/genai` integration using `GEMINI_API_KEY` for candidate pack generation and witty commentary (with reviewed seed fallbacks).
- **Unit Testing**: Native `node:test` and `node:assert/strict` (`npm test`).

---

## 🧪 Testing & Verification

- **Run Unit Tests**:
  ```bash
  npm test
  ```
  Runs 10 unit tests verifying role distribution, Undercover win conditions, vote tie handling, author fooling points, Daily Showdown stage scoring, and Africa/Lagos calendar streak calculations.

- **Multiplayer Simulation**:
  To simulate multiple players locally or in automated testing:
  ```bash
  curl -X POST http://localhost:3000/api/auth/guest -H "Content-Type: application/json" -d '{"userId": "guest_amina", "nickname": "Amina_Naut", "avatarKey": "captain"}'
  curl -X POST http://localhost:3000/api/rooms/join -H "Content-Type: application/json" -d '{"userId": "guest_amina", "code": "<ROOM_CODE>"}'
  ```
