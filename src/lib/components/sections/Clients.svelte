<script lang="ts">
	import { goto } from '$app/navigation';
	import { lines } from '#lib/actions/lines.ts';
	import { reveal } from '#lib/actions/reveal.ts';
	import { gsap } from '#lib/animations/gsap.ts';
	import SectionHead from '#lib/components/ui/SectionHead.svelte';
	import Shot from '#lib/components/ui/Shot.svelte';
	import { clients } from '#lib/data/clients.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';

	/**
	 * [04] Client work: a big list. Desktop: rows invert to orange on hover and a framed screenshot follows the
	 * cursor (clip-path reveal). Touch: tapping a row expands it like an accordion with the screenshot,
	 * description and links. Every row leads to /work/[slug].
	 */
	let list: HTMLOListElement;
	let preview: HTMLDivElement | undefined = $state();
	let hovered = $state(-1);
	let open = $state(-1);
	const pad = (n: number) => String(n).padStart(2, '0');

	// Cursor-following preview (fine pointers only).
	$effect(() => {
		if (!motion.finePointer || !preview) return;
		const pv = preview;
		const xTo = gsap.quickTo(pv, 'x', { duration: 0.55, ease: 'power3.out' });
		const yTo = gsap.quickTo(pv, 'y', { duration: 0.55, ease: 'power3.out' });
		const onMove = (e: PointerEvent) => {
			xTo(e.clientX + 24);
			yTo(e.clientY - pv.offsetHeight / 2);
		};
		const onEnter = (e: PointerEvent) => {
			gsap.set(pv, { x: e.clientX + 24, y: e.clientY - pv.offsetHeight / 2 });
			gsap.to(pv, { clipPath: 'inset(-8px -8px -8px -8px)', duration: motion.reduced ? 0 : 0.55, ease: 'power4.out', overwrite: 'auto' });
		};
		const onLeave = () => {
			hovered = -1;
			gsap.to(pv, { clipPath: 'inset(-8px -8px 100% -8px)', duration: motion.reduced ? 0 : 0.35, ease: 'power3.in', overwrite: 'auto' });
		};
		list.addEventListener('pointermove', onMove);
		list.addEventListener('pointerenter', onEnter);
		list.addEventListener('pointerleave', onLeave);
		return () => {
			list.removeEventListener('pointermove', onMove);
			list.removeEventListener('pointerenter', onEnter);
			list.removeEventListener('pointerleave', onLeave);
			gsap.killTweensOf(pv);
		};
	});

	// Touch: first tap expands the row instead of navigating.
	function onRowClick(e: MouseEvent, i: number) {
		if (motion.finePointer) return;
		e.preventDefault();
		open = open === i ? -1 : i;
	}

	function accordion(node: HTMLElement) {
		if (motion.reduced) return;
		gsap.fromTo(node, { height: 0 }, { height: 'auto', duration: 0.6, ease: 'power4.out' });
	}
</script>

<section id="work" data-section="04" class="section" aria-labelledby="work-title">
	<SectionHead id="work" title="Client work" titleId="work-title" />

	<ol bind:this={list} class="border-t border-line" use:reveal={{ y: 0 }}>
		{#each clients as c, i (c.slug)}
			<li class="border-b border-line">
				<a
					href="/work/{c.slug}"
					class="row"
					data-cursor
					aria-expanded={motion.finePointer ? undefined : open === i}
					onclick={(e) => onRowClick(e, i)}
					onpointerenter={() => (hovered = i)}
				>
					<span class="index-tag row-idx">{pad(i + 1)}</span>
					<span class="row-name font-display">{c.name}</span>
					<span class="row-cat caps">{c.category}</span>
					<span class="row-year caps">{c.year}</span>
					<span class="row-arrow" aria-hidden="true" data-no-scramble>↗</span>
				</a>

				{#if open === i}
					<div class="overflow-hidden" use:accordion>
						<div class="grid gap-5 pt-2 pb-8">
							<div class="frame">
								<Shot slug={c.slug} alt="{c.name} website, desktop view" />
							</div>
							<p class="text-[14px] leading-[1.6] text-mute">{c.description}</p>
							<div class="flex flex-wrap gap-3">
								<button type="button" class="btn" onclick={() => goto(`/work/${c.slug}`)}>
									<span>Case study</span><span aria-hidden="true" data-no-scramble>→</span>
								</button>
								<a class="tag" href={c.url} target="_blank" rel="noopener noreferrer"
									><span>Live site</span> <span aria-hidden="true" data-no-scramble>↗</span></a
								>
							</div>
						</div>
					</div>
				{/if}
			</li>
		{/each}
	</ol>

	<p class="mt-6 max-w-[60ch] text-[14px] leading-[1.6] text-mute" use:lines>
		Fully custom, personalised websites. Design and development by me, no templates.
	</p>

	{#if motion.finePointer}
		<div bind:this={preview} class="preview frame" aria-hidden="true">
			{#each clients as c, i (c.slug)}
				<div class="pv" class:is-on={hovered === i}>
					<span class="tab-label">{pad(i + 1)} / {c.slug.toUpperCase()}</span>
					<Shot slug={c.slug} alt="" />
				</div>
			{/each}
		</div>
	{/if}
</section>

<style>
	.row {
		display: grid;
		grid-template-columns: 2.5rem 1fr auto;
		align-items: baseline;
		gap: 0.75rem 1.25rem;
		padding: clamp(1.1rem, 2.4vw, 1.9rem) 0.75rem;
		transition:
			background-color 0.25s var(--ease-expo),
			color 0.25s var(--ease-expo);
	}
	.row-name {
		font-size: clamp(1.6rem, 4.6vw, 4.4rem);
		line-height: 0.95;
		color: var(--color-paper);
	}
	.row-cat,
	.row-year {
		grid-column: 2;
		font-size: 11px;
		color: var(--color-mute);
		font-weight: 600;
	}
	.row-year {
		display: none;
	}
	.row-arrow {
		grid-column: 3;
		grid-row: 1;
		font-size: 1.4rem;
		color: var(--color-accent-ink);
	}
	@media (min-width: 900px) {
		.row {
			grid-template-columns: 3.5rem minmax(0, 1fr) 17rem 4rem 2rem;
			align-items: center;
		}
		.row-cat,
		.row-year {
			grid-column: auto;
			display: block;
		}
		.row-arrow {
			grid-column: auto;
			grid-row: auto;
			text-align: right;
		}
	}
	/* Desktop hover: the row inverts. */
	@media (hover: hover) and (pointer: fine) {
		.row:hover {
			background: var(--color-accent);
		}
		.row:hover .row-name,
		.row:hover .row-cat,
		.row:hover .row-year,
		.row:hover .row-arrow,
		.row:hover .row-idx {
			color: var(--color-on-accent);
		}
	}

	.preview {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 70;
		width: clamp(300px, 28vw, 440px);
		aspect-ratio: 16 / 10;
		pointer-events: none;
		background: var(--color-ink);
		clip-path: inset(-8px -8px 100% -8px);
		--node-c: var(--color-accent);
	}
	.pv {
		position: absolute;
		inset: 0;
		opacity: 0;
	}
	.pv.is-on {
		opacity: 1;
	}
	.pv .tab-label {
		top: 0;
		left: 0;
		bottom: auto;
		z-index: 1;
	}
	.pv :global(img) {
		height: 100%;
		object-fit: cover;
		object-position: top;
	}
</style>
