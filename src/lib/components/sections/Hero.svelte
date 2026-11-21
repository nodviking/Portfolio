<script lang="ts">
	import { EASE, gsap } from '#lib/animations/gsap.ts';
	import { CIPHER, cipherOf, scrambleTo } from '#lib/animations/scramble.ts';
	import AsciiCanvas from '#lib/ascii/AsciiCanvas.svelte';
	import CardFan from '#lib/components/ui/CardFan.svelte';
	import LocalTime from '#lib/components/ui/LocalTime.svelte';
	import { heroIntro, heroWordmark } from '#lib/data/hero.ts';
	import { site } from '#lib/data/site.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';

	/**
	 * [01] Hero. The type is the hero: NOD (orange) + VIKING (orange box, dark text) sized to the full content
	 * width (container-query units), bottom-anchored, framed by spec-drawing annotations and a live dimension line.
	 *
	 * Intro: letters ScrambleText-decode left to right (widths locked), the box wipes in behind VIKING, then the
	 * annotations and dimension line draw in. Scroll: slight wordmark parallax, the divider scales out.
	 */
	let root: HTMLElement;
	let wrap: HTMLDivElement;
	let first: HTMLSpanElement;
	let boxed: HTMLSpanElement;
	let wordmark: HTMLHeadingElement;
	let width = $state(0);
	let played = $state(false);
	/** ASCII version of the wordmark: assembles from noise, then hands over to the solid HTML wordmark. */
	let asciiReveal = $state(0);
	let asciiOn = $state(false);
	let stacked = $state(false);
	const asciiLines = $derived(
		stacked
			? [heroWordmark.first.toUpperCase(), heroWordmark.boxed.toUpperCase()]
			: [`${heroWordmark.first} ${heroWordmark.boxed}`.toUpperCase()]
	);

	// Live pixel width for the dimension label.
	$effect(() => {
		const ro = new ResizeObserver(() => {
			width = Math.round(wordmark.getBoundingClientRect().width);
			stacked = wrap.clientWidth < 600;
		});
		ro.observe(wordmark);
		return () => ro.disconnect();
	});

	// Intro.
	$effect(() => {
		if (!motion.introDone) return;
		played = true;
		if (motion.reduced) return;

		const q = (s: string) => root.querySelectorAll<HTMLElement>(s);
		const words = [first, boxed];
		// Lock each word's width (em, so it still scales), start from same-length ciphertext.
		for (const el of words) {
			const px = parseFloat(getComputedStyle(el).fontSize) || 1;
			el.style.minWidth = `${el.getBoundingClientRect().width / px}em`;
		}
		first.textContent = cipherOf(heroWordmark.first.toUpperCase());
		boxed.textContent = cipherOf(heroWordmark.boxed.toUpperCase());
		const annos = Array.from(q('[data-anno]'));
		annos.forEach((el) => {
			el.dataset.text ??= el.textContent ?? '';
			el.textContent = cipherOf(el.dataset.text);
		});

		// 1. ASCII wordmark assembles out of noise (canvas), 2. the solid wordmark decodes in on top of it.
		const asc = { r: 0 };
		asciiOn = true;
		const T = 1.05;
		const tl = gsap
			.timeline({ defaults: { ease: EASE.out } })
			.to(asc, { r: 1, duration: 1.1, ease: 'power2.out', onUpdate: () => (asciiReveal = asc.r) }, 0)
			.set(q('[data-intro]'), { visibility: 'visible' }, T)
			.call(() => (asciiOn = false), [], T + 0.35)
			.to(
				first,
				{
					duration: 0.7,
					ease: 'none',
					scrambleText: { text: heroWordmark.first.toUpperCase(), chars: CIPHER, revealDelay: 0.2, speed: 0.9, tweenLength: false }
				},
				T + 0.05
			)
			.to(
				boxed,
				{
					duration: 0.8,
					ease: 'none',
					scrambleText: { text: heroWordmark.boxed.toUpperCase(), chars: CIPHER, revealDelay: 0.25, speed: 0.9, tweenLength: false }
				},
				T + 0.15
			)
			// Box wipes in from the left behind VIKING.
			.fromTo(boxed, { '--box-r': '100%' }, { '--box-r': '0%', duration: 0.55, ease: 'power4.inOut' }, T + 0.75)
			// Annotations: dimension line draws out from the centre, end ticks drop in, labels decode.
			.fromTo(q('[data-dim-line]'), { scaleX: 0 }, { scaleX: 1, duration: 0.9 }, T + 0.9)
			.fromTo(q('[data-dim-tick]'), { scaleY: 0 }, { scaleY: 1, duration: 0.4, stagger: 0.05 }, T + 1.15)
			.add(() => annos.forEach((el, i) => scrambleTo(el, el.dataset.text, 0.6, i * 0.06)), T + 0.95)
			.fromTo(q('[data-rule]'), { scaleX: 0 }, { scaleX: 1, duration: 1, transformOrigin: 'left center' }, T + 0.2)
			.fromTo(
				q('[data-line]'),
				{ clipPath: 'inset(0% 0% 100% 0%)', y: 14 },
				{ clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 0.8, stagger: 0.07 },
				T + 0.4
			);

		return () => {
			tl.kill();
			asciiOn = false;
			first.textContent = heroWordmark.first;
			boxed.textContent = heroWordmark.boxed;
			annos.forEach((el) => (el.textContent = el.dataset.text ?? el.textContent));
			gsap.set(q('[data-rule], [data-line], [data-dim-line], [data-dim-tick]'), {
				clearProps: 'clipPath,transform'
			});
			gsap.set(boxed, { '--box-r': '0%' });
		};
	});

	// Scroll: slight parallax on the wordmark, the divider scales out.
	$effect(() => {
		if (motion.reduced) return;
		const ctx = gsap.context(() => {
			gsap.to(wrap, {
				yPercent: -14,
				ease: 'none',
				scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true }
			});
			gsap.to(root.querySelector('[data-rule-wrap]'), {
				scaleX: 0,
				transformOrigin: 'right center',
				ease: 'none',
				scrollTrigger: { trigger: root, start: 'center top', end: 'bottom top', scrub: true }
			});
		}, root);
		return () => ctx.revert();
	});

</script>

<section
	bind:this={root}
	id="top"
	data-section="01"
	class={['hero', played && 'is-played']}
	aria-labelledby="hero-title"
>

	<div bind:this={wrap} class="wm-wrap">
		<!-- Spec-drawing annotations -->
		<div class="annos caps" aria-hidden="true">
			<span data-intro data-anno>{site.coords}</span>
			<span class="hidden md:inline" data-intro data-anno>{site.version}</span>
			<span class="text-right" data-intro><LocalTime seconds /></span>
		</div>
		<div class="dim" aria-hidden="true" data-intro>
			<span class="dim-tick l" data-dim-tick></span>
			<span class="dim-line" data-dim-line></span>
			<span class="dim-label caps">W {width}PX</span>
			<span class="dim-tick r" data-dim-tick></span>
		</div>

		<!-- One word in the DOM ("NODVIKING"); the box is a pseudo-element so the text isn't duplicated. -->
		<div class="wm-box">
		{#if asciiOn}
			<div class="ascii" aria-hidden="true">
				<AsciiCanvas lines={asciiLines} reveal={asciiReveal} cell={stacked ? 6 : 8} padX={0} padY={0.02} />
			</div>
		{/if}
		<h1 bind:this={wordmark} id="hero-title" class="wordmark font-display" aria-label={site.brand}>
			<span bind:this={first} class="w1" data-intro aria-hidden="true">{heroWordmark.first}</span><span
				bind:this={boxed}
				class="w2 boxword"
				data-intro
				data-text={heroWordmark.boxed.toUpperCase()}
				aria-hidden="true">{heroWordmark.boxed}</span
			>
		</h1>
		</div>
	</div>

	<div class="foot">
		<span class="rule-wrap" data-rule-wrap aria-hidden="true"><span class="rule" data-intro data-rule></span></span>
		<div class="max-w-[760px]">
			<p class="text-[clamp(1.15rem,2.1vw,1.75rem)] leading-[1.3] font-semibold tracking-[-0.02em]" data-intro data-line>
				{heroIntro[0]}
			</p>
			<p class="mt-3 text-[14px] leading-[1.6] text-mute md:text-[15px]" data-intro data-line>{heroIntro[1]}</p>
		</div>
		<a href="#about" class="caps self-end text-paper hover:text-accent-ink" data-intro data-line>
			<span>[ Scroll ↓ ]</span>
		</a>
	</div>

	<CardFan play={played} />
</section>

<style>
	.hero {
		display: flex;
		flex-direction: column;
		padding: calc(var(--nav-h) + 16px) var(--gutter) clamp(24px, 4vh, 40px);
	}

	/* Wordmark block sits a short, fixed distance below the nav. */
	.wm-wrap {
		container-type: inline-size;
		margin-top: clamp(1.5rem, 5vh, 3.5rem);
	}

	.hero {
		position: relative;
	}
	.wm-box {
		position: relative;
	}
	.ascii {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.annos {
		display: flex;
		justify-content: space-between;
		white-space: nowrap;
		gap: 1rem;
		font-size: 10px;
		font-weight: 600;
		color: var(--color-mute);
		margin-bottom: 0.9rem;
	}
	@media (max-width: 599px) {
		.annos {
			font-size: 9px;
			letter-spacing: 0.04em;
		}
	}

	/* Dimension line spanning the wordmark width, with end ticks and a live W label. */
	.dim {
		position: relative;
		height: 14px;
		margin-bottom: 0.8rem;
	}
	.dim-line {
		position: absolute;
		left: 0;
		right: 0;
		top: 50%;
		height: 1px;
		background: var(--color-line-strong);
	}
	.dim-tick {
		position: absolute;
		top: 0;
		width: 1px;
		height: 100%;
		background: var(--color-mute);
	}
	.dim-tick.l {
		left: 0;
	}
	.dim-tick.r {
		right: 0;
	}
	.dim-label {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		padding: 0 10px;
		background: var(--color-ink);
		font-size: 10px;
		color: var(--color-mute);
	}

	/* Sized to the full content width: JetBrains Mono advance is 0.6em, tracking -0.06em → 0.54em per glyph. */
	.wordmark {
		white-space: nowrap;
		line-height: 0.9;
		color: var(--color-accent-display);
		/* NOD (1.62em) + gap (0.14em) + VIKING box (3.24em + 0.11em padding) = 5.11em */
		font-size: calc(100cqw / 5.13);
	}
	.w1,
	.w2 {
		display: inline-block;
	}
	.w2 {
		margin-left: 0.14em;
	}
	/* Phones: stack NOD / VIKING, each sized to the full width. */
	@container (max-width: 599px) {
		.wordmark {
			white-space: normal;
		}
		.w1 {
			display: block;
			font-size: calc(100cqw / 1.76);
			line-height: 0.82;
		}
		.w2 {
			margin-left: 0;
			margin-top: 0.08em;
			font-size: calc(100cqw / 3.52);
		}
	}

	.foot {
		position: relative;
		display: grid;
		gap: 1.5rem;
		margin-top: clamp(1.25rem, 3vh, 2rem);
		padding-top: 1.35rem;
	}
	@media (min-width: 768px) {
		.foot {
			grid-template-columns: 1fr auto;
			align-items: end;
		}
	}
	.rule-wrap,
	.rule {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
	}
	.rule {
		background: var(--color-line);
	}

	/* Hidden until the intro runs (only when JS + motion are on; see the inline script in app.html). */
	:global(html.nv-anim) .hero:not(.is-played) [data-intro] {
		visibility: hidden;
	}
	:global(html.nv-anim) .hero:not(.is-played) .w2 {
		--box-r: 100%;
	}
</style>
