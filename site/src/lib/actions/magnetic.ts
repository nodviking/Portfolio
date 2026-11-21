import type { Action } from 'svelte/action';
import { gsap } from '#lib/animations/gsap.ts';
import { motion } from '#lib/stores/motion.svelte.ts';

export interface MagneticOptions {
	/** Fraction of the pointer offset the element follows (0–1). */
	strength?: number;
	/** Optional inner element that moves a bit further, for a layered feel. */
	inner?: string;
}

/**
 * `use:magnetic` – element eases toward the pointer while hovered, settles back on leave.
 * No-op on touch devices and under reduced motion. Cleans up its tweens on destroy.
 */
export const magnetic: Action<HTMLElement, MagneticOptions | undefined> = (node, options) => {
	let strength = options?.strength ?? 0.35;
	let innerSel = options?.inner;

	if (!motion.finePointer || motion.reduced) return {};

	const xTo = gsap.quickTo(node, 'x', { duration: 0.7, ease: 'power3.out' });
	const yTo = gsap.quickTo(node, 'y', { duration: 0.7, ease: 'power3.out' });
	let inner = innerSel ? node.querySelector<HTMLElement>(innerSel) : null;
	let ixTo = inner ? gsap.quickTo(inner, 'x', { duration: 0.7, ease: 'power3.out' }) : null;
	let iyTo = inner ? gsap.quickTo(inner, 'y', { duration: 0.7, ease: 'power3.out' }) : null;

	const onMove = (e: PointerEvent) => {
		const r = node.getBoundingClientRect();
		const dx = e.clientX - (r.left + r.width / 2);
		const dy = e.clientY - (r.top + r.height / 2);
		xTo(dx * strength);
		yTo(dy * strength);
		ixTo?.(dx * strength * 0.5);
		iyTo?.(dy * strength * 0.5);
	};

	const onLeave = () => {
		gsap.to(node, { x: 0, y: 0, duration: 1.1, ease: 'expo.out', overwrite: true });
		if (inner) gsap.to(inner, { x: 0, y: 0, duration: 1.1, ease: 'expo.out', overwrite: true });
	};

	node.addEventListener('pointermove', onMove);
	node.addEventListener('pointerleave', onLeave);

	return {
		update(next) {
			strength = next?.strength ?? 0.35;
			if (next?.inner !== innerSel) {
				innerSel = next?.inner;
				inner = innerSel ? node.querySelector<HTMLElement>(innerSel) : null;
				ixTo = inner ? gsap.quickTo(inner, 'x', { duration: 0.7, ease: 'power3.out' }) : null;
				iyTo = inner ? gsap.quickTo(inner, 'y', { duration: 0.7, ease: 'power3.out' }) : null;
			}
		},
		destroy() {
			node.removeEventListener('pointermove', onMove);
			node.removeEventListener('pointerleave', onLeave);
			gsap.killTweensOf(node);
			gsap.set(node, { clearProps: 'transform' });
			if (inner) {
				gsap.killTweensOf(inner);
				gsap.set(inner, { clearProps: 'transform' });
			}
		}
	};
};
