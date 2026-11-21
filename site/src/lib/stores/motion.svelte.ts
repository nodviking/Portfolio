import type Lenis from 'lenis';

/**
 * Global, reactive motion / input state. Read anywhere: `motion.reduced`, `motion.finePointer`.
 * Values are seeded synchronously in the browser so the first effect run already sees them.
 */
class MotionState {
	reduced = $state(false);
	finePointer = $state(false);
	menuOpen = $state(false);
	lenis = $state.raw<Lenis | null>(null);

	constructor() {
		if (typeof window === 'undefined') return;
		this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
		this.finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
	}

	/** Keep values in sync with OS-level changes. Returns a cleanup function. */
	listen(): () => void {
		const rm = matchMedia('(prefers-reduced-motion: reduce)');
		const fp = matchMedia('(hover: hover) and (pointer: fine)');
		const onRm = () => (this.reduced = rm.matches);
		const onFp = () => (this.finePointer = fp.matches);
		rm.addEventListener('change', onRm);
		fp.addEventListener('change', onFp);
		return () => {
			rm.removeEventListener('change', onRm);
			fp.removeEventListener('change', onFp);
		};
	}
}

export const motion = new MotionState();
