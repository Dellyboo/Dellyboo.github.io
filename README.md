# Mugisha Dear Duvet - Developer Portfolio

A responsive, animated portfolio for a Full-Stack Web Developer / Database
Specialist / Mobile App Developer. Photo-forward hero, a 5-language
switcher (EN/FR/JA/Kiswahili/Ikirundi) with real flag icons, a live
"Hobbies" grid, a contact form that emails you with an auto-generated
subject line, and BOXA - a voice-capable chat widget that answers visitor
questions about your work. Everything runs on **free tiers only - no
credit card, no billing account, anywhere**: GitHub Pages for hosting,
Firestore's free Spark plan for the Hobbies grid, and EmailJS's free tier
for sending contact-form email. No build step - plain HTML/CSS/JS.

## What's inside

```
portfolio/
├── index.html               → page structure & content
├── css/style.css             → design system + animations
├── js/
│   ├── main.js                 → nav, language switch, animations (no dependencies - always works)
│   ├── firebase-features.js    → hobbies grid (Firestore) + contact form (EmailJS), degrades gracefully if either can't load
│   ├── boxa-chat.js            → BOXA AI chat widget UI, voice input/output, and its rule-based reply engine
│   ├── i18n.js                 → EN/FR/JA/Kiswahili/Ikirundi text dictionary
│   ├── firebase-config.js      → YOUR Firebase project keys go here (optional, for the Hobbies grid)
│   ├── firebase-init.js        → Firestore read/write helpers
│   └── emailjs-config.js       → YOUR EmailJS keys go here (for contact-form email)
├── assets/                   → put avatar.jpg here
└── README.md
```


## 1. Add your photo

Drop a square photo (500×500px or larger) at `assets/avatar.jpg`. The hero
already points to that path - if the file is missing it automatically shows
a "MD" monogram instead, so nothing breaks either way.

## 2. Connect Firebase (for Hobbies + Contact messages)

Both the Hobbies grid and (optionally, as a backup log) the contact form
use **Firestore**, so you need a (free) Firebase project - this stays
entirely on Firebase's free "Spark" plan, no card required.

1. Go to https://console.firebase.google.com → **Add project** → follow the
   prompts (Google Analytics is optional, you can skip it).
2. Inside the project, click the **`</>`** icon ("Web") to register a web
   app. Give it any nickname. Firebase will show you a `firebaseConfig`
   object - copy those values into `js/firebase-config.js`, replacing the
   placeholders.
3. In the left sidebar: **Build → Firestore Database → Create database**.
   Choose a region close to your users and start in **production mode**.
4. Open the **Rules** tab and paste this in, then **Publish**:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {

       // Anyone can read hobby cards; only you (via the Firebase Console)
       // can add/edit/delete them - the site itself never writes here.
       match /hobbies/{doc} {
         allow read: if true;
         allow write: if false;
       }

       // Visitors can submit a message, but can't read, edit, or see
       // other people's messages - keeps the contact form private.
       match /messages/{doc} {
         allow create: if true;
         allow read, update, delete: if false;
       }
     }
   }
   ```

### Adding hobby cards

You manage hobbies directly from the **Firebase Console** - no code needed:

1. Firestore Database → **Start collection** → collection ID: `hobbies`.
2. Add a document (auto-ID is fine) with these fields:
   - `title` - string, e.g. `"Photography"`
   - `description` - string, can be long; cards auto-truncate with a
     "Read more" popup past ~90 characters
   - `image` - string, a public image URL (e.g. upload to
     [Firebase Storage](https://firebase.google.com/docs/storage), Imgur, or
     any image host, then paste the direct URL here). Leave blank to show a
     simple icon instead.
   - `order` - number, controls display order (0, 1, 2, …)
3. Repeat for each hobby. The site fetches this collection on every page
   load - no redeploy needed, just refresh the page.

Until you add real documents, the site shows 3 demo hobby cards
(Photography / Gaming / Exploring Japan) as a placeholder - safe to ignore,
they disappear automatically once Firestore has real data.

### Reading contact messages

If you set up Firestore, every form submission also gets logged in the
**`messages`** collection there as a backup - open Firestore Database in
the console any time to read them (name, email, message, timestamp). The
real-time notification, though, comes from EmailJS (step 5) straight to
your inbox - Firestore here is just a searchable record, not required for
emails to work.

## 3. Preview locally

Because this site uses Firebase's ES module SDK (`import`/`export`),
double-clicking `index.html` directly (a `file://` URL) will **not** load
Firebase correctly in most browsers - you need to serve it over `http://`.
From inside the `portfolio` folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

Everything else (animations, language switch, nav) still works even
without Firebase configured - only the Hobbies grid (falls back to demo
cards) and the contact form (shows an error note) are affected.

## 4. Publish on GitHub Pages

**Easiest - no terminal needed:**

1. On GitHub, create a new repository named exactly `Dellyboo.github.io`.
2. On the empty repo page, click **uploading an existing file**, and drag in
   everything from inside the `portfolio` folder (`index.html`, the `css`,
   `js`, and `assets` folders, `README.md`) - keep the folder structure
   intact. Commit changes.
3. Go to **Settings → Pages** - for a `username.github.io` repo this is
   usually already enabled and building from `main`.
4. Visit `https://dellyboo.github.io` after a minute or two.

(If you prefer the git command line, see the previous version of this
README or ask - happy to walk through it.)

## 5. Set up contact-form email (EmailJS - free, no card required)

The contact form needs **EmailJS** to actually deliver messages to
**dellydear98@gmail.com**. It's a free service designed exactly for this -
sending email straight from client-side JavaScript with no backend server
and no billing account. Free tier: 200 emails/month, no card needed to sign up.

1. Sign up at https://www.emailjs.com (free plan is fine).
2. **Add an Email Service**: Email Services → Add New Service → choose
   Gmail (or whichever provider you use) → connect the account you want
   to send from. Copy the **Service ID** it gives you.
3. **Create a Template**: Email Templates → Create New Template. Set:
   - **To email**: `dellydear98@gmail.com`
   - **Subject**: `{{subject}}`
   - **Content**: something like
     ```
     New message from {{from_name}} ({{from_email}}):

     {{message}}
     ```
   Copy the **Template ID**.
4. **Get your Public Key**: Account → General → copy the **Public Key**
   (this one is meant to be public/client-side, unlike a normal API key).
5. Paste all three into `js/emailjs-config.js`, replacing the `"REPLACE_ME"`
   placeholders.
6. Re-upload `js/emailjs-config.js` to GitHub and it's live - test it by
   submitting your own contact form and checking your inbox (and spam
   folder, the first time).

**About the subject line:** since there's no backend here to safely hold a
secret AI API key, the subject line is generated with a small built-in
JavaScript heuristic (it pulls the first sentence of the message, prefixed
with the sender's name) rather than a true AI call - still genuinely useful
for triage, and completely free with zero setup beyond the steps above.

Until EmailJS is configured, submitting the form just opens the visitor's
own email app with everything pre-filled instead - so nothing is ever
lost, it just takes one extra click from the visitor until you connect it.

## 6. About the BOXA AI chat widget (free, runs entirely in the browser)

BOXA is the chat bubble in the bottom-right corner. It needs **no setup at
all** - there's no backend, no API key, and no billing account behind it,
by design, since a true conversational AI would need a server to hold a
secret key safely (which brings back the exact billing requirement we're
avoiding here).

Instead, BOXA recognizes a set of common questions - skills, services,
projects, pricing, availability, how collaboration works, contact info -
and answers using the site's own translated content, in whichever of the
5 languages the visitor has selected. It's a smart FAQ assistant, not a
full LLM, but it covers what most visitors actually ask, for free, with no
setup required. If you want to expand what it can answer, the questions
and replies live in `js/boxa-chat.js` (the `INTENTS` array) and
`js/i18n.js` (any key starting with `boxa.`).

**About BOXA's voice feature:** it uses the browser's built-in Web Speech
API (free, built into the browser, no account needed) -
`SpeechSynthesis` for spoken replies and `SpeechRecognition` for the
microphone button. Support varies by browser and device:
- **English, French, Japanese** - well supported in Chrome/Edge on
  desktop and Android.
- **Swahili** - spoken replies (text-to-speech) work in many browsers;
  the microphone (speech-to-text) is hit-or-miss depending on the device.
- **Ikirundi** - very few systems ship a Kirundi voice or recognizer, so
  voice will likely fall back to text-only for this language. The chat
  itself still works fully in Kirundi text either way.
- Safari and Firefox support the microphone button less reliably than
  Chrome/Edge - the mic button automatically disables itself if a
  browser doesn't support it at all, rather than failing silently.

## 7. Notes on customization

- **Language switcher**: top-right of the nav, now with flags and 5
  languages (English, Français, 日本語, Kiswahili, Ikirundi). Text lives in
  `js/i18n.js` - add or edit keys there; every element tagged
  `data-i18n="key"` (or `data-i18n-ph="key"` for placeholders) in
  `index.html` updates automatically. The Kiswahili and Ikirundi
  translations are AI-generated best-effort - if you have a native speaker
  review them, I'm happy to help apply corrections. Project descriptions
  are currently English-only.
- **BOXA's chat language** is independent from the site's language
  switcher - a visitor can browse the site in Japanese and still chat with
  BOXA in French if they prefer.
- **Logo**: the `</>` + "dellyboo" mark in the nav is plain HTML/CSS, styled
  in `css/style.css` under `.brand`.
- **Colors & fonts**: CSS variables at the top of `css/style.css` - change
  `--violet`, `--cyan`, `--pink` to retheme the gradient everywhere at once.
- **Animations**: respect `prefers-reduced-motion` automatically.
- **LinkedIn**: still a placeholder `#` link in the Contact section - send
  me the URL and I'll wire it in, or search `REPLACE ME` in `index.html`.

