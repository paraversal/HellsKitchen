import { describe, expect, it } from 'vitest';
import { parseQuantity } from './quantity.ts';

const amount = (text: unknown) => {
	const r = parseQuantity(text);
	return r.ok ? r.quantity : r.problem;
};

describe('parseQuantity', () => {
	it('reads grams, millilitres and counts as they are', () => {
		expect(amount('10 g')).toEqual({ amount: 10, unit: 'g' });
		expect(amount('45 ml')).toEqual({ amount: 45, unit: 'ml' });
		expect(amount('0.011 pcs')).toEqual({ amount: 0.011, unit: 'pcs' });
		expect(amount('2 pack')).toEqual({ amount: 2, unit: 'pack' });
		expect(amount('3 jar')).toEqual({ amount: 3, unit: 'jar' });
	});

	it('converts kilograms and litres to grams and millilitres', () => {
		expect(amount('25 kg')).toEqual({ amount: 25000, unit: 'g' });
		expect(amount('1.5 l')).toEqual({ amount: 1500, unit: 'ml' });
		expect(amount('0.0165 kg')).toEqual({ amount: 16.5, unit: 'g' });
	});

	it('is relaxed about spaces and case', () => {
		expect(amount('10g')).toEqual({ amount: 10, unit: 'g' });
		expect(amount('  2 KG ')).toEqual({ amount: 2000, unit: 'g' });
	});

	it('explains what is wrong', () => {
		expect(amount(10)).toContain('has no unit');
		expect(amount('10')).toContain('is not an amount');
		expect(amount('ten g')).toContain('is not an amount');
		expect(amount('10 oz')).toContain('is not an amount');
		expect(amount('0,5 kg')).toContain('Use a dot');
		expect(amount('0 g')).toContain('more than zero');
		expect(amount(null)).toContain('with its unit');
	});
});
