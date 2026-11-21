<script lang="ts">
	import { decode } from '#lib/actions/decode.ts';
	import { lines } from '#lib/actions/lines.ts';
	import { sectionById } from '#lib/data/site.ts';

	/**
	 * `[03] / STOREENV.CLI` index line, then (optionally) a mid-size title that decodes in, with the section's
	 * one-line lede beside it. Deliberately smaller than the hero so the wordmark stays the loudest thing on the page.
	 */
	let { id, title, titleId }: { id: string; title?: string; titleId?: string } = $props();
	const meta = $derived(sectionById(id));
</script>

<div class="mb-[clamp(2.25rem,5vw,4rem)]">
	<div class="flex items-center gap-4">
		<p class="index-tag shrink-0">[{meta.index}] / {meta.file}</p>
		<span class="h-px flex-1 bg-line" aria-hidden="true"></span>
	</div>
	{#if title}
		<div class="mt-6 grid items-end gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:gap-10">
			<h2 id={titleId} class="font-display text-[clamp(2.4rem,5.6vw,4.75rem)] text-paper" use:decode>{title}</h2>
			{#if meta.lede}
				<p class="text-[14px] leading-[1.6] text-mute md:pb-2 md:text-right md:text-[15px]" use:lines>
					{meta.lede}
				</p>
			{/if}
		</div>
	{/if}
</div>
