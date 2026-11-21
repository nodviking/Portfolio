// Visual QA: node scripts/shots.mjs [baseUrl] [outDir]
// Captures the home route at every target width, plus menu-open and footer states.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = process.argv[2] ?? 'http://localhost:4173';
const out = process.argv[3] ?? 'shots';
const widths = [
	[390, 844],
	[768, 1024],
	[1024, 768],
	[1440, 900],
	[1920, 1080]
];

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const errors = [];

for (const [w, h] of widths) {
	const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
	page.on('pageerror', (e) => errors.push(`${w}: ${e.message}`));
	page.on('console', (m) => m.type() === 'error' && errors.push(`${w}: ${m.text()}`));
	await page.goto(base, { waitUntil: 'networkidle' });
	await page.evaluate(() => document.fonts.ready);
	await page.waitForTimeout(600);
	await page.screenshot({ path: `${out}/${w}-hero.png` });

	if (w === 390 || w === 1440) {
		await page.getByRole('button', { name: 'Menu' }).click();
		await page.waitForTimeout(1800);
		await page.screenshot({ path: `${out}/${w}-menu.png` });
		await page.keyboard.press('Escape');
		await page.waitForTimeout(1200);
		const focused = await page.evaluate(() => document.activeElement?.textContent?.trim());
		console.log(`${w}: focus after Esc -> "${focused}"`);

		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		await page.waitForTimeout(1500);
		await page.screenshot({ path: `${out}/${w}-footer.png` });
	}
	await page.close();
}

await browser.close();
console.log(errors.length ? `Errors:\n${errors.join('\n')}` : 'No console/page errors.');
