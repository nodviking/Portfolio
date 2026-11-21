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
		'nodviking builds full-stack products, developer tools and websites for brands, with a designer’s eye from years of graphic design work.',
	role: 'Developer × Designer',
	location: 'India',
	timeZone: 'Asia/Kolkata',
	timeZoneLabel: 'IST',
	email: 'tusharrr0302@gmail.com',
	available: true,
	availability: 'Available for freelance work',
	copyrightYear: 2026,
	designPortfolio: 'https://tusharrr.my.canva.site/'
} as const;

export type SocialIcon = 'github' | 'linkedin' | 'mail';

export interface Social {
	label: string;
	href: string;
	icon: SocialIcon;
}

export const socials: Social[] = [
	{ label: 'GitHub', href: 'https://github.com/nodviking', icon: 'github' },
	{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/nodviking/', icon: 'linkedin' },
	{ label: 'Email', href: `mailto:${site.email}`, icon: 'mail' }
];

export interface NavLink {
	label: string;
	href: string;
}

/** Centered desktop nav links (numbered). */
export const primaryLinks: NavLink[] = [
	{ label: 'Work', href: '/#work' },
	{ label: 'About', href: '/#about' },
	{ label: 'Contact', href: '/#contact' }
];

/** Fullscreen menu links (in-page anchors on the home route). */
export const navLinks: NavLink[] = [
	{ label: 'Work', href: '/#work' },
	{ label: 'StoreEnv', href: '/#storeenv' },
	{ label: 'About', href: '/#about' },
	{ label: 'Stack', href: '/#stack' },
	{ label: 'Contact', href: '/#contact' }
];
