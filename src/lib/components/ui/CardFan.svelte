<script lang="ts">
	import { gsap } from '#lib/animations/gsap.ts';
	import { heroFan } from '#lib/data/design.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';

	/**
	 * Fanned stack of work cards (code + design) under the hero. The centre card is tallest; the rest rotate
	 * outward. Intro: the cards deal out from a single stack. Hover: the card rises and straightens.
	 * Pointer: the whole fan tilts slightly toward the cursor.
	 */
	let { play = false }: { play?: boolean } = $props();

	let root: HTMLDivElement;
	const n = heroFan.length;
	const mid = (n - 1) / 2;
	// Per-card pose: rotation, horizontal offset (% of card width), drop (px).
	const pose = heroFan.map((_, i) => {
		const k = i - mid;
		return { r: k * 7, x: k * 78, y: Math.abs(k) * Math.abs(k) * 14, z: 10 - Math.abs(k) };
	});

	$effect(() => {
		if (!play || motion.reduced) return;
		const cards = root.querySelectorAll<HTMLElement>('[data-card]');
		const tl = gsap.timeline().fromTo(
			cards,
			// Only the CSS variable is tweened: GSAP must not write `transform`, which carries the fan pose.
			{ '--deal': 0, '--rise': 1, opacity: 0 },
			{ '--deal': 1, '--rise': 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: { each: 0.06, from: 'center' } }
		);
		return () => tl.kill();
	});

	// Gentle tilt toward the pointer (desktop).
	$effect(() => {
		if (!motion.finePointer || motion.reduced) return;
		const rx = gsap.quickTo(root, '--tx', { duration: 0.8, ease: 'power3.out' });
		const onMove = (e: PointerEvent) => rx(((e.clientX / window.innerWidth) * 2 - 1) * 6);
		window.addEventListener('pointermove', onMove, { passive: true });
		return () => window.removeEventListener('pointermove', onMove);
	});
</script>

<div bind:this={root} class="fan" style="--tx: 0">
	{#each heroFan as c, i (c.title)}
		<a
			href={c.href}
			class="card"
			data-card
			data-cursor
			data-no-scramble
			style="--r:{pose[i].r}deg; --x:{pose[i].x}%; --y:{pose[i].y}px; z-index:{pose[i].z}; --deal:{motion.reduced ? 1 : 0}"
		>
			<span class="media">
				<img src={c.img} alt={c.alt} loading="lazy" decoding="async" style:object-position={c.pos ?? '50% 0%'} />
			</span>
			<span class="label">
				<span class="t">{c.title}</span>
				<span class="s">{c.sub}</span>
			</span>
		</a>
	{/each}
</div>

<style>
	.fan {
		--tx: 0;
		position: relative;
		height: clamp(290px, 33vw, 460px);
		margin-top: clamp(1rem, 2.5vw, 2rem);
		overflow: hidden;
		/* Cards bleed off the bottom edge like a hand of cards. */
		mask-image: linear-gradient(to bottom, #000 86%, transparent);
	}
	.card {
		--deal: 1;
		--rise: 0;
		position: absolute;
		left: 50%;
		top: 6%;
		width: clamp(130px, 17vw, 250px);
		aspect-ratio: 3 / 4.2;
		display: flex;
		flex-direction: column;
		padding: 7px;
		border-radius: 18px;
		overflow: hidden;
		background: var(--color-card);
		border: 1px solid var(--color-line);
		box-shadow:
			0 18px 40px -18px var(--shadow);
		transform: translateX(calc(-50% + var(--x) * var(--deal)))
			translateY(calc(var(--y) * var(--deal) + var(--rise) * 45%))
			rotate(calc((var(--r) + var(--tx) * 1deg * 0.15) * var(--deal)));
		transform-origin: 50% 120%;
		transition:
			transform 0.6s var(--ease-expo),
			box-shadow 0.6s var(--ease-expo);
	}
	.card:hover,
	.card:focus-visible {
		z-index: 20 !important;
		transform: translateX(calc(-50% + var(--x))) translateY(calc(var(--y) - 28px)) rotate(0deg) scale(1.04);
		box-shadow: 0 28px 60px -20px var(--shadow);
	}
	.media {
		flex: 1;
		min-height: 0;
		border-radius: 12px;
		overflow: hidden;
		background: var(--color-panel);
	}
	.media img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.label {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 8px;
		padding: 9px 5px 3px;
		color: var(--color-paper);
		white-space: nowrap;
	}
	.t {
		font-weight: 800;
		font-size: clamp(13px, 1.2vw, 17px);
		letter-spacing: -0.02em;
		line-height: 1.1;
	}
	.s {
		font-size: 9px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-accent-ink);
		overflow: hidden;
		text-overflow: ellipsis;
	}
	@media (max-width: 639px) {
		.fan {
			height: 250px;
		}
		.s {
			display: none;
		}
		.card:nth-child(1),
		.card:nth-child(5) {
			display: none;
		}
	}
</style>
