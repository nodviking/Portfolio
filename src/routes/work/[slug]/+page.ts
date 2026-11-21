import { error } from '@sveltejs/kit';
import { clientBySlug, clients } from '#lib/data/clients.ts';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => clients.map((c) => ({ slug: c.slug }));

export const load: PageLoad = ({ params }) => {
	const client = clientBySlug(params.slug);
	if (!client) error(404, 'Project not found');
	const i = clients.indexOf(client);
	const n = clients.length;
	return { client, index: i, prev: clients[(i - 1 + n) % n], next: clients[(i + 1) % n] };
};
