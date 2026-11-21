<script lang="ts">
	import { frameDraw } from '#lib/actions/frameDraw.ts';
	import SectionHead from '#lib/components/ui/SectionHead.svelte';
	import { designRoots } from '#lib/data/contact.ts';
	import { site } from '#lib/data/site.ts';
</script>

<section id="design" data-section="09" class="section" aria-labelledby="design-title">
	<SectionHead id="design" />

	<a
		href={site.designPortfolio}
		target="_blank"
		rel="noopener noreferrer"
		class="card frame block p-7 md:p-14"
		use:frameDraw
		data-cursor
	>
		<span class="tab-label">01 / PORTFOLIO.CANVA</span>
		<h2 id="design-title" class="font-display text-[clamp(2.2rem,6.4vw,6rem)]" data-no-scramble>
			{designRoots.title}
		</h2>
		<p class="mt-6 max-w-[52ch] text-[15px] leading-[1.6] md:text-[17px]" data-no-scramble>{designRoots.body}</p>
		<span class="caps mt-10 inline-flex items-center gap-3">
			<span>{designRoots.cta}</span><span aria-hidden="true" data-no-scramble>↗</span>
		</span>
	</a>
</section>

<style>
	.card {
		color: var(--color-paper);
		transition:
			background-color 0.3s var(--ease-expo),
			color 0.3s var(--ease-expo);
	}
	.card p {
		color: var(--color-mute);
		transition: color 0.3s var(--ease-expo);
	}
	.card:hover,
	.card:focus-visible {
		background: var(--color-accent);
		color: var(--color-on-accent);
		--node-c: var(--color-on-accent);
	}
	.card:hover p,
	.card:focus-visible p {
		color: var(--color-on-accent);
	}
</style>
