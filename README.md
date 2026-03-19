# Mental Load — Deployment Guide

## What's in this folder

```
mental-load/
├── api/
│   └── claude.js          ← Secure API proxy (keeps your key safe)
├── src/
│   ├── main.jsx           ← App entry point
│   └── App.jsx            ← The full app
├── index.html             ← HTML shell
├── manifest.json          ← Makes it installable on mobile (PWA)
├── package.json           ← Dependencies
├── vite.config.js         ← Build config
└── vercel.json            ← Vercel routing config
```

---

## How to deploy (step by step)

### Step 1 — Put the files on GitHub

1. Go to github.com and open the `mental-load` repository you created
2. Click **"uploading an existing file"** (or drag and drop)
3. Upload ALL the files from this folder, keeping the folder structure:
   - `api/claude.js`
   - `src/main.jsx`
   - `src/App.jsx`
   - `index.html`
   - `manifest.json`
   - `package.json`
   - `vite.config.js`
   - `vercel.json`
4. Click **"Commit changes"**

### Step 2 — Connect to Vercel

1. Go to vercel.com and click **"Add New Project"**
2. Click **"Import Git Repository"** and select your `mental-load` repo
3. Vercel will detect it's a Vite project automatically
4. **Before clicking Deploy** — click **"Environment Variables"** and add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your API key from console.anthropic.com (starts with `sk-ant-...`)
5. Click **Deploy**

### Step 3 — You're live!

Vercel will give you a URL like `mental-load.vercel.app`. That's your app.

---

## Making it installable on phones

**iPhone:** Open the URL in Safari → tap the Share button → "Add to Home Screen"

**Android:** Open in Chrome → tap the three dots menu → "Add to Home Screen"

Once added, it opens full screen like a native app — no browser bars.

---

## Making changes

1. Come back to Claude, make your changes, get new files
2. Go to your GitHub repo
3. Click on the file you want to update → click the pencil ✏️ icon → paste new code → commit
4. Vercel redeploys automatically in about 30 seconds

That's it. No terminal needed, ever.

---

## Costs

- **Vercel:** Free (hobby plan is more than enough)
- **Anthropic API:** ~$0.01–0.05 per sort session depending on list length
- For 10 active clients sorting twice a week: roughly $2–5/month

