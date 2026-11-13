# 🍌 Banana Adventure Quest

React + Vite + Firebase (Authentication + Cloud Firestore) browser game for CIS046-3 Software For Enterprise.
Two fruit levels plus a final Apple Forest level, hints earned by solving two Banana API puzzles, timers, lives, achievements, profile and leaderboard.

> **Honest status (read first)**
> - This code was written by an AI (Claude) in an environment **without internet access**. It was **never installed, built, run, or deployed**, and Firebase / Netlify were never touched. Everything below is *to be verified by you*, using the test checklist in `docs/TESTING_AND_VIDEO.md`. Expect to fix small typos or version issues.
> - **Banana API contract is UNVERIFIED.** The official doc page blocked automated reading. The Banana API is used for the **hint challenge**. `src/services/bananaApi.js` uses `GET https://marcconrad.com/uob/banana/api.php` → JSON `{question: <image URL>, solution: <digit>}` from memory. **Open https://marcconrad.com/uob/banana/doc.php yourself and compare.** If anything differs, change only that one file. Also check the browser console for CORS errors; if CORS blocks it, tell me (the doc/terms decide whether a proxy is allowed).
> - **No Cloud Functions** are used (they need the paid Blaze plan). Scores are validated only by Firestore Security Rules (see "Security & cheating limits").

## 1. Features
Welcome, register/login/logout, dashboard with progress, 4 levels + final challenge, hint challenge, restart with confirmation, countdown timers, lives, scoring, achievements, profile page (edit name/avatar), leaderboard, falling-fruit background (respects reduced motion), responsive dark-green/gold/banana-yellow design.

## 2. Levels
| Level | Game | Timer | Lives | Hints/attempt | Banana API puzzles per hint |
|---|---|---|---|---|---|
| 1 Banana Jungle | Odd-one-out (6 rounds) | 1:30 | 2 | 2 | 1 |
| 2 Orange River | Hard fruit patterns (4 rounds, 5 choices, 4 pattern types) | 1:00 | 2 | 2 | 2 |
| Final: Apple Forest | Memory match, **16 cards** (8 pairs); wrong pair = −1 life | 1:30 | 4 | 2 | 3 |

Hint numbers are **per attempt** (shown in the UI). All numbers live in `src/config/gameConfig.js` (`hintPuzzles` = Banana API puzzles needed for one hint).

**Hint rules:** Hint button → timer pauses → rules screen → solve N real Banana API puzzles in a row (N = 1, 2 or 3 depending on the level) → a `useRef` guard stops double awards → a wrong answer shows feedback and fetches a new puzzle for that question (unlimited retries; solved puzzles are kept) → Cancel = no hint. If the API is down you see an error + Retry and no hint is given. Hint effects: L1 fades out 3 wrong cells, L2 explains the rule then crosses out wrong choices, Final shows every card face-up for 2 seconds.

**Restart:** confirmation dialog → the level component is re-mounted (new key), so timer, lives, run score and hints reset and no duplicate intervals exist. Saved best scores/achievements are untouched.

**Scoring policy:** run score = task points + time bonus (2/sec, max 250) + 50 per life left, capped at 1000. **Total score = sum of your best score per level**, so restarting/replaying can never add the same points twice (only improvements count). Timer reaching 0 = attempt lost (no points saved, session recorded).

## 3. Structure (and changes from your suggested layout)
```
src/  App.jsx main.jsx
  components/ Navbar FruitRain HintModal ProtectedRoute SessionGuard LoadingSpinner
  pages/ Welcome Login Register Dashboard Profile Leaderboard Level Completion
  games/ OddOneOutGame FruitSequenceGame FruitMemoryGame (+ FruitCountingGame, FruitSortingGame kept but unused)
  services/ bananaApi authService sessionService noticeService profileService progressService leaderboardService
  firebase/firebase.js   hooks/useAuth.jsx useTimer.js   config/gameConfig.js   styles/global.css games.css
firestore.rules firestore.indexes.json firebase.json netlify.toml .env.example .gitignore
```
Changes: one generic `Level.jsx` replaces Level1–4 (all levels share timer/lives/hints logic, driven by config); timer is a hook + HUD inside `Level.jsx` (no separate `Timer.jsx`); `useAuth.jsx` (needs `.jsx` because it contains JSX); `auth.css/dashboard.css` merged into `global.css`; achievements stored as an array in the user document rather than a subcollection (simpler, fewer reads).

## 4. Install and run (Windows + VS Code)
1. Install **Node.js LTS** from https://nodejs.org (accept defaults). Open a new terminal and check: `node -v` and `npm -v`.
2. Unzip the project, open the folder in VS Code (File → Open Folder), open Terminal (Ctrl+`).
3. `npm install`
4. Create Firebase (section 5), then copy `.env.example` to `.env` and fill it in.
5. `npm run dev` → open the printed `http://localhost:5173`. **After editing `.env`, stop (Ctrl+C) and run `npm run dev` again.**

## 5. Firebase setup (do in this order)
**A. Project** – https://console.firebase.google.com → sign in with Google → *Create a project* (or *Add project*) → name `banana-adventure-quest` → Google Analytics is **not needed**; turn it off → *Create project* → *Continue*.

**B. Web app** – Project overview → click the **`</>` Web** icon → nickname `banana-web` → leave "Firebase Hosting" unticked → *Register app*. Copy the `firebaseConfig` values into `.env` (`apiKey`→`VITE_FIREBASE_API_KEY`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`). (Later: Project settings → General → Your apps.) These values identify your project and are **public by design** (anything with `VITE_` is shipped to the browser). **Never** put service-account JSON keys or Admin SDK credentials in the project; this app never needs them.

**C. Authentication** – Build → *Authentication* → *Get started* → *Sign-in method* → **Email/Password** → Enable → Save. Test: register in the app, then Authentication → *Users* shows the account. (Email verification is *not* implemented.)

**D. Firestore database** – Build → *Firestore Database* → *Create database* → choose a **location near you** (cannot be changed later) → choose **Production mode** (locked down; our rules open exactly what is needed — never leave test mode on) → Create.

**E. Rules** – Firestore → *Rules* tab → delete everything → paste the contents of `firestore.rules` → *Publish*. Rules take ~1 min to apply.

**Collections are created automatically** when the app writes the first document; you don't create them by hand. Data model:
```
users/{uid}                       profile + totals + unlockedLevel + completedLevels[] + achievements[]   (private)
users/{uid}/progress/{levelId}    bestScore, bestTimeLeft, timesCompleted, hintsUsed                      (private)
users/{uid}/gameSessions/{id}     one record per finished attempt (append-only)                           (private)
sessions/{uid}                    newest sign-in time + device (single-session control)                    (private)
leaderboard/{uid}                 displayName, avatar, totalScore, levelsCompleted (no email)            (public to signed-in users)
```
Terms: a *collection* is a folder, a *document* is a record in it (ID = the player's UID), *fields* are its values, a *subcollection* is a collection inside a document. Pros: private data separated from public leaderboard, simple security rules. Cons: leaderboard fields are duplicated; no server-side aggregation.

**Authentication vs Firestore:** Authentication only proves *who* the player is (email, password, UID). Firestore stores *what they did*. Creating an Auth account does **not** create a `users/{uid}` document; `ensureProfile()` in `profileService.js` does that on first sign-in. Check both places in the Console.

## 5b. Tokens and session control
- **User tokens:** Firebase Authentication gives each login a signed **ID token (JWT)** that the SDK attaches to every Firestore request and renews automatically (about hourly). `getTokenInfo()` in `authService.js` reads it; the Profile page shows sign-in time, issue/expiry time and provider, with a *Refresh token* button. `progressService.js` calls `getIdToken()` before saving a run.
- **Remember me:** unticked = login ends when the tab closes (`browserSessionPersistence`); ticked = survives browser restarts (`browserLocalPersistence`).
- **Idle timeout:** `components/SessionGuard.jsx` signs the player out after 15 minutes without mouse/keyboard/touch activity, with a 60-second warning. **Maximum session:** 8 hours. Numbers are in `src/config/sessionConfig.js`.
- **One active device:** `services/sessionService.js` stores the newest sign-in time in `sessions/{uid}`. An older sign-in on another device notices (Firestore listener) and signs itself out. Rules stop an older session overwriting a newer one.
- **Honest limits:** these checks run in the browser. A determined user could bypass them locally; true token revocation needs the Firebase Admin SDK on a server (Cloud Functions).

## 6. Security & cheating limits
- Rules (`firestore.rules`): you can only read/write your own `users/{uid}` tree; profile creation must start at zero; only listed fields may change; score/unlock/achievement fields can only move by bounded steps (≤1000 points, ≤1 level); a level can only be written if already unlocked; sessions are append-only; the leaderboard entry must equal your own profile totals and contains no email.
- **Honest limit:** a browser game cannot be cheat-proof. Someone with dev-tools and their own login could still write *plausible* values (e.g. +1000 points) within these bounds. Real protection needs trusted server code (Cloud Functions, Blaze plan) that runs the scoring. For this assignment, explain this limitation in your video.
- Hiding a route is not security; the rules are.

## 7. Banana API test
1. Open `https://marcconrad.com/uob/banana/api.php` in a browser tab; you should see JSON. Compare with the official doc.
2. In the running game press **Hint** → Start, open DevTools → Network, filter "banana", confirm a 200 response; the puzzle image should show. Turn off Wi-Fi to see the friendly error + Retry button. If you see a CORS error in the Console, the API may not permit browser calls.

## 8. Troubleshooting
`Missing Firebase settings` → `.env` missing/misnamed or dev server not restarted. `permission-denied` → rules not published, or Firestore not created. `auth/operation-not-allowed` → Email/Password not enabled. Blank page after Netlify deploy → env variables missing in Netlify. 404 on refresh → `netlify.toml` not committed. Level won't open → previous level not completed (by design).

## 9. Academic integrity & attribution
- Code was **generated with AI assistance (Claude, Anthropic)** and not tested by the author at generation time. Disclose this in your submission as your university requires, and be ready to explain: `useTimer.js`, `Level.jsx` (finish/save flow), `HintModal.jsx` + `bananaApi.js` (API challenge), `progressService.js` (transaction), `firestore.rules`.
- External API: Banana API (Marc Conrad, University of Bedfordshire) — https://marcconrad.com/uob/banana/doc.php. Check its terms of use.
- Libraries (MIT/Apache): React, React Router, Vite, Firebase JS SDK. Font: Fredoka (SIL OFL) via Google Fonts. Fruit graphics are Unicode emoji (rendered by your OS font); no copyrighted game assets used.
