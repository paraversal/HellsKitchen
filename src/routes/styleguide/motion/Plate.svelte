<script lang="ts">
	import { plateLook } from './plate.ts';
	// A flat plate illustration for a recipe, from before the app had photos. Only the motion trial page still draws it, for the animations kept for later.
	let { seed, size = 48 }: { seed: string; size?: number } = $props();

	const look = $derived(plateLook(seed));
	const color = (name: string) => `var(--color-${name})`;
</script>

<svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-hidden="true">
	<circle cx="50" cy="50" r="50" fill={color(look.rim)} />
	<circle cx="50" cy="50" r="37" fill={color('sheet')} />
	<ellipse cx="50" cy="51" rx="25" ry="21" fill={color(look.food)} />
	<circle cx="39.5" cy="43.5" r="6.5" fill={color(look.garnish[0])} />
	<circle cx="60.5" cy="50.5" r="5.5" fill={color(look.garnish[1])} />
	<circle cx="47" cy="62" r="5" fill={color(look.garnish[2])} />
</svg>

<style>
	svg {
		display: block;
		flex: none;
	}
</style>
