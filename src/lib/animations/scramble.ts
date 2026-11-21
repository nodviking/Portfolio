import { gsap } from './gsap.ts';
import { motion } from '#lib/stores/motion.svelte.ts';

export const CIPHER = '0123456789ABCDEF{}<>=/#*';

/** Same-length ciphertext, keeping spaces so line breaks don't move. */
export function cipherOf(text: string) {
	return text.replace(/\S/g, () => CIPHER[(Math.random() * CIPHER.length) | 0]);
}

/** Scramble an element's text into `text` (defaults to its stored/original text). Mono font = no width change. */
export function scrambleTo(el: Element, text?: string, duration = 0.55, delay = 0) {
	const target = text ?? (el as HTMLElement).dataset.text ?? el.textContent ?? '';
	return gsap.to(el, {
		duration,
		delay,
		overwrite: true,
		ease: 'none',
		scrambleText: { text: target, chars: CIPHER, revealDelay: 0.1, speed: 1, tweenLength: false }
	});
}

/** Leaf elements with real text inside a link/button (skips icons, svg and [data-no-scramble]). */
function leaves(host: Element): HTMLElement[] {
	const out: HTMLElement[] = [];
	const walk = (el: Element) => {
		if (el instanceof SVGElement || el.hasAttribute('data-no-scramble')) return;
		if (el.children.length === 0) {
			const t = el.textContent?.trim() ?? '';
			if (t.length > 1 && el instanceof HTMLElement) out.push(el);
			return;
		}
		for (const c of Array.from(el.children)) walk(c);
	};
	walk(host);
	return out;
}

/**
 * Global: every link and button scrambles its text on hover (fine pointers, motion allowed).
 * Delegated on the document, so it covers content rendered later. Returns a cleanup function.
 */
export function installHoverScramble(): () => void {
	if (!motion.finePointer || motion.reduced) return () => {};
	const onOver = (e: PointerEvent) => {
		const host = (e.target as Element | null)?.closest?.('a, button');
		if (!host || host.hasAttribute('data-no-scramble')) return;
		if (e.relatedTarget instanceof Node && host.contains(e.relatedTarget)) return;
		for (const el of leaves(host)) {
			if (!el.dataset.text) el.dataset.text = el.textContent ?? '';
			if (gsap.isTweening(el)) continue;
			scrambleTo(el, el.dataset.text, 0.45);
		}
	};
	document.addEventListener('pointerover', onOver, { passive: true });
	return () => document.removeEventListener('pointerover', onOver);
}
