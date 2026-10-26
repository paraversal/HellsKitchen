<script lang="ts">
	import { untrack } from 'svelte';
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { allows } from '#lib/motion/mode.svelte.ts';

	// The estimated cost of the plan, and how much of the food that estimate is based on.
	// B6. Given a `value` and a `format`, the amount counts up or down to its new value instead of jumping.
	type Props = { amount?: string; value?: number; format?: (value: number) => string; caption?: string; coverage: number | null };
	let { amount, value, format, caption = 'Estimated cost', coverage }: Props = $props();
	const counter = new Tween(untrack(() => value ?? 0), { duration: 600, easing: cubicOut });
	$effect(() => {
		if (value !== undefined) void counter.set(value, { duration: allows.flights() ? 600 : 0 });
	});
	const shown = $derived(value !== undefined && format ? format(counter.current) : (amount ?? ''));
	const percent = $derived(coverage === null ? null : Math.round(coverage * 100));
</script>

<div class="cost">
	<div>
		<div class="caption">{caption}</div>
		<div class="amount">{shown}</div>
	</div>
	{#if percent !== null}
		<div class="coverage">
			<div class="meter" role="meter" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Share of the food that has a price">
				<div class="fill" style:width="{percent}%"></div>
			</div>
			<div class="caption">{percent} % of food priced</div>
		</div>
	{/if}
</div>

<style>
	.cost {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}
	.caption {
		color: var(--color-ink-soft);
		font-size: var(--text-note);
		white-space: nowrap;
	}
	.amount {
		font-size: var(--text-figure);
		font-weight: var(--weight-heavy);
		line-height: 1.2;
	}
	.coverage {
		display: flex;
		flex-direction: column;
		gap: 6px;
		width: 120px;
	}
	.meter {
		height: 8px;
		border-radius: 4px;
		background: var(--color-line);
		overflow: hidden;
	}
	.fill {
		transition: width 600ms var(--spring-soft);
		height: 100%;
		border-radius: 4px;
		background: var(--color-mustard);
	}
</style>
