<script lang="ts">
	import { untrack } from 'svelte';
	import { easing } from '#lib/motion/easing.ts';

	// A number whose digits roll to their new value, each on its own, like an odometer. Anything that is not a digit ("€", ",", " kg") stays still.
	// `laps` makes a digit go round that many extra times before it lands, like a slot machine.
	let { text, laps = 0, duration = 600 }: { text: string; laps?: number; duration?: number } = $props();

	const chars = $derived([...text]);
	let columns: (HTMLElement | undefined)[] = [];
	let previous = untrack(() => text);
	const isDigit = (c: string | undefined) => c !== undefined && /\d/.test(c);
	// The digits of a column are drawn by CSS, not written in the page, so copying the number or searching the page does not pick up 0123456789.
	const digits = $derived(`"${Array.from({ length: 10 * (laps + 3) }, (_, n) => n % 10).join('\\A ')}"`);

	$effect(() => {
		const now = [...text].reverse();
		const before = [...previous].reverse();
		const count = now.length;
		const changed = previous !== text;
		previous = text;
		if (!changed || document.documentElement.dataset.motion === 'off') return;
		now.forEach((c, i) => {
			const column = columns[count - 1 - i];
			if (!column || !isDigit(c)) return;
			const from = isDigit(before[i]) ? Number(before[i]) : Number(c);
			column.animate(
				[{ transform: `translateY(${-(from + 10)}em)` }, { transform: `translateY(${-(Number(c) + 10 + 10 * laps)}em)` }],
				{ duration: duration + laps * 350, easing: laps ? 'cubic-bezier(0.2, 0.7, 0.2, 1)' : easing('spring-soft') }
			);
		});
	});
</script>

<span class="odometer" role="img" aria-label={text}>
	{#each chars as c, i (chars.length - i)}
		{#if isDigit(c)}
			<span class="window" aria-hidden="true">
				<span class="column" bind:this={columns[i]} style:transform="translateY({-(Number(c) + 10)}em)" style:--digits={digits}>
				</span>
			</span>
		{:else}
			<span class="still" aria-hidden="true">{c}</span>
		{/if}
	{/each}
</span>

<style>
	.odometer {
		display: inline-flex;
		line-height: 1;
		font-variant-numeric: tabular-nums;
	}
	.window {
		display: inline-block;
		height: 1em;
		overflow: hidden;
	}
	.column {
		display: block;
	}
	.column::before {
		content: var(--digits);
		display: block;
		white-space: pre;
		line-height: 1;
	}
	.still {
		display: inline-block;
		height: 1em;
		white-space: pre;
	}
</style>
