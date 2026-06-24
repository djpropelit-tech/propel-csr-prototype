# Propel CSR App — Clickable Prototype (runnable project)

This is the same clickable prototype you've been testing as a Claude
artifact — packaged as a real, standalone Vite + React project so you can
run it locally, host it on your own infrastructure, or hand it to a
developer to extend.

It is still a **UI-only simulation**: all data (events, needs, budgets,
employee master) lives in React state and resets on every page refresh.
Nothing is saved to a real database. See the `propel-csr-backend` package
for the real API/DB layer this would eventually connect to.

## Tech stack

- React 18 (Hooks, no router — single-file screen switching by local state)
- Vite (dev server + build tool)
- Tailwind CSS (utility classes + Propel brand color tokens)
- lucide-react (icons)
- Recharts (Management dashboard charts)

## Run it locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173/propel-csr-prototype/dist/`. Edit `src/App.jsx` and it hot-reloads.

On a phone-sized viewport (or a real phone on the same Wi‑Fi during dev), the app runs full-screen. On desktop, the phone-frame demo layout is still shown at wider breakpoints.

## Share on office intranet (mobile testing)

Build and serve via WAMP on this machine:

```bash
npm run build
```

1. Start **WAMP** and click **Put Online** (allows other PCs on the LAN to connect).
2. Allow **port 80** through Windows Firewall for private networks if prompted.
3. Share this URL with testers on the office Wi‑Fi/LAN:

   **http://172.16.20.102/propel-csr-prototype/dist/**

Testers open the link in Chrome or Safari on their phone, tap **Continue** on the login screen, and use the role switcher to try Volunteer / CSR Team / Management. Data is demo-only and resets on refresh.

To add a home-screen icon: use the browser’s **Add to Home Screen** option (manifest is included).

After code changes, run `npm run build` again before sharing updates.

## Deploy to GitHub Pages (public internet)

The repo includes a GitHub Actions workflow that builds and publishes the app automatically.

### One-time setup on GitHub

1. Install [Git](https://git-scm.com/download/win) if you do not have it yet.
2. Create a new repository on GitHub named **`propel-csr-prototype`** (the name must match the `base` path in `vite.config.js`).
3. Push this project to that repo (see commands below).
4. On GitHub, open the repo → **Settings** → **Pages**.
5. Under **Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”).
6. After the first push to `main`, open **Actions** and wait for the “Deploy to GitHub Pages” workflow to finish.

Your public URL will be:

**https://YOUR-GITHUB-USERNAME.github.io/propel-csr-prototype/**

Replace `YOUR-GITHUB-USERNAME` with your GitHub username or organization name. Share that link — it works on phones and desktops over the internet with HTTPS.

### Push the project to GitHub (first time)

```bash
cd c:\wamp64\www\propel-csr-prototype
git init
git add .
git commit -m "Initial commit: Propel CSR mobile prototype"
git branch -M main
git remote add origin https://github.com/YOUR-GITHUB-USERNAME/propel-csr-prototype.git
git push -u origin main
```

### Build commands

| Command | Use for |
|---|---|
| `npm run build` | WAMP intranet (`/propel-csr-prototype/dist/`) |
| `npm run build:pages` | GitHub Pages (`/propel-csr-prototype/`) |
| `npm run preview:pages` | Test the GitHub Pages build locally before pushing |

If you rename the GitHub repo, update the `pages` base path in [`vite.config.js`](vite.config.js) to `"/your-repo-name/"`.

## Build for deployment

```bash
npm run build
```

Outputs a static site into `dist/` — deployable to any static host
(Netlify, Vercel, Azure Static Web Apps, an internal IIS/Nginx box, etc.).
No server runtime is required since there's no backend call in this build.

```bash
npm run preview   # serve the production build locally to sanity-check it
```

## Project structure

```
propel-csr-prototype/
├── index.html
├── src/
│   ├── main.jsx     ← React entry point
│   ├── App.jsx       ← the entire prototype (all 3 personas, all screens)
│   └── index.css     ← Tailwind directives
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

## Where to take this next

Open this folder in **Claude Code** and ask it to:
- Wire each screen's `useState` calls to real `fetch()` calls against the
  `propel-csr-backend` API, replacing the in-memory mock data
- Split `App.jsx` into separate component files (it's intentionally kept
  as one file for the Claude artifact preview, but a real codebase should
  break it up — Header, BottomNav, EventCard, each persona's screens, etc.)
- Add React Router if you want shareable URLs per screen
- Convert to React Native if the mobile app itself (not just a
  mobile-responsive web view) is the end goal
