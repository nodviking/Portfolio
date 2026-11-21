<script lang="ts">
	import { tick } from 'svelte';
	import { magnetic } from '#lib/actions/magnetic.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';
	import MenuOverlay from './MenuOverlay.svelte';
	import NavWordmark from './NavWordmark.svelte';

	let hidden = $state(false);
	let menuButton: HTMLButtonElement;

	// Hide on scroll down, reveal on scroll up. Always visible near the top.
	$effect(() => {
		let last = window.scrollY;
		const onScroll = () => {
			const y = window.scrollY;
			if (motion.menuOpen) return;
			if (y < 80) hidden = false;
			else if (Math.abs(y - last) > 6) hidden = y > last;
			last = y;
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	function closeMenu(refocus = true) {
		motion.menuOpen = false;
		// Wait for `inert` to come off the header before moving focus back.
		if (refocus) tick().then(() => menuButton?.focus());
	}
</script>

<header class="pointer-events-none fixed inset-x-0 top-0 z-50" inert={motion.menuOpen}>
	<div
		class={[
			'relative flex items-start justify-between px-[var(--gutter)] pt-5 transition-transform duration-700 ease-[var(--ease-expo)] md:pt-7',
			hidden && '-translate-y-[160%]'
		]}
	>
		<a href="/#work" class="pill pointer-events-auto" use:magnetic>Work</a>

		<a
			href="/"
			class="pointer-events-auto absolute top-5 left-1/2 flex h-9 -translate-x-1/2 items-center rounded-full px-2 md:top-7"
			aria-label="nodviking, home"
		>
			<NavWordmark />
		</a>

		<button
			bind:this={menuButton}
			type="button"
			class="pill pointer-events-auto"
			aria-expanded={motion.menuOpen}
			aria-controls="site-menu"
			onclick={() => (motion.menuOpen = true)}
			use:magnetic
		>
			Menu
		</button>
	</div>
</header>

<MenuOverlay onclose={closeMenu} />
