<script lang="ts">
	import { theme } from '#lib/stores/theme.svelte.ts';

	/** Dark / light switch. Shows the theme you'd switch to. */
	let { class: className = '' }: { class?: string } = $props();
	const next = $derived(theme.current === 'light' ? 'dark' : 'light');
</script>

<button
	type="button"
	class="toggle {className}"
	aria-label="{theme.current === 'light' ? 'Light' : 'Dark'} mode, switch to {next}"
	aria-pressed={theme.current === 'light'}
	onclick={() => theme.toggle()}
	data-no-scramble
>
	<span class="knob" aria-hidden="true"></span>
	<span class="caps text-[10px]">{theme.current === 'light' ? 'Light' : 'Dark'}</span>
</button>

<style>
	.toggle {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		height: 32px;
		padding: 0 10px 0 6px;
		border: 1px solid var(--color-line-strong);
		color: var(--color-paper);
		transition: border-color 0.3s;
	}
	.toggle:hover {
		border-color: var(--color-accent-ink);
	}
	.knob {
		position: relative;
		width: 26px;
		height: 14px;
		border: 1px solid currentColor;
	}
	.knob::after {
		content: '';
		position: absolute;
		top: 2px;
		left: 2px;
		width: 8px;
		height: 8px;
		background: var(--color-accent-ink);
		transition: transform 0.35s var(--ease-expo);
	}
	:global(html[data-theme='light']) .knob::after {
		transform: translateX(12px);
	}
</style>
