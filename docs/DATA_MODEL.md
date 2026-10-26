# Firestore data model

users/{uid}                     private profile, totalScore, unlockedLevel, completedLevels[], achievements[]
users/{uid}/progress/{levelId}  bestScore, bestTimeLeft, timesCompleted, hintsUsed
users/{uid}/gameSessions/{id}   one record per finished attempt (append-only)
leaderboard/{uid}               displayName, avatar, totalScore, levelsCompleted (no email)

Rules (firestore.rules): players can only read/write their own users/{uid} tree.
Score, unlock and achievement fields can only change in small bounded steps.
The leaderboard entry must match the player's own profile totals.
Limit: a browser game cannot be fully cheat-proof without server-side code.