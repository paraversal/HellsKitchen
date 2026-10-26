<script lang="ts">
	import { onMount } from 'svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Flame from '@lucide/svelte/icons/flame';
	import Plus from '@lucide/svelte/icons/plus';
	import Printer from '@lucide/svelte/icons/printer';
	import Share2 from '@lucide/svelte/icons/share-2';
	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
	import { resolve } from '$app/paths';
	import ActionRow from '#lib/components/ActionRow.svelte';
	import AddRow from '#lib/components/AddRow.svelte';
	import Badge from '#lib/components/Badge.svelte';
	import Button from '#lib/components/Button.svelte';
	import Check from '#lib/components/Check.svelte';
	import Chip from '#lib/components/Chip.svelte';
	import CostBlock from '#lib/components/CostBlock.svelte';
	import DayLabel from '#lib/components/DayLabel.svelte';
	import IconButton from '#lib/components/IconButton.svelte';
	import MealRow from '#lib/components/MealRow.svelte';
	import { MEAL_TYPES } from '#lib/components/meal-types.ts';
	import NoPricePill from '#lib/components/NoPricePill.svelte';
	import Plate from '#lib/components/Plate.svelte';
	import QrCode from '#lib/components/QrCode.svelte';
	import SearchField from '#lib/components/SearchField.svelte';
	import ShopRow from '#lib/components/ShopRow.svelte';
	import Stepper from '#lib/components/Stepper.svelte';
	import StoreTabs from '#lib/components/StoreTabs.svelte';

	// The style sheet: every color, the type, and every shared component, as they are in the code.
	// Compare it with the "Design System" frame in UI.fig. Nothing here is real data.
	const groups = [
		{ title: 'Base', names: ['paper', 'sheet', 'line', 'ink-soft', 'ink'] },
		{ title: 'Accents', names: ['tomato', 'mustard', 'leaf', 'plum', 'sky'] },
		{ title: 'Tints', names: ['tomato-tint', 'mustard-tint', 'leaf-tint', 'plum-tint', 'sky-tint'] }
	];
	const type = [
		{ spec: '38 · 800', size: 'var(--text-display)', weight: 800, text: "Freshers' Trip 2027" },
		{ spec: '30 · 800', size: 'var(--text-title)', weight: 800, text: 'Recipes' },
		{ spec: '22 · 800', size: 'var(--text-heading)', weight: 800, text: 'Ingredients' },
		{ spec: '17 · 700', size: 'var(--text-strong)', weight: 700, text: 'Lentil dal for 180' },
		{ spec: '16 · 400', size: 'var(--text-body)', weight: 400, text: 'Red lentils, 18 kg' },
		{ spec: '13 · 400', size: 'var(--text-note)', weight: 400, text: '21.6 kg needed' }
	];
	const plates = ['dal', 'reis', 'suppe', 'chili', 'salat', 'pasta', 'gratin', 'kuerbis', 'muesli', 'brot', 'pfann', 'kompott', 'kuchen', 'couscous'];
	const tabs = [
		{ id: 'supermarket', label: 'Supermarket', count: 6 },
		{ id: 'asian-market', label: 'Asian market', count: 4 },
		{ id: 'online', label: 'Online', count: 7 },
		{ id: 'drugstore', label: 'Drugstore', count: 2 }
	];

	let people = $state(200);
	let portions = $state(180);
	let active = $state('supermarket');
	let filter = $state('all');
	let search = $state('');
	let hex: Record<string, string> = $state({});

	onMount(() => {
		const style = getComputedStyle(document.documentElement);
		for (const { names } of groups) for (const name of names) hex[name] = style.getPropertyValue(`--color-${name}`).trim().toUpperCase();
	});
</script>

<main>
	<header>
		<span class="logo"><Flame size={28} color="var(--color-mustard)" /></span>
		<h1>Hell's Kitchen</h1>
	</header>

	<div class="two">
		<section>
			<h2>Colors</h2>
			{#each groups as group (group.title)}
				<h3>{group.title}</h3>
				<div class="swatches">
					{#each group.names as name (name)}
						<div class="swatch">
							<div class="chip-color" style:background="var(--color-{name})" class:bordered={name === 'paper' || name === 'sheet'}></div>
							<strong>{name}</strong>
							<span class="soft small">{hex[name] ?? ''}</span>
						</div>
					{/each}
				</div>
			{/each}
		</section>

		<section>
			<h2>Type</h2>
			<p class="soft">Bricolage Grotesque</p>
			{#each type as row (row.spec)}
				<div class="type-row">
					<span class="soft small">{row.spec}</span>
					<span style:font-size={row.size} style:font-weight={row.weight}>{row.text}</span>
				</div>
			{/each}
		</section>
	</div>

	<section>
		<h2>Components</h2>
		<div class="rows">
			<div class="row">
				<span class="soft small label">Actions</span>
				<div class="inline">
					<Button icon={Plus}>Add to plan</Button>
					<Button variant="secondary" icon={Share2}>Share</Button>
					<IconButton icon={Printer} label="Print" />
					<IconButton icon={ArrowLeft} label="Back" />
				</div>
			</div>
			<div class="row">
				<span class="soft small label">Counter</span>
				<Stepper name="people" bind:value={people} label="People" />
			</div>
			<div class="row">
				<span class="soft small label">Filters</span>
				<div class="inline">
					<Chip active={filter === 'all'} onclick={() => (filter = 'all')}>All</Chip>
					<Chip active={filter === 'soups'} onclick={() => (filter = 'soups')}>Soups</Chip>
					<Chip icon={SlidersHorizontal}>More</Chip>
				</div>
			</div>
			<div class="row">
				<span class="soft small label">Markers</span>
				<div class="inline">
					<Badge>Main</Badge>
					<Badge tone="leaf">Leaf</Badge>
					<Badge tone="mustard">Mustard</Badge>
					<Check label="Not bought" />
					<Check checked label="Bought" />
					<IconButton icon={Plus} label="Add to plan" size={34} />
				</div>
			</div>
			<div class="row">
				<span class="soft small label">Cost</span>
				<div class="inline wide">
					<CostBlock amount="€4,200" coverage={0.92} />
					<NoPricePill count={2} />
				</div>
			</div>
			<div class="row">
				<span class="soft small label">Store tabs</span>
				<div class="tabs"><StoreTabs {tabs} bind:active /></div>
			</div>
			<div class="row">
				<span class="soft small label">Meals</span>
				<div class="inline wide">
					{#each Object.values(MEAL_TYPES) as meal (meal.label)}
						<span class="meal-key">
							<span class="dot" style:background="var(--color-{meal.tint})" style:color="var(--color-{meal.color})"><meal.icon size={20} /></span>
							<strong>{meal.label}</strong>
						</span>
					{/each}
				</div>
			</div>
			<div class="row">
				<span class="soft small label">Plates</span>
				<div class="inline">{#each plates as seed (seed)}<Plate {seed} size={52} />{/each}</div>
			</div>
			<div class="row">
				<span class="soft small label">Day</span>
				<div class="inline wide"><DayLabel name="Saturday" date="Jul 13" /><div class="add"><AddRow label="Add meal" /></div></div>
			</div>
			<div class="row">
				<span class="soft small label">Meal</span>
				<div class="narrow">
					<MealRow type="lunch" time="12:30" people={200} dishes={[{ id: 'lentil-dal', name: 'Lentil dal' }, { id: 'basmati-rice', name: 'Basmati rice' }]} />
				</div>
				<div class="narrow">
					<MealRow compact type="dinner" time="19:30" people={200} dishes={[{ id: 'lentil-bolognese', name: 'Lentil bolognese' }, { id: 'green-salad', name: 'Green salad' }]} />
				</div>
			</div>
			<div class="row">
				<span class="soft small label">Shopping</span>
				<div class="narrow">
					<ShopRow name="Red lentils" buy="1 × 25 kg" need="21.6 kg needed" />
					<ShopRow name="Basmati rice" buy="4 × 10 kg" need="36 kg needed" checked />
					<ShopRow name="Curry powder" buy="1 kg" need="720 g needed" unpriced />
				</div>
			</div>
			<div class="row">
				<span class="soft small label">Share</span>
				<div class="narrow">
					<ActionRow icon={Share2} label="Copy the link" hint="The whole plan is inside the link" />
					<ActionRow icon={Printer} label="Print the shopping list" />
				</div>
				<QrCode text="https://example.org/plan/#plan=styleguide" label="A QR code, as an example" size={140} />
			</div>
			<div class="row">
				<span class="soft small label">Search</span>
				<div class="narrow"><SearchField bind:value={search} placeholder="Recipe or ingredient" /></div>
			</div>
		</div>
	</section>

	<p><a href={resolve('/styleguide/motion')}>Motion trial page</a> · <a href={resolve('/')}>Back to the start</a></p>
</main>

<style>
	main {
		max-width: 1480px;
		margin: 0 auto;
		padding: var(--space-8) var(--space-5) var(--space-9);
		display: flex;
		flex-direction: column;
		gap: var(--space-9);
	}
	header {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}
	.logo {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 52px;
		height: 52px;
		border-radius: var(--radius-pill);
		background: var(--color-tomato);
	}
	h1 {
		margin: 0;
		font-size: var(--text-hero);
		font-weight: var(--weight-heavy);
		line-height: 1.1;
	}
	h2 {
		margin: 0 0 var(--space-5);
		font-size: 26px;
		font-weight: var(--weight-heavy);
	}
	h3 {
		margin: var(--space-6) 0 14px;
		color: var(--color-ink-soft);
		font-size: var(--text-note);
		font-weight: var(--weight-bold);
	}
	.two {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
		gap: 72px;
	}
	.soft {
		color: var(--color-ink-soft);
	}
	.small {
		font-size: var(--text-note);
	}
	.swatches {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
	}
	.swatch {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		width: 112px;
		font-size: var(--text-note);
	}
	.chip-color {
		height: 72px;
		border-radius: var(--radius-m);
	}
	.bordered {
		border: var(--border);
	}
	.type-row {
		display: flex;
		align-items: baseline;
		gap: var(--space-6);
		padding: 10px 0;
	}
	.type-row .small {
		width: 80px;
		flex: none;
	}
	.rows {
		display: flex;
		flex-direction: column;
		gap: 26px;
	}
	.row {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-6);
	}
	.label {
		width: 96px;
		flex: none;
	}
	.inline {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 14px;
	}
	.wide {
		gap: 32px;
	}
	.tabs {
		width: min(520px, 100%);
	}
	.narrow {
		width: min(300px, 100%);
	}
	.add {
		width: 300px;
		max-width: 100%;
	}
	.meal-key {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		font-size: var(--text-compact);
	}
	.dot {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: var(--radius-pill);
	}
</style>
