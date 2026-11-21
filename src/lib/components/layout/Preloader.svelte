<script lang="ts">
	import { gsap } from '#lib/animations/gsap.ts';
	import { coverNow, reveal } from '#lib/animations/pixelwipe.ts';
	import { bootLines } from '#lib/data/preloader.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';

	/**
	 * [00] Boot sequence: mono log lines type in, a thin orange bar fills with a 000→100 counter, then the screen
	 * splits into a grid of squares that flip out diagonally to reveal the hero. ~1.8s total.
	 * Skipped before first paint (inline <head> script) on repeat visits and under reduced motion.
	 */
	const SESSION_KEY = 'nv-intro';

	let root: HTMLDivElement | undefined = $state();
	let gone = $state(false);
	let count = $state(0);
	let typed = $state(bootLines.map(() => ''));
	let done = $state(bootLines.map(() => false));
	let bar: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (document.documentElement.dataset.intro === 'skip') {
			gone = true;
			motion.introDone = true;
			return;
		}
		if (!root || !bar) return;

		const state = { p: 0 };
		const tl = gsap.timeline();
		const per = 0.24;

		bootLines.forEach((line, i) => {
			const o = { n: 0 };
			tl.to(
				o,
				{
					n: line.text.length,
					duration: per,
					ease: 'none',
					onUpdate: () => (typed[i] = line.text.slice(0, Math.round(o.n)))
				},
				i * (per + 0.06)
			).call(() => (done[i] = true), [], '>');
		});

		const total = bootLines.length * (per + 0.06);
		tl.to(
			state,
			{
				p: 1,
				duration: total,
				ease: 'power1.inOut',
				onUpdate: () => {
					count = Math.round(state.p * 100);
					bar!.style.transform = `scaleX(${state.p})`;
				}
			},
			0
		);

		// Exit: swap in an identical grid of squares, drop the preloader, flip the squares out.
		tl.call(
			() => {
				coverNow('var(--color-ink)');
				gone = true;
				motion.introDone = true;
				try {
					sessionStorage.setItem(SESSION_KEY, '1');
				} catch {
					/* storage blocked: the intro plays again next time */
				}
				reveal(0.3);
			},
			[],
			total + 0.12
		);

		return () => tl.kill();
	});
</script>

{#if !gone}
	<div bind:this={root} class="preloader fixed inset-0 z-[160] bg-ink" aria-hidden="true">
		<div class="absolute bottom-[18vh] left-[var(--gutter)] w-[min(520px,calc(100%-2*var(--gutter)))]">
			<p class="mb-5 index-tag">[00] / BOOT.SYS</p>
			<div class="text-[13px] leading-[1.9] text-paper md:text-[14px]">
				{#each bootLines as line, i (line.text)}
					<p class="min-h-[1.9em] whitespace-nowrap">
						{typed[i]}{#if line.ok && done[i]}<span class="text-accent">{' ✓'}</span>{/if}{#if !done[i] && typed[i].length > 0}<span
								class="caret"
							></span>{/if}
					</p>
				{/each}
			</div>
			<div class="mt-6 flex items-center gap-4">
				<div class="h-[2px] flex-1 bg-line">
					<div bind:this={bar} class="h-full origin-left scale-x-0 bg-accent"></div>
				</div>
				<p class="caps w-10 text-right text-accent tabular-nums">{String(count).padStart(3, '0')}</p>
			</div>
		</div>
	</div>
{/if}

<style>
	:global(html[data-intro='skip']) .preloader {
		display: none;
	}
	.caret {
		display: inline-block;
		width: 0.6em;
		height: 1.1em;
		margin-left: 2px;
		vertical-align: -0.18em;
		background: var(--color-accent);
	}
</style>
