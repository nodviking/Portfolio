/**
 * Decrypt field: a dependency-free WebGL2 particle renderer for the hero.
 *
 * - Particles are sampled from the *real* DOM text (per-character rects), so they sit exactly on top of the
 *   HTML <h1>/<h2> and the fallback never jumps.
 * - Every particle is drawn as a tiny code character (0-9 a-f { } < > = / •) from a glyph atlas, so the settled
 *   wordmark reads as ASCII art. Characters churn fast while a letter is still ciphertext and flip slowly at rest.
 * - Each letter "slot" cycles through random cipher glyphs (particles spring to the new shape) until it locks
 *   onto its final letter, left to right.
 * - Idle: particles breathe (small per-particle drift + a slow wave). Pointer pushes them away; touch taps send a
 *   ripple ring. Scroll progress disperses them and re-forms the About headline.
 * - CPU spring physics on Float32Arrays, one dynamic buffer upload per frame, two additive passes (soft halo + glyph).
 *
 * Lazy-loaded by Hero.svelte; nothing here runs on the server.
 */

export interface DecryptFieldOptions {
	canvas: HTMLCanvasElement;
	/** Stage element the canvas covers (sticky, viewport-sized). All coordinates are relative to it. */
	stage: HTMLElement;
	/** The hero <h1>; its characters become the letter slots. */
	heroText: HTMLElement;
	/** The About <h2>; particles re-form into it at scroll progress 1. */
	aboutText: HTMLElement;
	/** Element whose box marks where the About headline lands (the last viewport of the hero section). */
	aboutFrame: HTMLElement;
	/** Fewer particles, lower DPR, no pointer physics (touch / low-power devices). */
	lite: boolean;
	/** CSS font shorthand for the display face at a given size, e.g. `900 expanded 120px "Archivo Variable"`. */
	displayFont: (px: number) => string;
	/** Family used to draw the code characters. */
	monoFamily: string;
	onDecrypted?: () => void;
}

export interface DecryptField {
	/** Burst in from scattered positions and run the decrypt sequence. */
	start(): void;
	/** Scroll progress 0..1 (hero → About headline). */
	setProgress(p: number): void;
	/** Pointer position relative to the stage, or null when outside. */
	setPointer(x: number | null, y: number | null): void;
	/** Send a ripple ring out from a point (touch taps). */
	ripple(x: number, y: number): void;
	setRunning(running: boolean): void;
	rebuild(): Promise<void>;
	destroy(): void;
}

/** Big cipher shapes a letter slot cycles through before it locks. */
const CIPHER = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#$%&@?<>/';
/** The small characters every particle is drawn as. */
const ASCII = '0123456789abcdef{}<>=/•';
// #2F6BFF as 0..1 sRGB
const ACCENT: [number, number, number] = [0.184, 0.42, 1.0];

/* ------------------------------------------------------------------ text sampling */

interface CharBox {
	ch: string;
	left: number;
	top: number;
	width: number;
	height: number;
}

/** Per-character client rects for an element's text, honouring text-transform. */
function charBoxes(el: HTMLElement): CharBox[] {
	const upper = getComputedStyle(el).textTransform === 'uppercase';
	const out: CharBox[] = [];
	const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
	const range = document.createRange();
	for (let node = walker.nextNode(); node; node = walker.nextNode()) {
		const text = node.textContent ?? '';
		for (let i = 0; i < text.length; i++) {
			const ch = text[i];
			if (!ch.trim()) continue;
			range.setStart(node, i);
			range.setEnd(node, i + 1);
			const r = range.getClientRects()[0];
			if (!r || r.width === 0) continue;
			out.push({
				ch: upper ? ch.toUpperCase() : ch,
				left: r.left,
				top: r.top,
				width: r.width,
				height: r.height
			});
		}
	}
	range.detach();
	return out;
}

interface Glyph {
	/** Flat [x, y, x, y, …] offsets from (left edge, baseline). */
	pts: Float32Array;
	advance: number;
}

class GlyphSampler {
	private cache = new Map<string, Glyph>();
	private ctx: CanvasRenderingContext2D;

	constructor(private font: (px: number) => string) {
		const c = document.createElement('canvas');
		this.ctx = c.getContext('2d', { willReadFrequently: true })!;
	}

	ascent(px: number): number {
		this.ctx.font = this.font(px);
		const m = this.ctx.measureText('H');
		return m.fontBoundingBoxAscent ?? px * 0.9;
	}

	glyph(ch: string, px: number, step: number): Glyph {
		const key = `${ch}|${px.toFixed(1)}|${step.toFixed(2)}`;
		const hit = this.cache.get(key);
		if (hit) return hit;

		const ctx = this.ctx;
		const font = this.font(px);
		ctx.font = font;
		const advance = ctx.measureText(ch).width;
		const pad = Math.ceil(px * 0.15);
		const w = Math.ceil(advance + pad * 2);
		const h = Math.ceil(px * 1.5);
		const base = Math.ceil(px * 1.15);
		ctx.canvas.width = w;
		ctx.canvas.height = h;
		ctx.font = font; // resizing resets state
		ctx.fillStyle = '#fff';
		ctx.textBaseline = 'alphabetic';
		ctx.fillText(ch, pad, base);

		// A regular grid reads as ASCII art; sample at cell centres.
		const data = ctx.getImageData(0, 0, w, h).data;
		const pts: number[] = [];
		for (let y = step / 2; y < h; y += step) {
			const yi = Math.round(y);
			for (let x = step / 2; x < w; x += step) {
				const xi = Math.round(x);
				if (data[(yi * w + xi) * 4 + 3] > 120) pts.push(x - pad, y - base);
			}
		}
		const g = { pts: new Float32Array(pts), advance };
		this.cache.set(key, g);
		return g;
	}
}

/** Evenly pick `k` points from a flat point list (repeating with jitter if it is shorter). */
function resample(src: Float32Array, k: number, jitter: number, out: Float32Array) {
	const n = src.length / 2;
	if (n === 0) {
		out.fill(0);
		return;
	}
	const rep = k > n;
	for (let j = 0; j < k; j++) {
		const i = Math.floor((j * n) / k);
		out[j * 2] = src[i * 2] + (rep ? (Math.random() - 0.5) * jitter : 0);
		out[j * 2 + 1] = src[i * 2 + 1] + (rep ? (Math.random() - 0.5) * jitter : 0);
	}
}

/** One-row texture atlas of the ASCII characters (white on transparent). */
function buildAtlas(family: string): HTMLCanvasElement {
	const cell = 64;
	const c = document.createElement('canvas');
	c.width = cell * ASCII.length;
	c.height = cell;
	const ctx = c.getContext('2d')!;
	ctx.fillStyle = '#fff';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	// Padding inside each cell keeps mipmaps from bleeding between neighbours.
	ctx.font = `800 ${cell * 0.82}px ${family}`;
	for (let i = 0; i < ASCII.length; i++) ctx.fillText(ASCII[i], i * cell + cell / 2, cell * 0.53);
	return c;
}

/* ------------------------------------------------------------------ GL helpers */

const VERT = /* glsl */ `#version 300 es
in vec3 a_dyn;     // x, y (css px, stage space), hot (0..1)
in vec2 a_seed;    // random 0..1, char index
uniform vec2 u_res;
uniform float u_size;
uniform float u_glow;
out float v_hot;
out float v_seed;
out float v_char;
void main() {
	vec2 c = a_dyn.xy / u_res * 2.0 - 1.0;
	gl_Position = vec4(c.x, -c.y, 0.0, 1.0);
	gl_PointSize = u_glow > 0.5 ? u_size * 1.9 : u_size;
	v_hot = a_dyn.z;
	v_seed = a_seed.x;
	v_char = a_seed.y;
}`;

const FRAG = /* glsl */ `#version 300 es
precision highp float;
in float v_hot;
in float v_seed;
in float v_char;
uniform float u_glow;
uniform float u_time;
uniform float u_alpha;
uniform float u_nchars;
uniform vec3 u_color;
uniform sampler2D u_atlas;
out vec4 o;
void main() {
	vec3 hotc = vec3(0.72, 0.8, 1.0);
	vec3 col = mix(u_color, hotc, v_hot * 0.6);
	if (u_glow > 0.5) {
		float d = length(gl_PointCoord - 0.5);
		float a = exp(-d * d * 14.0) * 0.035 * u_alpha;
		o = vec4(u_color * a, a);
		return;
	}
	// Ciphertext churns fast; settled characters flip every few seconds, staggered.
	float rate = mix(0.28, 16.0, step(0.25, v_hot));
	float idx = mod(v_char + floor(u_time * rate + v_seed * 17.0), u_nchars);
	vec2 uv = vec2((idx + gl_PointCoord.x) / u_nchars, gl_PointCoord.y);
	float a = texture(u_atlas, uv).a;
	float flick = 0.6 + 0.4 * sin(u_time * 9.0 + v_seed * 60.0);
	a = min(1.0, a * 1.35) * u_alpha * mix(1.0, flick, v_hot);
	o = vec4(col * a, a);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
	const s = gl.createShader(type)!;
	gl.shaderSource(s, src);
	gl.compileShader(s);
	if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
		throw new Error(gl.getShaderInfoLog(s) ?? 'shader compile failed');
	}
	return s;
}

/* ------------------------------------------------------------------ field */

interface Slot {
	start: number;
	count: number;
	final: string;
	left: number;
	width: number;
	baseline: number;
	px: number;
	lockAt: number;
	nextSwap: number;
	locked: boolean;
}

interface Ripple {
	x: number;
	y: number;
	t: number;
}

export async function createDecryptField(opts: DecryptFieldOptions): Promise<DecryptField | null> {
	const { canvas, stage, heroText, aboutText, aboutFrame, lite, displayFont, monoFamily } = opts;

	const gl = canvas.getContext('webgl2', {
		alpha: true,
		antialias: false,
		premultipliedAlpha: true,
		powerPreference: lite ? 'low-power' : 'high-performance'
	});
	if (!gl) {
		console.warn('[hero] WebGL2 context unavailable');
		return null;
	}

	// --- program
	const prog = gl.createProgram()!;
	gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
	gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
	gl.linkProgram(prog);
	if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
		console.warn('[hero] particle program failed to link:', gl.getProgramInfoLog(prog));
		return null;
	}
	gl.useProgram(prog);

	const loc = {
		dyn: gl.getAttribLocation(prog, 'a_dyn'),
		seed: gl.getAttribLocation(prog, 'a_seed'),
		res: gl.getUniformLocation(prog, 'u_res'),
		size: gl.getUniformLocation(prog, 'u_size'),
		glow: gl.getUniformLocation(prog, 'u_glow'),
		time: gl.getUniformLocation(prog, 'u_time'),
		alpha: gl.getUniformLocation(prog, 'u_alpha'),
		nchars: gl.getUniformLocation(prog, 'u_nchars'),
		color: gl.getUniformLocation(prog, 'u_color'),
		atlas: gl.getUniformLocation(prog, 'u_atlas')
	};
	const vao = gl.createVertexArray()!;
	const dynBuf = gl.createBuffer()!;
	const seedBuf = gl.createBuffer()!;
	gl.bindVertexArray(vao);
	gl.uniform3fv(loc.color, ACCENT);
	gl.uniform1f(loc.nchars, ASCII.length);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE);
	gl.clearColor(0, 0, 0, 0);

	// --- glyph atlas
	await document.fonts.load(`800 40px ${monoFamily}`).catch(() => undefined);
	const tex = gl.createTexture()!;
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, buildAtlas(monoFamily));
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.uniform1i(loc.atlas, 0);

	const sampler = new GlyphSampler(displayFont);

	// --- state
	let N = 0;
	let pos = new Float32Array(0);
	let vel = new Float32Array(0);
	let home = new Float32Array(0);
	let about = new Float32Array(0);
	let scatter = new Float32Array(0);
	let phase = new Float32Array(0);
	let dyn = new Float32Array(0);
	let hot = new Float32Array(0);
	let slots: Slot[] = [];
	let tmp = new Float32Array(0);
	let step = 5;
	let vw = 1;
	let vh = 1;
	let dpr = 1;

	let progress = 0;
	let progressSmooth = 0;
	let px: number | null = null;
	let py: number | null = null;
	let pvx = 0;
	let pvy = 0;
	let lastPx = 0;
	let lastPy = 0;
	const ripples: Ripple[] = [];

	let started = false;
	let decryptT0 = 0;
	let decrypted = false;
	let running = true;
	let raf = 0;
	let destroyed = false;
	let t0 = performance.now();

	function setSlotGlyph(s: Slot, ch: string) {
		const g = sampler.glyph(ch, s.px, step);
		if (tmp.length < s.count * 2) tmp = new Float32Array(s.count * 2);
		resample(g.pts, s.count, step * 0.6, tmp);
		const ox = s.left + (s.width - g.advance) / 2;
		for (let j = 0; j < s.count; j++) {
			const i = s.start + j;
			home[i * 2] = ox + tmp[j * 2];
			home[i * 2 + 1] = s.baseline + tmp[j * 2 + 1];
		}
	}

	async function build() {
		const sr = stage.getBoundingClientRect();
		vw = Math.max(1, sr.width);
		vh = Math.max(1, sr.height);
		dpr = Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2);
		canvas.width = Math.round(vw * dpr);
		canvas.height = Math.round(vh * dpr);
		gl!.viewport(0, 0, canvas.width, canvas.height);

		const heroPx = parseFloat(getComputedStyle(heroText).fontSize) || 100;
		const aboutPx = parseFloat(getComputedStyle(aboutText).fontSize) || 60;
		await Promise.all([
			document.fonts.load(displayFont(heroPx)),
			document.fonts.load(displayFont(aboutPx))
		]);
		if (destroyed) return;

		// Character cell size: ~20 rows per em on desktop, so each glyph is big enough to read as a code character
		// while the wide letters stay readable as NODVIKING. Phones use ~13 rows per em (fewer particles).
		step = Math.max(lite ? 4.6 : 6, heroPx / (lite ? 13 : 20));

		// Hero slots, in stage coordinates.
		const boxes = charBoxes(heroText);
		const ascent = sampler.ascent(heroPx);
		const finals = boxes.map((b) => sampler.glyph(b.ch, heroPx, step));
		N = finals.reduce((n, g) => n + g.pts.length / 2, 0);

		const prevStarted = started;
		pos = new Float32Array(N * 2);
		vel = new Float32Array(N * 2);
		home = new Float32Array(N * 2);
		about = new Float32Array(N * 2);
		scatter = new Float32Array(N * 2);
		phase = new Float32Array(N * 2);
		dyn = new Float32Array(N * 3);
		hot = new Float32Array(N);

		let start = 0;
		slots = boxes.map((b, i) => {
			const count = finals[i].pts.length / 2;
			const s: Slot = {
				start,
				count,
				final: b.ch,
				left: b.left - sr.left,
				width: b.width,
				baseline: b.top - sr.top + ascent,
				px: heroPx,
				lockAt: 0,
				nextSwap: 0,
				locked: decrypted
			};
			start += count;
			return s;
		});
		for (const s of slots) {
			setSlotGlyph(s, decrypted ? s.final : CIPHER[(Math.random() * CIPHER.length) | 0]);
			for (let j = 0; j < s.count; j++) hot[s.start + j] = decrypted ? 0 : 1;
		}

		// About headline targets: its final resting place is the aboutFrame (last viewport of the section),
		// so measure relative to that frame rather than the current scroll position.
		const fr = aboutFrame.getBoundingClientRect();
		const aBoxes = charBoxes(aboutText);
		const aAscent = sampler.ascent(aboutPx);
		const aStep = Math.max(1.6, step * (aboutPx / heroPx) * 0.85);
		const aPts: number[] = [];
		for (const b of aBoxes) {
			const g = sampler.glyph(b.ch, aboutPx, aStep);
			const ox = b.left - fr.left;
			const oy = b.top - fr.top + aAscent;
			for (let j = 0; j < g.pts.length; j += 2) aPts.push(ox + g.pts[j], oy + g.pts[j + 1]);
		}
		// Sort both sets left→right so letters flow across instead of criss-crossing.
		const order = (arr: Float32Array | number[], n: number) =>
			Array.from({ length: n }, (_, i) => i).sort((a, b) => arr[a * 2] - arr[b * 2]);
		const aN = aPts.length / 2;
		const homeOrder = order(home, N);
		const aboutOrder = order(aPts, aN);
		for (let r = 0; r < N; r++) {
			const i = homeOrder[r];
			const k = aboutOrder[Math.floor((r * aN) / N)] ?? 0;
			about[i * 2] = (aPts[k * 2] ?? vw / 2) + (Math.random() - 0.5) * aStep * 0.6;
			about[i * 2 + 1] = (aPts[k * 2 + 1] ?? vh / 2) + (Math.random() - 0.5) * aStep * 0.6;
		}

		// Dispersion directions for the mid-scroll scatter, and breathing phases.
		const spread = Math.max(vw, vh) * 0.45;
		for (let i = 0; i < N; i++) {
			const a = Math.random() * Math.PI * 2;
			const r = spread * (0.25 + Math.random() * 0.75);
			scatter[i * 2] = Math.cos(a) * r;
			scatter[i * 2 + 1] = Math.sin(a) * r * 0.7;
			phase[i * 2] = Math.random() * Math.PI * 2;
			phase[i * 2 + 1] = Math.random() * Math.PI * 2;
		}

		// Initial positions: scattered before start, settled after a rebuild.
		for (let i = 0; i < N; i++) {
			if (prevStarted) {
				pos[i * 2] = home[i * 2];
				pos[i * 2 + 1] = home[i * 2 + 1];
			} else {
				pos[i * 2] = Math.random() * vw;
				pos[i * 2 + 1] = Math.random() * vh;
			}
		}

		const seeds = new Float32Array(N * 2);
		for (let i = 0; i < N; i++) {
			seeds[i * 2] = Math.random();
			seeds[i * 2 + 1] = (Math.random() * ASCII.length) | 0;
		}

		gl!.bindVertexArray(vao);
		gl!.bindBuffer(gl!.ARRAY_BUFFER, seedBuf);
		gl!.bufferData(gl!.ARRAY_BUFFER, seeds, gl!.STATIC_DRAW);
		gl!.enableVertexAttribArray(loc.seed);
		gl!.vertexAttribPointer(loc.seed, 2, gl!.FLOAT, false, 0, 0);

		gl!.bindBuffer(gl!.ARRAY_BUFFER, dynBuf);
		gl!.bufferData(gl!.ARRAY_BUFFER, dyn.byteLength, gl!.DYNAMIC_DRAW);
		gl!.enableVertexAttribArray(loc.dyn);
		gl!.vertexAttribPointer(loc.dyn, 3, gl!.FLOAT, false, 0, 0);
	}

	function scheduleDecrypt(now: number) {
		decryptT0 = now;
		const per = lite ? 120 : 105;
		slots.forEach((s, i) => {
			s.locked = false;
			s.lockAt = 380 + i * per;
			s.nextSwap = 0;
		});
	}

	function tickDecrypt(now: number) {
		if (decrypted) return;
		const t = now - decryptT0;
		let allLocked = true;
		for (const s of slots) {
			if (s.locked) continue;
			if (t >= s.lockAt) {
				s.locked = true;
				setSlotGlyph(s, s.final);
				continue;
			}
			allLocked = false;
			if (t >= s.nextSwap) {
				setSlotGlyph(s, CIPHER[(Math.random() * CIPHER.length) | 0]);
				s.nextSwap = t + 55 + Math.random() * 45;
			}
		}
		if (allLocked) {
			decrypted = true;
			opts.onDecrypted?.();
		}
	}

	function frame(now: number) {
		raf = 0;
		if (destroyed) return;
		if (running) raf = requestAnimationFrame(frame);

		if (started) tickDecrypt(now);
		const time = (now - t0) / 1000;

		progressSmooth += (progress - progressSmooth) * 0.14;
		const p = progressSmooth;
		const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
		const burst = Math.sin(Math.PI * p);

		// Pointer velocity boosts the push a little.
		if (px !== null && py !== null) {
			pvx = px - lastPx;
			pvy = py - lastPy;
			lastPx = px;
			lastPy = py;
		}
		const speed = Math.min(1, Math.hypot(pvx, pvy) / 40);
		const R = (lite ? 0 : 120) * (1 - p);
		const R2 = R * R;
		const F = 2.6 + speed * 3;
		const K = started ? 0.055 : 0;
		const D = 0.84;

		// Breathing: per-particle drift plus a slow travelling wave, faded out while scrolling.
		const breathe = decrypted ? step * 0.12 * (1 - Math.min(1, p * 4)) : 0;
		const wave = decrypted ? step * 0.16 * (1 - Math.min(1, p * 4)) : 0;

		// Ripples (touch taps): expanding rings that push particles outward.
		for (let r = ripples.length - 1; r >= 0; r--) {
			if ((now - ripples[r].t) / 1000 > 1.2) ripples.splice(r, 1);
		}

		for (let i = 0; i < N; i++) {
			const ix = i * 2;
			const iy = ix + 1;
			let tx = home[ix] + (about[ix] - home[ix]) * e + scatter[ix] * burst;
			let ty = home[iy] + (about[iy] - home[iy]) * e + scatter[iy] * burst;
			if (breathe > 0) {
				tx += Math.sin(time * 0.9 + phase[ix]) * breathe;
				ty += Math.cos(time * 0.75 + phase[iy]) * breathe + Math.sin(time * 1.1 + home[ix] * 0.012) * wave;
			}
			let ax = (tx - pos[ix]) * K;
			let ay = (ty - pos[iy]) * K;
			if (R2 > 0 && px !== null && py !== null) {
				const dx = pos[ix] - px;
				const dy = pos[iy] - py;
				const d2 = dx * dx + dy * dy;
				if (d2 < R2 && d2 > 0.01) {
					const d = Math.sqrt(d2);
					const f = (1 - d / R) * (1 - d / R) * F;
					ax += (dx / d) * f;
					ay += (dy / d) * f;
				}
			}
			for (let r = 0; r < ripples.length; r++) {
				const rp = ripples[r];
				const age = (now - rp.t) / 1000;
				const radius = age * 480;
				const band = 26 + age * 30;
				const dx = pos[ix] - rp.x;
				const dy = pos[iy] - rp.y;
				const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
				const off = Math.abs(d - radius);
				if (off < band) {
					const f = (1 - off / band) * (1 - age / 1.2) * 3.2;
					ax += (dx / d) * f;
					ay += (dy / d) * f;
				}
			}
			vel[ix] = (vel[ix] + ax) * D;
			vel[iy] = (vel[iy] + ay) * D;
			pos[ix] += vel[ix];
			pos[iy] += vel[iy];

			dyn[i * 3] = pos[ix];
			dyn[i * 3 + 1] = pos[iy];
		}
		// Per-slot heat: cipher glyphs run pale and churn, locked letters cool to the accent blue.
		for (const s of slots) {
			const v = s.locked ? 0 : 1;
			for (let j = 0; j < s.count; j++) {
				const i = s.start + j;
				const hv = hot[i] + (v - hot[i]) * 0.2;
				hot[i] = hv;
				dyn[i * 3 + 2] = hv * (1 - p);
			}
		}

		gl!.clear(gl!.COLOR_BUFFER_BIT);
		if (!started) return;

		gl!.bindVertexArray(vao);
		gl!.bindBuffer(gl!.ARRAY_BUFFER, dynBuf);
		gl!.bufferSubData(gl!.ARRAY_BUFFER, 0, dyn);
		gl!.uniform2f(loc.res, vw, vh);
		gl!.uniform1f(loc.time, time);
		// Fade most of the particle layer once the crisp DOM headline takes over at the very end.
		const endFade = Math.min(1, Math.max(0, (p - 0.9) / 0.1));
		gl!.uniform1f(loc.alpha, 1 - endFade * 0.8);
		// Glyphs slightly larger than their cell so strokes touch and the letter reads as a solid shape.
		gl!.uniform1f(loc.size, step * 1.3 * dpr);

		gl!.uniform1f(loc.glow, 1);
		gl!.drawArrays(gl!.POINTS, 0, N);
		gl!.uniform1f(loc.glow, 0);
		gl!.drawArrays(gl!.POINTS, 0, N);
	}

	function kick() {
		if (!raf && running && !destroyed) raf = requestAnimationFrame(frame);
	}

	await build();
	if (destroyed) return null;

	return {
		start() {
			if (started) return;
			started = true;
			t0 = performance.now();
			scheduleDecrypt(t0);
			kick();
		},
		setProgress(p) {
			progress = Math.min(1, Math.max(0, p));
		},
		setPointer(x, y) {
			if (x === null || y === null) {
				px = py = null;
				return;
			}
			if (px === null) {
				lastPx = x;
				lastPy = y;
			}
			px = x;
			py = y;
		},
		ripple(x, y) {
			if (ripples.length >= 4) ripples.shift();
			ripples.push({ x, y, t: performance.now() });
			kick();
		},
		setRunning(r) {
			running = r;
			if (r) kick();
			else if (raf) {
				cancelAnimationFrame(raf);
				raf = 0;
			}
		},
		async rebuild() {
			await build();
		},
		destroy() {
			destroyed = true;
			if (raf) cancelAnimationFrame(raf);
			gl!.deleteBuffer(dynBuf);
			gl!.deleteBuffer(seedBuf);
			gl!.deleteTexture(tex);
			gl!.deleteVertexArray(vao);
			gl!.deleteProgram(prog);
			gl!.getExtension('WEBGL_lose_context')?.loseContext();
		}
	};
}
