<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Settings from '@lucide/svelte/icons/settings';
	import IconButton from '#lib/components/IconButton.svelte';
	import { appData } from '#lib/app-data.ts';
	import SettingsSheet from '#lib/screens/SettingsSheet.svelte';

	// What the app has to cook with: the recipes and ingredients of this version, how complete they are, and where things are bought.
	// It comes from the files in data/; the gear opens the settings of the app.
	const health = appData.health;
	let settings = $state(false);

	const count = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

	type Gap = { label: string; have: number; of: number; missing?: { id: string; name: string }[]; without?: string; hint?: string };
	const gaps: Gap[] = health
		? [
				{ label: 'Ingredients with a price', have: health.ingredients.bought - health.ingredients.noPrice.length, of: health.ingredients.bought, missing: health.ingredients.noPrice, without: 'without a price', hint: 'The ones without count as free, so a cost that uses them is marked as partial.' },
				{ label: 'Recipes with a method', have: health.recipes.inApp - health.recipes.noCooking - health.recipes.noMethod.length, of: health.recipes.inApp - health.recipes.noCooking, missing: health.recipes.noMethod, without: 'without a method', hint: 'Recipes that need no cooking, like jam, are left out.' },
				{ label: 'Recipes with a photo', have: health.recipes.inApp - health.recipes.noPhoto.length, of: health.recipes.inApp, missing: health.recipes.noPhoto, without: 'without a photo', hint: 'The others show the icon of their kind. A photo goes in data/images/, named after the recipe.' },
				{ label: 'Ingredients with a pack size', have: health.ingredients.weighed - health.ingredients.noPack, of: health.ingredients.weighed, hint: 'Only for what is weighed. Without one, the shopping list shows the exact amount instead of whole packs.' }
			]
		: [];

	// The stores in the colours of the app, the busiest first. "Not bought" (water from the tap) stays grey and out of the bar.
	const COLOURS = ['tomato', 'leaf', 'mustard', 'sky', 'plum'];
	const stores = health ? health.stores.filter((s) => s.id !== 'none').map((s, i) => ({ ...s, colour: `var(--color-${COLOURS[i % COLOURS.length]})` })) : [];
	const notBought = health?.stores.find((s) => s.id === 'none');
</script>

<div class="screen">
	<header>
		<h1>Pantry</h1>
		<IconButton icon={Settings} label="Settings" onclick={() => (settings = true)} />
	</header>

	{#if health}
		<div class="pantry">
			<div class="column">
				<section>
					<h2>How complete</h2>
					{#each gaps as gap (gap.label)}
						{#snippet line()}
							<span class="top">
								<span class="label">{gap.label}</span>
								<b>{gap.have} / {gap.of}</b>
								{#if gap.missing?.length}<ChevronRight size={18} />{/if}
							</span>
							<span class="meter" role="meter" aria-label={gap.label} aria-valuemin={0} aria-valuemax={gap.of} aria-valuenow={gap.have}>
								<span class="fill" style:width="{gap.of ? (gap.have / gap.of) * 100 : 0}%"></span>
							</span>
						{/snippet}
						{#if gap.missing?.length}
							<details>
								<summary>{@render line()}</summary>
								{#if gap.hint}<p class="soft note">{gap.hint}</p>{/if}
								<h3>{gap.missing.length} {gap.without}</h3>
								<ul class="names">
									{#each gap.missing as item (item.id)}<li>{item.name}</li>{/each}
								</ul>
							</details>
						{:else}
							<div class="gap">
								{@render line()}
								{#if gap.hint}<p class="soft note">{gap.hint}</p>{/if}
							</div>
						{/if}
					{/each}
				</section>

				{#if health.recipes.needsReview.length}
					<section>
						<h2>Waiting for review</h2>
						<details>
							<summary>
								<span class="top">
									<span class="label">{count(health.recipes.needsReview.length, 'recipe')} left out of the app</span>
									<ChevronRight size={18} />
								</span>
							</summary>
							<p class="soft note">They come back once someone has checked their amounts.</p>
							<ul class="names">
								{#each health.recipes.needsReview as recipe (recipe.id)}
									<li>{recipe.name}{#if recipe.note}<span class="soft note">{recipe.note}</span>{/if}</li>
								{/each}
							</ul>
						</details>
					</section>
				{/if}
			</div>

			<div class="column">
				<section>
					<h2>Stores</h2>
					<div class="bar" aria-hidden="true">
						{#each stores as store (store.id)}<span style:flex-grow={store.ingredients} style:background={store.colour}></span>{/each}
					</div>
					<ul class="stores">
						{#each stores as store (store.id)}
							<li><span class="dot" style:background={store.colour}></span><span class="label">{store.name}</span><b>{count(store.ingredients, 'ingredient')}</b></li>
						{/each}
						{#if notBought?.ingredients}
							<li class="soft"><span class="dot"></span><span class="label">{notBought.name}</span><b>{count(notBought.ingredients, 'ingredient')}</b></li>
						{/if}
					</ul>
				</section>

				<section>
					<h2>Odds and ends</h2>
					{#if health.ingredients.unused.length}
						<details>
							<summary>
								<span class="top">
									<span class="label">Ingredients no recipe uses</span>
									<b>{health.ingredients.unused.length}</b>
									<ChevronRight size={18} />
								</span>
							</summary>
							<ul class="names">
								{#each health.ingredients.unused as item (item.id)}<li>{item.name}</li>{/each}
							</ul>
						</details>
					{/if}
					<div class="gap"><span class="top"><span class="label">Recipes that need no cooking</span><b>{health.recipes.noCooking}</b></span></div>
					<div class="gap"><span class="top"><span class="label">Notes from the checks</span><b>{count(health.checks.warnings, 'warning')}, {count(health.checks.notes, 'note')}</b></span></div>
				</section>
			</div>
		</div>
	{:else}
		<p class="soft">This version of the app was built without the health of its data.</p>
	{/if}
</div>

<SettingsSheet bind:open={settings} />

<style>
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}
	.pantry {
		display: flex;
		flex-direction: column;
		gap: var(--space-7);
		max-width: 720px;
		margin-top: var(--space-5);
	}
	.column {
		display: flex;
		flex-direction: column;
		gap: var(--space-7);
	}
	/* A desktop with room for both: what there is and how complete it is on the left, where it is bought on the right. */
	@media (min-width: 1100px) {
		.pantry {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			align-items: start;
			gap: var(--space-8);
			max-width: none;
		}
	}
	section {
		display: flex;
		flex-direction: column;
	}
	h2 {
		margin: 0 0 var(--space-2);
		font-size: var(--text-heading);
		font-weight: var(--weight-heavy);
	}
	p {
		margin: 0;
	}
	.note {
		font-size: var(--text-small);
	}

	details,
	.gap,
	.stores li {
		border-top: 1px solid var(--color-line);
	}
	summary,
	.gap {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-3) 0;
	}
	summary {
		cursor: pointer;
		list-style: none;
	}
	summary::-webkit-details-marker {
		display: none;
	}
	.top {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}
	.label {
		flex: 1;
		min-width: 0;
		font-weight: var(--weight-bold);
	}
	b {
		font-variant-numeric: tabular-nums;
	}
	.top :global(svg) {
		flex: none;
		color: var(--color-ink-soft);
		transition: transform var(--motion-quick) var(--ease-out);
	}
	details[open] .top :global(svg) {
		transform: rotate(90deg);
	}
	details > .note {
		padding-bottom: var(--space-3);
	}
	/* What the list under it holds, so it does not read as part of the line above. */
	details h3 {
		margin: 0;
		padding: var(--space-2) 0 var(--space-1) var(--space-3);
		color: var(--color-ink-soft);
		font-size: var(--text-small);
		font-weight: var(--weight-heavy);
	}

	.meter {
		display: block;
		height: 10px;
		border-radius: 5px;
		background: var(--color-line);
		overflow: hidden;
	}
	.fill {
		display: block;
		height: 100%;
		border-radius: 5px;
		background: var(--color-leaf);
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.names {
		padding-bottom: var(--space-3);
	}
	.names li {
		display: flex;
		flex-direction: column;
		padding: 5px 0 5px var(--space-3);
	}

	/* One bar, cut into the stores by how many ingredients each has. */
	.bar {
		display: flex;
		gap: 3px;
		height: 16px;
		margin: var(--space-2) 0 var(--space-4);
	}
	.bar span {
		flex-basis: 0;
		min-width: 6px;
		border-radius: 4px;
	}
	.bar span:first-child {
		border-radius: 8px 4px 4px 8px;
	}
	.bar span:last-child {
		border-radius: 4px 8px 8px 4px;
	}
	.stores li {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) 0;
	}
	.dot {
		flex: none;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--color-line);
	}
</style>
