<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Users from '@lucide/svelte/icons/users';
	import { untrack } from 'svelte';
	import { MEAL_TYPES, type MealType } from './meal-types.ts';
	import { strength } from '#lib/motion/fun.svelte.ts';
	import { mealScene } from '#lib/motion/arrive.ts';
	import RecipeImage from './RecipeImage.svelte';

	// One meal of the plan: what kind, when, how many people, and its dishes. `compact` is the narrow version for the desktop day columns.
	// With `onopen`, the whole row can be pressed, for example to edit the meal; a small arrow says so.
	// `organisers` and `hungry` mark a meal that is only for the organisers, or that is hungrier than usual (`hungry` is the factor, like "×1.3").
	// A dish's `note` says what was changed for it, like "70 g".
	type Dish = { id: string; name: string; note?: string };
	type Props = { type: MealType; time?: string; people: number; dishes: Dish[]; organisers?: boolean; hungry?: string; day?: string; compact?: boolean; onopen?: () => void };
	let { type, time, people, dishes, organisers = false, hungry, day, compact = false, onopen }: Props = $props();
	const meal = $derived(MEAL_TYPES[type]);

	// B2. When the kind of a meal is changed, its icon plays the scene of the new kind (with fun).
	let root = $state<HTMLElement>();
	let shown = untrack(() => type);
	$effect(() => {
		const now = type;
		if (now === shown) return;
		shown = now;
		if (strength('B2') === 'playful') mealScene(root?.querySelector<HTMLElement>('.icon'), now);
	});
</script>

{#snippet badge(box: number, glyph: number)}
	<span class="icon" data-type={type} style:width="{box}px" style:height="{box}px" style:background="var(--color-{meal.tint})" style:color="var(--color-{meal.color})">
		<meal.icon size={glyph} />
	</span>
{/snippet}

{#snippet inner()}
	{#if !compact}{@render badge(40, 20)}{/if}
	<div class="body">
		<div class="heading">
			{#if compact}{@render badge(28, 15)}{/if}
			<span class="name">{compact ? meal.short : meal.label}</span>
			{#if time}<span class="time">{time}</span>{/if}
			{#if organisers}<span class="tag organisers">Organisers</span>{/if}
			{#if hungry}<span class="tag hungry">Hungry {hungry}</span>{/if}
			<span class="people"><Users size={compact ? 14 : 15} />{people}{#if onopen}<span class="more" aria-hidden="true"><ChevronRight size={16} /></span>{/if}</span>
		</div>
		{#if dishes.length}
			<ul>
				{#each dishes as dish (dish.id)}
					<li><RecipeImage id={dish.id} size={compact ? 24 : 22} /><span>{dish.name}{#if dish.note}<span class="note"> · {dish.note}</span>{/if}</span></li>
				{/each}
			</ul>
		{/if}
	</div>
{/snippet}

{#if onopen}
	<div
		bind:this={root}
		class="meal open pressable"
		class:compact
		role="button"
		tabindex="0"
		aria-label="Edit {day ? `${day} ` : ''}{meal.label.toLowerCase()}{organisers ? ', for the organisers' : ''}{hungry ? ', hungrier than usual' : ''}"
		onclick={onopen}
		onkeydown={(event) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				onopen();
			}
		}}
	>
		{@render inner()}
	</div>
{:else}
	<div class="meal" class:compact>{@render inner()}</div>
{/if}

<style>
	.meal {
		display: flex;
		align-items: flex-start;
		gap: 14px;
		padding: 14px 0;
	}
	.open {
		cursor: pointer;
	}
	.icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: none;
		border-radius: var(--radius-pill);
	}
	.body {
		flex: 1;
		min-width: 0;
	}
	.heading {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: 9px;
	}
	.tag {
		padding: 1px 7px;
		border-radius: var(--radius-pill);
		font-size: var(--text-caption);
		font-weight: var(--weight-bold);
		line-height: 1.5;
		white-space: nowrap;
	}
	.organisers {
		background: var(--color-leaf-tint);
	}
	.hungry {
		background: var(--color-mustard-tint);
	}
	.more {
		display: inline-flex;
		margin-left: 2px;
		color: var(--color-ink-soft);
	}
	.note {
		color: var(--color-ink-soft);
		font-size: var(--text-small);
	}
	.name {
		font-weight: var(--weight-bold);
	}
	.time {
		color: var(--color-ink-soft);
		font-size: var(--text-small);
	}
	.people {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		margin-left: auto;
		font-weight: var(--weight-bold);
	}
	.people :global(svg) {
		color: var(--color-ink-soft);
	}
	ul {
		display: flex;
		flex-direction: column;
		gap: 9px;
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: var(--text-compact);
	}
	li {
		display: flex;
		align-items: center;
		gap: 9px;
	}
	.compact {
		display: block;
		padding: 18px 0;
	}
	.compact .heading {
		margin-bottom: 11px;
	}
	.compact .name {
		font-size: var(--text-compact);
	}
	.compact ul {
		gap: 11px;
	}
</style>
