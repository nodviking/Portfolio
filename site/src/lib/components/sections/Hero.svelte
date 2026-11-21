<script lang="ts">
	import { magnetic } from '#lib/actions/magnetic.ts';
	import { EASE, gsap } from '#lib/animations/gsap.ts';
	import HeroArt from '#lib/components/ui/HeroArt.svelte';
	import { heroCta, heroIntro, heroTag, heroWordmark } from '#lib/data/hero.ts';
	import { site } from '#lib/data/site.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';

	/**
	 * Hero: outlined role tag at the top, the two-part wordmark at the bottom centre ("NOD" in blue, "VIKING" in a
	 * blue box with dark text), then a hairline divider with intro copy on the left and status + CTA on the right.
	 *
	 * Intro (after the preloader): the wordmark letters ScrambleText-decode into place, then the box wipes in behind
	 * VIKING. Plain HTML text, no canvas. Under reduced motion everything is simply there.
	 */
	const CIPHER = '0123456789ABCDEF{}<>=/#';

	let root: HTMLElement;
	let first: HTMLSpanElement;
	let boxed: HTMLSpanElement;
	/** Once true, the pre-intro hiding CSS no longer applies (it never comes back, even if the effect re-runs). */
	let played = $state(false);

	const rand = (n: number) =>
		Array.from({ length: n }, () => CIPHER[(Math.random() * CIPHER.length) | 0]).join('');

	$effect(() => {
		if (!motion.introDone) return;
		played = true;
		if (motion.reduced) return;

		const q = (s: string) => root.querySelectorAll<HTMLElement>(s);
		const scramble = (text: string) => ({
			duration: 0.75,
			ease: 'none',
			scrambleText: { text, chars: CIPHER, revealDelay: 0.25, speed: 0.9, tweenLength: false }
		});

		// Lock each word's width (in em, so it still scales) and start from same-length ciphertext,
		// so the centred wordmark never changes width while it decodes.
		for (const el of [first, boxed]) {
			const px = parseFloat(getComputedStyle(el).fontSize) || 1;
			el.style.minWidth = `${el.getBoundingClientRect().width / px}em`;
		}
		first.textContent = rand(heroWordmark.first.length);
		boxed.textContent = rand(heroWordmark.boxed.length);

		const tl = gsap
			.timeline({ defaults: { ease: EASE.out } })
			.set(q('[data-intro]'), { visibility: 'visible' })
			.fromTo(
				q('[data-tag]'),
				{ clipPath: 'inset(0% 100% 0% 0%)' },
				{ clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power4.out' },
				0
			)
			.to(first, scramble(heroWordmark.first.toUpperCase()), 0.05)
			.to(boxed, scramble(heroWordmark.boxed.toUpperCase()), 0.18)
			// Box wipes in behind VIKING once it has decoded.
			.fromTo(
				boxed,
				{ '--box-r': '100%' },
				{ '--box-r': '0%', duration: 0.5, ease: 'power4.inOut' },
				0.95
			)
			// Isometric field rises in, then the blue cube drops onto it.
			.fromTo(
				q('[data-art="slab"], [data-art="ghost"], [data-art="dashed"]'),
				{ y: 16, clipPath: 'inset(0% 0% 100% 0%)' },
				{ y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, stagger: 0.02 },
				0.4
			)
			.fromTo(
				q('[data-art="solid"]'),
				{ y: -70, clipPath: 'inset(0% 0% 0% 0%)' },
				{ y: 0, duration: 0.7, ease: 'power4.out' },
				1.05
			)
			.fromTo(
				q('[data-rule]'),
				{ scaleX: 0 },
				{ scaleX: 1, duration: 1, transformOrigin: 'left center' },
				0.35
			)
			.fromTo(
				q('[data-line]'),
				{ clipPath: 'inset(0% 0% 100% 0%)', y: 14 },
				{ clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 0.8, stagger: 0.07 },
				0.55
			);

		return () => {
			tl.kill();
			first.textContent = heroWordmark.first;
			boxed.textContent = heroWordmark.boxed;
			gsap.set(q('[data-tag], [data-rule], [data-line], [data-art]'), {
				clearProps: 'clipPath,transform'
			});
			gsap.set(boxed, { '--box-r': '0%' });
		};
	});
</script>

<section bind:this={root} class={['hero', played && 'is-played']} aria-labelledby="hero-title">
	<div class="flex justify-center">
		<p class="tag" data-intro data-tag>
			<span class="tag-mark" aria-hidden="true"></span>{heroTag}
		</p>
	</div>

	<div class="art" data-intro>
		<HeroArt />
	</div>

	<!-- One word in the DOM ("NODVIKING"); the box is a pseudo-element so the text isn't duplicated. -->
	<h1 id="hero-title" class="wordmark font-display" aria-label={site.brand}>
		<span bind:this={first} class="w1" data-intro aria-hidden="true">{heroWordmark.first}</span><span
			bind:this={boxed}
			class="w2"
			data-intro
			data-text={heroWordmark.boxed}
			aria-hidden="true">{heroWordmark.boxed}</span
		>
	</h1>

	<div class="foot">
		<span class="rule" data-intro data-rule aria-hidden="true"></span>
		<div class="max-w-[640px] text-[14px] leading-[1.6] md:text-[14.4px]">
			<p data-intro data-line>{heroIntro[0]}</p>
			<p class="mt-2 text-mute" data-intro data-line>{heroIntro[1]}</p>
		</div>
		<div class="w-full md:w-[320px]">
			{#if site.available}
				<p class="mb-3 flex items-center gap-3 text-[12px] text-mute" data-intro data-line>
					<span class="tag-mark" aria-hidden="true"></span>{site.availability}.
				</p>
			{/if}
			<div data-intro data-line>
				<a
					href={heroCta.href}
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn--lg w-full"
					use:magnetic={{ strength: 0.12 }}
				>
					{heroCta.label} <span aria-hidden="true">↗</span>
				</a>
			</div>
		</div>
	</div>
</section>

<style>
	.hero {
		display: flex;
		flex-direction: column;
		min-height: 100svh;
		padding: calc(var(--nav-h) + 16px) var(--gutter) clamp(24px, 4.5vh, 40px);
	}

	/* The art takes whatever space is left, so the hero always fits one screen. */
	.art {
		position: relative;
		flex: 1;
		min-height: 120px;
		margin-block: clamp(0.75rem, 3vh, 2.5rem);
	}
	.art :global(svg) {
		position: absolute;
		inset: 0;
		margin: auto;
		max-width: 620px;
		max-height: 420px;
	}

	.wordmark {
		margin-top: auto;
		text-align: center;
		white-space: nowrap;
		font-size: min(15vw, 22svh, 13.5rem);
		line-height: 0.9;
		color: var(--color-accent);
	}
	.w1,
	.w2 {
		display: inline-block;
	}
	/* VIKING sits in a solid blue box with dark text; the box is drawn by ::after and wiped in via --box-r. */
	.w2 {
		--box-r: 0%;
		position: relative;
		margin-left: 0.14em;
		padding: 0 0.06em 0 0.05em;
	}
	.w2::after {
		content: attr(data-text);
		position: absolute;
		inset: 0;
		padding: inherit;
		background: var(--color-accent);
		color: var(--color-ink);
		clip-path: inset(0 var(--box-r) 0 0);
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
	.rule {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
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
