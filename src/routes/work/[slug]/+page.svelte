<script lang="ts">
	import { decode } from '#lib/actions/decode.ts';
	import { frameDraw } from '#lib/actions/frameDraw.ts';
	import { lines } from '#lib/actions/lines.ts';
	import { magnetic } from '#lib/actions/magnetic.ts';
	import Seo from '#lib/components/ui/Seo.svelte';
	import Shot from '#lib/components/ui/Shot.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const c = $derived(data.client);
	const pad = (n: number) => String(n).padStart(2, '0');

	const spec = $derived([
		{ k: 'Client', v: c.name },
		{ k: 'Category', v: c.category },
		{ k: 'Role', v: c.role },
		{ k: 'Stack', v: c.stack.join(' · ') },
		{ k: 'Scope', v: c.scope.join(' · ') },
		{ k: 'Year', v: c.year }
	]);
</script>

<Seo
	title="{c.name} — case study · nodviking"
	description={c.description}
	path="/work/{c.slug}"
/>

{#key c.slug}
	<article data-section="04" class="section pt-[calc(var(--nav-h)+3rem)]" aria-labelledby="case-title">
		<div class="mb-10 flex items-center gap-4">
			<a href="/#work" class="caps text-mute hover:text-accent"><span>← All work</span></a>
			<span class="h-px flex-1 bg-line" aria-hidden="true"></span>
			<p class="index-tag shrink-0">[04] / CLIENTS.LOG / {pad(data.index + 1)}</p>
		</div>

		<p class="caps mb-4 text-mute">{c.category}</p>
		<h1 id="case-title" class="font-display text-[clamp(2.6rem,8.4vw,8rem)] text-paper" use:decode>{c.name}</h1>

		<div class="frame mt-12" use:frameDraw>
			<span class="tab-label">01 / DESKTOP</span>
			<Shot slug={c.slug} alt="{c.name} website, desktop homepage" eager />
		</div>

		<div class="mt-14 grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-14">
			<dl class="frame self-start" use:frameDraw>
				<span class="tab-label">02 / SPEC.TXT</span>
				{#each spec as row (row.k)}
					<div class="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-line px-5 py-4 last:border-b-0">
						<dt class="caps text-[11px] text-mute">{row.k}</dt>
						<dd class="text-[14px] leading-[1.55] text-paper">{row.v}</dd>
					</div>
				{/each}
			</dl>

			<div>
				<p class="text-[clamp(1.05rem,1.6vw,1.35rem)] leading-[1.55] text-paper" use:lines>{c.description}</p>
				<a
					href={c.url}
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn--lg mt-8"
					use:magnetic={{ strength: 0.2 }}
				>
					<span>Visit live site</span><span aria-hidden="true" data-no-scramble>↗</span>
				</a>
			</div>
		</div>

		<div class="mt-16 grid items-start gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
			<div class="frame" use:frameDraw>
				<span class="tab-label">03 / DESKTOP.1440</span>
				<Shot slug={c.slug} alt="{c.name} website at 1440 pixels wide" />
			</div>
			<div class="frame mx-auto w-full max-w-[320px]" use:frameDraw={{ delay: 0.12 }}>
				<span class="tab-label">04 / MOBILE.390</span>
				<Shot slug={c.slug} variant="mobile" alt="{c.name} website on a phone" />
			</div>
		</div>

		<nav aria-label="More projects" class="mt-20 grid gap-6 md:grid-cols-2">
			<a href="/work/{data.prev.slug}" class="frame frame--lift block p-6" data-cursor>
				<span class="tab-label">← Prev</span>
				<span class="caps block text-mute">{data.prev.category}</span>
				<span class="mt-2 block font-display text-[clamp(1.6rem,3vw,2.6rem)] text-paper">{data.prev.name}</span>
			</a>
			<a href="/work/{data.next.slug}" class="frame frame--lift block p-6 text-right" data-cursor>
				<span class="tab-label">Next →</span>
				<span class="caps block text-mute">{data.next.category}</span>
				<span class="mt-2 block font-display text-[clamp(1.6rem,3vw,2.6rem)] text-paper">{data.next.name}</span>
			</a>
		</nav>
	</article>
{/key}
