// Visual QA: node scripts/shots.mjs [baseUrl] [outDir]
// Hero (mid-intro + settled), nav, About specimen cards, menu, at 1440 and 390 (+ other widths for the hero).
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = process.argv[2] ?? 'http://localhost:4173';
const out = process.argv[3] ?? 'shots';
await mkdir(out, { recursive: true });

const browser = await chromium.launch();
const errors = [];

const viewports = [
	{ w: 390, h: 844, mobile: true },
	{ w: 768, h: 1024 },
	{ w: 1024, h: 768 },
	{ w: 1440, h: 900 },
	{ w: 1920, h: 1080 }
];

for (const vp of viewports) {
	const ctx = await browser.newContext({
		viewport: { width: vp.w, height: vp.h },
		deviceScaleFactor: vp.mobile ? 2 : 1,
		isMobile: !!vp.mobile,
		hasTouch: !!vp.mobile
	});
	const page = await ctx.newPage();
	page.on('pageerror', (e) => errors.push(`${vp.w}: ${e.message}`));
	page.on('console', (m) => ['error', 'warning'].includes(m.type()) && errors.push(`${vp.w}: ${m.text()}`));

	await page.goto(base, { waitUntil: 'networkidle' });
	const full = vp.w === 390 || vp.w === 1440;

	if (full) {
		// Mid-intro: preloader (~2.6s) then the hero decode.
		await page.waitForFunction(() => document.querySelector('.hero')?.classList.contains('is-played'));
		await page.waitForTimeout(450);
		await page.screenshot({ path: `${out}/${vp.w}-hero-intro.png` });
	}
	await page.waitForTimeout(full ? 2200 : 4800);
	await page.screenshot({ path: `${out}/${vp.w}-hero.png` });

	if (!full) {
		await ctx.close();
		continue;
	}

	await page.screenshot({ path: `${out}/${vp.w}-nav.png`, clip: { x: 0, y: 0, width: vp.w, height: 96 } });

	// About cards
	await page.evaluate(() => document.getElementById('about')?.scrollIntoView({ block: 'start' }));
	await page.waitForTimeout(1600);
	await page.screenshot({ path: `${out}/${vp.w}-about.png` });
	if (vp.mobile) {
		await page.evaluate(() => window.scrollBy(0, innerHeight * 0.95));
		await page.waitForTimeout(1400);
		await page.screenshot({ path: `${out}/${vp.w}-about-2.png` });
	} else {
		await page.screenshot({ path: `${out}/${vp.w}-about-full.png`, fullPage: false });
	}

	if (vp.mobile) {
		await page.evaluate(() => window.scrollTo(0, 0));
		await page.waitForTimeout(800);
		await page.getByRole('button', { name: 'Open menu' }).click();
		await page.waitForTimeout(1600);
		await page.screenshot({ path: `${out}/${vp.w}-menu.png` });
		await page.keyboard.press('Escape');
		await page.waitForTimeout(1000);
		const focused = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
		console.log(`${vp.w}: focus after Esc -> "${focused}"`);
	}
	await ctx.close();
}

// Reduced motion: everything present, no intro
{
	const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
	const page = await ctx.newPage();
	page.on('pageerror', (e) => errors.push(`reduced: ${e.message}`));
	await page.goto(base, { waitUntil: 'networkidle' });
	await page.waitForTimeout(500);
	await page.screenshot({ path: `${out}/reduced-hero.png` });
	await ctx.close();
}

await browser.close();
console.log(errors.length ? `Console/page issues:\n${errors.join('\n')}` : 'No console/page errors.');
