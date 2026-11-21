<script lang="ts">
	import { frameDraw } from '#lib/actions/frameDraw.ts';
	import { gsap, ScrollTrigger } from '#lib/animations/gsap.ts';
	import SectionHead from '#lib/components/ui/SectionHead.svelte';
	import { stack } from '#lib/data/stack.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';

	/**
	 * [07] Stack: a framed JSON block (orange keys, white values, grey punctuation) that types in line by line,
	 * beside two marquee rows of the same tags running in opposite directions; their speed follows scroll
	 * velocity. Hovering any tag highlights it everywhere it appears.
	 */
	let code: HTMLPreElement;
	let tracks: HTMLDivElement[] = $state([]);
	let hl = $state('');

	const all = stack.flatMap((g) => g.tags);
	const half = Math.ceil(all.length / 2);
	const rows = [all.slice(0, half), all.slice(half)];

	function onOver(e: PointerEvent) {
		const t = (e.target as Element | null)?.closest?.<HTMLElement>('[data-tag]');
		hl = t?.dataset.tag ?? '';
	}

	// JSON types in: each line wipes open in character steps.
	$effect(() => {
		if (motion.reduced) return;
		const lines = Array.from(code.querySelectorAll<HTMLElement>('[data-cl]'));
		const tl = gsap.timeline({ paused: true });
		lines.forEach((l, i) => {
			const n = Math.max(4, (l.textContent ?? '').length);
			tl.fromTo(
				l,
				{ clipPath: 'inset(0% 100% 0% 0%)' },
				{ clipPath: 'inset(0% 0% 0% 0%)', duration: Math.min(0.7, n * 0.018), ease: `steps(${n})` },
				i * 0.12
			);
		});
		const st = ScrollTrigger.create({ trigger: code, start: 'top 80%', once: true, onEnter: () => tl.play() });
		return () => {
			st.kill();
			tl.kill();
			gsap.set(lines, { clearProps: 'clipPath' });
		};
	});

	// Marquees: base drift + scroll velocity, wrapped on half their width (content is doubled).
	$effect(() => {
		const [a, b] = tracks;
		if (motion.reduced || !a || !b) return;
		let xa = 0;
		let xb = 0;
		let visible = true;
		const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
		io.observe(a);
		const tick = (_t: number, dt: number) => {
			if (!visible) return;
			const v = Math.abs(motion.lenis?.velocity ?? 0);
			const speed = (0.035 + Math.min(v, 60) * 0.012) * dt;
			const wa = a.scrollWidth / 2;
			const wb = b.scrollWidth / 2;
			xa = (xa - speed) % wa;
			xb = (xb + speed) % wb;
			a.style.transform = `translate3d(${xa}px,0,0)`;
			b.style.transform = `translate3d(${xb - wb}px,0,0)`;
		};
		gsap.ticker.add(tick);
		return () => {
			gsap.ticker.remove(tick);
			io.disconnect();
		};
	});
</script>

<section
	id="stack"
	data-section="07"
	class="section"
	aria-labelledby="stack-title"
	onpointerover={onOver}
	onpointerleave={() => (hl = '')}
>
	<SectionHead id="stack" title="Stack" titleId="stack-title" />

	<div class="grid items-start gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
		<div class="frame bg-ink" use:frameDraw>
			<span class="tab-label">STACK.JSON</span>
			<pre bind:this={code} class="code"><code
					><span data-cl class="pn">{'{'}</span
					>{#each stack as g, gi (g.key)}<span data-cl
							>  <span class="k">"{g.key}"</span><span class="pn">: [</span
							>{#each g.tags as t, ti (t)}<span class="v chip-inline" class:is-hl={hl === t} data-tag={t}
									>"{t}"</span
								>{#if ti < g.tags.length - 1}<span class="pn">, </span>{/if}{/each}<span class="pn"
								>]{gi < stack.length - 1 ? ',' : ''}</span
							></span
						>{/each}<span data-cl class="pn">{'}'}</span
					></code
				></pre>
		</div>

		<div class="grid gap-4 overflow-hidden">
			{#each rows as row, r (r)}
				<div class="marquee">
					<div bind:this={tracks[r]} class="mq-track">
						{#each [0, 1] as copy (copy)}
							<ul class="mq-list" aria-hidden={copy === 1 ? 'true' : undefined}>
								{#each row as t (t)}
									<li class="chip mq-chip" class:is-hl={hl === t} data-tag={t}>{t}</li>
								{/each}
							</ul>
						{/each}
					</div>
				</div>
			{/each}
			<p class="mt-4 text-[13px] leading-[1.6] text-mute">
				Hover a tag to find it everywhere. Rows speed up with your scroll.
			</p>
		</div>
	</div>
</section>

<style>
	.code {
		margin: 0;
		padding: 1.5rem 1.4rem 1.75rem;
		font-family: var(--font-mono);
		font-size: clamp(12px, 1vw, 14px);
		line-height: 1.85;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.code [data-cl] {
		display: block;
		padding-left: 2ch;
		text-indent: -2ch;
	}
	.k {
		color: var(--color-accent-ink);
	}
	.v {
		color: var(--color-paper);
	}
	.pn {
		color: var(--color-mute);
	}
	.chip-inline {
		transition:
			background-color 0.2s,
			color 0.2s;
	}
	.chip-inline.is-hl {
		background: var(--color-accent);
		color: var(--color-on-accent);
	}

	.marquee {
		overflow: hidden;
		border-block: 1px solid var(--color-line);
		padding-block: 0.9rem;
	}
	.mq-track {
		display: flex;
		width: max-content;
		will-change: transform;
	}
	.mq-list {
		display: flex;
		gap: 0.75rem;
		padding-right: 0.75rem;
	}
	.mq-chip {
		font-size: clamp(12px, 1.2vw, 15px);
		padding: 8px 14px;
		white-space: nowrap;
	}
	@media (prefers-reduced-motion: reduce) {
		.mq-track,
		.mq-list {
			flex-wrap: wrap;
			width: auto;
		}
		.mq-list[aria-hidden='true'] {
			display: none;
		}
	}
</style>
