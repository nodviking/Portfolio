/** Experience timeline ([06] HISTORY.TXT). */
export interface ExperienceItem {
	role: string;
	org: string;
	/** TODO: fill in the real dates. */
	dates: string;
	body?: string;
}

export const experience: ExperienceItem[] = [
	{
		role: 'Creator & Developer',
		org: 'StoreEnv',
		dates: 'TODO: year – present',
		body: 'Encrypted .env manager: CLI, web app, VS Code extension.'
	},
	{
		role: 'Freelance Web Designer & Developer',
		org: 'Independent',
		dates: 'TODO: year – present',
		body: '5 custom websites shipped, one with a full admin dashboard.'
	},
	{
		role: 'Freelance Graphic Designer',
		org: 'Independent',
		dates: 'TODO: years',
		body: '80+ clients, 250+ projects: brands, thumbnails, social.'
	},
	{
		role: 'B.Tech, Information Technology',
		org: 'Bhagwan Parshuram Institute of Technology (BPIT), Delhi',
		dates: 'TODO: 20XX – 20XX'
	}
];

/** Hide "TODO:" placeholders on the page; they stay visible in this file. */
export const displayDates = (d: string) => (d.startsWith('TODO') ? '' : d);
