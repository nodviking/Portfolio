// Visual QA: node scripts/shots.mjs [baseUrl] [outDir] [sectionIds,comma] [widths,comma]
// Screenshots each section at each width (preloader skipped), plus the first-visit intro and the mobile menu.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = process.argv[2] ?? 'http://localhost:4173';
const out = process.argv[3] ?? 'shots';
const ids = (process.argv[4] ?? 'top,about,storeenv,work,lab,experience,stack,numbers,design,contact').split(',');
const widths = (process.argv[5] ?? '1440,390').split(',').map(Number);
const heights = { 390: 844, 768: 1024, 1024: 768, 1440: 900, 1920: 1080 };

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const errors = [];
const watch = (page, tag) => {
	page.on('pageerror', (e) => errors.push(`${tag}: ${e.message}`));
	page.on('console', (m) => ['error', 'warning'].includes(m.type()) && errors.push(`${tag}: ${m.text()}`));
};

async function settleScroll(page, y) {
	await page.evaluate((y) => window.scrollTo(0, y), y);
	await page.waitForTimeout(250);
}

for (const w of widths) {
	const mobile = w < 768;
	const ctx = await browser.newContext({
		viewport: { width: w, height: heights[w] ?? 900 },
		deviceScaleFactor: mobile ? 2 : 1,
		isMobile: mobile,
		hasTouch: mobile
	});
	await ctx.addInitScript(() => sessionStorage.setItem('nv-intro', '1'));
	const page = await ctx.newPage();
	watch(page, String(w));
	await page.goto(base, { waitUntil: 'networkidle' });
	await page.waitForTimeout(2600);

	for (const id of ids) {
		const y = await page.evaluate((id) => {
			const el = document.getElementById(id);
			return el ? el.getBoundingClientRect().top + window.scrollY : null;
		}, id);
		if (y === null) {
			errors.push(`${w}: section #${id} missing`);
			continue;
		}
		// Walk down in steps so scroll-triggered reveals fire as they would for a reader.
		const from = await page.evaluate(() => window.scrollY);
		for (let s = from; s < y; s += 400) await settleScroll(page, s);
		await settleScroll(page, y);
		await page.waitForTimeout(id === 'storeenv' ? 600 : 1800);
		await page.screenshot({ path: `${out}/${w}-${id}.png` });
		if (id === 'storeenv' && !mobile) {
			// Pinned horizontal scroll: capture mid and end of the pin.
			const len = await page.evaluate(() => {
				const st = window.__nvStoreenvLen;
				return typeof st === 'number' ? st : 0;
			});
			for (const f of [0.5, 0.98]) {
				for (let s = y; s < y + len * f; s += 300) await settleScroll(page, s);
				await settleScroll(page, y + len * f);
				await page.waitForTimeout(900);
				await page.screenshot({ path: `${out}/${w}-${id}-${Math.round(f * 100)}.png` });
			}
		}
	}
	await ctx.close();
}

// First visit: preloader + hero intro (1440 and 390)
for (const w of [1440, 390].filter((x) => widths.includes(x))) {
	const mobile = w < 768;
	const ctx = await browser.newContext({
		viewport: { width: w, height: heights[w] },
		deviceScaleFactor: mobile ? 2 : 1,
		isMobile: mobile,
		hasTouch: mobile
	});
	const page = await ctx.newPage();
	watch(page, `${w}-intro`);
	await page.goto(base, { waitUntil: 'commit' });
	await page.waitForSelector('.preloader');
	await page.waitForTimeout(700);
	await page.screenshot({ path: `${out}/${w}-preloader.png` });
	await page.waitForTimeout(1250);
	await page.screenshot({ path: `${out}/${w}-wipe.png` });
	await page.waitForTimeout(500);
	await page.screenshot({ path: `${out}/${w}-intro.png` });
	await page.waitForTimeout(2200);
	await page.screenshot({ path: `${out}/${w}-hero-settled.png` });
	if (mobile) {
		await page.getByRole('button', { name: 'Open menu' }).click();
		await page.waitForTimeout(1400);
		await page.screenshot({ path: `${out}/${w}-menu.png` });
		await page.keyboard.press('Escape');
		await page.waitForTimeout(1200);
		const f = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
		console.log(`${w}: focus after Esc -> "${f}"`);
	}
	await ctx.close();
}

await browser.close();
console.log(errors.length ? `Console/page issues:\n${errors.join('\n')}` : 'No console/page errors.');
