# Delly — Developer Portfolio

A responsive, animated portfolio site for a Full‑Stack Web Developer /
Database Specialist / Mobile App Developer. Pure HTML, CSS and vanilla
JavaScript — no build step, no framework, works straight on GitHub Pages.

## What's inside

```
portfolio/
├── index.html      → all page content & structure
├── css/style.css   → design system + animations
├── js/script.js    → nav, scroll‑reveal, contact form
├── assets/         → put your photo / images here
└── README.md       → this file
```

## 1. Before you publish — things to personalize

Search the code for `REPLACE ME` comments — they mark every spot you should edit.

- **Your photo** — `index.html`, About section. Add a square photo (500×500px+)
  to `assets/avatar.jpg`, then swap the placeholder `<div class="avatar-placeholder">`
  block for:
  ```html
  <img src="assets/avatar.jpg" alt="Portrait of Delly" class="avatar-photo">
  ```
- **Your name** — set to "Mugisha Dear Duvet (Dellyboo)" throughout the
  `<title>`, About section and footer, pulled from your GitHub profile.
  Edit freely if you'd rather show a different name or business name.
- **Projects** — the first 3 cards are pulled from your real repos
  (Bar-Resto-Management-System, Request-management-system, live-in-kobe).
  The 4th is a placeholder "more work coming soon" card — replace it with
  your next project, or delete it. Add a "Live demo" link to any card once
  you deploy that project (e.g. via GitHub Pages).
- **Social links** — the GitHub icon in Contact already points to
  `github.com/Dellyboo`. Add your LinkedIn URL to the LinkedIn icon (still `#`).
- **Contact form** — GitHub Pages only serves static files, so the form can't
  send email by itself. It currently opens the visitor's email client via a
  `mailto:` link (already wired to `dellydear98@gmail.com`). If you'd rather
  the form send silently in the background:
  1. Create a free form endpoint at https://formspree.io
  2. In `index.html`, change `<form class="contact-form" id="contactForm">` to
     `<form class="contact-form" id="contactForm" action="https://formspree.io/f/yourFormId" method="POST">`
  3. In `js/script.js`, remove the `mailto` redirect block inside the submit handler
     (Formspree will handle sending once the form's `action` posts there).

## 2. Preview locally

Just open `index.html` in a browser — no server required. For best results
(so relative paths and fonts always behave), you can also run a tiny local
server from the `portfolio` folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## 3. Publish on GitHub Pages (free hosting, your own github.io address)

**Option A — a dedicated site at `Dellyboo.github.io`** (recommended for you)

1. On GitHub, create a new repository named exactly `Dellyboo.github.io`
   (must match your username, `Dellyboo`, exactly — case doesn't matter but
   spelling does).
2. In your terminal, from inside the `portfolio` folder:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/Dellyboo/Dellyboo.github.io.git
   git push -u origin main
   ```
3. Go to the repo's **Settings → Pages**. For a `username.github.io` repo,
   GitHub publishes it automatically from the `main` branch — no extra config
   needed.
4. Your portfolio is live at `https://dellyboo.github.io` within a
   couple of minutes.

**Option B — a project site (any repo name), e.g. `portfolio`**

1. Create a repo named e.g. `portfolio` and push the same way as above,
   just change the remote to `https://github.com/Dellyboo/portfolio.git`.
2. Go to **Settings → Pages** → under "Build and deployment", set
   **Source: Deploy from a branch**, **Branch: main**, folder **/(root)** → Save.
3. Your site is live at `https://dellyboo.github.io/portfolio/`.

**Custom domain (optional):** if you buy a domain later, add a `CNAME` file
with your domain name at the project root, then point your domain's DNS to
GitHub Pages following GitHub's "Managing a custom domain" docs — you can
paste that page into Claude and I'll walk you through the DNS records too.

## 4. Notes on the design

- Font pairing: **JetBrains Mono** (headings, labels — technical/blueprint feel)
  + **Inter** (body copy, for readability).
- Color system lives at the top of `css/style.css` as CSS variables — change
  `--accent` or `--line` there to retheme the whole site in one edit.
- Animations respect `prefers-reduced-motion` automatically.
- Everything is responsive down to small phones; the nav collapses to a
  hamburger menu under 900px.
