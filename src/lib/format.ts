import { displayAmount } from './kitchen-engine/rules/units.ts';
import type { Unit } from './kitchen-engine/types.ts';

const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 });

/** An amount as people read it: "630 g", "74.6 kg", "14.4 L", "5.5 pcs". See rule R8 in the kitchen engine spec. */
export function formatAmount(amount: number, unit: Unit): string {
	const shown = displayAmount(amount, unit);
	return `${number.format(shown.value)} ${shown.unit}`;
}
