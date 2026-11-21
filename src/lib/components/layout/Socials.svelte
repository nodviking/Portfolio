<script lang="ts">
	import Icon from '#lib/components/ui/Icon.svelte';
	import { socials } from '#lib/data/site.ts';

	let { class: className = '', size = 15 }: { class?: string; size?: number } = $props();
</script>

<ul class="flex items-center gap-3 {className}">
	{#each socials as s (s.href)}
		<li>
			<a
				href={s.href}
				target={s.icon === 'mail' ? undefined : '_blank'}
				rel={s.icon === 'mail' ? undefined : 'noopener noreferrer'}
				class="grid size-8 place-items-center text-mute transition-colors duration-300 hover:text-accent"
				aria-label={s.label}
			>
				<Icon name={s.icon} {size} />
			</a>
		</li>
	{/each}
</ul>
