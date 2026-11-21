import { gsap } from './gsap.ts';

/**
 * Full-screen grid of squares used for the preloader exit, the menu and page transitions.
 * Squares animate in a diagonal stagger (row + column), so the wipe sweeps from the top-left corner.
 * The grid itself is rendered once by <PixelWipe /> in the root layout.
 */
let root: HTMLElement | null = null;
let cols = 1;

export function registerWipe(el: HTMLElement | null, columns: number) {
	root = el;
	cols = Math.max(1, columns);
}

const diagonal = (step: number) => (i: number) => (Math.floor(i / cols) + (i % cols)) * step;

function cells() {
	return root ? Array.from(root.children) : [];
}

/** Squares grow in until the screen is covered. */
export function cover(color = 'var(--color-accent)', duration = 0.3): Promise<void> {
	if (!root) return Promise.resolve();
	const el = root;
	el.style.setProperty('--pw-c', color);
	gsap.killTweensOf(cells());
	gsap.set(el, { visibility: 'visible' });
	return new Promise((resolve) => {
		gsap.fromTo(
			cells(),
			{ scale: 0, scaleY: 0 },
			{
				scale: 1.04,
				scaleY: 1.04,
				duration,
				ease: 'power3.out',
				stagger: diagonal(0.016),
				onComplete: () => resolve()
			}
		);
	});
}

/** Instantly cover the screen (used to swap the preloader out invisibly). */
export function coverNow(color = 'var(--color-ink)') {
	if (!root) return;
	root.style.setProperty('--pw-c', color);
	gsap.killTweensOf(cells());
	gsap.set(root, { visibility: 'visible' });
	gsap.set(cells(), { scale: 1.04, scaleY: 1.04 });
}

/** Squares flip out (edge-on) in the same diagonal order, revealing the page. */
export function reveal(duration = 0.32): Promise<void> {
	if (!root) return Promise.resolve();
	const el = root;
	return new Promise((resolve) => {
		gsap.to(cells(), {
			scaleY: 0,
			duration,
			ease: 'power3.in',
			stagger: diagonal(0.016),
			onComplete: () => {
				gsap.set(el, { visibility: 'hidden' });
				resolve();
			}
		});
	});
}
