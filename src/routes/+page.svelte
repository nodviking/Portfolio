<script lang="ts">
	import About from '#lib/components/sections/About.svelte';
	import Hero from '#lib/components/sections/Hero.svelte';

	// Remaining scenes are scaffolding until their phases land (order from ANSWERS.md section B).
	const scenes = [
		{ id: 'storeenv', label: 'StoreEnv' },
		{ id: 'work', label: 'Client work' },
		{ id: 'stack', label: 'Stack' },
		{ id: 'contact', label: 'Contact' }
	];
</script>

<Hero />
<About />

{#each scenes as scene (scene.id)}
	<section
		id={scene.id}
		aria-label={scene.label}
		class="grid min-h-[60svh] place-items-center border-t border-line px-[var(--gutter)]"
	>
		<h2 class="caps text-mute">{scene.label}</h2>
	</section>
{/each}
