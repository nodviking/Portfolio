<script lang="ts">
	/**
	 * Simple isometric cube (SVG).
	 * - solid:  blue faces in three shades
	 * - ghost:  dark grey faces with a hairline stroke
	 * - dashed: dashed blue outline only
	 * - slab:   a solid, half-height cube (for "in progress" states)
	 */
	let {
		size = 48,
		variant = 'solid',
		title
	}: { size?: number; variant?: 'solid' | 'ghost' | 'dashed' | 'slab'; title?: string } = $props();

	// Points on a 100×100 grid. Top face, left face, right face.
	const full = {
		top: '50,6 92,30 50,54 8,30',
		left: '8,30 50,54 50,98 8,74',
		right: '50,54 92,30 92,74 50,98'
	};
	const slab = {
		top: '50,40 92,64 50,88 8,64',
		left: '8,64 50,88 50,98 8,74',
		right: '50,88 92,64 92,74 50,98'
	};
	const g = $derived(variant === 'slab' ? slab : full);
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 100 104"
	role={title ? 'img' : undefined}
	aria-hidden={title ? undefined : 'true'}
	aria-label={title}
	class="iso iso--{variant}"
>
	{#if variant === 'dashed'}
		<g fill="none" stroke="var(--color-accent-soft)" stroke-width="1.6" stroke-dasharray="5 4">
			<polygon points={full.top} />
			<polyline points="8,30 8,74 50,98 92,74 92,30" />
			<line x1="50" y1="54" x2="50" y2="98" />
		</g>
	{:else}
		<polygon class="t" points={g.top} />
		<polygon class="l" points={g.left} />
		<polygon class="r" points={g.right} />
	{/if}
</svg>

<style>
	.iso polygon {
		stroke-linejoin: round;
		stroke-width: 1.2;
	}
	.iso--solid .t,
	.iso--slab .t {
		fill: var(--color-accent);
		stroke: var(--color-ink);
	}
	.iso--solid .l,
	.iso--slab .l {
		fill: var(--color-accent-deep);
		stroke: var(--color-ink);
	}
	.iso--solid .r,
	.iso--slab .r {
		fill: #1840b3;
		stroke: var(--color-ink);
	}
	.iso--ghost .t {
		fill: #2a2a2a;
		stroke: #4a4a4a;
	}
	.iso--ghost .l {
		fill: #1d1d1d;
		stroke: #4a4a4a;
	}
	.iso--ghost .r {
		fill: #161616;
		stroke: #4a4a4a;
	}
</style>
