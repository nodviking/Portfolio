<script lang="ts">
	import { decode } from '#lib/actions/decode.ts';
	import { magnetic } from '#lib/actions/magnetic.ts';
	import { EASE, gsap, ScrollTrigger } from '#lib/animations/gsap.ts';
	import Diagram from '#lib/components/ui/Diagram.svelte';
	import SectionHead from '#lib/components/ui/SectionHead.svelte';
	import Terminal from '#lib/components/ui/Terminal.svelte';
	import { features, storeenv } from '#lib/data/storeenv.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';

	/**
	 * [03] StoreEnv. Desktop: the section pins and the six feature panels scroll horizontally (scrubbed); the
	 * terminal types in sync with the same progress and a 01/06 counter ticks. Panels clip-wipe in and their
	 * diagrams draw as they enter the viewport (containerAnimation).
	 * Phones / reduced motion: panels stack vertically; the terminal types once on enter (or is shown complete).
	 */
	let section: HTMLElement;
	let pin: HTMLDivElement;
	let viewport: HTMLDivElement;
	let track: HTMLDivElement;
	let termBox: HTMLDivElement;

	let progress = $state(0);
	let termProgress = $state(0.08);
	const count = $derived(Math.min(features.length, Math.floor(progress * features.length) + 1));
	const pad = (n: number) => String(n).padStart(2, '0');

	function panelIn(panel: Element) {
		const paths = panel.querySelectorAll('.d');
		return gsap
			.timeline({ paused: true })
			// Negative insets keep the tab label (above the frame) and the corner nodes inside the clip.
			.fromTo(
				panel,
				{ clipPath: 'inset(-2rem 100% -1rem -1rem)' },
				{ clipPath: 'inset(-2rem -1rem -1rem -1rem)', duration: 0.8, ease: 'power4.out' }
			)
			.fromTo(paths, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1, ease: EASE.out, stagger: 0.06 }, 0.2);
	}

	$effect(() => {
		if (motion.reduced) {
			termProgress = 1;
			progress = 1;
			return;
		}
		const panels = Array.from(track.querySelectorAll('[data-panel]'));
		const mm = gsap.matchMedia();

		// Desktop: pinned horizontal scroll.
		mm.add('(min-width: 900px)', () => {
			const dist = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
			const len = () => dist() + window.innerHeight * 0.8;
			const tween = gsap.to(track, {
				x: () => -dist(),
				ease: 'none',
				scrollTrigger: {
					trigger: section,
					pin,
					start: 'top top',
					end: () => `+=${len()}`,
					scrub: 0.6,
					invalidateOnRefresh: true,
					onUpdate: (self) => {
						progress = self.progress;
						// Start with the first command already typed so the terminal is never an empty box.
						termProgress = 0.08 + self.progress * 0.92;
					},
					onRefresh: () => ((window as Window & { __nvStoreenvLen?: number }).__nvStoreenvLen = len())
				}
			});
			for (const p of panels) {
				const tl = panelIn(p);
				// Panels already visible when the pin starts reveal as the section arrives; the rest as they slide in.
				const visibleAtStart = (p as HTMLElement).offsetLeft < viewport.clientWidth;
				ScrollTrigger.create(
					visibleAtStart
						? { trigger: section, start: 'top 55%', once: true, onEnter: () => tl.play() }
						: {
								trigger: p,
								containerAnimation: tween,
								start: 'left 92%',
								once: true,
								onEnter: () => tl.play()
							}
				);
			}
		});

		// Phones: stacked panels, terminal types once when it enters.
		mm.add('(max-width: 899px)', () => {
			for (const p of panels) {
				const tl = panelIn(p);
				ScrollTrigger.create({ trigger: p, start: 'top 88%', once: true, onEnter: () => tl.play() });
			}
			const o = { p: 0 };
			ScrollTrigger.create({
				trigger: termBox,
				start: 'top 80%',
				once: true,
				onEnter: () =>
					gsap.to(o, { p: 1, duration: 5.5, ease: 'none', onUpdate: () => (termProgress = 0.08 + o.p * 0.92) })
			});
			progress = 1;
		});

		return () => mm.revert();
	});
</script>

<section bind:this={section} id="storeenv" data-section="03" class="storeenv" aria-labelledby="storeenv-title">
	<div bind:this={pin} class="pin">
		<div class="head">
			<SectionHead id="storeenv" />
			<div class="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
				<div>
					<h2 id="storeenv-title" class="font-display text-[clamp(3rem,10vw,9rem)] text-accent-display" use:decode>{storeenv.title}</h2>
					<p class="mt-3 text-[clamp(1.05rem,1.8vw,1.6rem)] font-medium text-paper">
						{storeenv.subtitle} <span class="text-mute">{storeenv.role}.</span>
					</p>
				</div>
				<div class="flex flex-col gap-4 lg:items-end">
					<div class="flex flex-wrap gap-3">
						{#each storeenv.links as l (l.href)}
							<a class="btn" href={l.href} target="_blank" rel="noopener noreferrer" use:magnetic={{ strength: 0.2 }}>
								<span>{l.label}</span><span aria-hidden="true" data-no-scramble>↗</span>
							</a>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<div class="body">
			<div bind:this={viewport} class="viewport">
				<div class="mb-3 hidden justify-end min-[900px]:flex">
					<p class="caps tabular-nums" aria-hidden="true">
						<span class="text-accent-ink">{pad(count)}</span>/{pad(features.length)}
					</p>
				</div>
				<div bind:this={track} class="track">
					{#each features as f, i (f.title)}
						<article class="panel frame" data-panel>
							<span class="tab-label">{pad(i + 1)} / {f.title.toUpperCase().replaceAll(' ', '_')}</span>
							<div class="dg"><Diagram kind={f.diagram} /></div>
							<div class="mt-auto">
								<h3 class="font-display text-[clamp(1.6rem,2.4vw,2.4rem)] text-paper">{f.title}</h3>
								<p class="mt-3 text-[13px] leading-[1.6] text-mute md:text-[14px]">{f.body}</p>
							</div>
						</article>
					{/each}
				</div>
			</div>

			<div bind:this={termBox} class="term-box">
				<Terminal progress={termProgress} />
			</div>
		</div>
	</div>
</section>

<style>
	.storeenv {
		position: relative;
		border-top: 1px solid var(--color-line);
	}
	.pin {
		padding: clamp(5rem, 10vw, 8rem) var(--gutter) clamp(3rem, 6vw, 5rem);
	}
	.head {
		margin-bottom: clamp(2rem, 4vw, 3rem);
	}
	.body {
		display: grid;
		gap: 2.5rem;
	}
	.track {
		display: grid;
		gap: 2rem;
	}
	.panel {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-top: 1.4rem;
		padding: 1.5rem 1.5rem 1.75rem;
		background: var(--color-ink);
	}
	.dg {
		padding: 0.5rem 0;
		max-width: 320px;
	}

	/* Desktop: one viewport-tall pinned stage; panels in a horizontal track beside the terminal. */
	@media (min-width: 900px) {
		.pin {
			height: 100svh;
			display: flex;
			flex-direction: column;
			padding-top: calc(var(--nav-h) + 1rem);
			padding-bottom: 2rem;
		}
		.head {
			margin-bottom: 1.5rem;
		}
		.head :global(h2) {
			font-size: clamp(3rem, 7vw, 7rem);
		}
		.body {
			flex: 1;
			min-height: 0;
			grid-template-columns: minmax(0, 1fr) minmax(340px, 31vw);
			align-items: stretch;
		}
		.viewport {
			display: flex;
			flex-direction: column;
			min-width: 0;
			overflow: hidden;
		}
		.track {
			display: flex;
			flex: 1;
			min-height: 0;
			gap: 1.5rem;
			will-change: transform;
		}
		.panel {
			flex: 0 0 clamp(300px, 27vw, 420px);
			margin-top: 1.4rem;
		}
		.dg {
			max-width: none;
		}
		.term-box {
			align-self: start;
			padding-top: calc(1.4rem + 1.6rem + 0.75rem);
		}
	}
	@media (min-width: 900px) and (prefers-reduced-motion: reduce) {
		.pin {
			height: auto;
		}
		.track {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.panel {
			flex: none;
		}
	}
</style>
