<script lang="ts">
	import { gsap } from '#lib/animations/gsap.ts';
	import { site } from '#lib/data/site.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';

	/**
	 * Sky-blue "nodviking" wordmark that decodes from ciphertext once the intro finishes,
	 * and re-scrambles on hover (as on the original React navbar).
	 */
	const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+=<>/\\|';

	let el: HTMLSpanElement;

	function decode(duration = 1.4) {
		if (motion.reduced) return;
		gsap.to(el, {
			duration,
			overwrite: true,
			scrambleText: { text: site.brand, chars: CHARS, revealDelay: 0.25, speed: 0.5 }
		});
	}

	$effect(() => {
		if (!motion.introDone) return;
		decode(1.6);
		return () => gsap.killTweensOf(el);
	});
</script>

<span
	bind:this={el}
	class="glow-text-sm font-display text-[20px] leading-none tracking-[0.06em] uppercase md:text-[22px]"
	aria-hidden="true"
	onpointerenter={() => decode(1)}>{site.brand}</span
>
