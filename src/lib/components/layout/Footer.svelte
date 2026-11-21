<script lang="ts">
	import { magnetic } from '#lib/actions/magnetic.ts';
	import AsciiCanvas from '#lib/ascii/AsciiCanvas.svelte';
	import { gsap, ScrollTrigger } from '#lib/animations/gsap.ts';
	import { scrollToTarget } from '#lib/animations/lenis.ts';
	import LocalTime from '#lib/components/ui/LocalTime.svelte';
	import { site } from '#lib/data/site.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';

	/** Footer: brand + location, a giant ASCII NODVIKING that assembles on enter, and the legal row. */
	let art: HTMLDivElement;
	let reveal = $state(motion.reduced ? 1 : 0);
	// Narrow screens: stack the wordmark and use finer cells so it stays legible.
	let narrow = $state(false);
	$effect(() => {
		const mq = matchMedia('(max-width: 639px)');
		const set = () => (narrow = mq.matches);
		set();
		mq.addEventListener('change', set);
		return () => mq.removeEventListener('change', set);
	});

	$effect(() => {
		if (motion.reduced) return;
		const o = { r: 0 };
		const st = ScrollTrigger.create({
			trigger: art,
			start: 'top 90%',
			once: true,
			onEnter: () => gsap.to(o, { r: 1, duration: 1.6, ease: 'power2.out', onUpdate: () => (reveal = o.r) })
		});
		return () => {
			st.kill();
			gsap.killTweensOf(o);
		};
	});

	function toTop() {
		scrollToTarget(document.getElementById('main') ?? 0);
	}
</script>

<footer class="px-[var(--gutter)] pt-16 pb-6 md:pb-8">
	<div class="flex flex-wrap items-end justify-between gap-6 border-t border-line pt-10">
		<div>
			<p class="font-display text-[22px] text-paper">{site.brand}</p>
			<p class="mt-2 text-[13px] text-mute">Design. Build. Ship.</p>
		</div>
		<div class="text-right">
			<p class="caps mb-1 text-[10px] text-accent-ink">Based in</p>
			<p class="text-[13px] text-paper">{site.location} · <LocalTime /></p>
		</div>
	</div>

	<div bind:this={art} class={['art', narrow && 'is-narrow']} aria-hidden="true">
		{#key narrow}
			<AsciiCanvas
				lines={narrow ? ['NOD', 'VIKING'] : ['NODVIKING']}
				{reveal}
				cell={narrow ? 5 : 7}
				pointer
				padX={0.005}
				padY={0.04}
			/>
		{/key}
	</div>

	<div
		class="caps grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-3 border-t border-line pt-5 text-[11px] text-mute md:flex md:justify-between"
	>
		<p>© {site.copyrightYear} {site.realName}</p>
		<p class="hidden md:block">Built with SvelteKit + GSAP</p>
		<button
			type="button"
			class="justify-self-end text-paper transition-colors hover:text-accent-ink"
			onclick={toTop}
			use:magnetic={{ strength: 0.3 }}
			aria-label="Back to top"
		>
			<span>[ ↑ Top ]</span>
		</button>
	</div>
</footer>

<style>
	.art {
		height: clamp(110px, 17vw, 300px);
		margin: 2.5rem 0 1.5rem;
	}
	.art.is-narrow {
		height: 64vw;
	}
</style>
