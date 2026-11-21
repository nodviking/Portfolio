<script lang="ts">
	/**
	 * Hero illustration: an isometric field of ghost slabs with one solid blue cube (the "built" thing)
	 * and one dashed cube (the next idea). Pure SVG, crisp at any size.
	 */
	const a = 42; // half-width of a tile's top face
	const b = 24; // half-height of a tile's top face
	const W = 560;
	const top0 = 92;

	type Kind = 'slab' | 'ghost' | 'solid' | 'dashed';
	interface Cell {
		i: number;
		j: number;
		kind: Kind;
	}

	const N = 5;
	const special: Record<string, Kind> = { '2,2': 'solid', '1,3': 'ghost', '3,0': 'dashed' };
	const skip = new Set(['0,0', '4,4', '0,4']);

	const cells: Cell[] = [];
	for (let s = 0; s <= 2 * (N - 1); s++) {
		for (let i = 0; i < N; i++) {
			const j = s - i;
			if (j < 0 || j >= N) continue;
			const key = `${i},${j}`;
			if (skip.has(key)) continue;
			cells.push({ i, j, kind: special[key] ?? 'slab' });
		}
	}

	const height: Record<Kind, number> = { slab: 10, ghost: 46, solid: 58, dashed: 58 };

	function faces(c: Cell) {
		const cx = W / 2 + (c.i - c.j) * a;
		const cy = top0 + (c.i + c.j) * b;
		const h = height[c.kind];
		const p = (pts: [number, number][]) => pts.map(([x, y]) => `${x},${y}`).join(' ');
		return {
			top: p([
				[cx, cy - b - h],
				[cx + a, cy - h],
				[cx, cy + b - h],
				[cx - a, cy - h]
			]),
			left: p([
				[cx - a, cy - h],
				[cx, cy + b - h],
				[cx, cy + b],
				[cx - a, cy]
			]),
			right: p([
				[cx, cy + b - h],
				[cx + a, cy - h],
				[cx + a, cy],
				[cx, cy + b]
			])
		};
	}
</script>

<svg viewBox="0 0 {W} 400" class="block h-full w-full" aria-hidden="true">
	{#each cells as c (`${c.i},${c.j}`)}
		{@const f = faces(c)}
		<g class="cell cell--{c.kind}" data-art={c.kind}>
			{#if c.kind === 'dashed'}
				<polygon points={f.top} />
				<polygon points={f.left} />
				<polygon points={f.right} />
			{:else}
				<polygon class="t" points={f.top} />
				<polygon class="l" points={f.left} />
				<polygon class="r" points={f.right} />
			{/if}
		</g>
	{/each}
</svg>

<style>
	polygon {
		stroke-linejoin: round;
		stroke-width: 1;
	}
	.cell--slab .t {
		fill: #1a1a1a;
		stroke: #333;
	}
	.cell--slab .l {
		fill: #141414;
		stroke: #333;
	}
	.cell--slab .r {
		fill: #111;
		stroke: #333;
	}
	.cell--ghost .t {
		fill: #2a2a2a;
		stroke: #484848;
	}
	.cell--ghost .l {
		fill: #1d1d1d;
		stroke: #484848;
	}
	.cell--ghost .r {
		fill: #161616;
		stroke: #484848;
	}
	.cell--solid .t {
		fill: var(--color-accent);
		stroke: var(--color-ink);
	}
	.cell--solid .l {
		fill: var(--color-accent-deep);
		stroke: var(--color-ink);
	}
	.cell--solid .r {
		fill: #1840b3;
		stroke: var(--color-ink);
	}
	.cell--dashed polygon {
		fill: none;
		stroke: var(--color-accent-soft);
		stroke-width: 1.4;
		stroke-dasharray: 5 4;
	}
</style>
