<script lang="ts">
	import { site } from '#lib/data/site.ts';

	let { seconds = false }: { seconds?: boolean } = $props();

	// Rendered as a fixed-width placeholder on the server so hydration never shifts layout.
	let now = $state<Date | null>(null);

	const fmt = $derived(
		new Intl.DateTimeFormat('en-IN', {
			timeZone: site.timeZone,
			hour: '2-digit',
			minute: '2-digit',
			second: seconds ? '2-digit' : undefined,
			hour12: false
		})
	);

	$effect(() => {
		now = new Date();
		const id = setInterval(() => (now = new Date()), 1000);
		return () => clearInterval(id);
	});

	const text = $derived(now ? fmt.format(now) : seconds ? '--:--:--' : '--:--');
</script>

<time class="tabular-nums" datetime={now?.toISOString()}>
	{text}<span class="sr-only"> in {site.location}</span>
	<span aria-hidden="true">{site.timeZoneLabel}</span>
</time>
