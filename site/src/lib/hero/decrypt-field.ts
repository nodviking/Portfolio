/**
 * Decrypt field: a dependency-free WebGL2 particle renderer for the hero.
 *
 * - Particles are sampled from the *real* DOM text (per-character rects), so they sit exactly on top of the
 *   HTML <h1>/<h2> and the fallback never jumps.
 * - Each letter "slot" cycles through random cipher glyphs (particles spring to the new glyph) until it locks
 *   onto its final letter, left to right.
 * - Pointer pushes particles away (spring back); scroll progress disperses them and re-forms the About headline.
 * - CPU spring physics on Float32Arrays, one dynamic buffer upload per frame, two additive point passes
 *   (soft glow + core).
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
	fontFamily: string;
	onDecrypted?: () => void;
}

export interface DecryptField {
	/** Burst in from scattered positions and run the decrypt sequence. */
	start(): void;
	/** Scroll progress 0..1 (hero → About headline). */
	setProgress(p: number): void;
	/** Pointer position relative to the stage, or null when outside. */
	setPointer(x: number | null, y: number | null): void;
	setRunning(running: boolean): void;
	rebuild(): Promise<void>;
	destroy(): void;
}

const CIPHER = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#$%&@?<>/';
// #2F6BFF in linear-ish 0..1 sRGB
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

	constructor(private family: string) {
		const c = document.createElement('canvas');
		this.ctx = c.getContext('2d', { willReadFrequently: true })!;
	}

	ascent(px: number): number {
		this.ctx.font = `400 ${px}px ${this.family}`;
		const m = this.ctx.measureText('H');
		return m.fontBoundingBoxAscent ?? px * 0.9;
	}

	glyph(ch: string, px: number, step: number): Glyph {
		const key = `${ch}|${px.toFixed(1)}|${step.toFixed(2)}`;
		const hit = this.cache.get(key);
		if (hit) return hit;

		const ctx = this.ctx;
		const font = `400 ${px}px ${this.family}`;
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

		const data = ctx.getImageData(0, 0, w, h).data;
		const pts: number[] = [];
		for (let y = 0; y < h; y += step) {
			const yi = Math.round(y);
			for (let x = 0; x < w; x += step) {
				const xi = Math.round(x);
				// Jitter breaks the sampling grid up so it reads as particles, not an LED matrix.
				if (data[(yi * w + xi) * 4 + 3] > 140) {
					pts.push(
						xi - pad + (Math.random() - 0.5) * step * 0.8,
						yi - base + (Math.random() - 0.5) * step * 0.8
					);
				}
			}
		}
		const g = { pts: new Float32Array(pts), advance };
		this.cache.set(key, g);
		return g;
	}
}

/** Evenly pick `k` points from a flat point list (repeating with jitter if it is shorter). */
function resample(src: Float32Array, k: number, jitter: number, out: Float32Array, offset: number) {
	const n = src.length / 2;
	if (n === 0) {
		for (let j = 0; j < k; j++) {
			out[(offset + j) * 2] = 0;
			out[(offset + j) * 2 + 1] = 0;
		}
		return;
	}
	for (let j = 0; j < k; j++) {
		const i = Math.floor((j * n) / k);
		const rep = k > n;
		out[(offset + j) * 2] = src[i * 2] + (rep ? (Math.random() - 0.5) * jitter : 0);
		out[(offset + j) * 2 + 1] = src[i * 2 + 1] + (rep ? (Math.random() - 0.5) * jitter : 0);
	}
}

/* ------------------------------------------------------------------ GL helpers */

const VERT = /* glsl */ `#version 300 es
in vec3 a_dyn;     // x, y (css px, stage space), hot (0..1)
in float a_seed;
uniform vec2 u_res;
uniform float u_size;
uniform float u_glow;
out float v_hot;
out float v_seed;
void main() {
	vec2 c = a_dyn.xy / u_res * 2.0 - 1.0;
	gl_Position = vec4(c.x, -c.y, 0.0, 1.0);
	float s = u_size * mix(0.7, 1.15, a_seed);
	gl_PointSize = u_glow > 0.5 ? s * 2.4 : s;
	v_hot = a_dyn.z;
	v_seed = a_seed;
}`;

const FRAG = /* glsl */ `#version 300 es
precision highp float;
in float v_hot;
in float v_seed;
uniform float u_glow;
uniform float u_time;
uniform float u_alpha;
uniform vec3 u_color;
out vec4 o;
void main() {
	float d = length(gl_PointCoord - 0.5);
	vec3 hotc = vec3(0.7, 0.8, 1.0);
	vec3 col = mix(u_color, hotc, v_hot * 0.65);
	float flick = 0.55 + 0.45 * sin(u_time * 9.0 + v_seed * 60.0);
	float a = u_glow > 0.5 ? exp(-d * d * 18.0) * 0.045 : smoothstep(0.5, 0.15, d);
	a *= u_alpha * mix(0.92, flick, v_hot);
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

export async function createDecryptField(opts: DecryptFieldOptions): Promise<DecryptField | null> {
	const { canvas, stage, heroText, aboutText, aboutFrame, lite, fontFamily } = opts;

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
		color: gl.getUniformLocation(prog, 'u_color')
	};
	const vao = gl.createVertexArray()!;
	const dynBuf = gl.createBuffer()!;
	const seedBuf = gl.createBuffer()!;
	gl.bindVertexArray(vao);
	gl.uniform3fv(loc.color, ACCENT);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE);
	gl.clearColor(0, 0, 0, 0);

	const sampler = new GlyphSampler(fontFamily);

	// --- state
	let N = 0;
	let pos = new Float32Array(0);
	let vel = new Float32Array(0);
	let home = new Float32Array(0);
	let about = new Float32Array(0);
	let scatter = new Float32Array(0);
	let dyn = new Float32Array(0);
	let hot = new Float32Array(0);
	let slots: Slot[] = [];
	let step = 3;
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

	let started = false;
	let decryptT0 = 0;
	let decrypted = false;
	let running = true;
	let raf = 0;
	let destroyed = false;
	let t0 = performance.now();

	function setSlotGlyph(s: Slot, ch: string) {
		const g = sampler.glyph(ch, s.px, step);
		const tmp = new Float32Array(s.count * 2);
		resample(g.pts, s.count, step * 0.8, tmp, 0);
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
			document.fonts.load(`400 ${heroPx}px ${fontFamily}`),
			document.fonts.load(`400 ${aboutPx}px ${fontFamily}`)
		]);
		if (destroyed) return;

		// Density: a fixed number of samples across the glyph height, coarser in lite mode.
		step = Math.max(lite ? 1.8 : 2.2, heroPx / (lite ? 40 : 70));

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
		const aStep = Math.max(1.4, step * (aboutPx / heroPx) * 0.9);
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

		// Dispersion directions for the mid-scroll scatter.
		const spread = Math.max(vw, vh) * 0.45;
		for (let i = 0; i < N; i++) {
			const a = Math.random() * Math.PI * 2;
			const r = spread * (0.25 + Math.random() * 0.75);
			scatter[i * 2] = Math.cos(a) * r;
			scatter[i * 2 + 1] = Math.sin(a) * r * 0.7;
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

		const seeds = new Float32Array(N);
		for (let i = 0; i < N; i++) seeds[i] = Math.random();

		gl!.bindVertexArray(vao);
		gl!.bindBuffer(gl!.ARRAY_BUFFER, seedBuf);
		gl!.bufferData(gl!.ARRAY_BUFFER, seeds, gl!.STATIC_DRAW);
		gl!.enableVertexAttribArray(loc.seed);
		gl!.vertexAttribPointer(loc.seed, 1, gl!.FLOAT, false, 0, 0);

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

		for (let i = 0; i < N; i++) {
			const ix = i * 2;
			const iy = ix + 1;
			const tx = home[ix] + (about[ix] - home[ix]) * e + scatter[ix] * burst;
			const ty = home[iy] + (about[iy] - home[iy]) * e + scatter[iy] * burst;
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
			vel[ix] = (vel[ix] + ax) * D;
			vel[iy] = (vel[iy] + ay) * D;
			pos[ix] += vel[ix];
			pos[iy] += vel[iy];

			dyn[i * 3] = pos[ix];
			dyn[i * 3 + 1] = pos[iy];
		}
		// Per-slot heat: cipher glyphs glow white-hot, locked letters cool to the accent blue.
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
		gl!.uniform1f(loc.time, (now - t0) / 1000);
		// Fade most of the particle layer once the crisp DOM headline takes over at the very end.
		const endFade = Math.min(1, Math.max(0, (p - 0.9) / 0.1));
		gl!.uniform1f(loc.alpha, 1 - endFade * 0.75);
		gl!.uniform1f(loc.size, step * 0.95 * dpr);

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
			gl!.deleteVertexArray(vao);
			gl!.deleteProgram(prog);
			gl!.getExtension('WEBGL_lose_context')?.loseContext();
		}
	};
}
