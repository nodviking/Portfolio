<script lang="ts">
	import { gsap } from '#lib/animations/gsap.ts';
	import { site } from '#lib/data/site.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';

	/** "NODVIKING" next to the logo cube. Decodes from ciphertext after the intro; re-scrambles on hover. */
	const CHARS = 'ABCDEF0123456789{}<>=/#';

	let el: HTMLSpanElement;

	function decode(duration = 1) {
		if (motion.reduced) return;
		gsap.to(el, {
			duration,
			overwrite: true,
			scrambleText: { text: site.brand, chars: CHARS, revealDelay: 0.15, speed: 0.6 }
		});
	}

	$effect(() => {
		if (!motion.introDone) return;
		decode(1.1);
		return () => gsap.killTweensOf(el);
	});
</script>

<span
	bind:this={el}
	class="text-[13px] leading-none font-extrabold tracking-[0.02em] text-paper uppercase"
	aria-hidden="true"
	onpointerenter={() => decode(0.8)}>{site.brand}</span
>
