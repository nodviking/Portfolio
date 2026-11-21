import type { Action } from 'svelte/action';
import { EASE, gsap, ScrollTrigger } from '#lib/animations/gsap.ts';
import { motion } from '#lib/stores/motion.svelte.ts';

/**
 * `use:frameDraw` on a `.frame`: when it scrolls into view the corner nodes pop in, then the four 1px edges
 * extend out of them (clockwise). Afterwards the temporary lines are removed and the static CSS frame takes over,
 * so the end state is identical. No-op under reduced motion.
 */
export const frameDraw: Action<HTMLElement, { delay?: number; start?: string } | undefined> = (
	node,
	opts
) => {
	if (motion.reduced) return {};

	const added: HTMLElement[] = [];
	const mk = (cls: string) => {
		const s = document.createElement('span');
		s.className = `fd ${cls}`;
		s.setAttribute('aria-hidden', 'true');
		node.appendChild(s);
		added.push(s);
		return s;
	};
	node.classList.add('is-drawing');
	const top = mk('fd-t');
	const right = mk('fd-r');
	const bottom = mk('fd-b');
	const left = mk('fd-l');
	const nodes = ['fd-tl', 'fd-tr', 'fd-br', 'fd-bl'].map((c) => mk(`fd-n ${c}`));

	gsap.set([top, bottom], { scaleX: 0 });
	gsap.set([left, right], { scaleY: 0 });
	gsap.set(nodes, { scale: 0 });

	const finish = () => {
		added.forEach((s) => s.remove());
		added.length = 0;
		node.classList.remove('is-drawing');
	};

	const tl = gsap
		.timeline({ paused: true, delay: opts?.delay ?? 0, onComplete: finish })
		.to(nodes, { scale: 1, duration: 0.3, ease: 'power4.out', stagger: 0.06 })
		.to([top, bottom], { scaleX: 1, duration: 0.85, ease: EASE.out }, 0.12)
		.to([right, left], { scaleY: 1, duration: 0.85, ease: EASE.out }, 0.12);

	const st = ScrollTrigger.create({
		trigger: node,
		start: opts?.start ?? 'top 88%',
		once: true,
		onEnter: () => tl.play()
	});

	return {
		destroy() {
			st.kill();
			tl.kill();
			finish();
		}
	};
};
