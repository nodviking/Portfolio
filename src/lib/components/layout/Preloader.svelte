<script lang="ts">
	import { untrack } from 'svelte';
	import { gsap } from '#lib/animations/gsap.ts';
	import { coverNow, reveal } from '#lib/animations/pixelwipe.ts';
	import { bootComment, bootLabels, bootLines } from '#lib/data/preloader.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';

	/**
	 * [00] Boot sequence:
	 * 1. a comment block and log lines type in (statuses snap to [ OK ]), a progress bar fills and a giant
	 *    000% counter ticks up in the corner;
	 * 2. the log clears, NOD [VIKING] appears small in the centre and its box wipes in;
	 * 3. the screen flashes accent, then the pixel grid flips out to reveal the hero.
	 * Skipped before first paint (inline <head> script) on repeat visits and under reduced motion.
	 */
	const SESSION_KEY = 'nv-intro';
	type Line = { text: string; status?: 'OK' | 'RUN'; comment: boolean };
	const all: Line[] = [
		...bootComment.map((text) => ({ text, comment: true })),
		...bootLines.map((l) => ({ ...l, comment: false }))
	];

	let root: HTMLDivElement | undefined = $state();
	let gone = $state(false);
	let count = $state(0);
	let typed = $state(all.map(() => ''));
	let done = $state(all.map(() => false));
	let bar: HTMLDivElement | undefined = $state();
	let stage = $state<'log' | 'mark' | 'flash'>('log');
	let box: HTMLSpanElement | undefined = $state();

	$effect(() => {
		if (document.documentElement.dataset.intro === 'skip') {
			gone = true;
			motion.introDone = true;
			return;
		}
		// Untracked: the log (and its bar) unmounts mid-sequence; that must not re-run this effect and kill the timeline.
		if (!untrack(() => root && bar)) return;

		const state = { p: 0 };
		const tl = gsap.timeline();
		const step = 0.11;

		all.forEach((line, i) => {
			const o = { n: 0 };
			tl.to(
				o,
				{
					n: line.text.length,
					duration: line.text.length ? 0.1 : 0.03,
					ease: 'none',
					onUpdate: () => (typed[i] = line.text.slice(0, Math.round(o.n)))
				},
				i * step
			).call(() => (done[i] = true), [], '>');
		});

		const logEnd = all.length * step + 0.1;
		tl.to(
			state,
			{
				p: 1,
				duration: logEnd,
				ease: 'power1.inOut',
				onUpdate: () => {
					count = Math.round(state.p * 100);
					if (bar) bar.style.transform = `scaleX(${state.p})`;
				}
			},
			0
		)
			// 2. Wordmark: the log clears, the boxed mark wipes in.
			.call(() => (stage = 'mark'), [], logEnd + 0.15)
			.add(() => {
				if (box) gsap.fromTo(box, { '--box-r': '100%' }, { '--box-r': '0%', duration: 0.35, ease: 'power4.inOut' });
			}, logEnd + 0.4)
			// 3. Flash, then the grid flips out.
			.call(() => (stage = 'flash'), [], logEnd + 0.95)
			.call(
				() => {
					coverNow('var(--color-accent)');
					gone = true;
					motion.introDone = true;
					try {
						sessionStorage.setItem(SESSION_KEY, '1');
					} catch {
						/* storage blocked: the intro plays again next time */
					}
					reveal(0.32);
				},
				[],
				logEnd + 1.15
			);

		return () => tl.kill();
	});
</script>

{#if !gone}
	<div
		bind:this={root}
		class={['preloader fixed inset-0 z-[160]', stage === 'flash' ? 'bg-accent' : 'bg-ink']}
		aria-hidden="true"
	>
		{#if stage === 'log'}
			<div
				class="absolute top-[clamp(1.5rem,6vh,4rem)] left-[var(--gutter)] w-[min(560px,calc(100%-2*var(--gutter)))]"
			>
				<div class="text-[11px] leading-[1.75] md:text-[12px]">
					{#each all as line, i (i)}
						<p class="flex min-h-[1.75em] justify-between gap-6 whitespace-nowrap">
							<span class={line.status ? 'text-paper' : 'text-accent-ink'}
								>{typed[i]}{#if !done[i] && typed[i].length > 0}<span class="caret"></span>{/if}</span
							>
							{#if line.status && done[i]}
								<span class={line.status === 'OK' ? 'text-paper' : 'text-accent-ink'}>[ {line.status} ]</span>
							{/if}
						</p>
					{/each}
				</div>
				<div class="mt-5 h-[3px] bg-line">
					<div bind:this={bar} class="h-full origin-left bg-accent" style="transform: scaleX(0)"></div>
				</div>
				<div class="caps mt-2 flex justify-between text-[10px] text-accent-ink">
					{#each bootLabels as l (l)}<span>{l}</span>{/each}
				</div>
			</div>
			<p class="pct font-display text-accent-display tabular-nums">{String(count).padStart(3, '0')}%</p>
		{:else if stage === 'mark'}
			<p class="absolute inset-0 grid place-items-center">
				<span class="font-display text-[clamp(1.6rem,3.4vw,2.6rem)] text-accent-display"
					>NOD<span bind:this={box} class="boxword ml-[0.14em]" data-text="VIKING" style="--box-r:100%"
						>VIKING</span
					></span
				>
			</p>
		{/if}
	</div>
{/if}

<style>
	:global(html[data-intro='skip']) .preloader {
		display: none;
	}
	.pct {
		position: absolute;
		right: var(--gutter);
		bottom: clamp(1rem, 4vh, 2.5rem);
		font-size: clamp(5rem, 17vw, 15rem);
		line-height: 0.8;
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
