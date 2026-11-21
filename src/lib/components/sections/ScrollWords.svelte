<script lang="ts">
	import AsciiCanvas from '#lib/ascii/AsciiCanvas.svelte';
	import { ScrollTrigger } from '#lib/animations/gsap.ts';
	import { scrollWords } from '#lib/data/about.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';

	/**
	 * Pinned ASCII scene: one big word at a time assembles out of character noise and dissolves again, scrubbed to
	 * scroll (DESIGN. → BUILD. → SHIP.). Under reduced motion the words are simply listed.
	 */
	let section: HTMLElement;
	let index = $state(0);
	let reveal = $state(0);
	// Finer cells on phones so the words stay legible.
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
		const n = scrollWords.length;
		const st = ScrollTrigger.create({
			trigger: section,
			start: 'top top',
			end: 'bottom bottom',
			scrub: true,
			onUpdate: (self) => {
				const p = Math.min(0.9999, self.progress) * n;
				const k = Math.floor(p);
				const t = p - k;
				index = k;
				// Assemble over the first 40% of each word's slice, hold, dissolve over the last 30%.
				reveal = t < 0.4 ? t / 0.4 : t > 0.7 ? Math.max(0, (1 - t) / 0.3) : 1;
				if (k === n - 1 && t > 0.7) reveal = 1; // the last word stays
			}
		});
		return () => st.kill();
	});
</script>

<section
	bind:this={section}
	class={['words', motion.reduced && 'is-still']}
	aria-label={scrollWords.join(' ')}
>
	{#if motion.reduced}
		<div class="grid gap-2 px-[var(--gutter)] py-24">
			{#each scrollWords as w (w)}
				<p class="font-display text-[clamp(3rem,14vw,12rem)] text-accent-display">{w}</p>
			{/each}
		</div>
	{:else}
		<div class="stage">
			{#key narrow}
				<AsciiCanvas lines={[scrollWords[index]]} {reveal} cell={narrow ? 5 : 9} dust={0.006} pointer padX={0.05} />
			{/key}
			<span class="block-cursor" aria-hidden="true"></span>
			<p class="caps counter" aria-hidden="true">
				<span class="text-accent-ink">{String(index + 1).padStart(2, '0')}</span>/{String(scrollWords.length).padStart(2, '0')}
			</p>
		</div>
	{/if}
</section>

<style>
	.words {
		position: relative;
		height: 320svh;
	}
	.words.is-still {
		height: auto;
	}
	.stage {
		position: sticky;
		top: 0;
		height: 100svh;
	}
	.block-cursor {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 8px;
		height: 14px;
		background: var(--color-accent);
		animation: blink 1s steps(2, start) infinite;
	}
	.counter {
		position: absolute;
		left: var(--gutter);
		bottom: 2rem;
		font-size: 11px;
		color: var(--color-mute);
	}
	@keyframes blink {
		to {
			visibility: hidden;
		}
	}
</style>
