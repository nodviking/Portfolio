<script lang="ts">
	import { reveal } from '#lib/actions/reveal.ts';
	import { monoMetrics as m, type SpecimenCard } from '#lib/data/about.ts';

	let { card, delay = 0 }: { card: SpecimenCard; delay?: number } = $props();

	/*
	 * The drawing is in font units (1 em = 1000), so the measurement lines are JetBrains Mono's real metrics and
	 * the glyphs sit on them exactly. Layout: a label column on the left, then one 600-unit cell per glyph.
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
</script>

<article class="frame mt-7 bg-ink" use:reveal={{ delay }}>
	<span class="tab-label">{card.tab}</span>

	<div class="px-[clamp(18px,3.4vw,52px)] pt-[clamp(22px,3.6vw,56px)]">
		<svg
			viewBox="0 0 {W} {H}"
			class="block h-auto w-full"
			role="img"
			aria-label="Type specimen: {card.glyphs.map((g) => g.char).join(' ')} in JetBrains Mono ExtraBold with its vertical metrics"
		>
			<!-- horizontal metric lines + labels -->
			{#each lines as l (l.key)}
				<line
					x1="0"
					x2={W}
					y1={l.y}
					y2={l.y}
					stroke={l.accent ? 'var(--color-accent)' : '#333'}
					stroke-width={l.accent ? 4 : 3}
				/>
				<text x="0" y={l.y - 22} class="lbl">
					<tspan fill="var(--color-mute)">{l.key}</tspan>
					<tspan fill="var(--color-paper)" dx="18">{l.value}</tspan>
				</text>
			{/each}

			<!-- cell guides + codepoints -->
			{#each xs as x, k (k)}
				<line x1={x} x2={x} y1={top} y2={descY} stroke="#3a3a3a" stroke-width="3" stroke-dasharray="14 12" />
				{#if k < cells}
					<text x={x + 22} y={top + 62} class="cp">{codepoint(card.glyphs[k].char)}</text>
				{/if}
			{/each}

			<!-- glyphs, set on the baseline -->
			{#each card.glyphs as g, k (k)}
				<text
					x={x0 + k * m.advance}
					y={base}
					class="glyph glyph--{g.style}"
				>{g.char}</text>
			{/each}

			<!-- crosshairs on the cap / x / base intersections -->
			{#each xs as x (x)}
				{#each crossYs as y (y)}
					<path d="M{x - 20} {y}H{x + 20}M{x} {y - 20}V{y + 20}" stroke="var(--color-accent)" stroke-width="5" />
				{/each}
			{/each}

			<!-- advance-width dimension + caption -->
			<path
				d="M{x0} {dimY}H{x0 + m.advance}M{x0} {dimY - 22}V{dimY + 22}M{x0 + m.advance} {dimY - 22}V{dimY + 22}"
				stroke="#5a5a5a"
				stroke-width="4"
			/>
			<text x={x0 + m.advance / 2} y={dimY + 95} text-anchor="middle" class="lbl" fill="var(--color-mute)"
				>{m.advance}</text
			>
			<text x={W} y={dimY + 18} text-anchor="end" class="lbl lbl--wide" fill="var(--color-mute)"
				>JETBRAINS MONO · 800</text
			>
		</svg>
	</div>

	<div class="px-[clamp(18px,3.4vw,52px)] pt-[clamp(28px,4vw,56px)] pb-[clamp(26px,3.6vw,48px)]">
		<p class="text-[13px] font-extrabold tracking-[0.01em] text-paper md:text-[14px]">
			{card.tag.before}<span class="text-accent">{card.tag.accent}</span>{card.tag.after}
		</p>
		<h3 class="mt-3 font-display text-[clamp(2.6rem,6vw,4.8rem)] text-paper">{card.title}</h3>
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
		fill: var(--color-accent);
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
