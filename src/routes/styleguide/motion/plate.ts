// The look of a recipe's plate: rim, food, and three bits of garnish, as names of color tokens. The look comes from the recipe's id.
export type PlateLook = { rim: string; food: string; garnish: [string, string, string] };

const PLATES: PlateLook[] = [
	{ rim: 'mustard-tint', food: 'mustard', garnish: ['tomato', 'leaf', 'tomato'] },
	{ rim: 'sky-tint', food: 'sheet', garnish: ['ink-soft', 'mustard', 'line'] },
	{ rim: 'tomato-tint', food: 'tomato', garnish: ['mustard', 'leaf', 'sheet'] },
	{ rim: 'tomato-tint', food: 'plum', garnish: ['tomato', 'mustard', 'leaf'] },
	{ rim: 'leaf-tint', food: 'leaf', garnish: ['tomato', 'mustard', 'sheet'] },
	{ rim: 'mustard-tint', food: 'tomato', garnish: ['sheet', 'leaf', 'mustard'] },
	{ rim: 'mustard-tint', food: 'mustard', garnish: ['line', 'ink-soft', 'sheet'] },
	{ rim: 'tomato-tint', food: 'mustard', garnish: ['sheet', 'tomato', 'leaf'] },
	{ rim: 'plum-tint', food: 'plum', garnish: ['mustard', 'tomato', 'sheet'] },
	{ rim: 'mustard-tint', food: 'tomato-tint', garnish: ['mustard', 'ink-soft', 'leaf'] },
	{ rim: 'sky-tint', food: 'mustard', garnish: ['sheet', 'tomato', 'plum'] },
	{ rim: 'plum-tint', food: 'tomato', garnish: ['mustard', 'leaf', 'sheet'] },
	{ rim: 'sky-tint', food: 'plum', garnish: ['sheet', 'mustard', 'tomato'] },
	{ rim: 'leaf-tint', food: 'mustard', garnish: ['leaf', 'tomato', 'sheet'] }
];

export function plateLook(seed: string): PlateLook {
	let hash = 0;
	for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
	return PLATES[hash % PLATES.length];
}
