// Generates static/og.png (1200×630), static/favicon-32.png and static/apple-touch-icon.png from HTML,
// using the same self-hosted JetBrains Mono as the site. Run: node scripts/brand-assets.mjs
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const font = path.join(
	root,
	'node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2'
);

// Embedded as a data URL: pages created with setContent can't load file:// fonts.
const fontData = (await readFile(font)).toString('base64');
const css = `
@font-face { font-family: JBM; src: url(data:font/woff2;base64,${fontData}) format('woff2'); font-weight: 100 800; }
* { margin: 0; box-sizing: border-box; }
html, body { background: #0e0e0e; color: #ededf0; font-family: JBM, monospace; }
.box { position: relative; display: inline-block; padding: 0 0.06em 0 0.05em; background: #6b0f1f; color: #ffffff; }
.wm { font-weight: 800; letter-spacing: -0.06em; line-height: 0.9; color: #ae2e44; white-space: nowrap; }
`;

const og = `<!doctype html><html><head><style>${css}
body { width: 1200px; height: 630px; padding: 56px 64px; display: flex; flex-direction: column;
  background-image: radial-gradient(circle, rgba(237,237,240,.06) 1.2px, transparent 1.6px); background-size: 28px 28px; }
.top { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; letter-spacing: .12em; color: #8a8f98; }
.top b { color: #cc5b6b; }
.tag { align-self: flex-start; margin-top: 40px; border: 1px solid rgba(237,237,240,.22); padding: 8px 14px; font-size: 16px;
  font-weight: 700; letter-spacing: .14em; display: flex; gap: 12px; align-items: center; }
.tag i { width: 10px; height: 10px; background: #cc5b6b; display: block; }
.wm { margin-top: auto; font-size: 196px; }
.rule { height: 1px; background: #2a2a2a; margin-top: 30px; }
.foot { margin-top: 18px; font-size: 18px; color: #8a8f98; display: flex; justify-content: space-between; }
.foot span:first-child { color: #ededf0; }
</style></head><body>
<div class="top"><span><b>[01]</b> / INDEX.HTML</span><span>LAT 28.61°N / LON 77.20°E</span></div>
<div class="tag"><i></i>DEVELOPER × DESIGNER · DELHI</div>
<div class="wm">NOD<span class="box" style="margin-left:.14em">VIKING</span></div>
<div class="rule"></div>
<div class="foot"><span>I design brands and build the products behind them.</span><span>nodviking</span></div>
</body></html>`;

const icon = (size) => `<!doctype html><html><head><style>${css}
body { width: ${size}px; height: ${size}px; display: grid; place-items: center; }
.box { font-size: ${Math.round(size * 0.58)}px; font-weight: 800; letter-spacing: -0.06em; line-height: 1; padding: ${Math.round(
	size * 0.08
)}px ${Math.round(size * 0.08)}px ${Math.round(size * 0.05)}px; }
</style></head><body><span class="box">NV</span></body></html>`;

const browser = await chromium.launch();
async function render(html, w, h, file) {
	const page = await browser.newPage({ viewport: { width: w, height: h } });
	await page.setContent(html);
	await page.evaluate(() => document.fonts.ready);
	await page.waitForTimeout(150);
	await page.screenshot({ path: path.join(root, 'static', file) });
	await page.close();
}
await render(og, 1200, 630, 'og.png');
await render(icon(32), 32, 32, 'favicon-32.png');
await render(icon(180), 180, 180, 'apple-touch-icon.png');
await browser.close();
console.log('wrote static/og.png, static/favicon-32.png, static/apple-touch-icon.png');
