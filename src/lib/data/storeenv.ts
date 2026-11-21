/** StoreEnv: the hero project. */

export const storeenv = {
	title: 'StoreEnv',
	subtitle: 'Git for environment secrets.',
	role: 'Solo project',
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
	{ title: 'Push / Pull', body: 'Sync .env files across machines.', diagram: 'pushpull' },
	{ title: 'Versioned', body: 'Signed history. One-command rollback.', diagram: 'versions' },
	{ title: 'Share keys', body: 'Per key, with access that expires.', diagram: 'sharing' },
	{ title: 'Zero-knowledge', body: 'Encrypted on device. Server sees ciphertext.', diagram: 'crypto' }
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
	{ kind: 'out', text: 'DATABASE_URL=postgres://app:••••@db.internal:5432/app', secret: true },
	{ kind: 'ok', text: '✓ encrypted on device · pushed v14' },
	{ kind: 'cmd', text: '$ storeenv pull' },
	{ kind: 'ok', text: '✓ 41 keys restored' },
	{ kind: 'cmd', text: '$ storeenv run -- npm start' },
	{ kind: 'ok', text: '✓ nothing written to disk' }
];

/** What the secret line looks like as ciphertext. Same length, so the line never reflows. */
export const secretCipher = 'DATABASE_URL=enc:v1:9f2c8a41e07bd3c6f5a1:7e04c9b2d8f1';
