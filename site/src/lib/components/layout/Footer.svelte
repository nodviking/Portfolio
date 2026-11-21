<script lang="ts">
	import { magnetic } from '#lib/actions/magnetic.ts';
	import { scrollToTarget } from '#lib/animations/lenis.ts';
	import Icon from '#lib/components/ui/Icon.svelte';
	import LocalTime from '#lib/components/ui/LocalTime.svelte';
	import { site } from '#lib/data/site.ts';
	import Socials from './Socials.svelte';

	function toTop() {
		scrollToTarget(document.getElementById('main') ?? 0);
	}
</script>

<footer class="relative px-[var(--gutter)] pt-24 pb-6 md:pt-32 md:pb-8">
	<p
		class="text-accent text-center font-display text-[10.6vw] leading-[0.9] uppercase select-none"
		aria-hidden="true"
	>
		nodviking
	</p>

	<div
		class="caps mt-10 grid grid-cols-2 items-center gap-y-4 text-paper/75 md:mt-14 md:grid-cols-4"
	>
		<p>© {site.copyrightYear} {site.realName}</p>
		<p class="justify-self-end md:justify-self-center"><LocalTime /></p>
		<Socials class="md:justify-self-center" />
		<button
			type="button"
			class="pill justify-self-end"
			onclick={toTop}
			use:magnetic
			aria-label="Back to top"
		>
			Top <Icon name="arrow-up" size={12} />
		</button>
	</div>
</footer>
