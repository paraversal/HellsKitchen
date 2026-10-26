import { describe, expect, it } from 'vitest';
import { slash } from './paths.ts';

describe('slash', () => {
	it('ends the path of a page with a slash, before any search or hash', () => {
		expect(slash('/hk/plan')).toBe('/hk/plan/');
		expect(slash('/hk/plan/')).toBe('/hk/plan/');
		expect(slash('/')).toBe('/');
		expect(slash('')).toBe('/');
		expect(slash('/hk/print/shopping?store=aldi')).toBe('/hk/print/shopping/?store=aldi');
		expect(slash('/hk/recipes#top')).toBe('/hk/recipes/#top');
	});
});
