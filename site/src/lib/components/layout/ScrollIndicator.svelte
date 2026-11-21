<script lang="ts">
	/** Thin blue scroll-progress line on the right edge. One transform per frame. */
	let bar: HTMLDivElement;

	$effect(() => {
		let raf = 0;
		const paint = () => {
			raf = 0;
			const max = document.documentElement.scrollHeight - window.innerHeight;
			const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
			bar.style.transform = `scaleY(${p.toFixed(4)})`;
		};
		const onScroll = () => {
			if (!raf) raf = requestAnimationFrame(paint);
		};
		paint();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
			if (raf) cancelAnimationFrame(raf);
		};
	});
</script>

<div class="track" aria-hidden="true"><div bind:this={bar} class="bar"></div></div>

<style>
	.track {
		position: fixed;
		top: 0;
		right: 0;
		width: 2px;
		height: 100%;
		z-index: 55;
		pointer-events: none;
		background: rgb(237 237 240 / 0.04);
	}
	.bar {
		width: 100%;
		height: 100%;
		background: var(--color-accent);
		transform: scaleY(0);
		transform-origin: top;
	}
</style>
