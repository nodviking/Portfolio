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
	},
	{
		tab: '02 / EVIDENCE.LINK',
		title: 'EvidenceLink AI',
		body: 'Hackathon project that turns cyber-fraud panic into a verifiable complaint package: OCR evidence extraction, a timeline, SHA-256-hashed files and a PDF report.',
		stack: ['React', 'Web Crypto', 'Tesseract.js'],
		readout: ['status: shipped', 'hash: sha-256', 'out: report.pdf']
	},
	{
		tab: '03 / RACHNA.OS',
		title: 'RachnaOS',
		body: 'An operating system for Indian YouTube and social creators: AI audience analytics, contract scanning and a freelancer marketplace.',
		stack: ['React', 'Express', 'Supabase', 'Claude API'],
		readout: ['status: prototype', 'modules: 3', 'users: creators']
	}
];
