import { describe, expect, it } from 'vitest';
import { plateLook } from './plate.ts';

describe('plate looks', () => {
	it('stay the same for the same recipe, and use only design colors', () => {
		expect(plateLook('lentil-dal')).toEqual(plateLook('lentil-dal'));
		const look = plateLook('anything');
		expect(look.rim).toMatch(/-tint$/);
		expect(look.garnish).toHaveLength(3);
	});
});
