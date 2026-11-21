# Answers + design reference for the nodviking rebuild

Read this whole file, look at every image in `reference/`, then continue. **Section A overrides anything earlier about following the Dear Freeda look.**

---

## A. Design direction (read carefully)

### The goal
This has to be an **Awwwards Site-of-the-Day level** portfolio. A client should be impressed within the first 3 seconds, before reading a word. Every section needs one memorable interaction. Nothing generic, nothing templated, no "developer portfolio starter" look.

### The base is MY current portfolio, not Dear Freeda
**Dear Freeda is NOT how I want my portfolio to look.** It's only a loose mood reference for polish and pacing. Don't copy its ornate chrome font, organic blobs, flowers or layout.

The **main base is my own current portfolio**: https://portfolio-mu-wine-42.vercel.app (the React code in this repo). Screenshots: `current-01-hero.jpg`, `current-02-about.jpg`. Keep and level up its identity:
- **Near-black background `#050507` + electric blue `#2F6BFF`** as the single accent (updated from the old sky-blue `#38BDF8`). Use the lighter tint `#5B8CFF` for small text, links and hover so it passes WCAG AA (`#2F6BFF` = 4.53:1, `#5B8CFF` = 6.44:1 on the background). Text: off-white `#EDEDF0`, muted `#8A8F98`.
- **Glow is subtle.** Only the hero wordmark gets a soft, small glow (low opacity, small blur). Nav, pills, preloader text, headings and body are crisp flat color. Small glows are fine on hover states and the cursor-lens edge.
- **Giant display type: Archivo Expanded 900** (variable, `wdth` 125, self-hosted via `@fontsource-variable/archivo`), a wide Monument-Extended-style grotesk. Keep the "type so big it becomes graphics" idea from the old Fjalla One hero. NODVIKING sits on **one line on tablet and desktop**, and is a deliberate **two-line "NOD / VIKING" below 600px**.
- **JetBrains Mono** (self-hosted) for labels, `[01]`-style section numbers, small caps, pills and code-style tags like `<DEV × DESIGN />`. **Inter Tight** stays for body copy.
- **Preloader word sequence** (`CREATE → CONNECT → name`, letters staggering in and out). Keep the idea, make it smoother, and end on **NODVIKING**.
- **ScrambleText logo** in the navbar: keep it, but scramble into **nodviking**.
- **Magnetic nav links + magnetic "Connect!" button**: keep, with a smooth (not elastic) return.
- Clean sans body text (currently Poppins; a sharper grotesk is fine).
- Port all these GSAP ideas over properly. The React versions were rough (manual scroll listeners, no cleanup), so rebuild them the clean Svelte way.

### Remove the 3D character
**Delete the 3D avatar** (`public/assets/Model/Tushar3d.glb`, `Tushar3.glb`) and everything that uses it. Don't use any character/avatar.

**Replace it with this hero concept: "decrypt".** It ties into StoreEnv (encryption) and shows I'm a developer *and* designer:
1. The giant NODVIKING wordmark first appears as **scrambled ciphertext** (random glyphs, hex, symbols in electric blue), then **decrypts** letter by letter into the clean wordmark with a soft glow pulse.
2. The wordmark is rendered in **WebGL** as thousands of tiny **ASCII particles**: each particle is a small code character (`0-9 a-f { } < > = / •`) that locks into the letter shapes and stays readable as NODVIKING once settled. They scatter away from the cursor like a force field and spring back, and they slowly drift and breathe when idle.
3. The cursor acts as a **"decryption lens"**: a circle around the cursor that reveals a hidden layer underneath (raw code / ASCII / `.env`-style `KEY=••••` lines) with a slight RGB-split at its edge (1px max; drop it if it ever looks cheap).
4. On scroll, the particles **disperse and re-form** into the next section's headline (a seamless hero → about transition), and the blue bars from my current site sweep across as the transition wipe (flat blue, travelling right → left as one striped group).
5. Fallbacks: on mobile, a lighter version (fewer particles, tap ripple instead of hover). With `prefers-reduced-motion`, a static glowing wordmark. Lazy-load the WebGL; the hero text must be real HTML for SEO and accessibility.

If you think a different hero idea would be clearly more impressive, pitch it to me in 3 lines before building. Otherwise build this.

### Make every section memorable (Awwwards bar)
- **About:** words light up electric blue as you scroll (scrubbed), with my real name appearing once. Plus two **specimen cards**, "Developer" and "Designer", drawn with type-measurement lines (cap height, x-height, baseline, descender) and mono annotations.
- **StoreEnv (hero project):** pinned scroll "product film". A live typing terminal, `.env` values visibly encrypting into ciphertext and decrypting on another "machine", a version-history timeline that scrubs with scroll, and feature cards that slide horizontally.
- **Client work:** big list of client names in giant wide display type. On hover, a WebGL image of the site appears following the cursor with a liquid/ripple distortion. Click → case-study page with a curtain page transition.
- **Stack:** tags floating in a 3D/particle field that react to the cursor, or a two-row velocity-skew marquee. Pick whichever looks better.
- **Achievements:** counters that roll like a slot machine / scramble into the final number.
- **Contact:** giant "LET'S BUILD" in the wide display type with the blue bars, a magnetic email button that copies on click, and a footer with live IST time.
- **Dot grid:** a very faint (≤4% opacity) dot grid behind content only, with slight parallax. **Corner-tick frames** (hairline border + small square corner ticks) on glass cards.
- **Magnetic buttons/links:** smooth return (expo/power3 out, at most a tiny overshoot). No elastic.
- Throughout: Lenis smooth scroll, custom cursor (flat colors: off-white ring + blue dot, no blend mode, which would turn the blue orange; context label like "VIEW" / "OPEN"), subtle grain overlay, and split-text reveals with strong ease-out curves (expo/power4). No bouncy or cheap effects.

### Borrowed from SDSLabs Hackathon (hackathon.sdslabs.co), in our blue + wide-grotesk identity
No orange and no copied layout. Only these ideas: ASCII-glyph particles, JetBrains Mono labels and `[01]` indices, a very faint dot grid, corner-tick card frames, and type-specimen cards with measurement lines.

### What to take from Dear Freeda only (`inspo.jpg`, `dearfreeda-*.jpg`)
Just these polish ideas, adapted to my black + electric-blue identity:
- Generous empty space, with each scroll step as one focused full-screen "scene"
- Thin outline **pill buttons** for the menu/nav, and social icons fixed bottom-left
- Big rounded media cards with a **frosted-glass** text panel (use it on client/project cards)
- Short, confident, ALL-CAPS microcopy

---

## B. Answers to your questions

**2. Domain:** no custom domain yet. Use `https://portfolio-mu-wine-42.vercel.app` and keep it as one constant `SITE_URL` in `src/lib/data/site.ts`.

**3. Email:** tusharrr0302@gmail.com. Don't show YouTube.

**4. StoreEnv:** it's my personal project. I designed and built the whole thing myself: CLI, encryption library, web app and VS Code extension. Role label: **"Creator — design, engineering, everything."** Yes, link the GitHub button to **nodviking/storeenv-cli** (open source, Apache-2.0), labelled "CLI on GitHub". Keep nodviking/storeenv private and don't link it.

**5. Client work:** all of these are fully custom, personalised websites (design + development by me, not templates):
- **Nanté Patisserie** (https://www.nantecakestudio.in): a luxury boutique patisserie. Custom brand website with the story/about, cakes and wedding creations. Design + development.
- **Advanced Dental Care by Dr. Sanjana** (https://www.adcbydrsanjana.in): a boutique dental clinic in Noida. Custom website with about, services, booking, and a blog **plus an admin dashboard** where the doctor uploads blog posts and manages appointments herself. Design + full-stack development.
- **Savora Hospitality** (https://www.savorahospitality.in): a culinary and hospitality consulting firm (concept, menus, kitchen planning, launch support for F&B brands). Custom website with about, services, a projects gallery, an insights journal and contact. Design + development.
- Take Playwright screenshots of all three (desktop 1440×900 + mobile 390×844) into `static/work/`.

**6. Shree Associate & Builders:** leave it out for now.

**7. Experience:**
- Creator & Developer, StoreEnv (personal product), `TODO: start year`–present. Built an encrypted, versioned `.env` manager: CLI, web app, VS Code extension.
- Freelance Web Designer & Developer, clients incl. Nanté Patisserie, ADC by Dr. Sanjana, Savora Hospitality, `TODO: start year`–present. 5 clients, 5 custom websites shipped, including an admin dashboard.
- Freelance Graphic Designer, `TODO: years`. 80+ clients, 250+ design projects.
- Education: B.Tech, Information Technology, **Bhagwan Parshuram Institute of Technology (BPIT), Delhi**, `TODO: 20XX–20XX`.

**8. Achievements / numbers to show:**
- 5 web clients · 5 web projects shipped
- 80+ design clients · 250+ design projects
- 1 product built solo: StoreEnv
- Remove "3+ years" unless I give you the number (`TODO`).
- Hackathons: `TODO` (optional: "ICURUS — Startup Buildathon India 2026 (Google × Hack2Skill)" as a participant line; ask me before showing it).

**9. "More builds" strip:** yes, but **without BrainBits and MeghDrishti**:
- **ICURUS** (SatQuery AI is its backend; one card): AI research assistant for satellite/Earth-observation data. It runs specialist geo models and explains every result with a trust grade. SvelteKit, FastAPI, LangGraph.
- **EvidenceLink AI**: hackathon project that turns cyber-fraud panic into a verifiable complaint package: OCR evidence extraction, a timeline, SHA-256-hashed files and a PDF report.
- **RachnaOS**: operating system for Indian YouTube/social creators: AI audience analytics, contract scanning, a freelancer marketplace. React, Express, Supabase, Claude API.

**10. AI row in Stack:** yes. LangGraph, FastAPI, LLM APIs (Claude, Gemini, OpenAI), Groq, Hugging Face models.

**11. 3D:** remove the 3D character completely. Use the "decrypt" particle wordmark hero from section A instead.

**12. Availability:** yes, show "Available for freelance work" in the hero.

Plan approved once you've adapted it to section A. Tell me the adjusted plan in a few bullets, then start Phase 1.
