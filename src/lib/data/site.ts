/**
 * Global site content. Edit here, not in components.
 * Search the repo for `TODO:` to find content that still needs filling in.
 */

/** Canonical production URL (no trailing slash). Swap when a custom domain is live. */
export const SITE_URL = 'https://nodviking.me';

export const site = {
	brand: 'nodviking',
	/** Real name: used ONLY in About, footer copyright, meta author and JSON-LD. */
	realName: 'Tushar Kumar',
	title: 'nodviking — developer × designer',
	description:
		'nodviking designs brands and builds the products behind them: full-stack products, developer tools and custom websites, from Delhi.',
	role: 'Developer × Designer',
	location: 'Delhi, India',
	coords: 'LAT 28.61°N / LON 77.20°E',
	version: 'v2026.11',
	timeZone: 'Asia/Kolkata',
	timeZoneLabel: 'IST',
	email: 'tusharrr0302@gmail.com',
	copyrightYear: 2026,
	github: 'https://github.com/nodviking',
	linkedin: 'https://www.linkedin.com/in/nodviking/',
	designPortfolio: 'https://tusharrr.my.canva.site/'
} as const;

export type SocialIcon = 'github' | 'linkedin' | 'mail';

export interface Social {
	label: string;
	href: string;
	icon: SocialIcon;
}

export const socials: Social[] = [
	{ label: 'GitHub', href: site.github, icon: 'github' },
	{ label: 'LinkedIn', href: site.linkedin, icon: 'linkedin' },
	{ label: 'Email', href: `mailto:${site.email}`, icon: 'mail' }
];

export interface NavLink {
	label: string;
	href: string;
}

/** Centred desktop nav links. Numbers are assigned in order. */
export const primaryLinks: NavLink[] = [
	{ label: 'About', href: '/#about' },
	{ label: 'StoreEnv', href: '/#storeenv' },
	{ label: 'Work', href: '/#work' },
	{ label: 'FAQ', href: '/#faq' },
	{ label: 'Contact', href: '/#contact' }
];

/**
 * Page sections, in order. `index` drives the [03] / FILE.EXT tabs and the 03/10 counter.
 * The preloader is [00] and isn't listed.
 */
export interface SectionMeta {
	id: string;
	index: string;
	file: string;
	label: string;
	/** One-line description shown beside the section title. */
	lede?: string;
}

export const sections: SectionMeta[] = [
	{ id: 'top', index: '01', file: 'INDEX.HTML', label: 'Home' },
	{ id: 'about', index: '02', file: 'ABOUT.MD', label: 'About', lede: 'Graphic design first, then code. Now both, on every project.' },
	{ id: 'storeenv', index: '03', file: 'STOREENV.CLI', label: 'StoreEnv' },
	{ id: 'work', index: '04', file: 'CLIENTS.LOG', label: 'Client work', lede: 'Custom websites for real businesses, designed and built from scratch.' },
	{ id: 'lab', index: '05', file: 'LAB.DIR', label: 'More builds', lede: 'Side projects and experiments.' },
	{ id: 'experience', index: '06', file: 'HISTORY.TXT', label: 'Experience', lede: 'Where the work has come from so far.' },
	{ id: 'stack', index: '07', file: 'STACK.JSON', label: 'Stack', lede: 'The tools I reach for, from Figma to FastAPI.' },
	{ id: 'numbers', index: '08', file: 'STATS.LOG', label: 'Numbers', lede: 'The work so far, counted.' },
	{ id: 'design', index: '09', file: 'DESIGN.ARCHIVE', label: 'Design roots', lede: 'Thumbnails, logos and brand identities from 250+ design projects. Drag the rows.' },
	{ id: 'faq', index: '10', file: 'FAQ.MD', label: 'FAQ' },
	{ id: 'contact', index: '11', file: 'CONTACT.SH', label: 'Contact' }
];

export const sectionById = (id: string) => sections.find((s) => s.id === id)!;

/** Fullscreen menu links. */
export const navLinks: NavLink[] = sections
	.filter((s) => s.id !== 'top')
	.map((s) => ({ label: s.label, href: `/#${s.id}` }));
