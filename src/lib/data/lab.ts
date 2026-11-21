/** More builds ([05] LAB.DIR). `readout` lines scramble on hover. */
export interface LabItem {
	tab: string;
	title: string;
	body: string;
	stack: string[];
	readout: string[];
}

export const lab: LabItem[] = [
	{
		tab: '01 / ICURUS.AI',
		title: 'ICURUS',
		body: 'An AI research assistant for satellite and Earth-observation data. It runs specialist geo models and explains every result with a trust grade.',
		stack: ['SvelteKit', 'FastAPI', 'LangGraph'],
		readout: ['status: building', 'models: geo × specialist', 'trust: graded']
	}
];
