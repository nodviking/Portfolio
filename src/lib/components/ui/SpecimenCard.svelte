<script lang="ts">
	import { decode } from '#lib/actions/decode.ts';
	import { frameDraw } from '#lib/actions/frameDraw.ts';
	import { EASE, gsap, ScrollTrigger } from '#lib/animations/gsap.ts';
	import { CIPHER } from '#lib/animations/scramble.ts';
	import { monoMetrics as m, type SpecimenCard } from '#lib/data/about.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';

	let { card, delay = 0 }: { card: SpecimenCard; delay?: number } = $props();

	/*
	 * The drawing is in font units (1 em = 1000), so the measurement lines are JetBrains Mono's real metrics and
	 * the glyphs sit on them exactly. Layout: a label column on the left, then one 600-unit cell per glyph.
	 * Motion: the frame draws from its corner nodes, then the measurement lines draw, then the glyphs scramble in.
	 */
	const W = 2600;
	const x0 = 560;
	const top = 140;
	const base = top + m.asc;
	const lines = [
		{ key: 'ASC', value: m.asc, y: top },
		{ key: 'CAP', value: m.cap, y: base - m.cap },
		{ key: 'X', value: m.x, y: base - m.x },
		{ key: 'BASE', value: 0, y: base, accent: true },
		{ key: 'DESC', value: m.desc, y: base - m.desc }
	];
	const descY = base - m.desc;
	const dimY = descY + 110;
	const H = dimY + 130;

	const cells = $derived(card.glyphs.length);
	const xs = $derived(Array.from({ length: cells + 1 }, (_, k) => x0 + k * m.advance));
	const crossYs = [base - m.cap, base - m.x, base];
	const codepoint = (c: string) =>
		'U+' + (c.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0');

	let svg: SVGSVGElement;

	$effect(() => {
		if (motion.reduced) return;
		const q = (s: string) => Array.from(svg.querySelectorAll<SVGElement>(s));
		const glyphs = q('[data-glyph]');
		const finals = glyphs.map((g) => g.textContent ?? '');

		const tl = gsap
			.timeline({ paused: true, delay: delay + 0.55 })
			.from(q('[data-h]'), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.9, ease: EASE.out, stagger: 0.06 })
			.from(q('[data-v]'), { scaleY: 0, transformOrigin: '50% 0%', duration: 0.7, ease: EASE.out, stagger: 0.05 }, 0.2)
			.from(q('[data-lbl]'), { autoAlpha: 0, duration: 0.3, stagger: 0.03 }, 0.3)
			.from(q('[data-cross]'), { scale: 0, transformOrigin: '50% 50%', duration: 0.4, stagger: 0.02 }, 0.55)
			.add(() => {
				glyphs.forEach((g, i) =>
					gsap.to(g, {
						duration: 0.7,
						delay: i * 0.08,
						ease: 'none',
						scrambleText: { text: finals[i], chars: CIPHER, revealDelay: 0.45, speed: 1.2 }
					})
				);
			}, 0.65)
			.from(glyphs, { autoAlpha: 0, duration: 0.01 }, 0.65);

		const st = ScrollTrigger.create({ trigger: svg, start: 'top 85%', once: true, onEnter: () => tl.play() });
		return () => {
			st.kill();
			tl.kill();
			glyphs.forEach((g, i) => {
				gsap.killTweensOf(g);
				g.textContent = finals[i];
			});
		};
	});
</script>

<article class="frame mt-7 bg-ink" use:frameDraw={{ delay }}>
	<span class="tab-label">{card.tab}</span>

	<div class="px-[clamp(18px,3.4vw,52px)] pt-[clamp(22px,3.6vw,56px)]">
		<svg
			bind:this={svg}
			viewBox="0 0 {W} {H}"
			class="block h-auto w-full"
			role="img"
			aria-label="Type specimen: {card.glyphs.map((g) => g.char).join(' ')} in JetBrains Mono ExtraBold with its vertical metrics"
		>
			<!-- horizontal metric lines + labels -->
			{#each lines as l (l.key)}
				<line
					data-h
					x1="0"
					x2={W}
					y1={l.y}
					y2={l.y}
					stroke={l.accent ? 'var(--color-accent-ink)' : '#333'}
					stroke-width={l.accent ? 4 : 3}
				/>
				<text data-lbl x="0" y={l.y - 22} class="lbl">
					<tspan fill="var(--color-mute)">{l.key}</tspan>
					<tspan fill="var(--color-paper)" dx="18">{l.value}</tspan>
				</text>
			{/each}

			<!-- cell guides + codepoints -->
			{#each xs as x, k (k)}
				<line
					data-v
					x1={x}
					x2={x}
					y1={top}
					y2={descY}
					stroke="#3a3a3a"
					stroke-width="3"
					stroke-dasharray="14 12"
				/>
				{#if k < cells}
					<text data-lbl x={x + 22} y={top + 62} class="cp">{codepoint(card.glyphs[k].char)}</text>
				{/if}
			{/each}

			<!-- glyphs, set on the baseline -->
			{#each card.glyphs as g, k (k)}
				<text data-glyph x={x0 + k * m.advance} y={base} class="glyph glyph--{g.style}">{g.char}</text>
			{/each}

			<!-- crosshairs on the cap / x / base intersections -->
			{#each xs as x (x)}
				{#each crossYs as y (y)}
					<path
						data-cross
						d="M{x - 20} {y}H{x + 20}M{x} {y - 20}V{y + 20}"
						stroke="var(--color-accent-ink)"
						stroke-width="5"
					/>
				{/each}
			{/each}

			<!-- advance-width dimension + caption -->
			<path
				data-h
				d="M{x0} {dimY}H{x0 + m.advance}M{x0} {dimY - 22}V{dimY + 22}M{x0 + m.advance} {dimY - 22}V{dimY + 22}"
				stroke="#5a5a5a"
				stroke-width="4"
			/>
			<text data-lbl x={x0 + m.advance / 2} y={dimY + 95} text-anchor="middle" class="lbl" fill="var(--color-mute)"
				>{m.advance}</text
			>
			<text data-lbl x={W} y={dimY + 18} text-anchor="end" class="lbl lbl--wide" fill="var(--color-mute)"
				>JETBRAINS MONO · 800</text
			>
		</svg>
	</div>

	<div class="px-[clamp(18px,3.4vw,52px)] pt-[clamp(28px,4vw,56px)] pb-[clamp(26px,3.6vw,48px)]">
		<p class="text-[13px] font-extrabold tracking-[0.01em] text-paper md:text-[14px]">
			{card.tag.before}<span class="text-accent-ink">{card.tag.accent}</span>{card.tag.after}
		</p>
		<h3 class="mt-3 font-display text-[clamp(2.6rem,6vw,4.8rem)] text-paper" use:decode={{ delay: delay + 0.6 }}>{card.title}</h3>
		<p class="mt-5 max-w-[46ch] text-[14px] leading-[1.65] text-mute md:text-[15px]">{card.body}</p>
	</div>
</article>

<style>
	svg text {
		font-family: var(--font-mono);
	}
	.lbl {
		font-size: 50px;
		font-weight: 700;
		letter-spacing: 4px;
	}
	.lbl--wide {
		letter-spacing: 8px;
	}
	.cp {
		font-size: 40px;
		fill: var(--color-mute);
		letter-spacing: 2px;
	}
	.glyph {
		font-size: 1000px;
		font-weight: 800;
	}
	.glyph--solid {
		fill: var(--color-accent-display);
	}
	.glyph--light {
		fill: var(--color-paper);
	}
	.glyph--outline {
		fill: none;
		stroke: var(--color-paper);
		stroke-width: 7;
	}
</style>
