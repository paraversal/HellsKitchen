import { describe, expect, it } from 'vitest';
import { validateData, validatePlan, type DataSet, type RawData } from './validate.ts';
import type { Issue } from './issues.ts';

// A tiny correct data set. Each test breaks one thing and checks that the right problem is reported.
const base = (): RawData => ({
	stores: { supermarket: 'Supermarket', none: 'Not bought' },
	ingredients: {
		'red-lentils': { name: 'Red lentils', unit: 'g', store: 'supermarket', price: 2.5, pack: '25 kg' },
		water: { name: 'Water', unit: 'ml', store: 'none' },
		lemon: { name: 'Lemon', unit: 'pcs', store: 'supermarket', price: 0.4 }
	},
	recipes: {
		dal: {
			name: 'Dal',
			category: 'main',
			portion: '500 g',
			per_100g: { 'red-lentils': '10 g', water: '40 ml', lemon: '0.01 pcs' },
			method: 'Cook it.'
		}
	}
});

const check = (change: (raw: RawData) => void = () => {}) => {
	const raw = base();
	change(raw);
	return validateData(raw);
};
const dal = (raw: RawData) => raw.recipes.dal as Record<string, unknown>;
const lentils = (raw: RawData) => (raw.ingredients as Record<string, Record<string, unknown>>)['red-lentils'];
const find = (issues: Issue[], code: string) => issues.find((i) => i.code === code);
const errors = (issues: Issue[]) => issues.filter((i) => i.severity === 'error');

describe('R1: a recipe is defined per 100 g of finished dish', () => {
	it('reads the amounts under per_100g as numbers in the base unit', () => {
		const { data } = check((raw) => {
			dal(raw).per_100g = { 'red-lentils': '0.01 kg', water: '40 ml' };
		});
		expect(data.recipes.dal.per100g).toEqual({ 'red-lentils': 10, water: 40 });
	});
});

describe('a correct data set', () => {
	it('has no errors and is turned into plain numbers', () => {
		const { issues, data } = check();
		expect(errors(issues)).toEqual([]);
		expect(data.ingredients['red-lentils'].pack).toBe(25000);
		expect(data.recipes.dal.per100g).toEqual({ 'red-lentils': 10, water: 40, lemon: 0.01 });
		expect(data.recipes.dal.portion).toBe(500);
	});
});

describe('ids', () => {
	it('bad-id: a recipe file name must be lower case with hyphens', () => {
		const { issues } = check((raw) => {
			raw.recipes['Dal Bhat'] = raw.recipes.dal;
		});
		expect(find(issues, 'bad-id')?.fix).toContain('"dal-bhat"');
	});
});

describe('recipes', () => {
	it('unknown-ingredient: suggests the closest ingredient', () => {
		const { issues } = check((raw) => {
			dal(raw).per_100g = { 'red-lentil': '10 g' };
		});
		const issue = find(issues, 'unknown-ingredient');
		expect(issue?.where).toBe('per_100g > red-lentil');
		expect(issue?.fix).toContain('"red-lentils"');
	});

	it('unit-mismatch: litres of lentils are refused', () => {
		const { issues } = check((raw) => {
			dal(raw).per_100g = { 'red-lentils': '1 l' };
		});
		expect(find(issues, 'unit-mismatch')?.message).toContain('counted in g');
	});

	it('unit-mismatch: kilograms are fine for an ingredient counted in grams', () => {
		const { issues } = check((raw) => {
			dal(raw).per_100g = { 'red-lentils': '0.01 kg' };
		});
		expect(errors(issues)).toEqual([]);
	});

	it('bad-quantity: a number without a unit, a comma, zero', () => {
		for (const text of ['10', '0,5 kg', '0 g']) {
			const { issues } = check((raw) => {
				dal(raw).per_100g = { 'red-lentils': text };
			});
			expect(find(issues, 'bad-quantity'), text).toBeDefined();
		}
	});

	it('missing-field: a recipe needs a portion', () => {
		const { issues } = check((raw) => {
			delete dal(raw).portion;
		});
		const issue = find(issues, 'missing-field');
		expect(issue?.message).toContain('"portion"');
		expect(issue?.file).toBe('data/recipes/dal.yaml');
	});

	it('portion-unit: the portion must be grams', () => {
		const { issues } = check((raw) => {
			dal(raw).portion = '250 ml';
		});
		expect(find(issues, 'portion-unit')).toBeDefined();
	});

	it('not-allowed: a mistyped category is corrected', () => {
		const { issues } = check((raw) => {
			dal(raw).category = 'mian';
		});
		expect(find(issues, 'not-allowed')?.fix).toContain('Did you mean "main"');
	});

	it('unknown-field: a mistyped field name is corrected', () => {
		const { issues } = check((raw) => {
			dal(raw).porton = '500 g';
			delete dal(raw).portion;
		});
		expect(find(issues, 'unknown-field')?.fix).toContain('Did you mean "portion"');
	});

	it('no-ingredients: a recipe needs ingredients', () => {
		const { issues } = check((raw) => {
			dal(raw).per_100g = {};
		});
		expect(find(issues, 'no-ingredients')).toBeDefined();
	});

	it('a recipe with errors is left out of the result', () => {
		const { data } = check((raw) => {
			dal(raw).per_100g = { nothing: '10 g' };
		});
		expect(data.recipes.dal).toBeUndefined();
	});
});

describe('ingredients and stores', () => {
	it('Known difference 5: unknown-store, an unknown store code is an error, not a silently missing list', () => {
		const { issues } = check((raw) => {
			lentils(raw).store = 'supermarkt';
		});
		const issue = find(issues, 'unknown-store');
		expect(issue?.fix).toContain('"supermarket"');
	});

	it('missing-none-store: the special store none must exist', () => {
		const { issues } = check((raw) => {
			delete (raw.stores as Record<string, string>).none;
		});
		expect(find(issues, 'missing-none-store')).toBeDefined();
	});

	it('pack-not-allowed: pieces have a pack size of 1', () => {
		const { issues } = check((raw) => {
			(raw.ingredients as Record<string, Record<string, unknown>>).lemon.pack = '12 pcs';
		});
		expect(find(issues, 'pack-not-allowed')).toBeDefined();
	});

	it('unit-mismatch: the pack size must fit the unit', () => {
		const { issues } = check((raw) => {
			lentils(raw).pack = '5 l';
		});
		expect(find(issues, 'unit-mismatch')?.where).toBe('red-lentils > pack');
	});

	it('wrong-type: a price must be a number', () => {
		const { issues } = check((raw) => {
			lentils(raw).price = 'cheap';
		});
		expect(find(issues, 'wrong-type')?.message).toContain('should be a number');
	});
});

describe('warnings and notes', () => {
	it('heavy-recipe: ingredients far heavier than the dish', () => {
		const { issues } = check((raw) => {
			dal(raw).per_100g = { 'red-lentils': '2 kg' };
		});
		expect(find(issues, 'heavy-recipe')?.severity).toBe('warning');
	});

	it('heavy-recipe: not repeated for a recipe already marked needs-review, which gets a note instead', () => {
		const { issues } = check((raw) => {
			dal(raw).per_100g = { 'red-lentils': '2 kg' };
			dal(raw).status = 'needs-review';
			dal(raw).review_note = 'Amounts too high.';
		});
		expect(find(issues, 'heavy-recipe')).toBeUndefined();
		expect(find(issues, 'needs-review')?.severity).toBe('note');
	});

	it('review-without-note', () => {
		const { issues } = check((raw) => {
			dal(raw).status = 'needs-review';
		});
		expect(find(issues, 'review-without-note')).toBeDefined();
	});

	it('light-recipe: ingredients far lighter than the dish', () => {
		const { issues } = check((raw) => {
			dal(raw).per_100g = { 'red-lentils': '5 g' };
		});
		expect(find(issues, 'light-recipe')).toBeDefined();
	});

	it('unused-ingredient, no-price, no-method, no-pack', () => {
		const { issues } = check((raw) => {
			(raw.ingredients as Record<string, unknown>).salt = { name: 'Salt', unit: 'g', store: 'supermarket' };
			delete dal(raw).method;
		});
		expect(find(issues, 'unused-ingredient')?.message).toContain('salt');
		expect(find(issues, 'no-price')?.message).toContain('salt');
		expect(find(issues, 'no-pack')?.message).toContain('salt');
		expect(find(issues, 'no-method')).toBeDefined();
	});

	it('no_cooking: something put out as it is needs no method and is not weighed', () => {
		const { issues, data } = check((raw) => {
			delete dal(raw).method;
			dal(raw).no_cooking = true;
			dal(raw).per_100g = { 'red-lentils': '500 g' };
		});
		expect(find(issues, 'no-method')).toBeUndefined();
		expect(find(issues, 'heavy-recipe')).toBeUndefined();
		expect(errors(issues)).toEqual([]);
		expect(data.recipes.dal.noCooking).toBe(true);
	});

	it('method-without-cooking: a method and no_cooking do not go together', () => {
		const { issues } = check((raw) => {
			dal(raw).no_cooking = true;
		});
		expect(find(issues, 'method-without-cooking')).toBeDefined();
	});

	it('no_cooking can only be true', () => {
		const { issues } = check((raw) => {
			dal(raw).no_cooking = false;
		});
		expect(errors(issues).length).toBeGreaterThan(0);
	});

	it('an ingredient in the store none needs no price', () => {
		const { issues } = check();
		expect(issues.some((i) => i.code === 'no-price' && i.message.includes('water'))).toBe(false);
	});
});

describe('photos', () => {
	const withPhotos = (...images: { name: string; bytes?: number }[]) =>
		check((raw) => {
			raw.images = images.map((i) => ({ name: i.name, bytes: i.bytes ?? 100_000 }));
		});

	it('a photo named after a recipe is accepted, in any of the usual formats', () => {
		for (const name of ['dal.jpg', 'dal.jpeg', 'dal.png', 'dal.webp', 'dal.avif', 'dal.JPG']) {
			const { issues, data } = withPhotos({ name });
			expect(issues.filter((i) => i.code.startsWith('image')), name).toEqual([]);
			expect(data.images).toEqual(['dal']);
		}
	});

	it('image-without-recipe: a photo that fits no recipe is an error, with a hint for a typo', () => {
		const { issues, data } = withPhotos({ name: 'dall.jpg' });
		expect(find(issues, 'image-without-recipe')?.fix).toContain('"dal"');
		expect(data.images).toEqual([]);
	});

	it('image-format: a format the app cannot use is an error', () => {
		const { issues } = withPhotos({ name: 'dal.heic' });
		expect(find(issues, 'image-format')?.fix).toContain('JPG');
	});

	it('image-twice: two photos of one recipe is an error', () => {
		const { issues } = withPhotos({ name: 'dal.jpg' }, { name: 'dal.png' });
		expect(find(issues, 'image-twice')).toBeDefined();
	});

	it('image-big: a huge photo is only a warning', () => {
		const { issues } = withPhotos({ name: 'dal.jpg', bytes: 9_000_000 });
		expect(find(issues, 'image-big')?.severity).toBe('warning');
		expect(errors(issues)).toEqual([]);
	});

	it('does not look at photos when the folder was not read', () => {
		expect(check().data.images).toBeUndefined();
	});
});

describe('plans', () => {
	const data = (): DataSet => check().data;
	const plan = () => ({
		format: 1,
		rules_version: 0,
		name: 'Test',
		event: { everyone: 100, organisers: 10, appetite_factor: 1.3 },
		days: [
			{
				date: '2027-07-09',
				meals: [{ type: 'dinner', time: '19:00', appetite: true, dishes: [{ recipe: 'dal' }] }]
			}
		],
		shopping: { checked: ['red-lentils'] }
	});
	const run = (change: (p: ReturnType<typeof plan>) => void = () => {}) => {
		const p = plan();
		change(p);
		return validatePlan(p, data(), 'plan.yaml');
	};

	it('a correct plan has no problems', () => {
		expect(run()).toEqual([]);
	});

	it('unknown-recipe: suggests the closest recipe', () => {
		const issues = run((p) => {
			p.days[0].meals[0].dishes[0].recipe = 'dahl';
		});
		expect(find(issues, 'unknown-recipe')?.fix).toContain('"dal"');
		expect(find(issues, 'unknown-recipe')?.where).toBe('days > #1 > meals > #1 > dishes > #1 > recipe');
	});

	it('bad-date: a date that does not exist', () => {
		const issues = run((p) => {
			p.days[0].date = '2027-02-30';
		});
		expect(find(issues, 'bad-date')).toBeDefined();
	});

	it('a share of the meal cannot be more than 1', () => {
		const issues = run((p) => {
			(p.days[0].meals[0].dishes[0] as Record<string, unknown>).share = 1.5;
		});
		expect(find(issues, 'invalid')?.message).toContain('at most 1');
	});

	it('unknown-ingredient: a ticked-off ingredient must exist', () => {
		const issues = run((p) => {
			p.shopping.checked = ['red-lentil'];
		});
		expect(find(issues, 'unknown-ingredient')?.fix).toContain('"red-lentils"');
	});

	it('empty-meal: a meal without dishes is only a warning', () => {
		const issues = run((p) => {
			p.days[0].meals[0].dishes = [];
		});
		expect(find(issues, 'empty-meal')?.severity).toBe('warning');
	});

	it('duplicate-dish: the same recipe twice in a meal', () => {
		const issues = run((p) => {
			p.days[0].meals[0].dishes.push({ recipe: 'dal' });
		});
		expect(find(issues, 'duplicate-dish')).toBeDefined();
	});

	it('plan-uses-needs-review: warns when a dish may have wrong amounts', () => {
		const d = data();
		d.recipes.dal.needsReview = true;
		expect(find(validatePlan(plan(), d, 'plan.yaml'), 'plan-uses-needs-review')).toBeDefined();
	});

	it('unknown-field: a mistyped plan field is corrected', () => {
		const p = { ...plan(), evnt: plan().event } as Record<string, unknown>;
		delete p.event;
		const issues = validatePlan(p, data(), 'plan.yaml');
		expect(find(issues, 'unknown-field')?.fix).toContain('Did you mean "event"');
	});
});

describe('everything wrong shows up in one run', () => {
	it('a recipe with a wrong field AND a misspelled ingredient reports both', () => {
		const { issues } = check((raw) => {
			dal(raw).category = 'mian';
			dal(raw).per_100g = { 'red-lentil': '10 g' };
		});
		expect(find(issues, 'not-allowed')).toBeDefined();
		expect(find(issues, 'unknown-ingredient')).toBeDefined();
	});

	it('a plan does not claim that a broken recipe does not exist', () => {
		const raw = base();
		dal(raw).category = 'mian';
		const { data, broken } = validateData(raw);
		const plan = {
			format: 1,
			rules_version: 0,
			name: 'T',
			event: { everyone: 10, organisers: 1 },
			days: [{ date: '2027-07-09', meals: [{ type: 'dinner', dishes: [{ recipe: 'dal' }] }] }]
		};
		expect(find(validatePlan(plan, data, 'p.yaml', broken), 'unknown-recipe')).toBeUndefined();
		expect(find(validatePlan(plan, data, 'p.yaml'), 'unknown-recipe')).toBeDefined();
	});
});
