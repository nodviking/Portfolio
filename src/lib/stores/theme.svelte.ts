/**
 * Colour theme: dark by default, optional light. The choice is stored in localStorage ('nv-theme') and applied
 * to <html data-theme> before first paint by an inline script in app.html, so there's no flash.
 */
export type Theme = 'dark' | 'light';
const KEY = 'nv-theme';

class ThemeState {
	current = $state<Theme>('dark');

	constructor() {
		if (typeof document === 'undefined') return;
		this.current = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
	}

	set(t: Theme) {
		this.current = t;
		const root = document.documentElement;
		if (t === 'light') root.dataset.theme = 'light';
		else delete root.dataset.theme;
		document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'light' ? '#f2eee7' : '#0e0e0e');
		try {
			localStorage.setItem(KEY, t);
		} catch {
			/* storage blocked: the choice lasts for this page view */
		}
	}

	toggle() {
		this.set(this.current === 'light' ? 'dark' : 'light');
	}
}

export const theme = new ThemeState();
