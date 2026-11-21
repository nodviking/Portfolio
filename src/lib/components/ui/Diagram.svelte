<script lang="ts">
	import type { DiagramKind } from '#lib/data/storeenv.ts';

	/**
	 * Small line-drawn feature diagrams for the StoreEnv panels. Every stroked shape has pathLength=1 and the
	 * `d` class, so a single tween on stroke-dashoffset (1 → 0) draws the whole diagram.
	 */
	let { kind }: { kind: DiagramKind } = $props();
</script>

<svg viewBox="0 0 240 140" class="diagram" aria-hidden="true">
	{#if kind === 'pushpull'}
		<rect class="d" pathLength="1" x="14" y="46" width="62" height="42" />
		<rect class="d" pathLength="1" x="164" y="46" width="62" height="42" />
		<rect class="d a" pathLength="1" x="102" y="18" width="36" height="28" />
		<path class="d a" pathLength="1" d="M76 58 C92 58 96 40 102 34 M96 30l6 4-5 5" />
		<path class="d a" pathLength="1" d="M138 34 C146 40 150 58 164 70 M157 70h7v-7" />
		<text x="45" y="108" class="t">a/.env</text>
		<text x="195" y="108" class="t">b/.env</text>
		<text x="120" y="62" class="t">enc</text>
	{:else if kind === 'versions'}
		<path class="d" pathLength="1" d="M16 86H224" />
		{#each [40, 80, 120, 160, 200] as x (x)}
			<rect class="d" pathLength="1" x={x - 6} y="80" width="12" height="12" />
		{/each}
		<path class="d a" pathLength="1" d="M200 78 C186 30 136 30 122 74 M116 68l6 7 7-6" />
		<text x="200" y="114" class="t">v14</text>
		<text x="120" y="114" class="t">v12</text>
		<text x="160" y="28" class="t">rollback</text>
	{:else if kind === 'sharing'}
		<circle class="d a" pathLength="1" cx="44" cy="70" r="16" />
		<path class="d a" pathLength="1" d="M60 70H92 M84 70v10 M76 70v8" />
		<path class="d" pathLength="1" d="M92 70 C120 70 130 30 160 30 M92 70H160 M92 70 C120 70 130 110 160 110" />
		<rect class="d" pathLength="1" x="160" y="20" width="52" height="20" />
		<rect class="d" pathLength="1" x="160" y="60" width="52" height="20" />
		<rect class="d dash" pathLength="1" x="160" y="100" width="52" height="20" />
		<text x="186" y="134" class="t">expires</text>
	{:else if kind === 'run'}
		<rect class="d" pathLength="1" x="110" y="34" width="112" height="56" />
		<text x="166" y="66" class="t">npm start</text>
		<circle class="d a" pathLength="1" cx="36" cy="62" r="12" />
		<path class="d a" pathLength="1" d="M48 62H110 M102 56l8 6-8 6" />
		<rect class="d" pathLength="1" x="24" y="96" width="34" height="30" />
		<path class="d a" pathLength="1" d="M18 92 L64 130" />
		<text x="94" y="120" class="t">no file</text>
	{:else if kind === 'crypto'}
		<rect class="d" pathLength="1" x="24" y="58" width="56" height="48" />
		<path class="d a" pathLength="1" d="M36 58V44a16 16 0 0 1 32 0v14" />
		<path class="d" pathLength="1" d="M52 76v12" />
		<text x="104" y="52" class="t l">9f2c 8a41 e07b</text>
		<text x="104" y="74" class="t l">d3c6 f5a1 7e04</text>
		<text x="104" y="96" class="t l">c9b2 d8f1 ····</text>
		<path class="d a" pathLength="1" d="M100 112H220" />
	{:else if kind === 'platforms'}
		<rect class="d" pathLength="1" x="16" y="34" width="56" height="44" />
		<rect class="d" pathLength="1" x="92" y="34" width="56" height="44" />
		<rect class="d" pathLength="1" x="168" y="34" width="56" height="44" />
		<path class="d a" pathLength="1" d="M44 78v20H196V78 M120 78v20" />
		<text x="44" y="60" class="t">mac</text>
		<text x="120" y="60" class="t">linux</text>
		<text x="196" y="60" class="t">win</text>
		<text x="120" y="122" class="t">{'{ } vscode · web'}</text>
	{/if}
</svg>

<style>
	.diagram {
		display: block;
		width: 100%;
		height: auto;
	}
	.d {
		fill: none;
		stroke: var(--color-paper);
		stroke-width: 1.4;
		stroke-linejoin: round;
		stroke-linecap: square;
		stroke-dasharray: 1;
		stroke-dashoffset: 0;
	}
	.d.a {
		stroke: var(--color-accent);
	}
	.d.dash {
		stroke-dasharray: 0.04 0.03;
	}
	.t {
		font-family: var(--font-mono);
		font-size: 9px;
		fill: var(--color-mute);
		text-anchor: middle;
		letter-spacing: 0.04em;
	}
	.t.l {
		text-anchor: start;
		font-size: 11px;
		fill: var(--color-paper);
	}
</style>
