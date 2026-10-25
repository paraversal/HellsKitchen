// Amounts in the data files are written with their unit, like "10 g" or "0.5 pack" (see docs/DATA.md).

/** The units an ingredient is counted in. Kilograms and litres are accepted when writing, and converted. */
export type DataUnit = 'g' | 'ml' | 'pcs' | 'pack' | 'jar';

type WrittenUnit = DataUnit | 'kg' | 'l';

const CONVERSION: Record<WrittenUnit, { unit: DataUnit; factor: number }> = {
	g: { unit: 'g', factor: 1 },
	kg: { unit: 'g', factor: 1000 },
	ml: { unit: 'ml', factor: 1 },
	l: { unit: 'ml', factor: 1000 },
	pcs: { unit: 'pcs', factor: 1 },
	pack: { unit: 'pack', factor: 1 },
	jar: { unit: 'jar', factor: 1 }
};

export type Quantity = { amount: number; unit: DataUnit };

export type QuantityResult = { ok: true; quantity: Quantity } | { ok: false; problem: string };

const WRITTEN = /^(\d+(?:\.\d+)?|\.\d+)\s*([a-z]+)$/;

/** Reads "10 g", "2 kg", "0.5 pack" ... and returns the amount in the base unit (g, ml, pcs, pack or jar). */
export function parseQuantity(text: unknown): QuantityResult {
	if (typeof text === 'number') {
		return { ok: false, problem: `${text} has no unit. Write it like "${text} g".` };
	}
	if (typeof text !== 'string') {
		return { ok: false, problem: 'an amount must be written with its unit, like "10 g".' };
	}
	const trimmed = text.trim().toLowerCase();
	if (/^\d+,\d+/.test(trimmed)) {
		return { ok: false, problem: `"${text}" uses a comma. Use a dot for decimals, like "0.5 kg".` };
	}
	const match = WRITTEN.exec(trimmed);
	if (!match || !(match[2] in CONVERSION)) {
		return {
			ok: false,
			problem: `"${text}" is not an amount. Write a number and a unit (g, kg, ml, l, pcs, pack or jar), like "10 g".`
		};
	}
	const { unit, factor } = CONVERSION[match[2] as WrittenUnit];
	const amount = Math.round(Number(match[1]) * factor * 1e6) / 1e6;
	if (!(amount > 0)) return { ok: false, problem: `"${text}" must be more than zero.` };
	return { ok: true, quantity: { amount, unit } };
}
