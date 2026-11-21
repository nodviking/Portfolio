<script lang="ts">
	import { site } from '#lib/data/site.ts';

	// Phase 1 shell: scene scaffolding only. Each scene is replaced by its real section in later phases.
	const scenes = [
		{ id: 'about', label: 'About' },
		{ id: 'storeenv', label: 'StoreEnv' },
		{ id: 'work', label: 'Client work' },
		{ id: 'stack', label: 'Stack' },
		{ id: 'contact', label: 'Contact' }
	];
</script>

<section class="grid min-h-svh place-items-center px-[var(--gutter)] text-center">
	<div>
		<h1
			class="glow-text font-display text-[clamp(4.5rem,19vw,19rem)] leading-[0.85] uppercase"
		>
			{site.brand}
		</h1>
		<p class="caps mx-auto mt-6 max-w-[34ch] text-paper/90">
			{site.role}. Full-stack products, developer tools and websites for brands.
		</p>
	</div>
</section>

{#each scenes as scene (scene.id)}
	<section
		id={scene.id}
		aria-label={scene.label}
		class="grid min-h-svh place-items-center border-t border-line/40 px-[var(--gutter)]"
	>
		<h2 class="caps text-mute">{scene.label}</h2>
	</section>
{/each}
