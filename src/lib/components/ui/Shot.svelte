<script lang="ts">
	/** A client screenshot from static/work/ as AVIF with a WebP fallback. Intrinsic size set to avoid layout shift. */
	let {
		slug,
		variant = 'desktop',
		alt,
		eager = false,
		class: className = ''
	}: {
		slug: string;
		variant?: 'desktop' | 'mobile';
		alt: string;
		eager?: boolean;
		class?: string;
	} = $props();

	const size = $derived(variant === 'desktop' ? { w: 1440, h: 900 } : { w: 780, h: 1688 });
	const base = $derived(`/work/${slug}-${variant}`);
</script>

<picture>
	<source srcset="{base}.avif" type="image/avif" />
	<img
		src="{base}.webp"
		{alt}
		width={size.w}
		height={size.h}
		loading={eager ? 'eager' : 'lazy'}
		fetchpriority={eager ? 'high' : 'auto'}
		decoding="async"
		class="block h-auto w-full {className}"
	/>
</picture>
