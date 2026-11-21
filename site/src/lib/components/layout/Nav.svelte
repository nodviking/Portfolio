<script lang="ts">
	import { tick } from 'svelte';
	import { magnetic } from '#lib/actions/magnetic.ts';
	import IsoCube from '#lib/components/ui/IsoCube.svelte';
	import { primaryLinks } from '#lib/data/site.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';
	import MenuOverlay from './MenuOverlay.svelte';
	import NavWordmark from './NavWordmark.svelte';

	let hidden = $state(false);
	let scrolled = $state(false);
	let active = $state('');
	let menuButton: HTMLButtonElement;

	// Hide on scroll down, reveal on scroll up. Always visible near the top.
	$effect(() => {
		let last = window.scrollY;
		const onScroll = () => {
			const y = window.scrollY;
			scrolled = y > 12;
			if (motion.menuOpen) return;
			if (y < 80) hidden = false;
			else if (Math.abs(y - last) > 6) hidden = y > last;
			last = y;
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	// Underline the link for the section in view.
	$effect(() => {
		const ids = primaryLinks.map((l) => l.href.split('#')[1]).filter(Boolean);
		const els = ids
			.map((id) => document.getElementById(id))
			.filter((el): el is HTMLElement => !!el);
		if (!els.length) return;
		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) if (e.isIntersecting) active = e.target.id;
			},
			{ rootMargin: '-45% 0px -50% 0px' }
		);
		els.forEach((el) => io.observe(el));
		return () => io.disconnect();
	});

	function closeMenu(refocus = true) {
		motion.menuOpen = false;
		// Wait for `inert` to come off the header before moving focus back.
		if (refocus) tick().then(() => menuButton?.focus());
	}
</script>

<header
	class={[
		'fixed inset-x-0 top-0 z-50 transition-[transform,background-color] duration-500 ease-[var(--ease-expo)]',
		hidden && '-translate-y-full',
		scrolled && 'bg-ink/90'
	]}
	inert={motion.menuOpen}
>
	<div class="relative flex h-[var(--nav-h)] items-center justify-between px-[var(--gutter)]">
		<a href="/" class="flex items-center gap-3" aria-label="nodviking, home">
			<IsoCube size={26} />
			<NavWordmark />
		</a>

		<nav aria-label="Sections" class="absolute left-1/2 hidden -translate-x-1/2 md:block">
			<ul class="flex items-center gap-11">
				{#each primaryLinks as link, i (link.href)}
					{@const id = link.href.split('#')[1]}
					<li>
						<a
							href={link.href}
							class={['navlink caps', active === id && 'is-active']}
							aria-current={active === id ? 'location' : undefined}
						>
							<b class="mr-2 text-[10px] font-black text-accent-soft"
								>{String(i + 1).padStart(2, '0')}</b
							><span>{link.label}</span>
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<a href="/#contact" class="btn hidden md:inline-flex" use:magnetic={{ strength: 0.2 }}>
			Connect <span aria-hidden="true">↗</span>
		</a>

		<button
			bind:this={menuButton}
			type="button"
			class="burger"
			aria-label="Open menu"
			aria-expanded={motion.menuOpen}
			aria-controls="site-menu"
			onclick={() => (motion.menuOpen = true)}
		>
			<span></span><span></span>
		</button>
	</div>
</header>

<MenuOverlay onclose={closeMenu} />

<style>
	.navlink {
		position: relative;
		display: inline-flex;
		align-items: baseline;
		padding: 4px 0;
	}
	.navlink::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: -2px;
		height: 1px;
		background: var(--color-accent-soft);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 0.45s var(--ease-expo);
	}
	.navlink:hover::after,
	.navlink.is-active::after {
		transform: scaleX(1);
	}

	.burger {
		display: grid;
		gap: 7px;
		width: 44px;
		height: 44px;
		place-content: center;
		margin-right: -8px;
	}
	.burger span {
		display: block;
		width: 26px;
		height: 2px;
		background: var(--color-paper);
	}
	@media (min-width: 768px) {
		.burger {
			display: none;
		}
	}
</style>
