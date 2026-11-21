/** More builds ([05] LAB.DIR). `readout` lines scramble on hover. */
export interface LabItem {
	tab: string;
	title: string;
	body: string;
	stack: string[];
	readout: string[];
	href?: string;
}

export const lab: LabItem[] = [
	{
		tab: '01 / CODO.LVLING',
		title: 'Codo Lvling',
		body: 'DSA practice as an RPG: level up, unlock regions and battle other coders live.',
		stack: ['React', 'Node.js', 'Socket.io', 'PostgreSQL', 'Gemini'],
		readout: ['status: live', 'mode: 1v1 · 2v2'],
		href: 'https://codo-lvling.vercel.app'
	},
	{
		tab: '02 / ICURUS.AI',
		title: 'ICURUS',
		body: 'An AI research assistant for satellite data that grades every answer for trust.',
		stack: ['SvelteKit', 'FastAPI', 'LangGraph'],
		readout: ['status: building', 'trust: graded']
	}
];
