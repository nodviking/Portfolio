/**
 * Global site content. Edit here, not in components.
 * Search the repo for `TODO:` to find content that still needs filling in.
 */

/** Canonical production URL (no trailing slash). Swap when a custom domain is live. */
export const SITE_URL = 'https://portfolio-mu-wine-42.vercel.app';

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
}

export const sections: SectionMeta[] = [
	{ id: 'top', index: '01', file: 'INDEX.HTML', label: 'Home' },
	{ id: 'about', index: '02', file: 'ABOUT.MD', label: 'About' },
	{ id: 'storeenv', index: '03', file: 'STOREENV.CLI', label: 'StoreEnv' },
	{ id: 'work', index: '04', file: 'CLIENTS.LOG', label: 'Client work' },
	{ id: 'lab', index: '05', file: 'LAB.DIR', label: 'More builds' },
	{ id: 'experience', index: '06', file: 'HISTORY.TXT', label: 'Experience' },
	{ id: 'stack', index: '07', file: 'STACK.JSON', label: 'Stack' },
	{ id: 'numbers', index: '08', file: 'STATS.LOG', label: 'Numbers' },
	{ id: 'design', index: '09', file: 'DESIGN.ARCHIVE', label: 'Design roots' },
	{ id: 'contact', index: '10', file: 'CONTACT.SH', label: 'Contact' }
];

export const sectionById = (id: string) => sections.find((s) => s.id === id)!;

/** Fullscreen menu links. */
export const navLinks: NavLink[] = sections
	.filter((s) => s.id !== 'top')
	.map((s) => ({ label: s.label, href: `/#${s.id}` }));
