import Lenis from 'lenis';
import { motion } from '#lib/stores/motion.svelte.ts';
import { gsap, ScrollTrigger } from './gsap.ts';

/**
 * Create Lenis and drive it from GSAP's ticker so ScrollTrigger and Lenis share one clock.
 * Returns a cleanup function. Not called at all under prefers-reduced-motion.
 */
export function startLenis(): () => void {
	const lenis = new Lenis({
		autoRaf: false,
		lerp: 0.1,
		wheelMultiplier: 1,
		touchMultiplier: 1.4
	});

	lenis.on('scroll', ScrollTrigger.update);
	const tick = (time: number) => lenis.raf(time * 1000);
	gsap.ticker.add(tick);
	// Keep GSAP's lag smoothing: if a long task blocks the main thread (e.g. WebGL context creation on a slow
	// device), timelines pause and resume instead of jumping to the end. Lenis only sees a smaller delta.
	gsap.ticker.lagSmoothing(500, 33);

	motion.lenis = lenis;
	ScrollTrigger.refresh();

	return () => {
		gsap.ticker.remove(tick);
		lenis.destroy();
		if (motion.lenis === lenis) motion.lenis = null;
	};
}

/** Scroll to an in-page target, smoothly when allowed, then move focus there for keyboard users. */
export function scrollToTarget(target: HTMLElement | number, opts: { immediate?: boolean } = {}) {
	const lenis = motion.lenis;
	const focus = () => {
		if (typeof target === 'number') return;
		if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
		target.focus({ preventScroll: true });
	};

	if (lenis && !opts.immediate) {
		lenis.scrollTo(target, {
			duration: 1.6,
			easing: (t) => 1 - Math.pow(1 - t, 4),
			onComplete: focus
		});
		return;
	}

	if (typeof target === 'number') {
		window.scrollTo({ top: target, behavior: 'auto' });
	} else {
		target.scrollIntoView({ behavior: 'auto', block: 'start' });
	}
	focus();
}

/**
 * Delegated click handler: same-page hash links (`#id` or `/#id` while on `/`) scroll with Lenis
 * instead of jumping. Cross-page links are left to SvelteKit.
 */
export function handleHashLinkClick(event: MouseEvent) {
	if (event.defaultPrevented || event.button !== 0) return;
	if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

	const link = (event.target as Element | null)?.closest?.('a[href*="#"]');
	if (!(link instanceof HTMLAnchorElement)) return;

	const url = new URL(link.href, location.href);
	if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;

	const id = decodeURIComponent(url.hash.slice(1));
	const el = id ? document.getElementById(id) : null;
	if (!el && id !== 'top') return;

	event.preventDefault();
	history.pushState(history.state, '', url.hash);
	scrollToTarget(el ?? 0);
}
