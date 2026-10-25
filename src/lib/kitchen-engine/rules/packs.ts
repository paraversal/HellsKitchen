// R10. Pack counts. See SPEC.md.
// Whole packs to buy, always rounded up. Pieces, packs and jars have a pack size of 1.
import { ROUNDING_ALLOWANCE } from '../config.ts';
import type { Ingredient } from '../types.ts';

export function packCount(need: number, ingredient: Ingredient): { packs: number; packSize: number } | undefined {
	const packSize = ingredient.unit === 'g' || ingredient.unit === 'ml' ? ingredient.pack : 1;
	if (packSize === undefined) return undefined;
	return { packs: Math.ceil(need / packSize - ROUNDING_ALLOWANCE), packSize };
}
