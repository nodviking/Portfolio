/**
 * About section: the scroll-lit paragraph and the Developer / Designer specimen cards.
 * Glyph metrics are JetBrains Mono's real values (units per em 1000).
 * The paragraph is the ONLY place on the page the real name appears.
 */

export const aboutParagraph =
	'nodviking is Tushar Kumar, a developer and designer from Delhi studying IT at Bhagwan Parshuram Institute of Technology. I started in graphic design (80+ clients, 250+ projects), then started building the products and websites myself.';

export interface SpecimenGlyph {
	char: string;
	/** solid = filled accent, outline = off-white stroke, light = off-white fill */
	style: 'solid' | 'outline' | 'light';
}

export interface SpecimenCard {
	tab: string;
	/** Code-style tag. `accent` is the part rendered in orange. */
	tag: { before: string; accent: string; after: string };
	title: string;
	body: string;
	glyphs: SpecimenGlyph[];
}

export const specimenCards: SpecimenCard[] = [
	{
		tab: '01 / DEV.TS',
		tag: { before: 'const role = "', accent: 'DEVELOPER', after: '";' },
		title: 'Developer',
		body: 'Full-stack products and developer tools: CLIs, web apps, encryption and admin dashboards, built end to end and shipped.',
		glyphs: [
			{ char: '<', style: 'solid' },
			{ char: '/', style: 'light' },
			{ char: '>', style: 'solid' }
		]
	},
	{
		tab: '02 / DESIGN.CSS',
		tag: { before: '.role { is: ', accent: 'DESIGNER', after: '; }' },
		title: 'Designer',
		body: '250+ design projects for 80+ clients taught me type, rhythm and restraint. Every interface I build starts there.',
		glyphs: [
			{ char: 'N', style: 'solid' },
			{ char: 'v', style: 'outline' }
		]
	}
];

/** JetBrains Mono vertical metrics, in font units. */
export const monoMetrics = { asc: 1020, cap: 730, x: 550, desc: -300, advance: 600 } as const;

/** Pinned ASCII scene after About: one word at a time, scrubbed to scroll. */
export const scrollWords = ['DESIGN.', 'BUILD.', 'SHIP.'];
