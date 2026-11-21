/** Hero + intro copy. Edit freely; components read from here. */

/** Preloader word sequence. The last word should be the brand. */
export const introWords = ['Create', 'Connect', 'nodviking'] as const;

/**
 * The hero wordmark, split where it breaks onto two lines on phones (< 600px). It reads as one word
 * ("nodviking") in the DOM, so SEO and screen readers are unaffected.
 */
export const heroWordmark = ['nod', 'viking'] as const;

/** Code-style tag above the wordmark. */
export const heroTag = '<DEV × DESIGN />';

/** Three short all-caps lines under the wordmark. */
export const heroLines = [
	'Developer × designer.',
	'Products, dev tools and brand websites,',
	'built with a designer’s eye.'
] as const;

/** The particles re-form into this headline on scroll (rendered as a real <h2> too). */
export const aboutHeadline = ['I design it.', 'Then I ship it.'] as const;

/**
 * Hidden layer revealed by the cursor lens. Values are masked; nothing here is a real secret.
 * Lines are repeated to fill the hero.
 */
export const lensLines = [
	'$ storeenv pull --env production',
	'✓ decrypted 14 secrets · AES-256-GCM · nothing written to disk',
	'NODVIKING_KEY=••••••••••••••••••••',
	'DATABASE_URL=postgres://••••••••@••••••/app',
	'STRIPE_SECRET=sk_live_••••••••••••••••',
	'const ship = (idea) => build(design(idea));',
	'$ storeenv run -- npm start',
	'SESSION_SECRET=••••••••••••••••',
	'git commit -m "make it feel designed"',
	'OPENAI_API_KEY=sk-••••••••••••••••••••'
] as const;
