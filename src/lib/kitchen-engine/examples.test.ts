import { describe, expect, it } from 'vitest';
import { calculate } from './calculate.ts';
import { EXAMPLES } from './examples/index.ts';

// The worked examples printed in SPEC.md, run for real.
describe('worked examples', () => {
	for (const example of EXAMPLES) {
		it(`${example.id}: the totals printed in the spec`, () => {
			const result = calculate(example.plan, example.data);
			for (const [ingredient, need] of Object.entries(example.needs)) expect(result.needs[ingredient]).toBeCloseTo(need, 6);
			for (const [ingredient, packs] of Object.entries(example.packs ?? {})) {
				const item = result.stores.flatMap((s) => s.items).find((i) => i.ingredient === ingredient);
				expect(item?.packs).toBe(packs);
			}
		});
	}
});
