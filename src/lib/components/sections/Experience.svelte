<script lang="ts">
	import { lines } from '#lib/actions/lines.ts';
	import { gsap, ScrollTrigger } from '#lib/animations/gsap.ts';
	import SectionHead from '#lib/components/ui/SectionHead.svelte';
	import { displayDates, experience } from '#lib/data/experience.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';

	/**
	 * [06] Experience: a vertical timeline. The 1px line draws as you scroll; each square node fills orange when
	 * its entry reaches the middle of the screen.
	 */
	let list: HTMLOListElement;
	let progress: HTMLSpanElement;
	let active = $state(motion.reduced ? experience.length : -1);

	$effect(() => {
		if (motion.reduced) {
			active = experience.length;
			return;
		}
		const ctx = gsap.context(() => {
			gsap.fromTo(
				progress,
				{ scaleY: 0 },
				{
					scaleY: 1,
					ease: 'none',
					scrollTrigger: { trigger: list, start: 'top 50%', end: 'bottom 50%', scrub: 0.4 }
				}
			);
			list.querySelectorAll<HTMLElement>('[data-entry]').forEach((el, i) => {
				ScrollTrigger.create({
					trigger: el,
					start: 'top 50%',
					onEnter: () => (active = Math.max(active, i)),
					onLeaveBack: () => (active = i - 1)
				});
			});
		}, list);
		return () => ctx.revert();
	});
</script>

<section id="experience" data-section="06" class="section" aria-labelledby="experience-title">
	<SectionHead id="experience" title="Experience" titleId="experience-title" />

	<ol bind:this={list} class="relative max-w-[980px] pl-10 md:pl-16">
		<span class="absolute top-2 bottom-2 left-[5px] w-px bg-line" aria-hidden="true"></span>
		<span
			bind:this={progress}
			class="absolute top-2 bottom-2 left-[5px] w-px origin-top bg-accent"
			aria-hidden="true"
		></span>

		{#each experience as e, i (e.role)}
			<li class="relative pb-14 last:pb-0" data-entry>
				<span class="node" class:is-on={i <= active} aria-hidden="true"></span>
				{#if displayDates(e.dates)}
					<p class="caps mb-2 text-[11px] text-mute">{displayDates(e.dates)}</p>
				{/if}
				<h3 class="font-display text-[clamp(1.5rem,3.4vw,3rem)] text-paper">{e.role}</h3>
				<p class="caps mt-3 text-accent-ink">{e.org}</p>
				{#if e.body}
					<p class="mt-4 max-w-[60ch] text-[14px] leading-[1.65] text-mute md:text-[15px]" use:lines>
						{e.body}
					</p>
				{/if}
			</li>
		{/each}
	</ol>
</section>

<style>
	.node {
		position: absolute;
		top: 0.45em;
		left: calc(-2.5rem + 0px);
		width: 11px;
		height: 11px;
		border: 1px solid var(--color-paper);
		background: var(--color-ink);
		transition:
			background-color 0.35s var(--ease-expo),
			border-color 0.35s var(--ease-expo);
	}
	@media (min-width: 768px) {
		.node {
			left: -4rem;
		}
	}
	.node.is-on {
		background: var(--color-accent-ink);
		border-color: var(--color-accent-ink);
	}
</style>
