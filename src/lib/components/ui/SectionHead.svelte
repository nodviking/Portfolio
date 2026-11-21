<script lang="ts">
	import { decode } from '#lib/actions/decode.ts';
	import { sectionById } from '#lib/data/site.ts';

	/** `[03] / STOREENV.CLI` index tab with a hairline, and an optional big display title that decodes in. */
	let { id, title, titleId }: { id: string; title?: string; titleId?: string } = $props();
	const meta = $derived(sectionById(id));
</script>

<div class="mb-[clamp(2rem,5vw,4.5rem)]">
	<div class="flex items-center gap-4">
		<p class="index-tag shrink-0">[{meta.index}] / {meta.file}</p>
		<span class="h-px flex-1 bg-line" aria-hidden="true"></span>
		<p class="caps shrink-0 text-[10px] text-mute">{meta.label}</p>
	</div>
	{#if title}
		<h2 id={titleId} class="mt-6 font-display text-[clamp(2.6rem,9.4vw,8.5rem)] text-paper" use:decode>{title}</h2>
	{/if}
</div>
