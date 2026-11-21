<script lang="ts">
	import { motion } from '#lib/stores/motion.svelte.ts';

	/** Very faint dot grid behind all content, with a slight parallax (one transform per frame, modulo the cell). */
	const CELL = 28;
	let el: HTMLDivElement;

	$effect(() => {
		if (motion.reduced) return;
		let raf = 0;
		const paint = () => {
			raf = 0;
			const y = (window.scrollY * 0.12) % CELL;
			el.style.transform = `translate3d(0, ${-y.toFixed(2)}px, 0)`;
		};
		const onScroll = () => {
			if (!raf) raf = requestAnimationFrame(paint);
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		paint();
		return () => {
			window.removeEventListener('scroll', onScroll);
			if (raf) cancelAnimationFrame(raf);
		};
	});
</script>

<div bind:this={el} class="dotgrid" style:--cell="{CELL}px" aria-hidden="true"></div>

<style>
	.dotgrid {
		position: fixed;
		inset: 0 0 calc(var(--cell) * -1) 0;
		z-index: -1;
		pointer-events: none;
		background-image: radial-gradient(circle at center, rgb(237 237 240 / 0.04) 1.1px, transparent 1.6px);
		background-size: var(--cell) var(--cell);
		background-position: calc(var(--cell) / 2) calc(var(--cell) / 2);
		will-change: transform;
	}
</style>
