<script lang="ts">
	import { gsap } from '#lib/animations/gsap.ts';
	import type { DesignPiece } from '#lib/data/design.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';

	/**
	 * Curved, infinitely looping strip of design pieces. Cards near the edges rotate away on Y and shrink, so the
	 * row reads like the inside of a cylinder. Drifts on its own (direction set by `dir`), speeds up with scroll
	 * velocity, and can be dragged. Pauses off-screen. Under reduced motion it's a plain horizontal scroller.
	 */
	let { items, dir = 1, height = 220 }: { items: DesignPiece[]; dir?: 1 | -1; height?: number } = $props();

	let wrap: HTMLDivElement;
	let track: HTMLDivElement;
	let dragging = $state(false);

	$effect(() => {
		if (motion.reduced) return;
		const cards = Array.from(track.children) as HTMLElement[];
		let x = 0;
		let vx = 0;
		let visible = false;
		let half = track.scrollWidth / 2;
		let w = wrap.clientWidth;
		const ro = new ResizeObserver(() => {
			half = track.scrollWidth / 2;
			w = wrap.clientWidth;
		});
		ro.observe(track);
		ro.observe(wrap);
		const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
		io.observe(wrap);

		let down = false;
		let lastX = 0;
		const onDown = (e: PointerEvent) => {
			down = true;
			dragging = true;
			lastX = e.clientX;
			vx = 0;
			wrap.setPointerCapture(e.pointerId);
		};
		const onMove = (e: PointerEvent) => {
			if (!down) return;
			const dx = e.clientX - lastX;
			lastX = e.clientX;
			x += dx;
			vx = dx;
		};
		const onUp = () => {
			down = false;
			dragging = false;
		};
		wrap.addEventListener('pointerdown', onDown);
		wrap.addEventListener('pointermove', onMove);
		wrap.addEventListener('pointerup', onUp);
		wrap.addEventListener('pointercancel', onUp);

		const tick = (_t: number, dt: number) => {
			if (!visible || half <= 0) return;
			if (!down) {
				const scroll = Math.min(40, Math.abs(motion.lenis?.velocity ?? 0));
				x += (dir * -(0.04 + scroll * 0.01)) * dt + vx;
				vx *= 0.92;
			}
			x = ((x % half) + half) % half - half; // keep in [-half, 0)
			track.style.transform = `translate3d(${x}px,0,0)`;
			// Curve: each card rotates by its distance from the centre of the viewport.
			const c = w / 2;
			for (const el of cards) {
				const mid = el.offsetLeft + x + el.offsetWidth / 2;
				const d = Math.max(-1.4, Math.min(1.4, (mid - c) / c));
				el.style.transform = `perspective(900px) rotateY(${(-d * 32).toFixed(2)}deg) scale(${(1 - Math.abs(d) * 0.12).toFixed(3)})`;
			}
		};
		gsap.ticker.add(tick);
		return () => {
			gsap.ticker.remove(tick);
			ro.disconnect();
			io.disconnect();
			wrap.removeEventListener('pointerdown', onDown);
			wrap.removeEventListener('pointermove', onMove);
			wrap.removeEventListener('pointerup', onUp);
			wrap.removeEventListener('pointercancel', onUp);
		};
	});
</script>

<div bind:this={wrap} class={['wrap', dragging && 'is-dragging', motion.reduced && 'is-still']} style:--h="{height}px" data-cursor="Drag">
	<div bind:this={track} class="track">
		{#each [0, 1] as copy (copy)}
			{#each items as it (it.slug + copy)}
				<figure class="card" aria-hidden={copy === 1 ? 'true' : undefined} style:aspect-ratio="{it.w} / {it.h}">
					<img
						src="/design/{it.slug}.webp"
						alt={copy === 1 ? '' : it.alt}
						width={it.w}
						height={it.h}
						loading="lazy"
						decoding="async"
						draggable="false"
					/>
					<figcaption>{it.kind}</figcaption>
				</figure>
			{/each}
		{/each}
	</div>
</div>

<style>
	.wrap {
		overflow: hidden;
		padding-block: 1.25rem;
		cursor: grab;
		touch-action: pan-y;
		user-select: none;
		mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
	}
	.wrap.is-dragging {
		cursor: grabbing;
	}
	.track {
		display: flex;
		gap: clamp(12px, 1.4vw, 20px);
		width: max-content;
		will-change: transform;
	}
	.card {
		position: relative;
		height: var(--h);
		margin: 0;
		border-radius: 16px;
		overflow: hidden;
		background: var(--color-panel);
		box-shadow: 0 16px 36px -20px rgb(20 18 18 / 0.5);
		transform-origin: 50% 50%;
		will-change: transform;
	}
	.card img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		pointer-events: none;
	}
	figcaption {
		position: absolute;
		left: 8px;
		bottom: 8px;
		padding: 2px 7px;
		border-radius: 6px;
		background: rgb(242 238 231 / 0.9);
		color: var(--color-accent);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.is-still {
		overflow-x: auto;
		mask-image: none;
	}
	.is-still .card[aria-hidden='true'] {
		display: none;
	}
</style>
