# FULL BUILD: finish the nodviking portfolio in one go

This file is the final source of truth. Where it conflicts with `ANSWERS.md`, the earlier prompt or earlier messages, **this file wins.** Build everything below in one run. Work phase by phase internally and commit after each one, but **don't stop to ask me between phases.** Only stop if something is truly blocked; otherwise make a sensible choice and note it in the final report.

The visual system stays the **Syntax Error style** already built (hackathon.sdslabs.co): `#0E0E0E` background, faint dot grid, JetBrains Mono everywhere (800 for display), 1px frames with square corner nodes, filled tab labels, numbered nav. No glow, no blur, no particles, no WebGL.

---

## 1. Fix these first

1. **Color → orange.** Replace the blue (`#2F6BFF` / `#5B8CFF`) everywhere with **`#FF4A00`** (confirm the exact value on the live Syntax Error site). Text on orange fills is `#0E0E0E`. Delete all blue tokens. Check the contrast of small orange text on `#0E0E0E`; use a lighter tint only if it fails.
2. **Remove the isometric cube field from the hero** (the floating cubes + dashed cube above the wordmark). Delete the component.
3. **Remove the hero "Available for freelance work." line and the big "VIEW STOREENV ↗" button.** Delete them.
4. **Remove the cube logo mark from the nav.** The logo is just the scrambling **NODVIKING** wordmark in mono.
5. **Remove the isometric cube icons from project cards too.** No cubes anywhere on the site.
6. Delete the old React app at the repo root (`src/`, `public/assets/Model/*.glb`, root `index.html`, `vite.config.js`, `eslint.config.js`, root `package.json` and lockfile). Git history keeps it. Then make the SvelteKit app in `site/` the only app: either move `site/` to the repo root, or keep it and tell me to set Vercel "Root Directory" to `site`. Pick whichever is cleaner and tell me.
7. Keep third-party reference screenshots out of git (add `reference/*.jpg` and `reference/*.png` to `.gitignore`), since the repo is public.

---

## 2. Identity

- The brand everywhere is **nodviking**. My real name, **Tushar Kumar**, appears only in: the About section (once), the footer copyright, meta `author`, and JSON-LD `Person.name` (with `alternateName: "nodviking"`).
- Email: **tusharrr0302@gmail.com**
- GitHub: https://github.com/nodviking
- LinkedIn: https://www.linkedin.com/in/nodviking/
- Old graphic design portfolio: https://tusharrr.my.canva.site/
- No YouTube.
- `SITE_URL` = `https://portfolio-mu-wine-42.vercel.app` (one constant in `site.ts`).
- Location line: Delhi, India · IST.

---

## 3. Sections (in this order), with content and motion

Every section gets a mono index tab like `[03] / STOREENV.CLI` and a right-edge progress readout like `03/10`. All copy below is final unless marked `TODO:`.

### [00] Preloader: "boot sequence" (max ~1.8s, skipped on repeat visits and with reduced motion)
- Mono boot log lines type in fast, line by line:
  `> init nodviking.sys` · `> load design.module ✓` · `> load dev.module ✓` · `> compile portfolio… 100%`
- A thin orange progress bar fills under them with a 000→100 counter.
- Exit: the screen splits into a grid of squares that flip out in a diagonal stagger (a pixel wipe), revealing the hero.

### [01] Hero
- Top: small outlined pill: `DEVELOPER × DESIGNER · DELHI`.
- **Huge wordmark filling the full content width**, bottom-anchored: `NOD` in orange + `VIKING` in a solid orange box with dark text. Make it big enough that there's **no empty band** (that's why the cubes are gone; the type is the hero). On phones, stack `NOD` / `VIKING` and size each to the full width.
- Thin technical annotations around the wordmark in tiny mono grey, like a spec drawing: `LAT 28.61°N / LON 77.20°E`, a live IST clock, `v2026.11`, `[ SCROLL ↓ ]`, plus a dimension line with end ticks spanning the wordmark width and labelled with its pixel width (live, updates on resize).
- Below a 1px divider: two lines of intro on the left:
  - "I design brands and build the products behind them."
  - (muted) "250+ design projects. 5 custom websites. 1 product built solo, from first commit to launch."
- Right side: just `[ SCROLL ↓ ]`. No button, no status line.
- **Motion:** after the preloader the letters ScrambleText-decode left to right (widths locked, no layout shift), then the orange box wipes in behind VIKING (clip-path from left), then the annotations and dimension line draw in (stroke animation). On scroll, the wordmark gets a slight scrubbed y-parallax and the divider line scales out.

### [02] About
- Keep the **Developer + Designer specimen cards** with measurement lines (already built), now orange.
- Above them, a short scroll-scrubbed paragraph where words go from grey to white as you scroll:
  "nodviking is Tushar Kumar, a developer and designer from Delhi studying IT at Bhagwan Parshuram Institute of Technology. I started in graphic design (80+ clients, 250+ projects), then started building the products and websites myself."
- **Motion:** card frames **draw themselves** (lines extend from the corner nodes), then the measurement lines draw, then the glyphs scramble in.

### [03] Hero project: StoreEnv (the centerpiece; make it the most impressive section)
- Tab: `[03] / STOREENV.CLI`. Title: **STOREENV**, with the subtitle "Git for environment secrets."
- Role tag: `SOLO PROJECT — DESIGN, ENGINEERING, EVERYTHING`
- Links: `storeenv.app ↗` (https://storeenv.app) and `CLI ON GITHUB ↗` (https://github.com/nodviking/storeenv-cli).
- **Pinned section with horizontal scroll** through 6 framed feature panels, each with a mono index and a small line-drawn diagram:
  1. **PUSH / PULL**: finds `.env` files in every service folder, encrypts them on your device, and restores them in the right place on another machine.
  2. **VERSIONED**: every push is a signed version with author and message. See which keys changed and roll back in one command.
  3. **SELECTIVE SHARING**: share a whole environment or only specific keys, by email or username, with access that expires.
  4. **RUN WITHOUT FILES**: `storeenv run` injects secrets straight into a process, so nothing is written to disk.
  5. **ZERO-KNOWLEDGE**: AES-256-GCM per secret, keys wrapped per person. The server only ever sees ciphertext.
  6. **EVERYWHERE**: single binary, Homebrew and npm · macOS, Linux, Windows · VS Code extension + web app.
- A **framed fake terminal** beside or under the panels that types in sync with the scroll: `$ storeenv push` → output lines → `$ storeenv pull` → `$ storeenv run -- npm start`. While it types, a sample line `DATABASE_URL=postgres://…` scrambles into ciphertext and back.
- **Motion:** pinned horizontal scroll (scrubbed), panels with clip-wipe reveals, diagram strokes drawing in, the terminal typing tied to scroll progress, and a counter `01/06` that ticks.

### [04] Client work
- Tab: `[04] / CLIENTS.LOG`. A **big list** of rows (full-width, 1px separators), each row with: index · client name in big mono 800 · category · year · `↗`.
  1. **Nanté Patisserie**: Luxury patisserie · https://www.nantecakestudio.in · "A custom brand website for a boutique patisserie: their story, signature cakes and wedding creations. Design + development."
  2. **Advanced Dental Care by Dr. Sanjana**: Dental clinic, Noida · https://www.adcbydrsanjana.in · "A personalised clinic website with services, appointment booking and a blog, plus an admin dashboard where the doctor publishes blog posts and manages appointments herself. Design + full-stack development."
  3. **Savora Hospitality**: Culinary & hospitality consulting · https://www.savorahospitality.in · "A custom website for an F&B consulting firm: services, a project gallery, an insights journal and contact. Design + development."
  - Years: `TODO:` (leave a TODO in the data file if unknown).
- Take Playwright screenshots of each live site (1440×900 and 390×844) into `static/work/` and convert them to AVIF/WebP.
- **Hover (desktop):** the row inverts (orange fill, dark text). A framed screenshot preview follows the cursor with a clip-path reveal and corner nodes. The name scrambles briefly.
- **Touch:** tap expands the row accordion-style to show the screenshot + description.
- Each row links to `/work/[slug]`, a case-study page with a hero screenshot, a role/stack/scope spec table (mono, framed), the description, desktop + mobile screenshots, a "Visit live site ↗" link, and next/previous project.
- **Page transition** between `/` and `/work/[slug]`: the same diagonal square-grid pixel wipe as the preloader (SvelteKit `onNavigate`).

### [05] More builds
- Tab: `[05] / LAB.DIR`. Three framed cards in a row (stacked on mobile), each with a filled tab label, title, one-liner and stack tags:
  - `01 / ICURUS.AI`: **ICURUS**. "An AI research assistant for satellite and Earth-observation data. It runs specialist geo models and explains every result with a trust grade." · SvelteKit · FastAPI · LangGraph
  - `02 / EVIDENCE.LINK`: **EvidenceLink AI**. "Hackathon project that turns cyber-fraud panic into a verifiable complaint package: OCR evidence extraction, a timeline, SHA-256-hashed files and a PDF report." · React · Web Crypto · Tesseract.js
  - `03 / RACHNA.OS`: **RachnaOS**. "An operating system for Indian YouTube and social creators: AI audience analytics, contract scanning and a freelancer marketplace." · React · Express · Supabase · Claude API
- No cubes. Instead each card has a tiny animated mono "readout" (e.g. `status: building`, `models: 3`, `hash: 9f2c…`) that scrambles on hover.
- **Motion:** frames draw in, cards stagger up, and hover lifts the card with the corner nodes moving outward 4px.

### [06] Experience
- Tab: `[06] / HISTORY.TXT`. A vertical timeline: a 1px line that **draws as you scroll**, with a square node per entry that fills orange when it reaches the center of the screen.
  - **Creator & Developer, StoreEnv**: `TODO: year`–present. "Designed and built an encrypted, versioned .env manager solo: CLI, encryption library, web app, VS Code extension."
  - **Freelance Web Designer & Developer**: `TODO: year`–present. "5 clients, 5 custom websites shipped, including a full admin dashboard. Clients include Nanté Patisserie, ADC by Dr. Sanjana and Savora Hospitality."
  - **Freelance Graphic Designer**: `TODO: years`. "80+ clients, 250+ projects: brand identities, social creatives and high-impact thumbnails."
  - **B.Tech, Information Technology, Bhagwan Parshuram Institute of Technology (BPIT), Delhi**: `TODO: 20XX–20XX`.

### [07] Stack
- Tab: `[07] / STACK.JSON`. Show it as a **framed JSON-style code block** with syntax colors (orange keys, white values, grey punctuation) that types in on enter, next to **two marquee rows** of the same tags going in opposite directions, whose speed reacts to scroll velocity.
  ```
  languages: Java, JavaScript, TypeScript, Python, HTML/CSS
  backend:   Node.js, Express, Prisma, JWT, REST, FastAPI
  frontend:  React, Svelte/SvelteKit, Tailwind
  ai:        LangGraph, Claude / Gemini / OpenAI APIs, Groq, Hugging Face
  cloud:     Vercel, Netlify, Firebase
  design:    Figma, Photoshop, Illustrator, Premiere Pro, Canva
  tools:     Git, GitHub
  ```
- Hovering a tag highlights it in every place it appears.

### [08] Numbers
- Tab: `[08] / STATS.LOG`. A 4-column framed grid (2×2 on mobile), with each number huge in mono 800:
  - **250+** design projects · **80+** design clients · **5** web clients · **5** websites shipped
- **Motion:** digits roll like an odometer/slot machine (each digit column scrolls) when the grid enters the screen, and the frames draw first.
- Hackathons: `TODO:` (don't show anything until I add it).

### [09] Design roots
- A single wide framed card: tab `[09] / DESIGN.ARCHIVE`, "Before code, there was design." plus "250+ projects for 80+ clients: identities, social creatives, thumbnails." and a link `VIEW DESIGN PORTFOLIO ↗` → https://tusharrr.my.canva.site/
- Hover: the card inverts to an orange fill.

### [10] Contact + footer
- Huge mono 800 `LET'S BUILD` with the second word in an orange box (same treatment as the hero).
- A big framed email button `tusharrr0302@gmail.com`: magnetic, copies on click, and the label scrambles to `COPIED ✓`.
- A row of links: GitHub ↗ · LinkedIn ↗ · Design portfolio ↗
- Footer: `© 2026 Tushar Kumar` · live IST clock · `BUILT WITH SVELTEKIT + GSAP` · back-to-top `[ ↑ TOP ]`.

---

## 4. Global Awwwards-level polish (all in the Syntax Error idiom: crisp, technical, no glow/blur)

- **Lenis** smooth scroll synced to GSAP ScrollTrigger (already set up).
- **Cursor:** a small square + crosshair lines with a live `x:0000 y:0000` mono readout next to it (desktop only). Over links it snaps to a square bracket `[ ]` frame around the element. Flat colors, no blend modes.
- **Every link and button:** the text scrambles on hover and buttons are magnetic (smooth expo return).
- **Section reveals:** frames draw from their corner nodes, headings scramble-decode, and body lines slide up from a clip mask, staggered. Use one consistent ease (`expo.out` / `power4.out`) and 0.6–1.1s durations.
- **Nav:** the current section's number highlights, an underline follows the active section, and the nav hides on scroll down. The phone burger opens the fullscreen menu with the pixel-grid wipe and links that scramble in.
- **Right-edge scroll indicator** (thin orange line) plus a `03/10` section counter.
- Faint dot grid with a very slight parallax.
- **Reduced motion:** no scramble, no pin, no horizontal scroll (panels stack vertically), no cursor; simple fades only.
- **Performance:** Lighthouse mobile ≥ 90 performance, 100 for accessibility, best practices and SEO. Self-host and preload JetBrains Mono (subset), lazy-load images, no layout shift.
- **SEO:** per-page meta, OG image 1200×630 (the NOD [VIKING] wordmark on `#0E0E0E`), `sitemap.xml`, `robots.txt`, JSON-LD Person, favicon from the wordmark.
- Clean up every GSAP/ScrollTrigger instance on destroy and on route change.

---

## 5. Finish

1. `npm run check` and `npm run build` with zero errors and warnings, plus Playwright with no console errors.
2. Screenshots of every section at 1440 and 390, plus 768 and 1920 for the hero. Visually check each one yourself and fix anything broken before reporting.
3. Lighthouse on the preview build; report the scores.
4. Update `reference/ANSWERS.md` so section A says "Syntax Error style, orange #FF4A00" and section B item 11 says "no 3D, no particles". Then commit.
5. Final report to me:
   - what's built, section by section (short)
   - every remaining `TODO:` with its file path
   - the Vercel deploy step (root directory, framework preset)
   - anything you decided on your own
