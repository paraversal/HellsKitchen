<script lang="ts">
	// The estimated cost of the plan, and how much of the food that estimate is based on.
	let { amount, coverage }: { amount: string; coverage: number | null } = $props();
	const percent = $derived(coverage === null ? null : Math.round(coverage * 100));
</script>

<div class="cost">
	<div>
		<div class="caption">Estimated cost</div>
		<div class="amount">{amount}</div>
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
		height: 100%;
		border-radius: 4px;
		background: var(--color-mustard);
	}
</style>
