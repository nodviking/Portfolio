// Phase 2 QA: node scripts/shots-hero.mjs [baseUrl] [outDir]
// Preloader frames, decrypt, cursor lens, scroll morph, mobile, reduced motion and repeat-visit skip.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = process.argv[2] ?? 'http://localhost:4173';
const out = process.argv[3] ?? 'shots-hero';
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [];
const watch = (page, tag) => {
	page.on('pageerror', (e) => errors.push(`${tag}: ${e.message}`));
	page.on('console', (m) => ['error', 'warning'].includes(m.type()) && errors.push(`${tag}: ${m.text()}`));
};
const heroMode = (page) =>
	page.evaluate(() => {
		const h = document.querySelector('.hero');
		return h?.classList.contains('is-gl') ? 'gl' : h?.classList.contains('is-static') ? 'static' : 'pending';
	});
const scrollToProgress = async (page, p) => {
	await page.evaluate((p) => {
		const h = document.querySelector('.hero');
		const top = h.offsetTop + (h.offsetHeight - innerHeight) * p;
		window.scrollTo(0, top);
	}, p);
	await page.waitForTimeout(1600);
};

// --- Desktop, first visit
{
	const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
	const page = await ctx.newPage();
	watch(page, '1440');
	await page.goto(base, { waitUntil: 'commit' });
	// Time the intro from the moment the preloader is actually animating.
	await page.waitForFunction(() => document.querySelector('.preloader [data-char]')?.style.transform);
	const t0 = Date.now();
	for (const t of [300, 900, 1500, 2150]) {
		await page.waitForTimeout(Math.max(0, t - (Date.now() - t0)));
		await page.screenshot({ path: `${out}/1440-intro-${t}.png` });
	}
	await page.waitForTimeout(500);
	await page.screenshot({ path: `${out}/1440-decrypting.png` });
	await page.waitForTimeout(2400);
	console.log('1440 mode:', await heroMode(page));
	await page.screenshot({ path: `${out}/1440-hero.png` });

	await page.mouse.move(600, 380);
	await page.mouse.move(700, 430, { steps: 12 });
	await page.waitForTimeout(500);
	await page.screenshot({ path: `${out}/1440-lens.png` });
	await page.mouse.move(1430, 890);

	await scrollToProgress(page, 0.5);
	await page.screenshot({ path: `${out}/1440-scroll-50.png` });
	await scrollToProgress(page, 1);
	await page.screenshot({ path: `${out}/1440-scroll-100.png` });

	// Repeat visit in the same session: no preloader.
	await page.goto(base);
	await page.waitForTimeout(150);
	const shown = await page.evaluate(() => {
		const p = document.querySelector('.preloader');
		return !!p && getComputedStyle(p).display !== 'none';
	});
	console.log('repeat visit preloader visible:', shown);
	await ctx.close();
}

// --- Mobile (touch, lite)
{
	const ctx = await browser.newContext({
		viewport: { width: 390, height: 844 },
		hasTouch: true,
		isMobile: true,
		deviceScaleFactor: 2
	});
	const page = await ctx.newPage();
	watch(page, '390');
	await page.goto(base);
	await page.waitForTimeout(1500);
	await page.screenshot({ path: `${out}/390-intro.png` });
	await page.waitForTimeout(3800);
	console.log('390 mode:', await heroMode(page));
	await page.screenshot({ path: `${out}/390-hero.png` });
	await scrollToProgress(page, 0.5);
	await page.screenshot({ path: `${out}/390-scroll-50.png` });
	await scrollToProgress(page, 1);
	await page.screenshot({ path: `${out}/390-scroll-100.png` });
	await ctx.close();
}

// --- Reduced motion
{
	const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
	const page = await ctx.newPage();
	watch(page, 'reduced');
	await page.goto(base, { waitUntil: 'networkidle' });
	await page.waitForTimeout(800);
	console.log('reduced mode:', await heroMode(page));
	await page.screenshot({ path: `${out}/reduced-hero.png` });
	await page.evaluate(() => window.scrollTo(0, innerHeight));
	await page.waitForTimeout(400);
	await page.screenshot({ path: `${out}/reduced-about.png` });
	await ctx.close();
}

await browser.close();
console.log(errors.length ? `Console/page issues:\n${errors.join('\n')}` : 'No console/page errors.');
