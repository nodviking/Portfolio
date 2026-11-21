// Extra QA: hero at 768/1920, client hover preview, mobile accordion, case study + page transition,
// reduced motion (StoreEnv stacks, no cursor), copy-email state. node scripts/shots-extra.mjs [base] [out]
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const base = process.argv[2] ?? 'http://localhost:4173';
const out = process.argv[3] ?? 'shots';
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const errors = [];
const watch = (p, t) => {
	p.on('pageerror', (e) => errors.push(`${t}: ${e.message}`));
	p.on('console', (m) => ['error', 'warning'].includes(m.type()) && errors.push(`${t}: ${m.text()}`));
};
const ctxFor = async (w, h, extra = {}) => {
	const mobile = w < 768;
	const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile, ...extra });
	await ctx.addInitScript(() => sessionStorage.setItem('nv-intro', '1'));
	return ctx;
};
const scrollTo = async (page, id) => {
	const y = await page.evaluate((id) => document.getElementById(id).getBoundingClientRect().top + scrollY, id);
	for (let s = await page.evaluate(() => scrollY); s < y; s += 500) {
		await page.evaluate((s) => scrollTo(0, s), s);
		await page.waitForTimeout(120);
	}
	await page.evaluate((y) => scrollTo(0, y), y);
	await page.waitForTimeout(1500);
};

for (const [w, h] of [[768, 1024], [1920, 1080]]) {
	const ctx = await ctxFor(w, h);
	const page = await ctx.newPage();
	watch(page, String(w));
	await page.goto(base, { waitUntil: 'networkidle' });
	await page.waitForTimeout(2800);
	await page.screenshot({ path: `${out}/${w}-top.png` });
	await ctx.close();
}

// Desktop: client hover preview, then click through to a case study (page transition).
{
	const ctx = await ctxFor(1440, 900);
	const page = await ctx.newPage();
	watch(page, 'hover');
	await page.goto(base, { waitUntil: 'networkidle' });
	await page.waitForTimeout(1500);
	await scrollTo(page, 'work');
	const row = page.locator('#work a.row').nth(1);
	const box = await row.boundingBox();
	await page.mouse.move(box.x + 300, box.y + box.height / 2, { steps: 6 });
	await page.mouse.move(box.x + 420, box.y + box.height / 2, { steps: 10 });
	await page.waitForTimeout(900);
	await page.screenshot({ path: `${out}/1440-work-hover.png` });
	await row.click();
	await page.waitForTimeout(450);
	await page.screenshot({ path: `${out}/1440-transition.png` });
	await page.waitForURL('**/work/**');
	await page.waitForTimeout(2200);
	await page.screenshot({ path: `${out}/1440-case.png` });
	await page.evaluate(() => window.scrollTo(0, innerHeight * 1.1));
	await page.waitForTimeout(1500);
	await page.screenshot({ path: `${out}/1440-case-2.png` });
	console.log('case title:', await page.title());
	await ctx.close();
}

// Mobile: accordion row, case study.
{
	const ctx = await ctxFor(390, 844);
	const page = await ctx.newPage();
	watch(page, '390-acc');
	await page.goto(base, { waitUntil: 'networkidle' });
	await page.waitForTimeout(1500);
	await scrollTo(page, 'work');
	await page.locator('#work a.row').first().tap();
	await page.waitForTimeout(1000);
	await page.screenshot({ path: `${out}/390-work-open.png` });
	await page.goto(base + '/work/savora-hospitality', { waitUntil: 'networkidle' });
	await page.waitForTimeout(1800);
	await page.screenshot({ path: `${out}/390-case.png` });
	await ctx.close();
}

// Reduced motion: whole page, StoreEnv stacked.
{
	const ctx = await ctxFor(1440, 900, { reducedMotion: 'reduce' });
	const page = await ctx.newPage();
	watch(page, 'reduced');
	await page.goto(base, { waitUntil: 'networkidle' });
	await page.waitForTimeout(600);
	await page.screenshot({ path: `${out}/reduced-top.png` });
	await page.evaluate(() => document.getElementById('storeenv').scrollIntoView());
	await page.waitForTimeout(500);
	await page.screenshot({ path: `${out}/reduced-storeenv.png` });
	const cursor = await page.evaluate(() => !!document.querySelector('.cursor'));
	console.log('reduced: cursor present =', cursor);
	await ctx.close();
}

// Copy email state
{
	const ctx = await ctxFor(1440, 900, { permissions: ['clipboard-read', 'clipboard-write'] });
	const page = await ctx.newPage();
	watch(page, 'copy');
	await page.goto(base, { waitUntil: 'networkidle' });
	await page.waitForTimeout(1200);
	await scrollTo(page, 'contact');
	await page.locator('#contact button.email').click();
	await page.waitForTimeout(700);
	await page.screenshot({ path: `${out}/1440-copied.png` });
	console.log('clipboard:', await page.evaluate(() => navigator.clipboard.readText()));
	await ctx.close();
}

await browser.close();
console.log(errors.length ? `Console/page issues:\n${errors.join('\n')}` : 'No console/page errors.');
