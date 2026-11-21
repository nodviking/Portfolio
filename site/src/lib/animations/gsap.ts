import { gsap } from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);
}

/** House eases: no linear, no bounce. */
export const EASE = {
	out: 'expo.out',
	outSoft: 'power4.out',
	inOut: 'power4.inOut',
	in: 'power3.in'
} as const;

/** Reveal durations sit in the 0.8–1.4s band. */
export const DUR = {
	fast: 0.6,
	base: 1,
	slow: 1.3
} as const;

export { gsap, ScrollTrigger, SplitText };
