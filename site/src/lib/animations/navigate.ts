import { goto } from '$app/navigation';
import { scrollToTarget } from './lenis.ts';

/**
 * Programmatic navigation that respects Lenis: same-page hash targets scroll smoothly,
 * everything else goes through SvelteKit's router.
 */
export function navigateTo(href: string) {
	const url = new URL(href, location.href);
	if (url.origin === location.origin && url.pathname === location.pathname && url.hash) {
		const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
		if (el) {
			history.pushState(history.state, '', url.hash);
			scrollToTarget(el);
			return;
		}
	}
	if (url.origin !== location.origin) {
		location.href = url.href;
		return;
	}
	goto(url.pathname + url.search + url.hash);
}
