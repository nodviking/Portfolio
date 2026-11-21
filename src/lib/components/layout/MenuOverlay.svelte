<script lang="ts">
	import { gsap } from '#lib/animations/gsap.ts';
	import { navigateTo } from '#lib/animations/navigate.ts';
	import { cover, reveal } from '#lib/animations/pixelwipe.ts';
	import { cipherOf, scrambleTo } from '#lib/animations/scramble.ts';
	import LocalTime from '#lib/components/ui/LocalTime.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { navLinks, sections, site } from '#lib/data/site.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';
	import Socials from './Socials.svelte';

	/** Fullscreen menu. Opens/closes behind a pixel-grid wipe; the links scramble in. */
	let { onclose }: { onclose: (refocus?: boolean) => void } = $props();

	let root: HTMLDivElement;
	let shown = $state(false);
	let busy = false;

	const indexFor = (href: string) => sections.find((s) => href.endsWith(`#${s.id}`))?.index ?? '';

	async function open() {
		if (busy) return;
		busy = true;
		motion.lenis?.stop();
		if (!motion.reduced) await cover();
		shown = true;
		gsap.set(root, { autoAlpha: 1 });
		const labels = Array.from(root.querySelectorAll<HTMLElement>('[data-menu-label]'));
		if (!motion.reduced) {
			labels.forEach((el) => (el.textContent = cipherOf(el.dataset.text!)));
			reveal();
			labels.forEach((el, i) => scrambleTo(el, el.dataset.text, 0.6, 0.15 + i * 0.05));
		}
		requestAnimationFrame(() =>
			root.querySelector<HTMLElement>('[data-menu-link]')?.focus({ preventScroll: true })
		);
		busy = false;
	}

	async function close() {
		if (busy) return;
		busy = true;
		if (!motion.reduced) await cover();
		shown = false;
		gsap.set(root, { autoAlpha: 0 });
		root.querySelectorAll<HTMLElement>('[data-menu-label]').forEach((el) => {
			gsap.killTweensOf(el);
			el.textContent = el.dataset.text!;
		});
		if (!motion.reduced) reveal();
		motion.lenis?.start();
		busy = false;
	}

	$effect(() => {
		gsap.set(root, { autoAlpha: 0 });
	});

	$effect(() => {
		const want = motion.menuOpen;
		if (want && !shown) open();
		else if (!want && shown) close();
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
		setTimeout(() => navigateTo(href), motion.reduced ? 0 : 650);
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
	<div class="flex h-[var(--nav-h)] items-center justify-between px-[var(--gutter)]">
		<span class="caps text-mute">/* menu */</span>
		<button type="button" class="tag" onclick={() => onclose()}><span>Close</span></button>
	</div>

	<nav aria-label="Primary" class="flex flex-1 items-center px-[var(--gutter)]">
		<ol class="flex w-full flex-col">
			{#each navLinks as link (link.href)}
				<li class="border-b border-line first:border-t">
					<a
						href={link.href}
						data-menu-link
						data-no-scramble
						class="group flex items-baseline gap-4 py-2 md:gap-6"
						onclick={(e) => go(e, link.href)}
					>
						<span class="index-tag w-8 tabular-nums" aria-hidden="true">{indexFor(link.href)}</span>
						<span
							data-menu-label
							data-text={link.label}
							class="font-display text-[clamp(2rem,7vw,5rem)] text-paper transition-colors duration-200 group-hover:text-accent-ink group-focus-visible:text-accent-ink"
							>{link.label}</span
						>
					</a>
				</li>
			{/each}
		</ol>
	</nav>

	<div class="mx-[var(--gutter)] grid gap-5 border-t border-line pt-5 pb-6 md:grid-cols-3 md:items-end md:pb-8">
		<div class="caps flex flex-col gap-1 text-mute">
			<a class="w-fit hover:text-accent-ink" href="mailto:{site.email}"><span>{site.email}</span></a>
			<a
				class="inline-flex w-fit items-center gap-1 hover:text-accent-ink"
				href={site.designPortfolio}
				target="_blank"
				rel="noopener noreferrer"><span>Design portfolio</span> <Icon name="arrow-up-right" size={12} /></a
			>
		</div>
		<p class="caps text-mute md:text-center">{site.location}</p>
		<div class="caps flex items-center justify-between gap-4 text-mute md:justify-end">
			<LocalTime />
			<Socials />
		</div>
	</div>
</div>
