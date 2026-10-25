<script lang="ts">
	// A flat plate illustration for a recipe. The look comes from the recipe's id, so every recipe keeps its plate without any extra data.
	let { seed, size = 48 }: { seed: string; size?: number } = $props();

	// rim, food, and three bits of garnish: names of color tokens
	const PLATES: [string, string, [string, string, string]][] = [
		['mustard-tint', 'mustard', ['tomato', 'leaf', 'tomato']],
		['sky-tint', 'sheet', ['ink-soft', 'mustard', 'line']],
		['tomato-tint', 'tomato', ['mustard', 'leaf', 'sheet']],
		['tomato-tint', 'plum', ['tomato', 'mustard', 'leaf']],
		['leaf-tint', 'leaf', ['tomato', 'mustard', 'sheet']],
		['mustard-tint', 'tomato', ['sheet', 'leaf', 'mustard']],
		['mustard-tint', 'mustard', ['line', 'ink-soft', 'sheet']],
		['tomato-tint', 'mustard', ['sheet', 'tomato', 'leaf']],
		['plum-tint', 'plum', ['mustard', 'tomato', 'sheet']],
		['mustard-tint', 'tomato-tint', ['mustard', 'ink-soft', 'leaf']],
		['sky-tint', 'mustard', ['sheet', 'tomato', 'plum']],
		['plum-tint', 'tomato', ['mustard', 'leaf', 'sheet']],
		['sky-tint', 'plum', ['sheet', 'mustard', 'tomato']],
		['leaf-tint', 'mustard', ['leaf', 'tomato', 'sheet']]
	];

	function pick(text: string) {
		let hash = 0;
		for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
		return PLATES[hash % PLATES.length];
	}

	const [rim, food, garnish] = $derived(pick(seed));
	const color = (name: string) => `var(--color-${name})`;
</script>

<svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-hidden="true">
	<circle cx="50" cy="50" r="50" fill={color(rim)} />
	<circle cx="50" cy="50" r="37" fill={color('sheet')} />
	<ellipse cx="50" cy="51" rx="25" ry="21" fill={color(food)} />
	<circle cx="39.5" cy="43.5" r="6.5" fill={color(garnish[0])} />
	<circle cx="60.5" cy="50.5" r="5.5" fill={color(garnish[1])} />
	<circle cx="47" cy="62" r="5" fill={color(garnish[2])} />
</svg>

<style>
	svg {
		display: block;
		flex: none;
	}
</style>
