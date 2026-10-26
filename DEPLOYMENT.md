# Git, GitHub and Netlify guide

## 1. Git basics (first time)
```bash
git --version                       # install from https://git-scm.com if missing
git config --global user.name  "Your Name"
git config --global user.email "you@example.com"
cd banana-adventure-quest
git init -b main
git add .
git status                          # confirm .env and node_modules are NOT listed
git commit -m "chore: initial Vite + React project with Firebase config"
```
Create an empty repo on https://github.com/new (name `banana-adventure-quest`, no README), then:
```bash
git remote add origin https://github.com/YOUR-USERNAME/banana-adventure-quest.git
git push -u origin main
```
## 2. Feature-branch workflow (for your "version control" video segment)
Only create a branch when you have work to commit on it. Example sequence (adapt to what you really change):
```bash
git switch -c feature/banana-api
#   ...edit src/services/bananaApi.js, test...
git add src/services/bananaApi.js
git commit -m "feat(api): verify Banana API contract and error handling"
git switch main
git merge feature/banana-api        # merge into main
git push origin main
git branch -d feature/banana-api    # optional tidy-up
```
Suggested branches: `feature/frontend-design` (CSS/UI), `feature/banana-api`, `feature/firebase-auth`, `feature/firebase-database` (rules, services), `feature/game-levels`, `feature/profile-leaderboard`, `feature/deployment`. Show `git log --oneline --graph` in your video.

Common errors: *"fatal: not a git repository"* → run inside the project folder. *"failed to push / rejected"* → `git pull origin main` first. *Merge conflict* → open the marked file, keep the right lines, delete `<<<<<<<`, `=======`, `>>>>>>>`, then `git add` and `git commit`. *Committed .env by mistake* → `git rm --cached .env`, commit, and rotate/regenerate nothing sensitive (these values are public config) but never commit service-account keys.

Never commit: `node_modules/`, `dist/`, `.env`, private keys, service-account JSON (all in `.gitignore`).

## 3. Netlify
Netlify builds the React app into static files in `dist/` and serves them; Firebase separately provides login and database.
1. Test locally first: `npm run build` must succeed; test all levels, login, profile, leaderboard.
2. https://app.netlify.com → sign up with GitHub → *Add new site* → *Import an existing project* → GitHub → pick the repo.
3. Build command `npm run build`, publish directory `dist` (pre-filled from `netlify.toml`).
4. *Site configuration → Environment variables* → add all six `VITE_FIREBASE_…` values from your `.env` (before the first deploy, or redeploy afterwards: *Deploys → Trigger deploy*).
5. Deploy; open the `https://….netlify.app` URL.
6. **Firebase for production:** Authentication → *Settings* → *Authorized domains* → add your `…netlify.app` domain (email/password sign-in may work without it, but add it anyway; it is required for redirect-based features such as OAuth/password-reset links). Confirm the rules from `firestore.rules` are published.
7. Test on the live URL: register, play Level 1, check Firestore Console, refresh `/profile` and `/level/1` (the redirect in `netlify.toml` stops 404s), log out/in, test on your phone.
8. Updating: edit → test → `git add .` → `git commit -m "..."` → `git push` → Netlify auto-builds → refresh and verify.

Not verified: no deployment was performed by the AI; "it works" only counts after you test the live site.

Deployed on Netlify from the main branch. Environment variables set in Netlify. Netlify domain added to Firebase Authorized domains. Google sign-in enabled.