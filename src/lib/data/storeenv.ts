/** StoreEnv: the hero project. */

export const storeenv = {
	title: 'StoreEnv',
	subtitle: 'Git for environment secrets.',
	role: 'Solo project — design, engineering, everything',
	links: [
		{ label: 'storeenv.app', href: 'https://storeenv.app' },
		{ label: 'CLI on GitHub', href: 'https://github.com/nodviking/storeenv-cli' }
	]
} as const;

export type DiagramKind = 'pushpull' | 'versions' | 'sharing' | 'run' | 'crypto' | 'platforms';

export interface Feature {
	title: string;
	body: string;
	diagram: DiagramKind;
}

export const features: Feature[] = [
	{
		title: 'Push / Pull',
		body: 'Finds .env files in every service folder, encrypts them on your device, and restores them in the right place on another machine.',
		diagram: 'pushpull'
	},
	{
		title: 'Versioned',
		body: 'Every push is a signed version with author and message. See which keys changed and roll back in one command.',
		diagram: 'versions'
	},
	{
		title: 'Selective sharing',
		body: 'Share a whole environment or only specific keys, by email or username, with access that expires.',
		diagram: 'sharing'
	},
	{
		title: 'Run without files',
		body: '`storeenv run` injects secrets straight into a process, so nothing is written to disk.',
		diagram: 'run'
	},
	{
		title: 'Zero-knowledge',
		body: 'AES-256-GCM per secret, keys wrapped per person. The server only ever sees ciphertext.',
		diagram: 'crypto'
	},
	{
		title: 'Everywhere',
		body: 'Single binary, Homebrew and npm · macOS, Linux, Windows · VS Code extension + web app.',
		diagram: 'platforms'
	}
];

/**
 * Fake terminal script, typed in sync with scroll. `secret: true` marks the sample line that scrambles into
 * ciphertext and back while the terminal types. Values are illustrative, not real secrets.
 */
export interface TermLine {
	kind: 'cmd' | 'out' | 'ok' | 'dim';
	text: string;
	secret?: boolean;
}

export const terminal: TermLine[] = [
	{ kind: 'cmd', text: '$ storeenv push' },
	{ kind: 'dim', text: 'scanning ./api ./web ./worker' },
	{ kind: 'out', text: 'found 3 .env files · 41 keys' },
	{ kind: 'out', text: 'DATABASE_URL=postgres://app:••••@db.internal:5432/app', secret: true },
	{ kind: 'ok', text: '✓ encrypted on device · AES-256-GCM' },
	{ kind: 'ok', text: '✓ pushed v14 "rotate stripe key" (signed)' },
	{ kind: 'cmd', text: '$ storeenv pull' },
	{ kind: 'out', text: 'restoring v14 → ./api/.env ./web/.env' },
	{ kind: 'ok', text: '✓ 41 keys decrypted locally' },
	{ kind: 'cmd', text: '$ storeenv run -- npm start' },
	{ kind: 'dim', text: 'injecting 41 secrets · nothing written to disk' },
	{ kind: 'ok', text: '✓ server listening on :3000' }
];

/** What the secret line looks like as ciphertext. Same length, so the line never reflows. */
export const secretCipher = 'DATABASE_URL=enc:v1:9f2c8a41e07bd3c6f5a1:7e04c9b2d8f1';
