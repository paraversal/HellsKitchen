<script lang="ts">
	import { appData } from '#lib/app-data.ts';
	import { MEAL_TYPES } from '#lib/components/meal-types.ts';
	import { planStore } from '#lib/plan/browser.ts';
	import { recipeSheets, sheetFacts } from '#lib/plan/sheets.ts';

	// One page for every dish of the plan, scaled to the meal it is cooked for: who eats it, how much, and the method.
	const sheets = $derived(planStore.plan ? recipeSheets(planStore.plan, appData) : []);
</script>

{#each sheets as sheet (sheet.key)}
	<article>
		<p class="when">{sheet.day.name} {sheet.day.date} · {MEAL_TYPES[sheet.meal].label}{sheet.time ? ` ${sheet.time}` : ''}</p>
		<h1>{sheet.name}</h1>
		<p class="facts">{sheetFacts(sheet).join(' · ')}</p>

		<h2>Ingredients</h2>
		<ul>
			{#each sheet.lines as line (line.id)}
				<li><span>{line.name}</span><span class="amount">{line.amount}</span></li>
			{/each}
		</ul>

		{#if sheet.method}
			<h2>Method</h2>
			<p class="method">{sheet.method}</p>
		{/if}
	</article>
{:else}
	<p>No dishes in the plan yet. Put dishes in a meal first.</p>
{/each}

<style>
	article + article {
		break-before: page;
		margin-top: 56px;
	}
	p {
		margin: 0;
	}
	.when {
		font-size: var(--text-small);
		font-weight: var(--weight-bold);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	h1 {
		margin: 4px 0 6px;
		font-size: 30px;
		font-weight: var(--weight-heavy);
		overflow-wrap: anywhere;
	}
	.facts {
		padding-bottom: var(--space-3);
		border-bottom: 2px solid #000;
		font-size: var(--text-body);
	}
	h2 {
		margin: var(--space-5) 0 var(--space-2);
		font-size: var(--text-strong);
		font-weight: var(--weight-heavy);
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
		columns: 2;
		column-gap: var(--space-8);
	}
	li {
		display: flex;
		justify-content: space-between;
		gap: var(--space-3);
		padding: 5px 0;
		border-bottom: 1px solid #bbb;
		break-inside: avoid;
	}
	.amount {
		font-weight: var(--weight-bold);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.method {
		white-space: pre-line;
		line-height: var(--leading-method);
	}
	@media (max-width: 520px) {
		ul {
			columns: 1;
		}
	}
	@media print {
		article + article {
			margin-top: 0;
		}
	}
</style>
