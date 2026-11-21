<script lang="ts">
	import { gsap } from '#lib/animations/gsap.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';

	/**
	 * Technical cursor (desktop only): a small square with crosshair ticks and a live `x:0000 y:0000` readout.
	 * Over links/buttons it snaps to a square-bracket frame `[ ]` around the element. Flat colours, no blend modes.
	 */
	let pointer: HTMLDivElement | undefined = $state();
	let brackets: HTMLDivElement | undefined = $state();
	let readout: HTMLSpanElement | undefined = $state();
	let visible = $state(false);
	let locked = $state(false);

	$effect(() => {
		if (!motion.finePointer || motion.reduced || !pointer || !brackets || !readout) return;
		const root = document.documentElement;
		root.classList.add('has-cursor');
		const p = pointer;
		const b = brackets;
		const r = readout;

		let mx = -100;
		let my = -100;
		let target: Element | null = null;
		// Bracket box, eased toward its goal each frame.
		const box = { x: -100, y: -100, w: 20, h: 20 };
		const pad = (n: string) => n.padStart(4, '0');

		const onMove = (e: PointerEvent) => {
			if (e.pointerType !== 'mouse') return;
			mx = e.clientX;
			my = e.clientY;
			visible = true;
			p.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
			r.textContent = `x:${pad(String(Math.round(mx)))} y:${pad(String(Math.round(my)))}`;
		};

		const onOver = (e: PointerEvent) => {
			const t = (e.target as Element | null)?.closest?.('a, button, [role="button"], summary, [data-cursor]');
			target = t ?? null;
			locked = !!t;
		};

		const tick = () => {
			let gx: number;
			let gy: number;
			let gw: number;
			let gh: number;
			if (target && target.isConnected) {
				const rc = target.getBoundingClientRect();
				gx = rc.left - 6;
				gy = rc.top - 6;
				gw = rc.width + 12;
				gh = rc.height + 12;
			} else {
				gx = mx - 10;
				gy = my - 10;
				gw = 20;
				gh = 20;
			}
			const k = 0.3;
			box.x += (gx - box.x) * k;
			box.y += (gy - box.y) * k;
			box.w += (gw - box.w) * k;
			box.h += (gh - box.h) * k;
			b.style.transform = `translate3d(${box.x}px, ${box.y}px, 0)`;
			b.style.width = `${box.w}px`;
			b.style.height = `${box.h}px`;
		};

		const onLeaveDoc = () => (visible = false);

		window.addEventListener('pointermove', onMove, { passive: true });
		document.addEventListener('pointerover', onOver, { passive: true });
		root.addEventListener('pointerleave', onLeaveDoc);
		gsap.ticker.add(tick);

		return () => {
			root.classList.remove('has-cursor');
			window.removeEventListener('pointermove', onMove);
			document.removeEventListener('pointerover', onOver);
			root.removeEventListener('pointerleave', onLeaveDoc);
			gsap.ticker.remove(tick);
		};
	});
</script>

{#if motion.finePointer && !motion.reduced}
	<div class="cursor" class:is-hidden={!visible} class:is-locked={locked} aria-hidden="true">
		<div bind:this={brackets} class="brackets">
			<span class="c tl"></span><span class="c tr"></span><span class="c bl"></span><span class="c br"></span>
		</div>
		<div bind:this={pointer} class="pointer">
			<span class="sq"></span>
			<span class="tick t"></span><span class="tick b"></span><span class="tick l"></span><span
				class="tick r"
			></span>
			<span bind:this={readout} class="readout">x:0000 y:0000</span>
		</div>
	</div>
{/if}

<style>
	.cursor {
		position: fixed;
		inset: 0;
		z-index: 200;
		pointer-events: none;
		transition: opacity 0.25s;
	}
	.cursor.is-hidden {
		opacity: 0;
	}
	.pointer {
		position: absolute;
		top: 0;
		left: 0;
		will-change: transform;
	}
	.sq {
		position: absolute;
		width: 6px;
		height: 6px;
		left: -3px;
		top: -3px;
		background: var(--color-accent-ink);
		transition: transform 0.3s var(--ease-expo);
	}
	.tick {
		position: absolute;
		background: var(--color-paper);
		opacity: 0.55;
		transition: opacity 0.3s;
	}
	.tick.t,
	.tick.b {
		width: 1px;
		height: 8px;
		left: -0.5px;
	}
	.tick.t {
		top: -15px;
	}
	.tick.b {
		top: 7px;
	}
	.tick.l,
	.tick.r {
		height: 1px;
		width: 8px;
		top: -0.5px;
	}
	.tick.l {
		left: -15px;
	}
	.tick.r {
		left: 7px;
	}
	.readout {
		position: absolute;
		left: 16px;
		top: 12px;
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.04em;
		color: var(--color-mute);
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}
	.is-locked .tick,
	.is-locked .readout {
		opacity: 0;
	}
	.is-locked .sq {
		transform: scale(0.5);
	}

	.brackets {
		position: absolute;
		top: 0;
		left: 0;
		opacity: 0;
		transition: opacity 0.25s;
		will-change: transform, width, height;
	}
	.is-locked .brackets {
		opacity: 1;
	}
	.c {
		position: absolute;
		width: 8px;
		height: 8px;
		border-color: var(--color-accent-ink);
		border-style: solid;
		border-width: 0;
	}
	.tl {
		top: 0;
		left: 0;
		border-top-width: 1.5px;
		border-left-width: 1.5px;
	}
	.tr {
		top: 0;
		right: 0;
		border-top-width: 1.5px;
		border-right-width: 1.5px;
	}
	.bl {
		bottom: 0;
		left: 0;
		border-bottom-width: 1.5px;
		border-left-width: 1.5px;
	}
	.br {
		bottom: 0;
		right: 0;
		border-bottom-width: 1.5px;
		border-right-width: 1.5px;
	}
</style>
