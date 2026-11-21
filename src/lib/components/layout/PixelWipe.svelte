<script lang="ts">
	import { registerWipe } from '#lib/animations/pixelwipe.ts';

	/** The square grid used by every wipe (preloader exit, menu, page transitions). Hidden when idle. */
	let root: HTMLDivElement;
	let cols = $state(12);
	let rows = $state(8);

	$effect(() => {
		const size = () => {
			const cell = window.innerWidth < 768 ? 64 : 90;
			cols = Math.ceil(window.innerWidth / cell);
			rows = Math.ceil(window.innerHeight / cell);
		};
		size();
		window.addEventListener('resize', size);
		return () => window.removeEventListener('resize', size);
	});

	$effect(() => {
		registerWipe(root, cols);
		return () => registerWipe(null, 1);
	});
</script>

<div
	bind:this={root}
	class="pw"
	style:--cols={cols}
	style:--rows={rows}
	aria-hidden="true"
>
	{#each Array.from({ length: cols * rows }, (_, i) => i) as i (i)}<span></span>{/each}
</div>

<style>
	.pw {
		--pw-c: var(--color-accent);
		position: fixed;
		inset: 0;
		z-index: 150;
		display: grid;
		grid-template-columns: repeat(var(--cols), 1fr);
		grid-template-rows: repeat(var(--rows), 1fr);
		pointer-events: none;
		visibility: hidden;
	}
	.pw span {
		background: var(--pw-c);
		transform: scale(0);
	}
</style>
