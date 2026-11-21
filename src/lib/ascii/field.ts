/**
 * ASCII field: a small Canvas-2D renderer that draws a shape (text or glyphs) as a grid of mono characters.
 *
 * - The source is rasterised once per (shape, grid size) to a tiny offscreen canvas, one pixel per cell, and read
 *   back as luminance. Each cell's luminance picks a character from a density ramp.
 * - `reveal` (0..1) assembles the shape out of noise: every cell has its own threshold, so the art resolves cell by
 *   cell. Below its threshold a cell shows a random character (or nothing), weighted by its luminance.
 * - Idle: a small share of lit cells flicker. Pointer: cells near the pointer scramble.
 * - Renders at most ~30 fps and only while visible. No WebGL.
 */

export const RAMP = ' .:-=+*#%@';
const NOISE = '.:-=+*#%@01<>/{}[]';

export interface FieldSource {
	/** Key for caching the luminance map. */
	key: string;
	/** Draw the shape in white on the (cols × rows) context; the field handles the rest. */
	draw: (ctx: CanvasRenderingContext2D, cols: number, rows: number) => void;
}

export interface FieldOptions {
	canvas: HTMLCanvasElement;
	/** Cell size in CSS px (width; height is derived from the mono aspect). */
	cell?: number;
	color?: string;
	/** Faint background noise density (0..1) shown in empty cells. */
	dust?: number;
	/** Enable pointer scramble. */
	pointer?: boolean;
	/** Max frames per second while animating. */
	fps?: number;
	/** Static render (reduced motion): no flicker, no noise, reveal forced to 1. */
	still?: boolean;
	font?: string;
}

export interface Field {
	setSource(src: FieldSource): void;
	setReveal(r: number): void;
	resize(): void;
	destroy(): void;
}

function rand(n: number) {
	return (Math.random() * n) | 0;
}

export function createField(opts: FieldOptions): Field {
	const canvas = opts.canvas;
	const ctx = canvas.getContext('2d')!;
	const still = !!opts.still;
	const cellW = opts.cell ?? 9;
	const cellH = Math.round(cellW * 1.6);
	const color = opts.color ?? '#3b78ff';
	const dust = opts.dust ?? 0;
	const font = opts.font ?? '"JetBrains Mono Variable", ui-monospace, monospace';
	const frameMs = 1000 / (opts.fps ?? 30);

	const off = document.createElement('canvas');
	const octx = off.getContext('2d', { willReadFrequently: true })!;

	let cols = 1;
	let rows = 1;
	let w = 1;
	let h = 1;
	let dpr = 1;
	let lum: Float32Array = new Float32Array(1);
	let thresh = new Float32Array(1);
	let chars = new Uint8Array(1); // index into NOISE for animated cells
	let grain = new Float32Array(1); // stable per-cell texture so the ramp varies inside solid shapes
	let source: FieldSource | null = null;
	const cache = new Map<string, Float32Array>();

	let reveal = still ? 1 : 0;
	let px = -1e9;
	let py = -1e9;
	let raf = 0;
	let last = 0;
	let visible = true;
	let dirty = true;
	let destroyed = false;

	function measure() {
		const r = canvas.getBoundingClientRect();
		w = Math.max(1, r.width);
		h = Math.max(1, r.height);
		dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = Math.round(w * dpr);
		canvas.height = Math.round(h * dpr);
		cols = Math.max(1, Math.floor(w / cellW));
		rows = Math.max(1, Math.floor(h / cellH));
		thresh = new Float32Array(cols * rows);
		chars = new Uint8Array(cols * rows);
		grain = new Float32Array(cols * rows);
		for (let i = 0; i < thresh.length; i++) {
			thresh[i] = Math.random();
			chars[i] = rand(NOISE.length);
			grain[i] = 0.45 + 0.55 * Math.random();
		}
		cache.clear();
		if (source) lum = sample(source);
		dirty = true;
	}

	function sample(src: FieldSource): Float32Array {
		const key = `${src.key}|${cols}x${rows}`;
		const hit = cache.get(key);
		if (hit) return hit;
		off.width = cols;
		off.height = rows;
		octx.clearRect(0, 0, cols, rows);
		octx.fillStyle = '#fff';
		src.draw(octx, cols, rows);
		const data = octx.getImageData(0, 0, cols, rows).data;
		const out = new Float32Array(cols * rows);
		for (let i = 0; i < out.length; i++) out[i] = data[i * 4 + 3] / 255;
		cache.set(key, out);
		return out;
	}

	function render(now: number) {
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, w, h);
		ctx.font = `700 ${cellH * 0.78}px ${font}`;
		ctx.textBaseline = 'top';
		ctx.fillStyle = color;
		const R = 70;
		const R2 = R * R;
		const flick = still ? 0 : 0.035;
		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < cols; x++) {
				const i = y * cols + x;
				const L = lum[i];
				const cx = x * cellW;
				const cy = y * cellH;
				let ch = '';
				let a = 0;
				const settled = reveal >= thresh[i];
				if (L > 0.04 && settled) {
					const d = L * grain[i];
					ch = RAMP[Math.min(RAMP.length - 1, 1 + Math.floor(d * (RAMP.length - 1)))];
					a = 0.62 + 0.38 * d;
					if (flick && Math.random() < flick) ch = NOISE[rand(NOISE.length)];
				} else if (!still && L > 0.04 && reveal > 0) {
					// Unresolved part of the shape: sparse noise that densifies as reveal grows.
					if (Math.random() < 0.15 + reveal * 0.5) {
						ch = NOISE[chars[i]];
						a = 0.35 + 0.45 * reveal;
						if (Math.random() < 0.3) chars[i] = rand(NOISE.length);
					}
				} else if (dust && !still && Math.random() < dust) {
					ch = NOISE[rand(4)];
					a = 0.12;
				}
				if (opts.pointer && ch) {
					const dx = cx + cellW / 2 - px;
					const dy = cy + cellH / 2 - py;
					if (dx * dx + dy * dy < R2) {
						ch = NOISE[rand(NOISE.length)];
						a = 1;
					}
				}
				if (!ch || ch === ' ') continue;
				ctx.globalAlpha = a;
				ctx.fillText(ch, cx, cy);
			}
		}
		ctx.globalAlpha = 1;
		last = now;
		dirty = false;
	}

	function frame(now: number) {
		raf = 0;
		if (destroyed) return;
		const animating = !still;
		if (visible && (dirty || (animating && now - last > frameMs))) render(now);
		if (visible && animating) raf = requestAnimationFrame(frame);
	}
	const kick = () => {
		if (!raf && !destroyed) raf = requestAnimationFrame(frame);
	};

	const io = new IntersectionObserver(([e]) => {
		visible = e.isIntersecting;
		if (visible) {
			dirty = true;
			kick();
		}
	});
	io.observe(canvas);

	const onMove = (e: PointerEvent) => {
		const r = canvas.getBoundingClientRect();
		px = e.clientX - r.left;
		py = e.clientY - r.top;
	};
	const onLeave = () => {
		px = py = -1e9;
	};
	if (opts.pointer && !still) {
		window.addEventListener('pointermove', onMove, { passive: true });
		canvas.addEventListener('pointerleave', onLeave);
	}

	measure();
	kick();

	return {
		setSource(src) {
			source = src;
			lum = sample(src);
			dirty = true;
			kick();
		},
		setReveal(r) {
			reveal = still ? 1 : Math.min(1, Math.max(0, r));
			dirty = true;
			kick();
		},
		resize() {
			measure();
			kick();
		},
		destroy() {
			destroyed = true;
			if (raf) cancelAnimationFrame(raf);
			io.disconnect();
			window.removeEventListener('pointermove', onMove);
			canvas.removeEventListener('pointerleave', onLeave);
		}
	};
}

/** Source: one or more lines of text, centred and scaled to fill the grid (mono 800). */
export function textSource(lines: string[], opts: { padX?: number; padY?: number } = {}): FieldSource {
	return {
		key: `text:${lines.join('\n')}`,
		draw(ctx, cols, rows) {
			// Cells are 1.6× taller than wide, so draw into a stretched space and squash vertically.
			const padX = opts.padX ?? 0.04;
			const padY = opts.padY ?? 0.08;
			const W = cols;
			const H = rows * 1.6;
			ctx.save();
			ctx.scale(1, 1 / 1.6);
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			const fam = '"JetBrains Mono Variable", ui-monospace, monospace';
			ctx.font = `800 100px ${fam}`;
			const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
			let size = (100 * W * (1 - padX * 2)) / widest;
			size = Math.min(size, (H * (1 - padY * 2)) / (lines.length * 0.95));
			ctx.font = `800 ${size}px ${fam}`;
			const lh = size * 0.95;
			const top = H / 2 - ((lines.length - 1) * lh) / 2;
			lines.forEach((l, k) => ctx.fillText(l, W / 2, top + k * lh));
			ctx.restore();
		}
	};
}
