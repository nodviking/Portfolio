<script lang="ts">
	import { SITE_URL, site } from '#lib/data/site.ts';

	/** Per-page meta: title, description, canonical and OG/Twitter text. The OG image is set in the layout. */
	let {
		title = site.title,
		description = site.description,
		path = '/'
	}: { title?: string; description?: string; path?: string } = $props();

	const url = $derived(SITE_URL + (path === '/' ? '' : path));
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
</svelte:head>
