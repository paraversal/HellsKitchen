<script lang="ts">
	import { appData } from '#lib/app-data.ts';
	import { recipeImage } from '#lib/recipe-image.ts';
	import type { Category } from '#lib/kitchen-engine/types.ts';
	import { RECIPE_KINDS } from './recipe-kinds.ts';

	// The picture of a recipe: its photo if it has one, otherwise an icon for its kind (every main dish has the same one).
	// Both are a circle in a rim of the color of the kind, like a plate.
	// `category` is for showing a kind without a recipe, like on the style sheet.
	let { id, size = 48, category }: { id: string; size?: number; category?: Category } = $props();

	const kind = $derived(RECIPE_KINDS[category ?? appData.recipes[id]?.category ?? 'misc']);
	const src = $derived(recipeImage(id, size > 72 ? 'l' : 's'));
	const rim = $derived(Math.max(2, Math.round(size * 0.05)));
	let failed = $state(false);
	$effect(() => {
		void src;
		failed = false;
	});
</script>

<span class="picture" style:width="{size}px" style:height="{size}px" style:background="var(--color-{kind.tint})" aria-hidden="true">
	{#if src && !failed}
		<img {src} alt="" width={size - 2 * rim} height={size - 2 * rim} loading="lazy" decoding="async" onerror={() => (failed = true)} />
	{:else}
		{@const Icon = kind.icon}
		<span class="disc" style:color="var(--color-{kind.accent})"><Icon size={Math.max(11, Math.round(size * 0.42))} /></span>
	{/if}
</span>

<style>
	.picture {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: none;
		border-radius: 50%;
	}
	img {
		display: block;
		flex: none;
		border-radius: 50%;
		object-fit: cover;
	}
	.disc {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 74%;
		height: 74%;
		border-radius: 50%;
		background: var(--color-sheet);
	}
</style>
