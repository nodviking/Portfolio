<script lang="ts">
	import { magnetic } from '#lib/actions/magnetic.ts';
	import { gsap, ScrollTrigger } from '#lib/animations/gsap.ts';
	import { CIPHER, cipherOf, scrambleTo } from '#lib/animations/scramble.ts';
	import SectionHead from '#lib/components/ui/SectionHead.svelte';
	import { contact } from '#lib/data/contact.ts';
	import { site } from '#lib/data/site.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';

	/**
	 * [10] Contact: LET'S + BUILD (boxed, same treatment as the hero) decodes and box-wipes in on enter;
	 * a big framed email button copies on click and its label scrambles to COPIED ✓.
	 */
	let heading: HTMLHeadingElement;
	let first: HTMLSpanElement;
	let boxed: HTMLSpanElement;
	let label: HTMLSpanElement;
	let status = $state('');
	let resetTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		if (motion.reduced) return;
		const words = [first, boxed];
		const finals = [contact.headline.first.toUpperCase(), contact.headline.boxed.toUpperCase()];
		gsap.set(words, { visibility: 'hidden' });
		gsap.set(boxed, { '--box-r': '100%' });
		const st = ScrollTrigger.create({
			trigger: heading,
			start: 'top 85%',
			once: true,
			onEnter: () => {
				words.forEach((w, i) => {
					const px = parseFloat(getComputedStyle(w).fontSize) || 1;
					w.style.minWidth = `${w.getBoundingClientRect().width / px}em`;
					w.textContent = cipherOf(finals[i]);
				});
				gsap.set(words, { visibility: 'visible' });
				gsap
					.timeline()
					.to(first, { duration: 0.7, ease: 'none', scrambleText: { text: finals[0], chars: CIPHER, revealDelay: 0.2, tweenLength: false } }, 0)
					.to(boxed, { duration: 0.8, ease: 'none', scrambleText: { text: finals[1], chars: CIPHER, revealDelay: 0.25, tweenLength: false } }, 0.15)
					.to(boxed, { '--box-r': '0%', duration: 0.55, ease: 'power4.inOut' }, 0.85);
			}
		});
		return () => {
			st.kill();
			gsap.killTweensOf(words);
			first.textContent = contact.headline.first;
			boxed.textContent = contact.headline.boxed;
			gsap.set(words, { clearProps: 'visibility' });
			gsap.set(boxed, { '--box-r': '0%' });
		};
	});

	async function copy() {
		try {
			await navigator.clipboard.writeText(site.email);
			status = 'Email address copied to clipboard.';
			swap('COPIED ✓');
		} catch {
			status = 'Copy failed. Opening your mail app.';
			window.location.href = `mailto:${site.email}`;
		}
	}

	function swap(text: string) {
		clearTimeout(resetTimer);
		if (motion.reduced) label.textContent = text;
		else scrambleTo(label, text, 0.5);
		resetTimer = setTimeout(() => {
			if (motion.reduced) label.textContent = site.email;
			else scrambleTo(label, site.email, 0.6);
			status = '';
		}, 2200);
	}

	const links = [
		{ label: 'GitHub', href: site.github },
		{ label: 'LinkedIn', href: site.linkedin },
		{ label: 'Design portfolio', href: site.designPortfolio }
	];
</script>

<section id="contact" data-section="10" class="section pb-14" aria-labelledby="contact-title">
	<SectionHead id="contact" />

	<div class="wm-wrap">
		<h2 bind:this={heading} id="contact-title" class="wordmark font-display" aria-label="Let's build">
			<span bind:this={first} class="w1" aria-hidden="true">{contact.headline.first}</span><span
				bind:this={boxed}
				class="w2 boxword"
				data-text={contact.headline.boxed.toUpperCase()}
				aria-hidden="true">{contact.headline.boxed}</span
			>
		</h2>
	</div>

	<div class="mt-[clamp(2.5rem,6vw,5rem)] grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
		<button
			type="button"
			class="email frame"
			onclick={copy}
			use:magnetic={{ strength: 0.12 }}
			data-no-scramble
		>
			<span class="tab-label">MAIL.TO</span>
			<span bind:this={label} class="email-label">{site.email}</span>
			<span class="caps text-mute">Click to copy</span>
		</button>

		<ul class="flex flex-wrap gap-3">
			{#each links as l (l.href)}
				<li>
					<a class="tag" href={l.href} target="_blank" rel="noopener noreferrer"
						><span>{l.label}</span> <span aria-hidden="true" data-no-scramble>↗</span></a
					>
				</li>
			{/each}
		</ul>
	</div>
	<p class="sr-only" aria-live="polite">{status}</p>
</section>

<style>
	.wm-wrap {
		container-type: inline-size;
	}
	/* LET'S (2.7em) + gap (0.14em) + BUILD box (2.7em + 0.11em) ≈ 5.65em */
	.wordmark {
		white-space: nowrap;
		line-height: 0.9;
		color: var(--color-accent);
		font-size: calc(100cqw / 5.7);
	}
	.w1,
	.w2 {
		display: inline-block;
	}
	.w2 {
		margin-left: 0.14em;
	}

	.email {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.75rem;
		width: 100%;
		margin-top: 1.4rem;
		padding: clamp(1.25rem, 3vw, 2.25rem);
		text-align: left;
		transition: background-color 0.3s var(--ease-expo);
	}
	.email-label {
		font-weight: 800;
		letter-spacing: -0.03em;
		font-size: clamp(1.05rem, 4.2vw, 3.4rem);
		line-height: 1;
		color: var(--color-paper);
		overflow-wrap: anywhere;
	}
	.email:hover {
		background: var(--color-accent);
		--node-c: var(--color-ink);
	}
	.email:hover .email-label,
	.email:hover .caps {
		color: var(--color-ink);
	}
</style>
