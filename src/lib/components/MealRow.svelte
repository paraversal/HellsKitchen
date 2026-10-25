<script lang="ts">
	import Users from '@lucide/svelte/icons/users';
	import { MEAL_TYPES, type MealType } from './meal-types.ts';
	import Plate from './Plate.svelte';

	// One meal of the plan: what kind, when, how many people, and its dishes. `compact` is the narrow version for the desktop day columns.
	// With `onopen`, the whole row can be pressed, for example to edit the meal.
	type Props = { type: MealType; time?: string; people: number; dishes: { id: string; name: string }[]; compact?: boolean; onopen?: () => void };
	let { type, time, people, dishes, compact = false, onopen }: Props = $props();
	const meal = $derived(MEAL_TYPES[type]);
</script>

{#snippet badge(box: number, glyph: number)}
	<span class="icon" style:width="{box}px" style:height="{box}px" style:background="var(--color-{meal.tint})" style:color="var(--color-{meal.color})">
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
			<span class="people"><Users size={compact ? 14 : 15} />{people}</span>
		</div>
		{#if dishes.length}
			<ul>
				{#each dishes as dish (dish.id)}
					<li><Plate seed={dish.id} size={compact ? 24 : 22} />{dish.name}</li>
				{/each}
			</ul>
		{/if}
	</div>
{/snippet}

{#if onopen}
	<div
		class="meal open pressable"
		class:compact
		role="button"
		tabindex="0"
		aria-label="Edit {meal.label}"
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
		gap: var(--space-2);
		margin-bottom: 9px;
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
