# nodviking — portfolio

Personal portfolio of **nodviking** — live at **https://nodviking.me**. Technical / brutalist style: `#0E0E0E`, one
maroon accent, JetBrains Mono everywhere, hairline frames with square corner nodes, ASCII-art canvases.

## Stack

- **SvelteKit 3 + Svelte 5 runes**, TypeScript, Vite, `@sveltejs/adapter-static`. Every page is prerendered to static HTML.
- **Tailwind CSS v4** + design tokens in `src/app.css`.
- **GSAP** (ScrollTrigger, SplitText, ScrambleText) for all motion, **Lenis** for smooth scroll (synced to GSAP's ticker).
- **JetBrains Mono Variable**, self-hosted via `@fontsource-variable` and preloaded.
- No WebGL, no 3D. Respects `prefers-reduced-motion` (no scramble, no pinning, no custom cursor, no smooth scroll).

## Run it

```sh
npm install
npm run dev        # http://localhost:5173
npm run check      # svelte-check (types + a11y)
npm run build && npm run preview
```

## Edit content (no component changes needed)

All copy lives in typed files in `src/lib/data/`:

| File | What |
| --- | --- |
| `site.ts` | brand, email, links, `SITE_URL`, nav + section list (`[03] / FILE.EXT` tabs, `03/10` counter) |
| `hero.ts` | role tag, wordmark, intro lines |
| `preloader.ts` | boot-sequence lines |
| `about.ts` | scroll-lit paragraph (the only place the real name appears) + specimen cards |
| `storeenv.ts` | StoreEnv title/links, the 6 feature panels, terminal script |
| `clients.ts` | client list + case-study content (`/work/[slug]`) |
| `lab.ts` · `experience.ts` · `stack.ts` · `numbers.ts` · `contact.ts` | the remaining sections |

Search for `TODO:` to find content that still needs real values. Dates marked `TODO:` are hidden on the page.

## Scripts

- `node scripts/capture-work.mjs` — screenshots each client site (1440×900 and 390×844) into `static/work/` as AVIF + WebP.
- `node scripts/brand-assets.mjs` — regenerates `static/og.png` (1200×630) and the favicons.
- `node scripts/shots.mjs [url] [outDir]` / `scripts/shots-extra.mjs` — Playwright visual QA screenshots.

## Deploy (GitHub Pages)

Every push to `main` runs `.github/workflows/deploy.yml`: `npm ci` → `npm run check` → `npm run build` → deploy the
`build/` folder to GitHub Pages. The custom domain comes from `static/CNAME` (`nodviking.me`); `SITE_URL` in
`src/lib/data/site.ts` must match it.

DNS (Namecheap): four `A` records on `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
`185.199.111.153`, and a `CNAME` on `www` → `nodviking.github.io`.
