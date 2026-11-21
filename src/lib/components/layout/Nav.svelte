<script lang="ts">
	import { tick, untrack } from 'svelte';
	import { page } from '$app/state';
	import { magnetic } from '#lib/actions/magnetic.ts';
	import { primaryLinks } from '#lib/data/site.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';
	import MenuOverlay from './MenuOverlay.svelte';
	import NavWordmark from './NavWordmark.svelte';

	let hidden = $state(false);
	let scrolled = $state(false);
	let active = $state('');
	let list: HTMLUListElement | undefined = $state();
	let underline = $state({ x: 0, w: 0, on: false });
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

	// Track which linked section is in the middle of the viewport.
	$effect(() => {
		void page.url.pathname; // re-scan after each navigation
		active = '';
		const ids = primaryLinks.map((l) => l.href.split('#')[1]);
		const els = ids
			.map((id) => document.getElementById(id))
			.filter((el): el is HTMLElement => !!el);
		if (!els.length) return;
		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (e.isIntersecting) active = e.target.id;
					else if (active === e.target.id) active = '';
				}
			},
			{ rootMargin: '-50% 0px -50% 0px' }
		);
		els.forEach((el) => io.observe(el));
		return () => io.disconnect();
	});

	// The underline slides to the active link.
	$effect(() => {
		const id = active;
		if (!list) return;
		const place = () => {
			const a = list!.querySelector<HTMLElement>(`a[href$="#${id}"]`);
			underline = a
				? { x: a.offsetLeft, w: a.offsetWidth, on: true }
				: { ...untrack(() => underline), on: false };
		};
		place();
		window.addEventListener('resize', place);
		return () => window.removeEventListener('resize', place);
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
		<a href="/" class="flex items-center" data-no-scramble>
			<NavWordmark />
		</a>

		<nav aria-label="Sections" class="absolute left-1/2 hidden -translate-x-1/2 md:block">
			<ul bind:this={list} class="relative flex items-center gap-10">
				{#each primaryLinks as link, i (link.href)}
					{@const id = link.href.split('#')[1]}
					<li>
						<a
							href={link.href}
							class="caps inline-flex items-baseline gap-2 py-1"
							aria-current={active === id ? 'location' : undefined}
						>
							<b
								class={[
									'text-[10px] font-black transition-colors duration-300',
									active === id ? 'text-accent-ink' : 'text-mute'
								]}>{String(i + 1).padStart(2, '0')}</b
							><span>{link.label}</span>
						</a>
					</li>
				{/each}
				<span
					class="underline"
					style:transform="translateX({underline.x}px) scaleX({underline.on ? 1 : 0})"
					style:width="{underline.w}px"
					aria-hidden="true"
				></span>
			</ul>
		</nav>

		<a href="/#contact" class="btn hidden md:inline-flex" use:magnetic={{ strength: 0.2 }}>
			<span>Connect</span><span aria-hidden="true" data-no-scramble>↗</span>
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
	.underline {
		position: absolute;
		left: 0;
		bottom: -4px;
		height: 1px;
		background: var(--color-accent);
		transform-origin: left;
		transition:
			transform 0.55s var(--ease-expo),
			width 0.55s var(--ease-expo);
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
