<script lang="ts">
	import '../app.css';
	import '@fontsource-variable/jetbrains-mono/wght.css';
	import monoFontUrl from '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2?url';

	import { afterNavigate, onNavigate } from '$app/navigation';
	import { ScrollTrigger } from '#lib/animations/gsap.ts';
	import { handleHashLinkClick, startLenis } from '#lib/animations/lenis.ts';
	import { cover, reveal } from '#lib/animations/pixelwipe.ts';
	import { installHoverScramble } from '#lib/animations/scramble.ts';
	import Cursor from '#lib/components/layout/Cursor.svelte';
	import DotGrid from '#lib/components/layout/DotGrid.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import Nav from '#lib/components/layout/Nav.svelte';
	import PixelWipe from '#lib/components/layout/PixelWipe.svelte';
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

	// Every link/button scrambles its label on hover.
	$effect(() => {
		void motion.finePointer;
		void motion.reduced;
		return installHoverScramble();
	});

	// Re-measure scroll-driven layouts once web fonts settle.
	$effect(() => {
		document.fonts?.ready.then(() => ScrollTrigger.refresh());
	});

	// Page transitions: the same diagonal pixel-grid wipe as the preloader.
	onNavigate((nav) => {
		if (motion.reduced || !nav.to || nav.from?.url.pathname === nav.to.url.pathname) return;
		return new Promise((resolve) => {
			cover().then(() => {
				resolve();
				nav.complete.then(() => reveal());
			});
		});
	});

	afterNavigate((nav) => {
		if (nav.type === 'enter') return;
		// New page: start at the top (unless jumping to a hash) and re-measure triggers.
		if (!nav.to?.url.hash) motion.lenis?.scrollTo(0, { immediate: true, force: true });
		requestAnimationFrame(() => ScrollTrigger.refresh());
	});

	const personLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: site.realName,
		alternateName: site.brand,
		url: SITE_URL,
		email: `mailto:${site.email}`,
		jobTitle: 'Developer and designer',
		address: { '@type': 'PostalAddress', addressLocality: 'Delhi', addressCountry: 'IN' },
		sameAs: [site.github, site.linkedin, site.designPortfolio]
	});
</script>

<svelte:head>
	<meta name="author" content={site.realName} />
	<meta name="theme-color" content="#f2eee7" />
	<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	<link rel="preload" href={monoFontUrl} as="font" type="font/woff2" crossorigin="anonymous" />
	<meta property="og:site_name" content={site.brand} />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="{SITE_URL}/og.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="NOD VIKING wordmark on a near-black background" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content="{SITE_URL}/og.png" />
	{@html `<script type="application/ld+json">${personLd}</script>`}
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
<PixelWipe />
<Preloader />
<Cursor />
