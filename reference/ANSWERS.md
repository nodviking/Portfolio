# Answers + design reference for the nodviking rebuild

Read this whole file, look at every image in `reference/`, then continue. **Section A overrides anything earlier about following the Dear Freeda look.**

---

## A. Design direction: Syntax Error-style technical / brutalist, blue accent

The look follows the system of **Syntax Error** (https://hackathon.sdslabs.co/) closely, with **my** content, name and
colour. No copied logo, copy or assets. (Supersedes the earlier Dear Freeda, chrome, glow, particle and wide-grotesk
directions; their code has been deleted.)

### Visual system
- **Background `#0E0E0E`** (not pure black) with a very faint dot grid (≤4%, slight parallax), behind content only.
- **One accent: electric blue `#2F6BFF`.** On `#0E0E0E` it is 4.29:1, so it is used for large type, fills and
  graphics. Small blue text uses `#5B8CFF` (6.1:1). Text on blue fills is white (4.5:1), except the giant VIKING box,
  which keeps dark text (large text only needs 3:1).
- **Text:** off-white `#EDEDF0`, muted grey `#8A8F98` for secondary copy.
- **Font: JetBrains Mono everywhere** (self-hosted). Display = 800 weight, tight tracking (−0.06em), uppercase,
  line-height 0.9. Body = regular. Labels = 12px/700, tracked +0.1em, uppercase.
- **No glow, no blur, no gradients.** Crisp flat colour only.
- **Frames:** 1px `#2A2A2A` borders with small square corner nodes. **Filled blue tab labels** on cards, e.g.
  `01 / STOREENV.CLI`.
- **Buttons:** solid blue, square corners, uppercase mono, `↗` for outbound links.
- **Tags:** outlined square-cornered pills with a small blue square marker, e.g. `DEVELOPER × DESIGNER · DELHI`.
- **Isometric cube icons** (CSS/SVG) for project cards and the logo mark.
- **Thin blue scroll indicator** on the right edge.

### Layout + signature moments
- **Nav:** cube logo mark + NODVIKING (ScrambleText) on the left, centred links with blue numbers
  (`01 WORK  02 ABOUT  03 CONTACT`), solid blue `CONNECT ↗` on the right. Hides on scroll down, shows on scroll up.
  Fullscreen menu (burger on mobile) with focus trap.
- **Preloader:** CREATE → CONNECT → NODVIKING letter stagger with a 000–100 counter, then a wipe. Skipped on repeat
  visits and under reduced motion.
- **Hero:** outlined role tag at the top, an isometric cube field in the middle, and the big two-word wordmark at the
  bottom centre: **"NOD" in solid blue + "VIKING" in a solid blue box with dark text**. Below a 1px divider: two
  lines of intro on the left (white + muted), and on the right a muted status line ("Available for freelance work")
  plus a solid blue **"View StoreEnv ↗"** button.
- **Hero intro:** the wordmark letters ScrambleText-decode into place (HTML text only, no canvas), then the box wipes
  in behind VIKING. Short and crisp.
- **About:** a Developer / Designer **type-specimen card pair** with measurement lines (ASC / CAP / X / BASE / DESC,
  JetBrains Mono's real metrics), a blue "+" between them, and code-style tags in mono
  (`const role = "DEVELOPER";`, `.role { is: DESIGNER; }`), with my own copy. Plus the scroll-lit manifesto
  paragraph with my real name once (Phase 3).
- **Motion:** crisp. Reveals use clip-path and translate (expo / power4 out). No blur, no glow, no bounce.
  Keep Lenis smooth scroll, magnetic buttons (smooth return, no elastic) and the custom cursor (flat colours,
  no blend modes).
- Later sections (StoreEnv, client work, stack, achievements, contact) use the same frames, tab labels, cube icons
  and mono type.

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
