<script lang="ts">
	import { untrack } from 'svelte';
	import { createField, textSource, type Field } from './field.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';

	/**
	 * Canvas that draws `lines` of text as ASCII art. Reveal is controlled by the parent (`reveal` 0..1), so it can be
	 * timed (intro) or scrubbed (scroll). Rebuilds on resize. Static under reduced motion.
	 */
	let {
		lines,
		reveal = 1,
		cell = 9,
		dust = 0,
		pointer = false,
		padX,
		padY,
		fps,
		defer = false,
		class: className = '',
		label
	}: {
		lines: string[];
		reveal?: number;
		cell?: number;
		dust?: number;
		pointer?: boolean;
		padX?: number;
		padY?: number;
		fps?: number;
		/** Wait for the intro to finish and the browser to be idle before starting (ambient fields). */
		defer?: boolean;
		class?: string;
		label?: string;
	} = $props();

	let canvas: HTMLCanvasElement;
	let field: Field | null = null;

	// Deferred fields start once; `defer` is read once at mount on purpose.
	let ready = $state(untrack(() => !defer));
	$effect(() => {
		if (ready || !motion.introDone) return;
		const go = () => (ready = true);
		if ('requestIdleCallback' in window) {
			const id = window.requestIdleCallback(go, { timeout: 2500 });
			return () => window.cancelIdleCallback(id);
		}
		const t = setTimeout(go, 1200);
		return () => clearTimeout(t);
	});

	$effect(() => {
		if (!ready) return;
		const color = getComputedStyle(document.documentElement).getPropertyValue('--color-accent-ink').trim() || '#d45a6c';
		const f = createField({ canvas, cell, color, dust, pointer, fps, still: motion.reduced });
		field = f;
		let alive = true;
		const src = untrack(() => textSource(lines, { padX, padY }));
		f.setSource(src);
		// Re-rasterise once the mono font is ready (captured source: props may be gone by then).
		document.fonts?.ready.then(() => {
			if (alive) f.setSource({ ...src, key: src.key + '|font' });
		});
		let t: ReturnType<typeof setTimeout> | undefined;
		const ro = new ResizeObserver(() => {
			clearTimeout(t);
			t = setTimeout(() => f.resize(), 120);
		});
		ro.observe(canvas);
		return () => {
			alive = false;
			clearTimeout(t);
			ro.disconnect();
			f.destroy();
			field = null;
		};
	});

	$effect(() => {
		field?.setSource(textSource(lines, { padX, padY }));
	});

	$effect(() => {
		field?.setReveal(reveal);
	});
</script>

<canvas
	bind:this={canvas}
	class="block h-full w-full {className}"
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
></canvas>
