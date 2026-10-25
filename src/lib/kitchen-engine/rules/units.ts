// R8. Purchase units. See SPEC.md.
// Grams and millilitres are shown as kg and L from 1000 up, and with three significant digits. Counts stay counts.
import type { Unit } from '../types.ts';

export type Shown = { value: number; unit: 'g' | 'kg' | 'ml' | 'L' | 'pcs' | 'pack' | 'jar' };

function threeDigits(x: number): number {
	return x === 0 ? 0 : Number(x.toPrecision(3));
}

export function displayAmount(amount: number, unit: Unit): Shown {
	if (unit !== 'g' && unit !== 'ml') return { value: threeDigits(amount), unit };
	const rounded = threeDigits(amount);
	if (rounded >= 1000) return { value: threeDigits(rounded / 1000), unit: unit === 'g' ? 'kg' : 'L' };
	return { value: rounded, unit };
}
