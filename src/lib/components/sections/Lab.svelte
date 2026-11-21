<script lang="ts">
	import { frameDraw } from '#lib/actions/frameDraw.ts';
	import { reveal } from '#lib/actions/reveal.ts';
	import { scrambleTo } from '#lib/animations/scramble.ts';
	import SectionHead from '#lib/components/ui/SectionHead.svelte';
	import { lab } from '#lib/data/lab.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';

	/** [05] More builds: framed cards with a mono readout that scrambles on hover; cards lift, nodes step out. */
	function readoutHover(node: HTMLElement) {
		const onEnter = () => {
			if (motion.reduced) return;
			node.querySelectorAll<HTMLElement>('[data-readout] p').forEach((p, i) =>
				scrambleTo(p, p.dataset.text, 0.55, i * 0.06)
			);
		};
		node.addEventListener('pointerenter', onEnter);
		return { destroy: () => node.removeEventListener('pointerenter', onEnter) };
	}
</script>

<section id="lab" data-section="05" class="section" aria-labelledby="lab-title">
	<SectionHead id="lab" title="More builds" titleId="lab-title" />

	<!-- One project: a full-width card split in two. Two or more: a grid of cards. -->
	<div class={['grid gap-x-6 gap-y-14', lab.length >= 3 ? 'md:grid-cols-3' : lab.length === 2 && 'md:grid-cols-2']}>
		{#each lab as item, i (item.title)}
			<div use:reveal={{ clip: false, y: 48, delay: i * 0.1 }}>
				<article
					class={['frame frame--lift h-full bg-ink p-6 md:p-8', lab.length === 1 ? 'grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-14' : 'flex flex-col']}
					use:frameDraw={{ delay: i * 0.1 }}
					use:readoutHover
				>
					<span class="tab-label">{item.tab}</span>
					<div class="flex flex-col">
						<div class="flex items-start justify-between gap-4" data-readout aria-hidden="true">
							<div class="text-[10px] leading-[1.7] tracking-[0.04em] text-mute uppercase">
								{#each item.readout as r (r)}<p data-text={r}>{r}</p>{/each}
							</div>
							<span class="blink mt-1 size-2 shrink-0 bg-accent"></span>
						</div>
						<h3 class="mt-10 font-display text-[clamp(2rem,4.4vw,3.6rem)] text-paper">{item.title}</h3>
					</div>
					<div class="flex flex-col md:justify-end">
						<p class="text-[15px] leading-[1.65] text-mute md:text-[16px]">{item.body}</p>
						<ul class="mt-6 flex flex-wrap gap-2" aria-label="Built with">
							{#each item.stack as s (s)}<li class="chip">{s}</li>{/each}
						</ul>
					</div>
				</article>
			</div>
		{/each}
	</div>
</section>

<style>
	.blink {
		animation: blink 1.2s steps(2, start) infinite;
	}
	@keyframes blink {
		to {
			visibility: hidden;
		}
	}
</style>
