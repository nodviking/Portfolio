<script lang="ts">
	import { EASE, gsap } from '#lib/animations/gsap.ts';
	import { navigateTo } from '#lib/animations/navigate.ts';
	import LocalTime from '#lib/components/ui/LocalTime.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { navLinks, site } from '#lib/data/site.ts';
	import { magnetic } from '#lib/actions/magnetic.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';
	import Socials from './Socials.svelte';

	let { onclose }: { onclose: (refocus?: boolean) => void } = $props();

	let root: HTMLDivElement;
	let tl: gsap.core.Timeline | null = null;

	// Build the open/close timeline once; play/reverse it when the menu state flips.
	$effect(() => {
		const lines = root.querySelectorAll('[data-menu-line]');
		const fades = root.querySelectorAll('[data-menu-fade]');
		gsap.set(root, { autoAlpha: 0 });

		tl = gsap
			.timeline({ paused: true })
			.set(root, { autoAlpha: 1 })
			.fromTo(
				root,
				{ clipPath: 'inset(0% 0% 100% 0%)' },
				{ clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: EASE.inOut }
			)
			.fromTo(
				lines,
				{ yPercent: 115 },
				{ yPercent: 0, duration: 1.1, ease: EASE.out, stagger: 0.06 },
				'-=0.35'
			)
			.fromTo(fades, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: 'power2.out' }, '<0.25');

		return () => {
			tl?.kill();
			tl = null;
		};
	});

	$effect(() => {
		const open = motion.menuOpen;
		if (!tl) return;
		if (open) {
			motion.lenis?.stop();
			if (motion.reduced) tl.progress(1);
			else tl.timeScale(1).play();
			requestAnimationFrame(() =>
				root.querySelector<HTMLElement>('[data-menu-line]')?.focus({ preventScroll: true })
			);
		} else {
			if (motion.reduced) tl.progress(0);
			else tl.timeScale(1.7).reverse();
			motion.lenis?.start();
		}
	});

	function onKeydown(e: KeyboardEvent) {
		if (!motion.menuOpen) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			onclose();
			return;
		}
		if (e.key !== 'Tab') return;
		const focusables = Array.from(
			root.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
		).filter((el) => el.offsetParent !== null);
		if (!focusables.length) return;
		const first = focusables[0];
		const last = focusables[focusables.length - 1];
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}

	function go(e: MouseEvent, href: string) {
		if (e.metaKey || e.ctrlKey || e.shiftKey) return;
		e.preventDefault();
		onclose(false);
		motion.lenis?.start();
		// Let the curtain start lifting before we move.
		setTimeout(() => navigateTo(href), motion.reduced ? 0 : 250);
	}
</script>

<svelte:window onkeydown={onKeydown} />

<div
	bind:this={root}
	id="site-menu"
	class="invisible fixed inset-0 z-[60] flex flex-col bg-ink"
	role="dialog"
	aria-modal="true"
	aria-label="Site menu"
	inert={!motion.menuOpen}
	data-lenis-prevent
>
	<div class="flex justify-end px-[var(--gutter)] pt-5 md:pt-7">
		<button type="button" class="pill" onclick={() => onclose()} use:magnetic>Close</button>
	</div>

	<nav aria-label="Primary" class="flex flex-1 items-center justify-center">
		<ol class="flex flex-col items-center gap-1 md:gap-2">
			{#each navLinks as link, i (link.href)}
				<li class="overflow-hidden pb-[0.08em]">
					<a
						href={link.href}
						data-menu-line
						class="group flex items-baseline gap-3 md:gap-5"
						onclick={(e) => go(e, link.href)}
					>
						<span class="caps text-mute tabular-nums" aria-hidden="true"
							>{String(i + 1).padStart(2, '0')}</span
						>
						<span
							class="font-display text-[clamp(3.4rem,12vw,8.5rem)] leading-[0.92] text-paper uppercase transition-colors duration-500 ease-[var(--ease-expo)] group-hover:text-accent group-focus-visible:text-accent"
							>{link.label}</span
						>
					</a>
				</li>
			{/each}
		</ol>
	</nav>

	<div
		data-menu-fade
		class="grid gap-6 px-[var(--gutter)] pb-6 md:grid-cols-3 md:items-end md:pb-8"
	>
		<div class="caps flex flex-col gap-1 text-paper/80">
			<a class="w-fit hover:text-paper" href="mailto:{site.email}">{site.email}</a>
			<a
				class="inline-flex w-fit items-center gap-1 hover:text-paper"
				href={site.designPortfolio}
				target="_blank"
				rel="noopener noreferrer"
				>Design portfolio <Icon name="arrow-up-right" size={12} /></a
			>
		</div>
		<p class="caps flex items-center gap-2 text-paper/80 md:justify-center">
			{#if site.available}<span class="size-1.5 rounded-full bg-accent" aria-hidden="true"
				></span>{site.availability}{/if}
		</p>
		<div class="caps flex items-center justify-between gap-4 text-paper/80 md:justify-end">
			<LocalTime />
			<Socials />
		</div>
	</div>
</div>
