import type { Action } from 'svelte/action';
import { EASE, gsap, ScrollTrigger, SplitText } from '#lib/animations/gsap.ts';
import { motion } from '#lib/stores/motion.svelte.ts';

/**
 * `use:lines`: split into lines, each sliding up out of its own clip mask when the block enters (staggered).
 * Re-splits on resize/font load (autoSplit). Reverted on destroy. No-op under reduced motion.
 */
export const lines: Action<HTMLElement, { delay?: number } | undefined> = (node, opts) => {
	if (motion.reduced) return {};
	let st: ScrollTrigger | undefined;
	let played = false;

	const split = SplitText.create(node, {
		type: 'lines',
		mask: 'lines',
		autoSplit: true,
		onSplit(self) {
			st?.kill();
			if (played) return;
			const tween = gsap.from(self.lines, {
				yPercent: 105,
				duration: 0.9,
				ease: EASE.out,
				stagger: 0.08,
				delay: opts?.delay ?? 0,
				paused: true,
				onComplete: () => (played = true)
			});
			st = ScrollTrigger.create({
				trigger: node,
				start: 'top 90%',
				once: true,
				onEnter: () => tween.play()
			});
			return tween;
		}
	});

	return {
		destroy() {
			st?.kill();
			split.revert();
		}
	};
};
