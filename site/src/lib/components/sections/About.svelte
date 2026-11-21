<script lang="ts">
	import { reveal } from '#lib/actions/reveal.ts';
	import SpecimenCard from '#lib/components/ui/SpecimenCard.svelte';
	import { specimenCards } from '#lib/data/about.ts';

	// Phase 3 adds the scroll-lit manifesto paragraph above these cards.
</script>

<section id="about" class="px-[var(--gutter)] py-[clamp(5rem,12vw,10rem)]" aria-labelledby="about-title">
	<div class="mb-[clamp(2.5rem,6vw,5rem)] flex items-start gap-4 md:gap-6" use:reveal>
		<span class="index-tag pt-2">[01]</span>
		<h2 id="about-title" class="font-display text-[clamp(3rem,10vw,9rem)] text-paper">About</h2>
	</div>

	<div class="grid items-center gap-y-6 md:grid-cols-[1fr_auto_1fr] md:gap-x-[clamp(1.5rem,3vw,3.5rem)]">
		<SpecimenCard card={specimenCards[0]} />
		<span
			class="justify-self-center font-display text-[clamp(3rem,5vw,4.5rem)] leading-none text-accent"
			aria-hidden="true">+</span
		>
		<SpecimenCard card={specimenCards[1]} delay={0.12} />
	</div>
</section>
