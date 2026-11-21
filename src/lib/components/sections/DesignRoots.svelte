<script lang="ts">
	import { magnetic } from '#lib/actions/magnetic.ts';
	import CurvedGallery from '#lib/components/ui/CurvedGallery.svelte';
	import SectionHead from '#lib/components/ui/SectionHead.svelte';
	import { designRoots } from '#lib/data/contact.ts';
	import { design } from '#lib/data/design.ts';
	import { site } from '#lib/data/site.ts';

	/** [09] Design roots: two curved galleries of real design work, drifting in opposite directions. */
	const wide = design.filter((d) => d.w / d.h > 1.2);
	const square = design.filter((d) => d.w / d.h <= 1.2);
</script>

<section id="design" data-section="09" class="section !px-0" aria-labelledby="design-title">
	<div class="px-[var(--gutter)]">
		<SectionHead id="design" title={designRoots.title} titleId="design-title" />
	</div>

	<div class="grid gap-2">
		<CurvedGallery items={wide} height={210} />
		<CurvedGallery items={square} dir={-1} height={170} />
	</div>

	<div class="mt-10 flex flex-wrap items-center justify-between gap-6 px-[var(--gutter)]">
		<p class="max-w-[52ch] text-[15px] leading-[1.6] text-mute">{designRoots.body}</p>
		<a
			href={site.designPortfolio}
			target="_blank"
			rel="noopener noreferrer"
			class="btn btn--lg"
			use:magnetic={{ strength: 0.2 }}
		>
			<span>{designRoots.cta}</span><span aria-hidden="true" data-no-scramble>↗</span>
		</a>
	</div>
</section>
