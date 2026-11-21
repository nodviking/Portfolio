<script lang="ts">
	import { EASE, gsap } from '#lib/animations/gsap.ts';
	import { introWords } from '#lib/data/hero.ts';
	import { site } from '#lib/data/site.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';

	/**
	 * CREATE → CONNECT → NODVIKING letter stagger, a 0–100 counter, then a curtain wipe up into the page.
	 * Skipped (by an inline <head> script, so there is no flash) on repeat visits in the same session and
	 * under prefers-reduced-motion. Sets `motion.introDone` as the wipe starts so the hero can begin underneath.
	 */
	const SESSION_KEY = 'nv-intro';

	let root: HTMLDivElement | undefined = $state();
	let count = $state(0);
	let gone = $state(false);

	$effect(() => {
		if (document.documentElement.dataset.intro === 'skip') {
			gone = true;
			motion.introDone = true;
			return;
		}

		if (!root) return;
		const el = root;
		const words = Array.from(el.querySelectorAll<HTMLElement>('[data-word]'));
		const charsOf = (w: HTMLElement) => w.querySelectorAll('[data-char]');
		const counter = { v: 0 };

		const tl = gsap.timeline({
			onComplete: () => {
				try {
					sessionStorage.setItem(SESSION_KEY, '1');
				} catch {
					/* storage blocked: the intro simply plays again next time */
				}
				gone = true;
			}
		});

		tl.to(
			counter,
			{ v: 100, duration: 2.15, ease: 'power2.inOut', onUpdate: () => (count = Math.round(counter.v)) },
			0
		);

		words.forEach((word, i) => {
			const at = i * 0.68;
			tl.fromTo(
				charsOf(word),
				{ y: 0, yPercent: 110 },
				{ yPercent: 0, duration: 0.6, ease: EASE.out, stagger: 0.035 },
				at
			);
			if (i < words.length - 1) {
				tl.to(
					charsOf(word),
					// overwrite: the stagger-in may still be running on the last letters.
					{ yPercent: -110, duration: 0.3, ease: 'power3.in', stagger: 0.018, overwrite: 'auto' },
					at + 0.38
				);
			}
		});

		const last = charsOf(words[words.length - 1]);
		tl.add(() => {
			motion.introDone = true;
		}, '+=0.12')
			.to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.95, ease: EASE.inOut }, '<')
			.to(last, { yPercent: -45, autoAlpha: 0, duration: 0.6, ease: 'power3.in', stagger: 0.02 }, '<');

		return () => tl.kill();
	});
</script>

{#if !gone}
	<div
		bind:this={root}
		class="preloader fixed inset-0 z-[120] grid place-items-center bg-ink"
		style="clip-path: inset(0% 0% 0% 0%)"
		aria-hidden="true"
	>
		{#each introWords as word, i (word)}
			<p
				data-word
				class={[
					'absolute font-display text-[clamp(3.2rem,12vw,10rem)] leading-none uppercase',
					i === introWords.length - 1 ? 'text-accent' : 'text-paper'
				]}
			>
				{#each Array.from(word) as ch, j (j)}<span class="inline-block overflow-hidden pb-[0.04em] align-bottom"
						><span data-char class="inline-block translate-y-[110%]">{ch}</span></span
					>{/each}
			</p>
		{/each}

		<p class="caps absolute bottom-5 left-[var(--gutter)] text-mute md:bottom-7">
			{site.role}
		</p>
		<p
			class="caps text-accent-soft absolute right-[var(--gutter)] bottom-5 tabular-nums md:bottom-7"
		>
			{String(count).padStart(3, '0')}
		</p>
	</div>
{/if}

<style>
	:global(html[data-intro='skip']) .preloader {
		display: none;
	}
</style>
