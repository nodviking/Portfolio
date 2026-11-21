import type { Action } from 'svelte/action';
import { EASE, gsap, ScrollTrigger } from '#lib/animations/gsap.ts';
import { motion } from '#lib/stores/motion.svelte.ts';

export interface RevealOptions {
	/** Delay in seconds once the element enters. */
	delay?: number;
	/** Direction the clip opens from. */
	from?: 'bottom' | 'left' | 'top';
	/** Vertical travel in px. */
	y?: number;
	/** Set false to only translate (e.g. framed cards whose corner nodes would be clipped). */
	clip?: boolean;
}

const clipFrom = {
	bottom: 'inset(0% 0% 100% 0%)',
	top: 'inset(100% 0% 0% 0%)',
	left: 'inset(0% 100% 0% 0%)'
} as const;

/**
 * `use:reveal`: crisp clip-path + translate reveal when the element scrolls into view (once).
 * No blur, no opacity fog. No-op under reduced motion. Kills its tween and trigger on destroy.
 */
export const reveal: Action<HTMLElement, RevealOptions | undefined> = (node, opts) => {
	if (motion.reduced) return {};
	const from = opts?.from ?? 'bottom';
	const clip = opts?.clip ?? true;
	gsap.set(node, clip ? { clipPath: clipFrom[from], y: opts?.y ?? 28 } : { y: opts?.y ?? 28 });

	const tween = gsap.to(node, {
		...(clip ? { clipPath: 'inset(0% 0% 0% 0%)' } : {}),
		y: 0,
		duration: 1.1,
		ease: EASE.out,
		delay: opts?.delay ?? 0,
		paused: true,
		onComplete: () => gsap.set(node, { clearProps: 'clipPath,transform' })
	});
	const st = ScrollTrigger.create({
		trigger: node,
		start: 'top 88%',
		once: true,
		onEnter: () => tween.play()
	});

	return {
		destroy() {
			st.kill();
			tween.kill();
			gsap.set(node, { clearProps: 'clipPath,transform' });
		}
	};
};
