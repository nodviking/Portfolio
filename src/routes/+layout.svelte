<script lang="ts">
	import '../app.css';
	import '@fontsource-variable/jetbrains-mono/wght.css';
	import monoFontUrl from '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2?url';

	import { handleHashLinkClick, startLenis } from '#lib/animations/lenis.ts';
	import { ScrollTrigger } from '#lib/animations/gsap.ts';
	import Cursor from '#lib/components/layout/Cursor.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import DotGrid from '#lib/components/layout/DotGrid.svelte';
	import Nav from '#lib/components/layout/Nav.svelte';
	import Preloader from '#lib/components/layout/Preloader.svelte';
	import ScrollIndicator from '#lib/components/layout/ScrollIndicator.svelte';
	import { site, SITE_URL } from '#lib/data/site.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	$effect(() => motion.listen());

	// Hold scroll while the intro plays.
	$effect(() => {
		const lenis = motion.lenis;
		if (!lenis) return;
		if (motion.introDone) lenis.start();
		else lenis.stop();
	});

	// Smooth scroll only when motion is allowed; tears down if the user flips the OS setting.
	$effect(() => {
		if (motion.reduced) return;
		return startLenis();
	});

	// Re-measure scroll-driven layouts once web fonts settle.
	$effect(() => {
		document.fonts?.ready.then(() => ScrollTrigger.refresh());
	});
</script>

<svelte:head>
	<title>{site.title}</title>
	<meta name="description" content={site.description} />
	<meta name="author" content={site.realName} />
	<meta name="theme-color" content="#0e0e0e" />
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<link
		rel="preload"
		href={monoFontUrl}
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/>
	<meta property="og:site_name" content={site.brand} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={SITE_URL} />
</svelte:head>

<svelte:document onclick={handleHashLinkClick} />

<a href="#main" class="skip-link tag">Skip to content</a>

<DotGrid />
<Nav />

<main id="main" inert={motion.menuOpen}>
	{@render children()}
</main>

<div inert={motion.menuOpen}>
	<Footer />
</div>


<ScrollIndicator />
<Preloader />
<Cursor />
