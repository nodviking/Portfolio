import type { Action } from 'svelte/action';
import { gsap, SplitText } from '#lib/animations/gsap.ts';
import { motion } from '#lib/stores/motion.svelte.ts';

/**
 * `use:wordScrub`: words go from muted grey to white, scrubbed to scroll position.
 * Under reduced motion the paragraph is simply white.
 */
export const wordScrub: Action<HTMLElement> = (node) => {
	if (motion.reduced) return {};
	let tween: gsap.core.Tween | undefined;
	const split = SplitText.create(node, {
		type: 'words',
		aria: 'none',
		autoSplit: true,
		onSplit(self) {
			tween?.scrollTrigger?.kill();
			tween = gsap.fromTo(
				self.words,
				{ color: 'var(--color-mute)' },
				{
					color: 'var(--color-paper)',
					ease: 'none',
					stagger: 0.1,
					scrollTrigger: { trigger: node, start: 'top 82%', end: 'bottom 45%', scrub: 0.6 }
				}
			);
			return tween;
		}
	});
	return {
		destroy() {
			tween?.scrollTrigger?.kill();
			tween?.kill();
			split.revert();
		}
	};
};
