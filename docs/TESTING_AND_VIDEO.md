# Test checklist, persistence test and video outline

## A. Persistence test (Firebase Console)
1. Register account A. Authentication → Users shows it. Firestore → `users/{uid}` exists (created by `ensureProfile`).
2. Play Level 1 and win. Firestore: `users/{uid}` (totalScore, unlockedLevel 2, completedLevels [1], achievements), `users/{uid}/progress/1`, `users/{uid}/gameSessions/…`, `leaderboard/{uid}`.
3. Refresh browser → dashboard still shows score/unlocks. Logout → login → same data.
4. Register account B → separate empty profile; leaderboard shows both names but no emails.
5. Try `/level/3` as A before unlocking → redirected to dashboard.

## B. Checklist (tick each)
Auth: [ ] register ok [ ] duplicate email message [ ] bad password message [ ] login/logout [ ] protected pages redirect.
Levels: [ ] L1 counting game [ ] wrong answer −1 life [ ] L2 flip/match/penalty [ ] L3 pattern [ ] L4 sorting [ ] final 3 stages [ ] each level unlocks next.
Hints: [ ] 2 Banana API puzzles per hint [ ] timer paused in modal [ ] wrong answer → new puzzle, no hint until both right [ ] API offline → error + Retry [ ] limits 5/4/2/1 enforced (button disables) [ ] hint content fits game.
Timer/restart: [ ] countdown, red warning ≤10s [ ] reaching 0 ends attempt [ ] restart confirm, resets timer/lives/score, no double timer.
Data: [ ] replay doesn't double total score [ ] profile edit saves [ ] leaderboard sorted [ ] second user separate.
Errors: [ ] offline Banana API → Retry [ ] wrong Firestore rules show friendly message.
UI: [ ] mobile width [ ] fruit rain doesn't block clicks [ ] reduced-motion setting hides it.
Rules test: Firestore → Rules → *Rules Playground*: simulate an unauthenticated read of `/users/x` (should deny) and an authenticated read of another uid's doc (deny).

## C. 10-minute video outline
1. (0:00) Intro + demo of game (1.5 min).
2. Version control (2 min): `git log --oneline --graph`, branches, a merge, GitHub page.
3. Event-driven programming (2 min): `Login.jsx submit`, `HintModal submit`, `FruitMemoryGame flip`, `FruitCountingGame pick`, `Level.jsx hintEarned/stageDone`, `onAuthStateChanged` in `useAuth.jsx`, Enter-key handlers. Explain event → handler → setState → re-render.
4. Interoperability (2.5 min): `bananaApi.js` request/JSON/validation/failure handling, shown through the Hint challenge (Network tab); Firebase SDK calls in `progressService.js` and the Firestore Console.
5. Virtual identity (2 min): Auth account vs `users/{uid}`, UID in paths, two accounts, rules denying cross-access (Rules Playground).
6. (0:10) Limits: cheating cannot be fully prevented without Cloud Functions; AI-assistance disclosure.
