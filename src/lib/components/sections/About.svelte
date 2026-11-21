<script lang="ts">
	import { wordScrub } from '#lib/actions/wordScrub.ts';
	import SectionHead from '#lib/components/ui/SectionHead.svelte';
	import SpecimenCard from '#lib/components/ui/SpecimenCard.svelte';
	import { aboutParagraph, specimenCards } from '#lib/data/about.ts';
</script>

<section id="about" data-section="02" class="section" aria-labelledby="about-title">
	<SectionHead id="about" title="About" titleId="about-title" />

	<!-- The only place the real name appears on the page. Words go grey → white as you scroll. -->
	<p
		class="mb-[clamp(4rem,9vw,8rem)] max-w-[34ch] text-[clamp(1.35rem,3.2vw,2.7rem)] leading-[1.3] font-medium tracking-[-0.02em] text-paper"
		use:wordScrub
	>
		{aboutParagraph}
	</p>

	<div class="grid items-center gap-y-6 md:grid-cols-[1fr_auto_1fr] md:gap-x-[clamp(1.5rem,3vw,3.5rem)]">
		<SpecimenCard card={specimenCards[0]} />
		<span
			class="justify-self-center font-display text-[clamp(3rem,5vw,4.5rem)] leading-none text-accent-display"
			aria-hidden="true">+</span
		>
		<SpecimenCard card={specimenCards[1]} delay={0.15} />
	</div>
</section>
