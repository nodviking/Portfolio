<script lang="ts">
	import { gsap } from '#lib/animations/gsap.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';

	/**
	 * Dot + lagging ring, mix-blend-mode: difference.
	 * - grows over links/buttons
	 * - shows a label over any element with data-cursor="View" (or any text)
	 * Only mounted on fine pointers; follows instantly (no lag) under reduced motion.
	 */
	let dot: HTMLDivElement | undefined = $state();
	let ring: HTMLDivElement | undefined = $state();
	let label = $state('');
	let hovering = $state(false);
	let visible = $state(false);
	let pressed = $state(false);

	$effect(() => {
		if (!motion.finePointer || !dot || !ring) return;
		const root = document.documentElement;
		root.classList.add('has-cursor');

		const lag = motion.reduced ? 0.001 : 0.55;
		const dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' });
		const dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' });
		const rx = gsap.quickTo(ring, 'x', { duration: lag, ease: 'power3.out' });
		const ry = gsap.quickTo(ring, 'y', { duration: lag, ease: 'power3.out' });

		const onMove = (e: PointerEvent) => {
			if (e.pointerType !== 'mouse') return;
			visible = true;
			dx(e.clientX);
			dy(e.clientY);
			rx(e.clientX);
			ry(e.clientY);
		};

		const onOver = (e: PointerEvent) => {
			const t = e.target as Element | null;
			const labelled = t?.closest?.<HTMLElement>('[data-cursor]');
			const interactive = t?.closest?.('a, button, [role="button"], label, summary');
			label = labelled?.dataset.cursor ?? '';
			hovering = Boolean(labelled || interactive);
		};

		const onLeaveDoc = () => (visible = false);
		const onDown = () => (pressed = true);
		const onUp = () => (pressed = false);

		window.addEventListener('pointermove', onMove, { passive: true });
		document.addEventListener('pointerover', onOver, { passive: true });
		document.documentElement.addEventListener('pointerleave', onLeaveDoc);
		window.addEventListener('pointerdown', onDown);
		window.addEventListener('pointerup', onUp);

		return () => {
			root.classList.remove('has-cursor');
			window.removeEventListener('pointermove', onMove);
			document.removeEventListener('pointerover', onOver);
			document.documentElement.removeEventListener('pointerleave', onLeaveDoc);
			window.removeEventListener('pointerdown', onDown);
			window.removeEventListener('pointerup', onUp);
			gsap.killTweensOf([dot, ring]);
		};
	});
</script>

{#if motion.finePointer}
	<div
		class="pointer-events-none fixed inset-0 z-[100] mix-blend-difference transition-opacity duration-300"
		class:opacity-0={!visible}
		aria-hidden="true"
	>
		<div bind:this={dot} class="cursor-anchor">
			<div class="dot" class:shrink={hovering}></div>
		</div>
		<div bind:this={ring} class="cursor-anchor">
			<div class="ring" class:hover={hovering && !label} class:label={!!label} class:pressed>
				<span>{label}</span>
			</div>
		</div>
	</div>
{/if}

<style>
	.cursor-anchor {
		position: absolute;
		top: 0;
		left: 0;
		will-change: transform;
	}
	.dot,
	.ring {
		position: absolute;
		top: 0;
		left: 0;
		border-radius: 999px;
		translate: -50% -50%;
		transition:
			width 0.6s var(--ease-expo),
			height 0.6s var(--ease-expo),
			background-color 0.6s var(--ease-expo),
			opacity 0.4s var(--ease-expo),
			scale 0.4s var(--ease-expo);
	}
	.dot {
		width: 6px;
		height: 6px;
		background: #fff;
	}
	.dot.shrink {
		opacity: 0;
	}
	.ring {
		width: 34px;
		height: 34px;
		border: 1px solid #fff;
		display: grid;
		place-items: center;
	}
	.ring.hover {
		width: 64px;
		height: 64px;
		background: #fff;
	}
	.ring.label {
		width: 92px;
		height: 92px;
		background: #fff;
	}
	.ring.pressed {
		scale: 0.85;
	}
	.ring span {
		color: #000;
		font-size: 11px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		opacity: 0;
		transition: opacity 0.3s;
	}
	.ring.label span {
		opacity: 1;
	}
</style>
