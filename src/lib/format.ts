import { displayAmount } from './kitchen-engine/rules/units.ts';
import type { Unit } from './kitchen-engine/types.ts';

const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 });

/** An amount as people read it: "630 g", "74.6 kg", "14.4 L", "5.5 pcs". See rule R8 in the kitchen engine spec. */
export function formatAmount(amount: number, unit: Unit): string {
	const shown = displayAmount(amount, unit);
	return `${number.format(shown.value)} ${shown.unit}`;
}

const when = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

/** A time stamp as people read it: "Jul 9, 10:00 AM". */
export function whenText(iso: string): string {
	const date = new Date(iso);
	return Number.isNaN(date.getTime()) ? 'unknown time' : when.format(date);
}
