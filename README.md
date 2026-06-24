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

## Deploy to Netlify (public internet)

Netlify is simpler than GitHub Pages — connect your Git repo and it builds and hosts automatically with HTTPS.

### Option A — Connect GitHub repo (recommended)

1. Push this project to GitHub (if not already):
   ```bash
   cd c:\wamp64\www\propel-csr-prototype
   git add .
   git commit -m "Configure Netlify deployment"
   git push
   ```
2. Go to [app.netlify.com](https://app.netlify.com) and sign up / log in.
3. Click **Add new site** → **Import an existing project**.
4. Choose **GitHub** and select your `propel-csr-prototype` repo.
5. Netlify reads [`netlify.toml`](netlify.toml) automatically:
   - **Build command:** `npm run build:netlify`
   - **Publish directory:** `dist`
6. Click **Deploy site**.

After 1–2 minutes you get a URL like **`https://random-name-123.netlify.app`**. You can rename it under **Site configuration → Domain management** (e.g. `propel-csr.netlify.app`).

Every `git push` to `main` redeploys automatically.

### Option B — Manual deploy (no Git on Netlify)

```bash
npm run build:netlify
```

Drag the `dist/` folder onto [app.netlify.com/drop](https://app.netlify.com/drop).

### Build commands

| Command | Use for |
|---|---|
| `npm run build` | WAMP intranet (`/propel-csr-prototype/dist/`) |
| `npm run build:netlify` | Netlify / public internet (site root `/`) |
| `npm run preview:netlify` | Test the Netlify build locally before deploying |

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
