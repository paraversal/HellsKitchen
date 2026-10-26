<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Plus from '@lucide/svelte/icons/plus';
	import { resolve } from '$app/paths';
	import { slash } from '#lib/paths.ts';
	import Badge from '#lib/components/Badge.svelte';
	import Button from '#lib/components/Button.svelte';
	import IconButton from '#lib/components/IconButton.svelte';
	import RecipeImage from '#lib/components/RecipeImage.svelte';
	import { RECIPE_KINDS } from '#lib/components/recipe-kinds.ts';
	import Stepper from '#lib/components/Stepper.svelte';
	import { appData } from '#lib/app-data.ts';
	import { categoryName } from '#lib/categories.ts';
	import { planStore } from '#lib/plan/browser.ts';
	import { adding } from '#lib/plan/current.svelte.ts';
	import { formatAmount } from '#lib/format.ts';
	import { strength } from '#lib/motion/fun.svelte.ts';
	import { recipeOpened } from '#lib/motion/recipeopen.svelte.ts';
	import Odometer from '#lib/components/Odometer.svelte';
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
	let page = $state<HTMLElement>();
	const visible = (el: Element) => (el as HTMLElement).offsetParent !== null;
	// C3. When the page of a recipe appears, it makes its entrance (with fun).
	$effect(() => {
		const current = id;
		if (!page) return;
		void recipeOpened(current, [...document.querySelectorAll(`[data-plate="${current}"]`)].find((el) => page?.contains(el) && visible(el)), page);
	});
	const source = $derived(recipe?.source && recipe.source !== IMPORT_SOURCE ? recipe.source : undefined);
</script>

{#if recipe}
	<article bind:this={page}>
		<div class="hero" style:background="var(--color-{RECIPE_KINDS[recipe.category].tint})">
			<div class="back"><IconButton icon={ArrowLeft} label="Back to the recipes" href={slash(resolve('/(app)/recipes'))} /></div>
			<span class="hero-plate" data-plate={id} style:view-transition-name="hk-plate"><RecipeImage {id} size={168} /></span>
		</div>

		<header>
			<div class="plate" data-plate={id}><RecipeImage {id} size={120} /></div>
			<div class="titles">
				<h1>{recipe.name}</h1>
				<div class="tags">
					<Badge>{categoryName(recipe.category)}</Badge>
					{#if recipe.noCooking}<Badge tone="leaf">No cooking</Badge>{/if}
					{#if source}<span class="soft note">Source: {source}</span>{/if}
				</div>
			</div>
			<div class="action"><Button icon={Plus} disabled={planStore.status === 'unreadable'} onclick={() => (adding.recipe = id)}>Add to plan</Button></div>
		</header>

		<div class="columns">
			<section class="ingredients">
				<Stepper name="portions" bind:value={portions} {step} min={1} label="Portions" size="medium" />
				<p class="hint">Just for trying out this recipe. It does not use or change your plan.</p>
				<div class="heading">
					<h2>Ingredients</h2>
					<span class="soft note">{recipe.portion} g per portion</span>
				</div>
				<ul>
					{#each lines as line, i (line.id)}
						<li class={strength('C5') === 'playful' ? 'drop' : 'fade'} style:--i={i}><span class="amount"><Odometer text={formatAmount(line.amount, line.unit)} /></span><span>{line.name}</span></li>
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

		<div class="cta"><Button icon={Plus} block disabled={planStore.status === 'unreadable'} onclick={() => (adding.recipe = id)}>Add to plan</Button></div>
	</article>
{/if}

<style>
	article {
		padding-bottom: calc(104px + env(safe-area-inset-bottom));
	}
	/* A phone: a tinted band with the plate, then the recipe. */
	.hero-plate {
		display: inline-flex;
	}
	/* C5. The ingredients arrive one after the other: they fade up, or with fun they drop in and settle. */
	li.fade {
		animation: arrive var(--motion-normal) var(--ease-out) backwards;
		animation-delay: calc(min(var(--i), 8) * 25ms);
	}
	li.drop {
		animation: drop-in 550ms var(--spring-bouncy) backwards;
		animation-delay: calc(min(var(--i), 8) * 25ms);
	}
	@keyframes arrive {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
	}
	@keyframes drop-in {
		from {
			opacity: 0;
			transform: translateY(-22px);
		}
	}
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
	.hint {
		margin: var(--space-3) 0 0;
		color: var(--color-ink-soft);
		font-size: var(--text-note);
	}
	.heading {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-top: var(--space-5);
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
