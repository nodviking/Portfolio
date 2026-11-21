<script lang="ts">
	import { gsap } from '#lib/animations/gsap.ts';
	import { decode } from '#lib/actions/decode.ts';
	import { faq } from '#lib/data/faq.ts';
	import { sectionById, site } from '#lib/data/site.ts';
	import { motion } from '#lib/stores/motion.svelte.ts';

	/** [10] FAQ: sticky boxed heading on the left, a numbered accordion on the right (one open at a time). */
	let open = $state(-1);
	const meta = sectionById('faq');
	const pad = (n: number) => String(n).padStart(2, '0');

	function toggle(i: number) {
		open = open === i ? -1 : i;
	}

	function expand(node: HTMLElement) {
		if (motion.reduced) return;
		gsap.fromTo(node, { height: 0 }, { height: 'auto', duration: 0.5, ease: 'power4.out' });
	}
</script>

<section id="faq" data-section={meta.index} class="section" aria-labelledby="faq-title">
	<div class="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
		<div class="lg:sticky lg:top-[calc(var(--nav-h)+2rem)] lg:self-start">
			<p class="index-tag mb-5">[{meta.index}] / {meta.file}</p>
			<h2 id="faq-title" class="font-display text-[clamp(2.6rem,6.4vw,5.6rem)] text-paper">
				<span class="block" use:decode>Frequently</span>
				<span class="block" use:decode={{ delay: 0.1 }}>asked</span>
				<span class="boxword mt-1" data-text="QUESTIONS">Questions</span>
			</h2>
			<p class="mt-6 text-[13px] text-mute">
				Still curious? <a class="text-paper underline underline-offset-4 hover:text-accent" href="mailto:{site.email}"
					><span>Email me</span></a
				>
			</p>
		</div>

		<ol class="border-t border-line">
			{#each faq as item, i (item.q)}
				<li class="border-b border-line">
					<h3>
						<button
							type="button"
							class="row"
							aria-expanded={open === i}
							aria-controls="faq-{i}"
							onclick={() => toggle(i)}
							data-no-scramble
						>
							<span class="index-tag w-8 shrink-0">{pad(i + 1)}</span>
							<span class="flex-1 text-left text-[14px] font-semibold text-paper md:text-[15px]">{item.q}</span>
							<span class="plus" class:is-open={open === i} aria-hidden="true">+</span>
						</button>
					</h3>
					{#if open === i}
						<div id="faq-{i}" class="overflow-hidden" use:expand>
							<p class="pr-10 pb-6 pl-8 text-[14px] leading-[1.7] text-mute md:pl-12">{item.a}</p>
						</div>
					{/if}
				</li>
			{/each}
		</ol>
	</div>
</section>

<style>
	.row {
		display: flex;
		align-items: center;
		gap: 1rem;
		width: 100%;
		padding: 1.25rem 0;
	}
	@media (min-width: 768px) {
		.row {
			gap: 1.5rem;
		}
	}
	.row:hover .plus,
	.row:focus-visible .plus {
		color: var(--color-accent);
	}
	.plus {
		font-size: 1.4rem;
		line-height: 1;
		color: var(--color-paper);
		transition:
			transform 0.4s var(--ease-expo),
			color 0.2s;
	}
	.plus.is-open {
		transform: rotate(45deg);
		color: var(--color-accent);
	}
</style>
