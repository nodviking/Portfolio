/** Hero + intro copy. Edit freely; components read from here. */

/** Preloader word sequence. The last word should be the brand. */
export const introWords = ['Create', 'Connect', 'nodviking'] as const;

/** Outlined tag above the wordmark. */
export const heroTag = 'Developer × Designer · Delhi';

/** The two-part wordmark: first word in solid blue, second in a solid blue box with dark text. */
export const heroWordmark = { first: 'Nod', boxed: 'Viking' } as const;

/** Two lines under the divider: the first in full white, the second muted. */
export const heroIntro = [
	'I build full-stack products, developer tools and websites for brands.',
	'Years of graphic design behind every layout, so the details hold up after launch.'
] as const;

export const heroCta = { label: 'View StoreEnv', href: 'https://storeenv.app' } as const;
