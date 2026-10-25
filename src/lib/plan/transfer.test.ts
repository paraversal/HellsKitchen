import { deflateSync, strToU8 } from 'fflate';
import { describe, expect, it } from 'vitest';
import { planSchema, type PlanFile } from '../data/schema.ts';
import { addDay, addDish, addMeal, newPlan, rename, setChecked, setEvent } from './plan.ts';
import { decodeShare, encodeShare, fileName, samePlan, forSharing, fromBase64Url, fromFile, readLink, toBase64Url, toFile } from './transfer.ts';

const NOW = '2027-07-09T10:00:00.000Z';

/** A big, realistic plan: three days, four meals a day, four dishes in each. */
function bigPlan(): PlanFile {
	const recipes = ['curried-lentil-tomato-and-coconut-soup', 'spaghetti-with-tomatosauce', 'beanballs-for-spaghetti', 'sauce-for-beanballs', 'hummus-neutral', 'hummus-green', 'couscous-salad', 'apple-crumble', 'alc-free-punsch', 'chilli-con-sweetpotato', 'baba-ganoush', 'lebanase-bread'];
	let plan = setEvent(rename(newPlan('2027-07-09'), "Freshers' Trip 2027"), { everyone: 200, organisers: 32, appetite_factor: 1.3 });
	plan = addDay(addDay(plan));
	let n = 0;
	for (let day = 0; day < 3; day++) {
		for (const type of ['breakfast', 'lunch', 'coffee', 'dinner'] as const) {
			const added = addMeal(plan, day, type);
			plan = added.plan;
			for (let k = 0; k < 4; k++) plan = addDish(plan, day, added.meal, recipes[n++ % recipes.length]);
		}
	}
	return setChecked(plan, 'salt', true);
}

describe('base64 for addresses', () => {
	it('round-trips any bytes, without characters that break an address', () => {
		const bytes = Uint8Array.from({ length: 1000 }, (_, i) => (i * 37) % 256);
		const text = toBase64Url(bytes);
		expect(text).toMatch(/^[A-Za-z0-9_-]*$/);
		expect([...fromBase64Url(text)]).toEqual([...bytes]);
	});
});

describe('a link', () => {
	it('carries a plan and when it was last changed', () => {
		const plan = addDish(addMeal(newPlan('2027-07-09'), 0, 'lunch').plan, 0, 0, 'tzatziki');
		const decoded = decodeShare(encodeShare(plan, NOW));
		expect(decoded.ok).toBe(true);
		if (decoded.ok) {
			expect(decoded.shared.updatedAt).toBe(NOW);
			expect(decoded.shared.plan.days[0].meals[0].dishes).toEqual([{ recipe: 'tzatziki' }]);
		}
	});

	it('leaves out the shopping ticks, which are one person\'s progress', () => {
		const plan = bigPlan();
		expect(plan.shopping?.checked).toEqual(['salt']);
		expect(forSharing(plan).shopping).toBeUndefined();
		const decoded = decodeShare(encodeShare(plan, NOW));
		expect(decoded.ok && decoded.shared.plan.shopping).toBeFalsy();
	});

	it('does not change the plan it is made from, and also works for a plan that is a reactive proxy', () => {
		const plan = bigPlan();
		const before = JSON.stringify(plan);
		const proxy = new Proxy(plan, {}); // like the state of a screen: structuredClone cannot copy it
		expect(decodeShare(encodeShare(proxy, NOW)).ok).toBe(true);
		expect(JSON.stringify(plan)).toBe(before);
	});

	it('is small enough for a chat message and a QR code, even for a big plan', () => {
		const link = encodeShare(bigPlan(), NOW);
		expect(link.length).toBeLessThan(2000);
	});

	it('is read from the part after the #', () => {
		const text = encodeShare(newPlan('2027-07-09'), NOW);
		expect(readLink(`#${text}`)?.ok).toBe(true);
		expect(readLink('#something-else')).toBeUndefined();
		expect(readLink('')).toBeUndefined();
	});

	it('says so when the link is damaged or cut off', () => {
		const text = encodeShare(bigPlan(), NOW);
		for (const broken of [text.slice(0, text.length - 40), 'plan=', 'plan=!!!', 'plan=AAAA']) {
			const decoded = decodeShare(broken);
			expect(decoded.ok, broken).toBe(false);
			if (!decoded.ok) expect(decoded.problem.length).toBeGreaterThan(10);
		}
	});

	it('refuses something that is not a plan', () => {
		const wrong = `plan=${toBase64Url(deflateSync(strToU8(JSON.stringify({ v: 1, updatedAt: NOW, plan: { name: 'x' } }))))}`;
		const decoded = decodeShare(wrong);
		expect(decoded.ok).toBe(false);
	});

	it('refuses a link that unpacks into something huge', () => {
		const bomb = deflateSync(strToU8('a'.repeat(5_000_000)), { level: 9 });
		expect(bomb.length).toBeLessThan(10_000);
		expect(decodeShare(`plan=${toBase64Url(bomb)}`).ok).toBe(false);
	});
});

describe('a file', () => {
	it('keeps the whole plan, ticks included', () => {
		const plan = bigPlan();
		const decoded = fromFile(toFile(plan, NOW, '2027-07-10T08:00:00.000Z'));
		expect(decoded.ok).toBe(true);
		if (decoded.ok) {
			expect(decoded.shared.plan).toEqual(plan);
			expect(decoded.shared.updatedAt).toBe(NOW);
			expect(planSchema.safeParse(decoded.shared.plan).success).toBe(true);
		}
	});

	it('is readable text', () => {
		const text = toFile(newPlan('2027-07-09', 'Test'), NOW, NOW);
		expect(text).toContain('"app": "hells-kitchen-plan"');
		expect(text).toContain('"name": "Test"');
	});

	it('says so when the file is not a plan', () => {
		for (const text of ['not json at all', '{}', JSON.stringify({ app: 'something-else', version: 1, plan: {} }), '']) {
			const decoded = fromFile(text);
			expect(decoded.ok, text).toBe(false);
		}
	});

	it('is named after the plan', () => {
		expect(fileName(rename(newPlan('2027-07-09'), "Freshers' Trip 2027"))).toBe('freshers-trip-2027.json');
		expect(fileName(rename(newPlan('2027-07-09'), 'Café Übung'))).toBe('cafe-ubung.json');
		expect(fileName(rename(newPlan('2027-07-09'), '???'))).toBe('plan.json');
	});
});

describe('comparing plans', () => {
	it('ignores the shopping ticks, which are not part of what is shared', () => {
		const plan = bigPlan();
		expect(samePlan(plan, setChecked(plan, 'salt', false))).toBe(true);
		expect(samePlan(plan, rename(plan, 'Other'))).toBe(false);
	});
});
