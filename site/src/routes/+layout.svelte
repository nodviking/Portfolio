<script lang="ts">
	import '../app.css';
	import '@fontsource/anton/latin-400.css';
	import '@fontsource-variable/inter-tight';
	import antonUrl from '@fontsource/anton/files/anton-latin-400-normal.woff2?url';

	import { handleHashLinkClick, startLenis } from '#lib/animations/lenis.ts';
	import { ScrollTrigger } from '#lib/animations/gsap.ts';
	import Cursor from '#lib/components/layout/Cursor.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import Grain from '#lib/components/layout/Grain.svelte';
	import Nav from '#lib/components/layout/Nav.svelte';
	import Socials from '#lib/components/layout/Socials.svelte';
	import { site, SITE_URL } from '#lib/data/site.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	$effect(() => motion.listen());

	// TEMP (Phase 1 restyle): no preloader yet, so the intro is done on mount.
	$effect(() => {
		motion.introDone = true;
	});

	// Smooth scroll only when motion is allowed; tears down if the user flips the OS setting.
	$effect(() => {
		if (motion.reduced) return;
		return startLenis();
	});

	// Fixed socials step aside once the footer (which has its own) scrolls into view.
	let footerWrap: HTMLDivElement;
	let footerInView = $state(false);
	$effect(() => {
		const io = new IntersectionObserver(([e]) => (footerInView = e.isIntersecting), {
			rootMargin: '0px 0px -10% 0px'
		});
		io.observe(footerWrap);
		return () => io.disconnect();
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
	<meta name="theme-color" content="#000000" />
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<link
		rel="preload"
		href={antonUrl}
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/>
	<meta property="og:site_name" content={site.brand} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={SITE_URL} />
</svelte:head>

<svelte:document onclick={handleHashLinkClick} />

<a href="#main" class="skip-link pill bg-ink">Skip to content</a>

<Nav />

<main id="main" inert={motion.menuOpen}>
	{@render children()}
</main>

<div bind:this={footerWrap} inert={motion.menuOpen}>
	<Footer />
</div>

<!-- Fixed socials, bottom-left (desktop). On mobile they live in the menu and footer. -->
<div
	class="fixed bottom-5 left-[var(--gutter)] z-40 hidden transition-opacity duration-500 md:block"
	class:opacity-0={motion.menuOpen || footerInView}
	inert={motion.menuOpen || footerInView}
>
	<Socials />
</div>

<Cursor />
<Grain />
