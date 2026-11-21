<script lang="ts">
	import { secretCipher, terminal } from '#lib/data/storeenv.ts';

	/**
	 * Framed fake terminal. `progress` (0..1) drives everything, so it can be tied to scroll:
	 * characters type in line by line, and once the sample secret line has typed it scrambles into ciphertext
	 * and back. Every line has a reserved height, so nothing reflows while typing.
	 */
	let { progress = 0 }: { progress?: number } = $props();

	const lens = terminal.map((l) => l.text.length);
	const total = lens.reduce((a, b) => a + b, 0);
	const starts = lens.reduce<number[]>((acc, _, i) => [...acc, i === 0 ? 0 : acc[i - 1] + lens[i - 1]], []);
	const secretIndex = terminal.findIndex((l) => l.secret);
	const secretEnd = (starts[secretIndex] + lens[secretIndex]) / total;
	const HEX = '0123456789abcdef';

	// Typing finishes at 85% of progress so the last line can sit for a moment.
	const typed = $derived(Math.min(total, Math.round((progress / 0.85) * total)));

	function lineText(i: number): string {
		const visible = Math.max(0, Math.min(lens[i], typed - starts[i]));
		const text = terminal[i].text.slice(0, visible);
		if (i !== secretIndex || visible < lens[i]) return text;
		// Encrypt → decrypt window, measured in progress units after the line finished typing.
		const a = secretEnd * 0.85 + 0.03;
		const t = (progress - a) / 0.3;
		if (t <= 0 || t >= 1) return text;
		const plain = terminal[i].text;
		const k = t < 0.5 ? t / 0.5 : 1 - (t - 0.5) / 0.5; // 0 → 1 → 0
		const edge = Math.floor(k * plain.length);
		let out = '';
		for (let c = 0; c < plain.length; c++) {
			if (c < 13) out += plain[c]; // keep the key name readable
			else if (c < edge) out += secretCipher[c];
			else if (c < edge + 3) out += HEX[(c * 7 + Math.floor(progress * 400)) % 16];
			else out += plain[c];
		}
		return out;
	}

	const lines = $derived(terminal.map((_, i) => lineText(i)));
	const cursorLine = $derived(starts.findIndex((s, i) => typed >= s && typed < s + lens[i]));
</script>

<div class="frame bg-ink">
	<span class="tab-label">STOREENV.CLI — ZSH</span>
	<div class="flex items-center gap-2 border-b border-line px-4 py-3" aria-hidden="true">
		<span class="size-2 bg-line-strong"></span><span class="size-2 bg-line-strong"></span><span
			class="size-2 bg-accent"
		></span>
		<span class="ml-3 text-[11px] text-mute">~/projects/acme</span>
	</div>
	<p class="sr-only">
		Terminal demo: {terminal.map((l) => l.text).join('. ')}
	</p>
	<pre class="term" aria-hidden="true"><code
			>{#each terminal as l, i (i)}<span class="ln ln--{l.kind}" class:is-secret={l.secret}
					>{#if l.kind === 'cmd' && lines[i].length > 0}<span class="text-accent">{lines[i].slice(0, 1)}</span
						>{lines[i].slice(1)}{:else if l.kind === 'ok' && lines[i].length > 0}<span class="text-accent"
							>{lines[i].slice(0, 1)}</span
						>{lines[i].slice(1)}{:else}{lines[i]}{/if}{#if i === cursorLine}<span class="caret"
						></span>{/if}</span
				>{/each}</code
		></pre>
</div>

<style>
	.term {
		margin: 0;
		padding: 16px 18px 20px;
		font-family: var(--font-mono);
		font-size: clamp(11px, 0.9vw, 13px);
		line-height: 1.75;
		color: var(--color-paper);
		white-space: pre;
		overflow: hidden;
	}
	.ln {
		display: block;
		min-height: 1.75em;
	}
	.ln--dim {
		color: var(--color-mute);
	}
	.ln--out {
		color: var(--color-paper);
	}
	.is-secret {
		color: var(--color-paper);
	}
	.caret {
		display: inline-block;
		width: 0.6em;
		height: 1.1em;
		vertical-align: -0.2em;
		background: var(--color-accent);
	}
</style>
