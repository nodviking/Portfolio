<script lang="ts">
	import { magnetic } from '#lib/actions/magnetic.ts';
	import { scrollToTarget } from '#lib/animations/lenis.ts';
	import LocalTime from '#lib/components/ui/LocalTime.svelte';
	import { site } from '#lib/data/site.ts';

	function toTop() {
		scrollToTarget(document.getElementById('main') ?? 0);
	}
</script>

<footer class="px-[var(--gutter)] pb-6 md:pb-8">
	<div
		class="caps grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-3 border-t border-line pt-5 text-[11px] text-mute md:flex md:justify-between"
	>
		<p>© {site.copyrightYear} {site.realName}</p>
		<p class="justify-self-end"><LocalTime /></p>
		<p>Built with SvelteKit + GSAP</p>
		<button
			type="button"
			class="justify-self-end text-paper transition-colors hover:text-accent"
			onclick={toTop}
			use:magnetic={{ strength: 0.3 }}
			aria-label="Back to top"
		>
			<span>[ ↑ Top ]</span>
		</button>
	</div>
</footer>
