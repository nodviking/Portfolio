<script lang="ts">
	let { size = 44 }: { size?: number } = $props();
</script>

<!-- Chrome "nv" mark inside a thin ring. Pure CSS/SVG so it renders before any JS. -->
<span
	class="relative grid place-items-center rounded-full border border-paper/70"
	style:width="{size}px"
	style:height="{size}px"
	aria-hidden="true"
>
	<span class="chrome-text font-display leading-none" style:font-size="{size * 0.5}px"
		>nv</span
	>
</span>
