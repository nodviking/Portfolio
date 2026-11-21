import { clients } from '#lib/data/clients.ts';
import { SITE_URL } from '#lib/data/site.ts';

export const prerender = true;

export function GET() {
	const paths = ['/', ...clients.map((c) => `/work/${c.slug}`)];
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${SITE_URL}${p === '/' ? '' : p}</loc></url>`).join('\n')}
</urlset>
`;
	return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
