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

	<div class="grid gap-x-6 gap-y-14 md:grid-cols-3">
		{#each lab as item, i (item.title)}
			<div use:reveal={{ clip: false, y: 48, delay: i * 0.1 }}>
				<article
					class="frame frame--lift flex h-full flex-col bg-ink p-6"
					use:frameDraw={{ delay: i * 0.1 }}
					use:readoutHover
				>
					<span class="tab-label">{item.tab}</span>
					<div class="flex items-start justify-between gap-4" data-readout aria-hidden="true">
						<div class="text-[10px] leading-[1.7] tracking-[0.04em] text-mute uppercase">
							{#each item.readout as r (r)}<p data-text={r}>{r}</p>{/each}
						</div>
						<span class="blink mt-1 size-2 shrink-0 bg-accent"></span>
					</div>
					<h3 class="mt-10 font-display text-[clamp(1.8rem,3vw,2.8rem)] text-paper">{item.title}</h3>
					<p class="mt-4 text-[14px] leading-[1.6] text-mute">{item.body}</p>
					<ul class="mt-auto flex flex-wrap gap-2 pt-7" aria-label="Built with">
						{#each item.stack as s (s)}<li class="chip">{s}</li>{/each}
					</ul>
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
