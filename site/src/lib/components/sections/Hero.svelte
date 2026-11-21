<script lang="ts">
	import { ScrollTrigger } from '#lib/animations/gsap.ts';
	import LocalTime from '#lib/components/ui/LocalTime.svelte';
	import { aboutHeadline, heroLines, lensLines } from '#lib/data/hero.ts';
	import { site } from '#lib/data/site.ts';
	import type { DecryptField } from '#lib/hero/decrypt-field.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';

	/**
	 * "Decrypt" hero.
	 * - gl:     WebGL particles decrypt NODVIKING, scatter from the pointer, and re-form into the About headline on scroll.
	 * - static: flat wordmark with a soft glow + headline in normal flow (reduced motion, no WebGL2, Save-Data).
	 * The real <h1>/<h2> are always in the DOM; in gl mode their text is transparent but still readable/selectable.
	 */
	let section: HTMLElement;
	let stage: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	let heroTitle: HTMLHeadingElement;
	let aboutTitle: HTMLHeadingElement;
	let aboutFrame: HTMLDivElement;
	let lens: HTMLDivElement | undefined = $state();
	let lensRing: HTMLDivElement | undefined = $state();

	let mode = $state<'pending' | 'gl' | 'static'>('pending');
	let progress = $state(0);
	let field: DecryptField | null = null;

	const frontOpacity = $derived(Math.max(0, 1 - progress * 5));
	const reveal = $derived(Math.min(1, Math.max(0, (progress - 0.9) / 0.1)));

	// Dense rows (several snippets per row) so whatever the lens lands on reads as code.
	const lensRows = Array.from({ length: 44 }, (_, i) =>
		Array.from({ length: 5 }, (_, j) => lensLines[(i * 3 + j * 7) % lensLines.length]).join('   ')
	);

	// 1. Decide the mode and lazy-load the engine.
	$effect(() => {
		const reduced = motion.reduced;
		const fine = motion.finePointer;
		const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
		if (reduced || conn?.saveData) {
			mode = 'static';
			return;
		}

		const lite = !fine || (navigator.hardwareConcurrency ?? 8) <= 4;
		let cancelled = false;

		(async () => {
			const { createDecryptField } = await import('#lib/hero/decrypt-field.ts');
			if (cancelled) return;
			const f = await createDecryptField({
				canvas,
				stage,
				heroText: heroTitle,
				aboutText: aboutTitle,
				aboutFrame,
				lite,
				fontFamily: 'Anton'
			});
			if (cancelled) {
				f?.destroy();
				return;
			}
			if (!f) {
				mode = 'static';
				return;
			}
			field = f;
			mode = 'gl';
		})().catch((err) => {
			console.warn('[hero] WebGL field unavailable, using static hero', err);
			mode = 'static';
		});

		return () => {
			cancelled = true;
			field?.destroy();
			field = null;
		};
	});

	// 2. Start the decrypt as the preloader hands off.
	$effect(() => {
		if (mode === 'gl' && motion.introDone) field?.start();
	});

	// 3. Scroll progress across the sticky stage → disperse / re-form.
	$effect(() => {
		if (mode !== 'gl') return;
		const st = ScrollTrigger.create({
			trigger: section,
			start: 'top top',
			end: 'bottom bottom',
			onUpdate: (self) => {
				progress = self.progress;
				field?.setProgress(self.progress);
			}
		});
		return () => st.kill();
	});

	// 4. Pointer physics + cursor lens (fine pointers only).
	$effect(() => {
		if (mode !== 'gl' || !motion.finePointer || !lens || !lensRing) return;
		const lensEl = lens;
		const ringEl = lensRing;
		let mx = 0;
		let my = 0;
		let lr = 0;
		let target = 0;
		let raf = 0;

		const paint = () => {
			raf = 0;
			lr += (target - lr) * 0.16;
			lensEl.style.setProperty('--mx', `${mx}px`);
			lensEl.style.setProperty('--my', `${my}px`);
			lensEl.style.setProperty('--lr', `${lr.toFixed(1)}px`);
			ringEl.style.transform = `translate(${mx - lr}px, ${my - lr}px)`;
			ringEl.style.width = ringEl.style.height = `${lr * 2}px`;
			if (Math.abs(target - lr) > 0.4) raf = requestAnimationFrame(paint);
		};
		const kick = () => {
			if (!raf) raf = requestAnimationFrame(paint);
		};
		const onMove = (e: PointerEvent) => {
			if (e.pointerType !== 'mouse') return;
			const r = stage.getBoundingClientRect();
			mx = e.clientX - r.left;
			my = e.clientY - r.top;
			target = 150;
			field?.setPointer(mx, my);
			kick();
		};
		const onLeave = () => {
			target = 0;
			field?.setPointer(null, null);
			kick();
		};

		stage.addEventListener('pointermove', onMove, { passive: true });
		stage.addEventListener('pointerleave', onLeave);
		return () => {
			stage.removeEventListener('pointermove', onMove);
			stage.removeEventListener('pointerleave', onLeave);
			if (raf) cancelAnimationFrame(raf);
		};
	});

	// 5. Pause when off-screen or the tab is hidden; rebuild on real resizes.
	$effect(() => {
		if (mode !== 'gl') return;
		let inView = true;
		const sync = () => field?.setRunning(inView && !document.hidden);
		const io = new IntersectionObserver(([e]) => {
			inView = e.isIntersecting;
			sync();
		});
		io.observe(section);
		document.addEventListener('visibilitychange', sync);

		let lastW = window.innerWidth;
		let lastH = window.innerHeight;
		let timer: ReturnType<typeof setTimeout> | undefined;
		const onResize = () => {
			const w = window.innerWidth;
			const h = window.innerHeight;
			// Ignore mobile URL-bar height jitter.
			if (w === lastW && (!motion.finePointer || h === lastH)) return;
			lastW = w;
			lastH = h;
			clearTimeout(timer);
			timer = setTimeout(() => {
				field?.rebuild();
				ScrollTrigger.refresh();
			}, 200);
		};
		window.addEventListener('resize', onResize);

		return () => {
			io.disconnect();
			document.removeEventListener('visibilitychange', sync);
			window.removeEventListener('resize', onResize);
			clearTimeout(timer);
		};
	});
</script>

<section
	bind:this={section}
	class={['hero', mode === 'gl' && 'is-gl', mode === 'static' && 'is-static', motion.introDone && 'is-in']}
	aria-labelledby="hero-title"
>
	<div bind:this={stage} class="hero-stage">
		{#if motion.finePointer}
			<div
				bind:this={lens}
				class="lens"
				aria-hidden="true"
				style:opacity={mode === 'gl' ? frontOpacity : 0}
			>
				{#each lensRows as line, i (i)}
					<p style:margin-left="-{(i * 37) % 29}ch">{line}</p>
				{/each}
			</div>
			<div bind:this={lensRing} class="lens-ring" aria-hidden="true"></div>
		{/if}

		<canvas bind:this={canvas} class="hero-canvas" aria-hidden="true"></canvas>

		<div class="absolute inset-0 grid place-items-center px-[var(--gutter)] text-center">
			<div>
				<h1
					bind:this={heroTitle}
					id="hero-title"
					class="hero-title font-display text-[clamp(4.6rem,19.5vw,20rem)] leading-[0.86] uppercase"
				>
					{site.brand}
				</h1>
				<div class="hero-in">
					<p
						class="caps mx-auto mt-5 text-paper/85 md:mt-7"
						style:opacity={mode === 'gl' ? frontOpacity : undefined}
					>
						{#each heroLines as line (line)}<span class="block">{line}</span>{/each}
					</p>
				</div>
			</div>
		</div>

		<div class="hero-in absolute inset-x-0 bottom-5 md:bottom-7">
		<div
			class="caps flex items-end justify-between gap-4 px-[var(--gutter)] text-paper/80 md:grid md:grid-cols-3"
			style:opacity={mode === 'gl' ? frontOpacity : undefined}
		>
			<span class="shrink-0 md:hidden"><LocalTime /></span>
			<a href="#about" class="scroll-cue hidden justify-self-center md:col-start-2 md:flex">
				<span>Scroll</span><span class="cue-line" aria-hidden="true"></span>
			</a>
			<span class="flex flex-col items-end gap-1 justify-self-end text-right">
				{#if site.available}
					<span class="flex items-center gap-2">
						<span class="size-1.5 rounded-full bg-accent" aria-hidden="true"
						></span>{site.availability}
					</span>
				{/if}
				<span class="hidden md:inline">{site.location} · <LocalTime /></span>
			</span>
		</div>
		</div>
	</div>

	<!-- Where the particles land: the last viewport of the section. -->
	<div bind:this={aboutFrame} id="about" class="about-frame px-[var(--gutter)]">
		<h2
			bind:this={aboutTitle}
			class="about-title font-display text-[clamp(3.2rem,10vw,9.5rem)] leading-[0.9] uppercase"
			style:--reveal={mode === 'gl' ? reveal : undefined}
		>
			{#each aboutHeadline as line (line)}<span class="block">{line}</span>{/each}
		</h2>
	</div>
</section>

<style>
	.hero {
		position: relative;
		height: 260svh;
	}
	.hero-stage {
		position: sticky;
		top: 0;
		height: 100svh;
		overflow: hidden;
	}
	.hero-canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	/* Wordmark: the only glowing element on the site. Soft, small. */
	.hero-title {
		position: relative;
		color: var(--color-accent);
		text-shadow: var(--glow-hero);
	}
	.is-gl .hero-title {
		color: transparent;
		text-shadow: none;
	}

	/* About headline sits in the last viewport; in gl mode it fades in crisp as the particles finish forming. */
	.about-frame {
		position: absolute;
		inset-inline: 0;
		bottom: 0;
		height: 100svh;
		display: grid;
		place-items: center;
		text-align: center;
		pointer-events: none;
	}
	.about-title {
		--reveal: 0;
		color: rgb(47 107 255 / var(--reveal));
	}

	/* Static mode (reduced motion / no WebGL): everything in normal flow. */
	.is-static {
		height: auto;
	}
	.is-static .hero-stage {
		position: relative;
	}
	.is-static .about-frame {
		position: relative;
		height: auto;
		min-height: 70svh;
	}
	.is-static .about-title {
		--reveal: 1;
	}
	@media (prefers-reduced-motion: reduce) {
		.hero {
			height: auto;
		}
		.hero-stage {
			position: relative;
		}
		.about-frame {
			position: relative;
			height: auto;
			min-height: 70svh;
		}
		.about-title {
			--reveal: 1;
		}
	}

	/* Intro: supporting copy rises in after the preloader. */
	.hero-in {
		opacity: 0;
		translate: 0 14px;
		transition:
			opacity 1.1s var(--ease-expo) 0.9s,
			translate 1.1s var(--ease-expo) 0.9s;
	}
	.is-in .hero-in {
		opacity: 1;
		translate: 0 0;
	}

	/* Cursor lens: hidden code layer, masked to a circle around the pointer. */
	.lens {
		--mx: -999px;
		--my: -999px;
		--lr: 0px;
		position: absolute;
		inset: 0;
		padding: 5.5rem var(--gutter) 0;
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: 12px;
		line-height: 2;
		white-space: nowrap;
		color: rgb(91 140 255 / 0.72);
		pointer-events: none;
		user-select: none;
		-webkit-mask-image: radial-gradient(
			circle var(--lr) at var(--mx) var(--my),
			#000 40%,
			transparent 100%
		);
		mask-image: radial-gradient(circle var(--lr) at var(--mx) var(--my), #000 40%, transparent 100%);
	}
	.lens-ring {
		position: absolute;
		top: 0;
		left: 0;
		width: 0;
		height: 0;
		border-radius: 999px;
		border: 1px solid rgb(91 140 255 / 0.4);
		box-shadow: 0 0 10px rgb(47 107 255 / 0.18);
		pointer-events: none;
	}

	.scroll-cue {
		flex-direction: column;
		align-items: center;
		gap: 0.6rem;
	}
	.cue-line {
		width: 1px;
		height: 42px;
		background: linear-gradient(to bottom, var(--color-accent-soft), transparent);
		transform-origin: top;
		animation: cue 2.2s var(--ease-quart-in-out) infinite;
	}
	@keyframes cue {
		0% {
			transform: scaleY(0);
			transform-origin: top;
		}
		45% {
			transform: scaleY(1);
			transform-origin: top;
		}
		55% {
			transform: scaleY(1);
			transform-origin: bottom;
		}
		100% {
			transform: scaleY(0);
			transform-origin: bottom;
		}
	}
</style>
