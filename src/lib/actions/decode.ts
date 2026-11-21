import type { Action } from 'svelte/action';
import { gsap, ScrollTrigger } from '#lib/animations/gsap.ts';
import { cipherOf, scrambleTo } from '#lib/animations/scramble.ts';
import { motion } from '#lib/stores/motion.svelte.ts';

/**
 * `use:decode` on a text-only element (e.g. a heading): when it enters, it starts as same-length ciphertext
 * and decodes left to right. Mono type, so nothing reflows. No-op under reduced motion.
 */
export const decode: Action<HTMLElement, { delay?: number; duration?: number } | undefined> = (
	node,
	opts
) => {
	if (motion.reduced || node.children.length > 0) return {};
	const text = node.textContent ?? '';
	node.dataset.text = text;
	// clip-path (not visibility) keeps the heading in the accessibility tree before it decodes.
	gsap.set(node, { clipPath: 'inset(0% 100% 0% 0%)' });

	let tween: gsap.core.Tween | null = null;
	const st = ScrollTrigger.create({
		trigger: node,
		start: 'top 90%',
		once: true,
		onEnter: () => {
			// Ciphertext can wrap differently from the real words, so hold the box size until decoding ends.
			const h = node.getBoundingClientRect().height;
			gsap.set(node, { height: h, clipPath: 'none' });
			node.textContent = cipherOf(text);
			tween = scrambleTo(node, text, opts?.duration ?? 0.9, opts?.delay ?? 0);
			tween.eventCallback('onComplete', () => gsap.set(node, { clearProps: 'height' }));
		}
	});

	return {
		destroy() {
			st.kill();
			tween?.kill();
			node.textContent = text;
			gsap.set(node, { clearProps: 'clipPath,height' });
		}
	};
};
