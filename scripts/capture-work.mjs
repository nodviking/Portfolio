// Screenshots each client's live site (1440×900 desktop, 390×844 @2x mobile) into static/work/ as AVIF + WebP.
// Run: node scripts/capture-work.mjs
import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const clients = [
	{ slug: 'nante-patisserie', url: 'https://www.nantecakestudio.in' },
	{ slug: 'adc-by-dr-sanjana', url: 'https://www.adcbydrsanjana.in' },
	{ slug: 'savora-hospitality', url: 'https://www.savorahospitality.in' }
];
const shots = [
	{ name: 'desktop', width: 1440, height: 900, scale: 1, mobile: false },
	{ name: 'mobile', width: 390, height: 844, scale: 2, mobile: true }
];

await mkdir('static/work', { recursive: true });
const browser = await chromium.launch();
for (const c of clients) {
	for (const s of shots) {
		const ctx = await browser.newContext({
			viewport: { width: s.width, height: s.height },
			deviceScaleFactor: s.scale,
			isMobile: s.mobile,
			hasTouch: s.mobile,
			reducedMotion: 'reduce'
		});
		const page = await ctx.newPage();
		try {
			await page.goto(c.url, { waitUntil: 'networkidle', timeout: 60000 });
		} catch (e) {
			console.warn(`${c.slug} ${s.name}: ${e.message.split('\n')[0]}`);
		}
		await page.waitForTimeout(4500); // let preloaders / intro animations finish
		const png = await page.screenshot();
		const base = `static/work/${c.slug}-${s.name}`;
		await sharp(png).avif({ quality: 52 }).toFile(`${base}.avif`);
		await sharp(png).webp({ quality: 74 }).toFile(`${base}.webp`);
		console.log(`${base}: ok`);
		await ctx.close();
	}
}
await browser.close();
