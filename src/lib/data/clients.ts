/** Client work: list rows + /work/[slug] case studies. Screenshots live in static/work/. */

export interface Client {
	slug: string;
	name: string;
	category: string;
	/** TODO: confirm. Currently the year each repo was created. */
	year: string;
	url: string;
	description: string;
	role: string;
	stack: string[];
	scope: string[];
}

export const clients: Client[] = [
	{
		slug: 'nante-patisserie',
		name: 'Nanté Patisserie',
		category: 'Luxury patisserie',
		year: '2026', // TODO: confirm year
		url: 'https://www.nantecakestudio.in',
		description:
			'A custom brand website for a boutique patisserie: their story, signature cakes and wedding creations. Design + development.',
		role: 'Design + development',
		stack: ['React', 'Vite', 'Tailwind CSS', 'GSAP', 'Framer Motion'],
		scope: ['Brand website', 'Story / about', 'Cakes + wedding collections', 'Motion design']
	},
	{
		slug: 'adc-by-dr-sanjana',
		name: 'Advanced Dental Care by Dr. Sanjana',
		category: 'Dental clinic, Noida',
		year: '2026', // TODO: confirm year
		url: 'https://www.adcbydrsanjana.in',
		description:
			'A personalised clinic website with services, appointment booking and a blog, plus an admin dashboard where the doctor publishes blog posts and manages appointments herself. Design + full-stack development.',
		role: 'Design + full-stack development',
		stack: ['SvelteKit', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Nodemailer'],
		scope: ['Clinic website', 'Appointment booking', 'Blog', 'Admin dashboard (posts + appointments)']
	},
	{
		slug: 'savora-hospitality',
		name: 'Savora Hospitality',
		category: 'Culinary & hospitality consulting',
		year: '2026', // TODO: confirm year
		url: 'https://www.savorahospitality.in',
		description:
			'A custom website for an F&B consulting firm: services, a project gallery, an insights journal and contact. Design + development.',
		role: 'Design + development',
		stack: ['SvelteKit', 'TypeScript', 'Tailwind CSS'],
		scope: ['Consultancy website', 'Services', 'Project gallery', 'Insights journal', 'Contact']
	}
];

export const clientBySlug = (slug: string) => clients.find((c) => c.slug === slug);
