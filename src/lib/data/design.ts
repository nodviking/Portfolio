/** Design archive: graphic design pieces (from the Canva portfolio), served from static/design/. */
export interface DesignPiece {
	slug: string;
	alt: string;
	kind: 'Thumbnail' | 'Brand' | 'Logo' | 'Poster' | 'Banner' | 'Artwork';
	w: number;
	h: number;
}

const p = (slug: string, alt: string, kind: DesignPiece['kind'], w: number, h: number): DesignPiece => ({ slug, alt, kind, w, h });

export const design: DesignPiece[] = [
	p('thumb-chainsaw-man', 'Chainsaw Man season 2 reaction thumbnail', 'Thumbnail', 720, 405),
	p('brand-lightyear-cards', 'Lightyear bakery business cards', 'Brand', 720, 576),
	p('thumb-abandoned-school', 'Abandoned school exploration thumbnail', 'Thumbnail', 720, 405),
	p('logo-rckless-podcast', 'Rckless Podcast logo', 'Logo', 720, 720),
	p('poster-kamar-ke-dard', 'Kamar Ke Dard music poster', 'Poster', 640, 800),
	p('thumb-own-your-story', 'Own your story podcast thumbnail', 'Thumbnail', 720, 405),
	p('brand-cv-box', 'Couture Vibes packaging mockup', 'Brand', 500, 400),
	p('thumb-live', 'Minecraft live-stream thumbnail', 'Thumbnail', 720, 405),
	p('logo-mach-records', 'Mach Records logo', 'Logo', 720, 720),
	p('brand-lightyear-tote', 'Lightyear tote bag mockup', 'Brand', 720, 576),
	p('thumb-gaadi-tera', 'Gaadi Tera Bhai music video thumbnail', 'Thumbnail', 720, 405),
	p('art-minecraft-torch', 'Minecraft character artwork', 'Artwork', 720, 720),
	p('thumb-abandoned-courthouse', 'Abandoned courthouse thumbnail', 'Thumbnail', 720, 405),
	p('logo-lightyear', 'Lightyear logo', 'Logo', 720, 720),
	p('brand-lightyear-mug', 'Lightyear mug mockup', 'Brand', 640, 800),
	p('thumb-before-after', 'Before and after fitness thumbnail', 'Thumbnail', 720, 405),
	p('logo-tfox', 'TFOX logo', 'Logo', 720, 720),
	p('banner-vitality', 'Vitality guild banner', 'Banner', 720, 405),
	p('brand-cv-fabric', 'Couture Vibes fabric pattern', 'Brand', 720, 405),
	p('logo-shave', 'Shave logo', 'Logo', 720, 720),
	p('brand-lightyear-bakery', 'Lightyear bakery signage', 'Brand', 720, 405),
	p('logo-couture-vibes', 'Couture Vibes wordmark', 'Logo', 720, 720),
	p('banner-bulking-protocol', 'Bul-King Protocol banner', 'Banner', 720, 383),
	p('logo-aps', 'APS logo', 'Logo', 720, 720)
];

/** Cards fanned out under the hero intro (code + design work, centre card first in visual weight). */
export const heroFan: { title: string; sub: string; img: string; alt: string; href: string; pos?: string }[] = [
	{ title: 'Nanté', sub: 'Patisserie site', img: '/work/nante-patisserie-mobile.webp', alt: 'Nanté Patisserie website on a phone', href: '/work/nante-patisserie' },
	{ title: 'Thumbnails', sub: 'YouTube design', img: '/design/thumb-chainsaw-man.webp', alt: 'YouTube thumbnail design', href: '#design' },
	{ title: 'StoreEnv', sub: 'Solo product', img: '/work/storeenv-desktop.webp', alt: 'StoreEnv website', href: '#storeenv', pos: '8% 92%' },
	{ title: 'Lightyear', sub: 'Brand identity', img: '/design/brand-lightyear-cards.webp', alt: 'Lightyear bakery brand identity', href: '#design' },
	{ title: 'ADC', sub: 'Clinic + dashboard', img: '/work/adc-by-dr-sanjana-mobile.webp', alt: 'Advanced Dental Care website on a phone', href: '/work/adc-by-dr-sanjana' }
];
