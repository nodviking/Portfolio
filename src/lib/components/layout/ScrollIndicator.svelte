<script lang="ts">
	import { page } from '$app/state';
	import { ScrollTrigger } from '#lib/animations/gsap.ts';
	import { sections } from '#lib/data/site.ts';

	/**
	 * Right edge: a thin orange scroll-progress line plus a `03/10` readout of the section in view.
	 * Sections opt in with `data-section="03"`.
	 */
	let bar: HTMLDivElement;
	let current = $state('01');
	const total = String(sections.length).padStart(2, '0');

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

	// The section whose box contains the middle of the viewport (recomputed on scroll, so jumps never go stale).
	$effect(() => {
		void page.url.pathname; // re-scan after each navigation
		const els = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));
		if (!els.length) return;
		let raf = 0;
		const update = () => {
			raf = 0;
			const mid = window.innerHeight / 2;
			let pick = els[0];
			for (const el of els) if (el.getBoundingClientRect().top <= mid) pick = el;
			current = pick.dataset.section!;
		};
		const on = () => {
			if (!raf) raf = requestAnimationFrame(update);
		};
		update();
		window.addEventListener('scroll', on, { passive: true });
		window.addEventListener('resize', on);
		window.addEventListener('load', on);
		ScrollTrigger.addEventListener('refresh', on);
		return () => {
			window.removeEventListener('scroll', on);
			window.removeEventListener('resize', on);
			window.removeEventListener('load', on);
			ScrollTrigger.removeEventListener('refresh', on);
			if (raf) cancelAnimationFrame(raf);
		};
	});
</script>

<div class="track" aria-hidden="true"><div bind:this={bar} class="bar"></div></div>
<p class="counter caps" aria-hidden="true"><span class="text-accent-ink">{current}</span>/{total}</p>

<style>
	.track {
		position: fixed;
		top: 0;
		right: 0;
		width: 2px;
		height: 100%;
		z-index: 55;
		pointer-events: none;
		background: var(--color-line);
	}
	.bar {
		width: 100%;
		height: 100%;
		background: var(--color-accent);
		transform: scaleY(0);
		transform-origin: top;
	}
	.counter {
		position: fixed;
		right: 10px;
		bottom: 18px;
		z-index: 55;
		writing-mode: vertical-rl;
		font-size: 10px;
		letter-spacing: 0.14em;
		color: var(--color-mute);
		pointer-events: none;
		font-variant-numeric: tabular-nums;
	}
	@media (max-width: 767px) {
		.counter {
			display: none;
		}
	}
</style>
