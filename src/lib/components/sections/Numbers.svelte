<script lang="ts">
	import { frameDraw } from '#lib/actions/frameDraw.ts';
	import { gsap, ScrollTrigger } from '#lib/animations/gsap.ts';
	import SectionHead from '#lib/components/ui/SectionHead.svelte';
	import { hackathons, numbers } from '#lib/data/numbers.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';

	/**
	 * [08] Numbers: each digit is a vertical strip (0–9 twice) that rolls like an odometer to its value when the
	 * grid enters, after the frames draw. Server-rendered at the final value, so it reads correctly without JS.
	 */
	let grid: HTMLDListElement;
	const STRIP = 20;
	const pct = (d: number) => -((10 + d) * 100) / STRIP;

	$effect(() => {
		if (motion.reduced) return;
		const strips = Array.from(grid.querySelectorAll<HTMLElement>('[data-strip]'));
		gsap.set(strips, { clearProps: 'transform' });
		gsap.set(strips, { yPercent: 0 });
		const st = ScrollTrigger.create({
			trigger: grid,
			start: 'top 80%',
			once: true,
			onEnter: () => {
				strips.forEach((s, i) => {
					const d = Number(s.dataset.digit);
					gsap.to(s, { yPercent: pct(d), duration: 1.6 + (strips.length - i) * 0.04, delay: 0.5 + i * 0.05, ease: 'expo.out' });
				});
			}
		});
		return () => {
			st.kill();
			gsap.killTweensOf(strips);
		};
	});
</script>

<section id="numbers" data-section="08" class="section" aria-labelledby="numbers-title">
	<SectionHead id="numbers" title="Numbers" titleId="numbers-title" />

	<dl bind:this={grid} class="grid grid-cols-2 gap-px lg:grid-cols-4">
		{#each numbers as n, i (n.label)}
			<div class="frame flex flex-col-reverse justify-end gap-4 p-5 md:p-7" use:frameDraw={{ delay: i * 0.08 }}>
				<dt class="caps text-[11px] text-mute">{n.label}</dt>
				<dd class="num font-display text-paper">
					<span class="sr-only">{n.value}{n.suffix ?? ''}</span>
					{#each String(n.value).split('') as ch, k (k)}
						<span class="digit" aria-hidden="true"
							><span class="strip" data-strip data-digit={ch} style:transform="translateY({pct(Number(ch))}%)"
								>{#each Array.from({ length: STRIP }, (_, j) => j % 10) as d, j (j)}<span>{d}</span>{/each}</span
							></span
						>
					{/each}{#if n.suffix}<span class="text-accent-display" aria-hidden="true">{n.suffix}</span>{/if}
				</dd>
			</div>
		{/each}
	</dl>

	{#if hackathons.length}
		<ul class="mt-10 grid gap-2">
			{#each hackathons as h (h.name)}
				<li class="caps text-mute"><span class="text-paper">{h.name}</span> — {h.result}</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.num {
		display: flex;
		font-size: clamp(3.6rem, 10vw, 9rem);
		line-height: 1;
	}
	.digit {
		display: inline-block;
		height: 1em;
		overflow: hidden;
	}
	.strip {
		display: flex;
		flex-direction: column;
	}
	.strip > span {
		height: 1em;
		line-height: 1;
	}
</style>
