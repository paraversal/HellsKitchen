<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Plus from '@lucide/svelte/icons/plus';
	import { resolve } from '$app/paths';
	import Badge from '#lib/components/Badge.svelte';
	import Button from '#lib/components/Button.svelte';
	import IconButton from '#lib/components/IconButton.svelte';
	import Plate from '#lib/components/Plate.svelte';
	import { plateLook } from '#lib/components/plate.ts';
	import Stepper from '#lib/components/Stepper.svelte';
	import { appData } from '#lib/app-data.ts';
	import { categoryName } from '#lib/categories.ts';
	import { planStore } from '#lib/plan/browser.ts';
	import { adding } from '#lib/plan/current.svelte.ts';
	import { formatAmount } from '#lib/format.ts';
	import { scaledIngredients } from '#lib/recipes.ts';

	// One recipe, for a number of portions. The amounts come from the kitchen engine.
	let { id }: { id: string } = $props();

	const DEFAULT_PORTIONS = 10;
	// The source of the first recipes is only the note that they came from the old sheet. Nobody needs to read that.
	const IMPORT_SOURCE = 'Old Excel sheet';

	const recipe = $derived(appData.recipes[id]);
	let portions = $state(DEFAULT_PORTIONS);
	const lines = $derived(scaledIngredients(appData, id, portions));
	// Counting up to 200 one by one takes long, so the steps get bigger.
	const step = $derived(portions >= 100 ? 10 : portions >= 20 ? 5 : 1);
	const source = $derived(recipe?.source && recipe.source !== IMPORT_SOURCE ? recipe.source : undefined);
</script>

{#if recipe}
	<article>
		<div class="hero" style:background="var(--color-{plateLook(id).rim})">
			<div class="back"><IconButton icon={ArrowLeft} label="Back to the recipes" href={resolve('/(app)/recipes')} /></div>
			<Plate seed={id} size={168} />
		</div>

		<header>
			<div class="plate"><Plate seed={id} size={120} /></div>
			<div class="titles">
				<h1>{recipe.name}</h1>
				<div class="tags">
					<Badge>{categoryName(recipe.category)}</Badge>
					{#if source}<span class="soft note">Source: {source}</span>{/if}
				</div>
			</div>
			<div class="action"><Button icon={Plus} disabled={planStore.status !== 'ready'} onclick={() => (adding.recipe = id)}>Add to plan</Button></div>
		</header>

		<div class="columns">
			<section class="ingredients">
				<Stepper name="portions" bind:value={portions} {step} min={1} label="Portions" size="medium" />
				<div class="heading">
					<h2>Ingredients</h2>
					<span class="soft note">{recipe.portion} g per portion</span>
				</div>
				<ul>
					{#each lines as line (line.id)}
						<li><span class="amount">{formatAmount(line.amount, line.unit)}</span><span>{line.name}</span></li>
					{/each}
				</ul>
			</section>

			{#if recipe.method}
				<section class="method">
					<h2>Method</h2>
					<p>{recipe.method}</p>
				</section>
			{/if}
		</div>

		<div class="cta"><Button icon={Plus} block disabled={planStore.status !== 'ready'} onclick={() => (adding.recipe = id)}>Add to plan</Button></div>
	</article>
{/if}

<style>
	article {
		padding-bottom: 104px;
	}
	/* A phone: a tinted band with the plate, then the recipe. */
	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end;
		gap: 0;
		position: relative;
		height: 262px;
		padding-bottom: var(--space-6);
	}
	.back {
		position: absolute;
		top: calc(var(--space-5) + env(safe-area-inset-top));
		left: var(--space-5);
	}
	header {
		padding: var(--space-5) var(--space-5) 0;
	}
	.plate,
	.action {
		display: none;
	}
	h1 {
		font-size: var(--text-title-large);
	}
	.tags {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 14px;
	}
	.note {
		font-size: var(--text-note);
	}
	.columns {
		display: flex;
		flex-direction: column;
		gap: var(--space-7);
		padding: 14px var(--space-5) 0;
	}
	.heading {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-top: var(--space-6);
	}
	h2 {
		margin: 0;
		font-size: var(--text-heading);
		font-weight: var(--weight-heavy);
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: 11px 0;
		border-top: 1px solid var(--color-line);
	}
	li:first-child {
		border-top: 0;
	}
	.amount {
		width: 88px;
		flex: none;
		text-align: right;
		font-size: var(--text-strong);
		font-weight: var(--weight-heavy);
		font-variant-numeric: tabular-nums;
	}
	.method h2 {
		margin-bottom: 14px;
	}
	.method p {
		margin: 0;
		white-space: pre-line;
		line-height: var(--leading-method);
	}
	.cta {
		position: fixed;
		inset: auto 0 0;
		padding: var(--space-3) var(--space-5) calc(var(--space-4) + env(safe-area-inset-bottom));
		background: var(--color-paper);
		border-top: var(--border);
	}

	/* A desktop: no band, the plate and the title side by side, the ingredients next to the method. */
	@media (min-width: 900px) {
		article {
			padding: var(--space-8) 48px;
		}
		.hero,
		.cta {
			display: none;
		}
		header {
			display: flex;
			align-items: center;
			gap: var(--space-6);
			padding: 0 0 var(--space-6);
			border-bottom: var(--border);
		}
		.plate,
		.action {
			display: block;
		}
		.titles {
			flex: 1;
		}
		h1 {
			font-size: 46px;
		}
		.tags {
			margin-top: var(--space-3);
		}
		.columns {
			display: grid;
			grid-template-columns: 360px 1fr;
			gap: 48px;
			align-items: start;
			padding: var(--space-7) 0 0;
		}
		.method h2 {
			font-size: var(--text-figure);
		}
	}
</style>
