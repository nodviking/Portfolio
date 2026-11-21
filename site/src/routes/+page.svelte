<script lang="ts">
	import Hero from '#lib/components/sections/Hero.svelte';

	// Remaining scenes are scaffolding until their phases land.
	const scenes = [
		{ id: 'storeenv', label: 'StoreEnv' },
		{ id: 'work', label: 'Client work' },
		{ id: 'stack', label: 'Stack' },
		{ id: 'contact', label: 'Contact' }
	];
</script>

<Hero />

{#each scenes as scene (scene.id)}
	<section
		id={scene.id}
		aria-label={scene.label}
		class="grid min-h-svh place-items-center border-t border-line/40 px-[var(--gutter)]"
	>
		<h2 class="caps text-mute">{scene.label}</h2>
	</section>
{/each}
