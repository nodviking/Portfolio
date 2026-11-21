// QA for the Syntax Error-style effects: preloader stages, hero ASCII intro, scroll words, FAQ, footer.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const base = process.argv[2] ?? 'http://localhost:5173';
const out = process.argv[3] ?? 'shots';
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const errors = [];
for (const [w, h] of [[1440, 900], [390, 844]]) {
	const m = w < 768;
	const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: m ? 2 : 1, isMobile: m, hasTouch: m });
	const page = await ctx.newPage();
	page.on('pageerror', (e) => errors.push(`${w}: ${e.message}`));
	page.on('console', (x) => x.type() === 'error' && errors.push(`${w}: ${x.text()}`));
	await page.goto(base, { waitUntil: 'commit' });
	await page.waitForSelector('.preloader');
	const t0 = Date.now();
	for (const t of [900, 1700, 2250, 2550, 3000, 3500, 5200]) {
		await page.waitForTimeout(Math.max(0, t - (Date.now() - t0)));
		await page.screenshot({ path: `${out}/${w}-intro-${t}.png` });
	}
	const scrollTo = async (y) => {
		for (let s = await page.evaluate(() => scrollY); s < y; s += 400) {
			await page.evaluate((s) => scrollTo(0, s), s);
			await page.waitForTimeout(90);
		}
		await page.evaluate((y) => scrollTo(0, y), y);
		await page.waitForTimeout(900);
	};
	const words = await page.evaluate(() => {
		const el = document.querySelector('.words');
		return { top: el.getBoundingClientRect().top + scrollY, h: el.offsetHeight };
	});
	for (const f of [0.08, 0.2, 0.5, 0.85]) {
		await scrollTo(words.top + (words.h - innerHeightOf(h)) * f);
		await page.screenshot({ path: `${out}/${w}-words-${Math.round(f * 100)}.png` });
	}
	const faqY = await page.evaluate(() => document.getElementById('faq').getBoundingClientRect().top + scrollY);
	await scrollTo(faqY);
	await page.locator('#faq button.row').nth(1).click({ force: true });
	await page.waitForTimeout(800);
	await page.screenshot({ path: `${out}/${w}-faq.png` });
	const end = await page.evaluate(() => document.documentElement.scrollHeight);
	await scrollTo(end);
	await page.waitForTimeout(2000);
	await page.screenshot({ path: `${out}/${w}-footer.png` });
	await ctx.close();
}
function innerHeightOf(h) {
	return h;
}
await browser.close();
console.log(errors.length ? errors.join('\n') : 'No console/page errors.');
