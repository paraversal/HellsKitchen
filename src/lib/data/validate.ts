// The checks on the data: the shape of each file (schema.ts) and everything between files, like
// "does this ingredient exist?". It is what a database would do with keys and constraints, see docs/STACK.md.
// It only works on data it is given and never reads files, so the app and the command line can share it.
import type { z } from 'zod';
import { FIELD_NAMES, ID_FORMAT, ingredientsSchema, planSchema, recipeSchema, storesSchema } from './schema.ts';
import { parseQuantity, type DataUnit } from './quantity.ts';
import { closest, type Issue, type Severity } from './issues.ts';

export const FILES = {
	stores: 'data/stores.yaml',
	ingredients: 'data/ingredients.yaml',
	recipe: (id: string) => `data/recipes/${id}.yaml`
};

/** A recipe whose ingredients weigh more than this many grams per 100 g of finished dish is probably a mistake. */
export const HEAVY_RECIPE = 300;
/** Less than this and ingredients are probably missing. */
export const LIGHT_RECIPE = 50;

export type Ingredient = { name: string; unit: DataUnit; store: string; price?: number; pack?: number };
export type Recipe = {
	name: string;
	category: string;
	/** Grams one guest is expected to eat. */
	portion: number;
	/** Per 100 g of finished dish, in the ingredient's own unit (g, ml, pcs, pack or jar). */
	per100g: Record<string, number>;
	method?: string;
	source?: string;
	needsReview: boolean;
	reviewNote?: string;
};
export type DataSet = {
	stores: Record<string, string>;
	ingredients: Record<string, Ingredient>;
	recipes: Record<string, Recipe>;
};

/**
 * The parsed contents of the data files. A value of `undefined` means "this file could not be read, and that was
 * already reported", so the checks that depend on it are skipped instead of producing a pile of follow-on errors.
 */
export type RawData = {
	stores: unknown;
	ingredients: unknown;
	/** One entry per file in data/recipes/, keyed by the file name without .yaml. */
	recipes: Record<string, unknown>;
};

// --- turning zod's complaints into plain language -------------------------------------------------

function valueAt(root: unknown, path: PropertyKey[]): unknown {
	let value = root;
	for (const key of path) {
		if (value === null || typeof value !== 'object') return undefined;
		value = (value as Record<PropertyKey, unknown>)[key];
	}
	return value;
}

function describe(value: unknown): string {
	if (value === null || value === undefined) return 'empty';
	if (typeof value === 'string') return `"${value}"`;
	if (Array.isArray(value)) return 'a list';
	if (typeof value === 'object') return 'a group of fields';
	return String(value);
}

const EXPECTED: Record<string, string> = {
	string: 'text',
	number: 'a number',
	int: 'a whole number',
	boolean: 'true or false',
	array: 'a list',
	object: 'a group of fields'
};

function where(path: PropertyKey[]): string | undefined {
	const parts = path.map((p) => (typeof p === 'number' ? `#${p + 1}` : String(p)));
	return parts.length ? parts.join(' > ') : undefined;
}

function fromZod(error: z.ZodError, file: string, raw: unknown, fields: string[]): Issue[] {
	return error.issues.map((issue): Issue => {
		const base = { severity: 'error' as Severity, file, where: where(issue.path) };
		const last = issue.path[issue.path.length - 1];
		const value = valueAt(raw, issue.path);
		if (issue.code === 'unrecognized_keys') {
			const keys = issue.keys;
			const guess = closest(keys[0], fields);
			return {
				...base,
				code: 'unknown-field',
				message: `unknown ${keys.length === 1 ? 'field' : 'fields'} ${keys.map((k) => `"${k}"`).join(', ')}`,
				fix: guess ? `Did you mean "${guess}"?` : `Allowed fields: ${[...new Set(fields)].join(', ')}.`
			};
		}
		if (issue.code === 'invalid_type') {
			if (value === undefined) return { ...base, code: 'missing-field', message: `the field "${String(last)}" is missing` };
			return {
				...base,
				code: 'wrong-type',
				message: `should be ${EXPECTED[issue.expected] ?? issue.expected}, but is ${describe(value)}`
			};
		}
		if (issue.code === 'invalid_value') {
			const allowed = issue.values.map(String);
			const guess = typeof value === 'string' ? closest(value, allowed) : undefined;
			return {
				...base,
				code: 'not-allowed',
				message: `${describe(value)} is not allowed here`,
				fix: guess ? `Did you mean "${guess}"? Allowed: ${allowed.join(', ')}.` : `Use one of: ${allowed.join(', ')}.`
			};
		}
		return { ...base, code: 'invalid', message: issue.message };
	});
}

// --- the checks ---------------------------------------------------------------------------------------

export function validateData(raw: RawData): { issues: Issue[]; data: DataSet; broken: string[] } {
	const issues: Issue[] = [];
	const data: DataSet = { stores: {}, ingredients: {}, recipes: {} };
	const report = (severity: Severity, code: string, file: string, message: string, extra: { where?: string; fix?: string } = {}) =>
		issues.push({ severity, code, file, message, ...extra });
	const idProblem = (kind: string, id: string, file: string, at?: string): boolean => {
		if (ID_FORMAT.test(id)) return false;
		const suggestion = id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
		report('error', 'bad-id', file, `${kind} id "${id}" is not allowed`, {
			where: at,
			fix: `Ids use lower case letters, digits and single hyphens.${suggestion ? ` Try "${suggestion}".` : ''}`
		});
		return true;
	};

	// stores
	if (raw.stores !== undefined) {
		const parsed = storesSchema.safeParse(raw.stores);
		if (!parsed.success) issues.push(...fromZod(parsed.error, FILES.stores, raw.stores, []));
		else {
			for (const [id, name] of Object.entries(parsed.data)) if (!idProblem('store', id, FILES.stores, id)) data.stores[id] = name;
			if (!('none' in parsed.data)) {
				report('error', 'missing-none-store', FILES.stores, 'the store "none" is missing', {
					fix: 'Add the line  none: Not bought  . It is for things that are never bought, like tap water.'
				});
			}
		}
	}

	// ingredients
	const knownIngredientIds = new Set<string>();
	if (raw.ingredients !== undefined) {
		const parsed = ingredientsSchema.safeParse(raw.ingredients);
		if (!parsed.success) issues.push(...fromZod(parsed.error, FILES.ingredients, raw.ingredients, FIELD_NAMES.ingredient));
		else {
			for (const [id, item] of Object.entries(parsed.data)) {
				knownIngredientIds.add(id);
				const before = issues.length;
				idProblem('ingredient', id, FILES.ingredients, id);
				if (raw.stores !== undefined && !(item.store in data.stores)) {
					const guess = closest(item.store, Object.keys(data.stores));
					report('error', 'unknown-store', FILES.ingredients, `the store "${item.store}" does not exist`, {
						where: `${id} > store`,
						fix: guess ? `Did you mean "${guess}"? Otherwise add the store to ${FILES.stores}.` : `Use a store from ${FILES.stores}, or add a new one there.`
					});
				}
				let pack: number | undefined;
				if (item.pack !== undefined) {
					if (item.unit !== 'g' && item.unit !== 'ml') {
						report('error', 'pack-not-allowed', FILES.ingredients, `"${id}" is counted in ${item.unit}, which has a pack size of 1`, {
							where: `${id} > pack`,
							fix: 'Remove the pack line.'
						});
					} else {
						const q = parseQuantity(item.pack);
						if (!q.ok) report('error', 'bad-quantity', FILES.ingredients, q.problem, { where: `${id} > pack` });
						else if (q.quantity.unit !== item.unit) {
							report('error', 'unit-mismatch', FILES.ingredients, `the pack size is written in ${q.quantity.unit}, but "${id}" is counted in ${item.unit}`, {
								where: `${id} > pack`,
								fix: item.unit === 'g' ? 'Write the pack size in g or kg.' : 'Write the pack size in ml or l.'
							});
						} else pack = q.quantity.amount;
					}
				}
				if (item.store === 'none' && item.price !== undefined) {
					report('warning', 'price-on-unbought', FILES.ingredients, `"${id}" is never bought, so its price is ignored`, { where: `${id} > price` });
				}
				if (issues.length === before) data.ingredients[id] = { name: item.name, unit: item.unit, store: item.store, price: item.price, pack };
			}
		}
	}

	// recipes
	const broken: string[] = [];
	const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

	/** Checks the ingredient lines of one recipe. Returns the amounts that are fine, and how much they weigh together. */
	const checkLines = (file: string, lines: Record<string, unknown>) => {
		const amounts: Record<string, number> = {};
		let weight = 0;
		for (const [ingredientId, text] of Object.entries(lines)) {
			const at = `per_100g > ${ingredientId}`;
			idProblem('ingredient', ingredientId, file, at);
			const ingredient = data.ingredients[ingredientId];
			if (!ingredient && raw.ingredients !== undefined && !knownIngredientIds.has(ingredientId)) {
				const guess = closest(ingredientId, [...knownIngredientIds]);
				report('error', 'unknown-ingredient', file, `there is no ingredient "${ingredientId}"`, {
					where: at,
					fix: guess ? `Did you mean "${guess}"? Otherwise add it to ${FILES.ingredients} first.` : `Add it to ${FILES.ingredients} first, with its unit and store.`
				});
			}
			const q = parseQuantity(text);
			if (!q.ok) {
				report('error', 'bad-quantity', file, q.problem, { where: at });
				continue;
			}
			if (ingredient && q.quantity.unit !== ingredient.unit) {
				const also = ingredient.unit === 'g' ? ' or kg' : ingredient.unit === 'ml' ? ' or l' : '';
				report('error', 'unit-mismatch', file, `"${text}" is written in ${q.quantity.unit}, but "${ingredientId}" is counted in ${ingredient.unit}`, {
					where: at,
					fix: `Write the amount in ${ingredient.unit}${also}, or change the unit of the ingredient in ${FILES.ingredients}.`
				});
				continue;
			}
			amounts[ingredientId] = q.quantity.amount;
			if (q.quantity.unit === 'g' || q.quantity.unit === 'ml') weight += q.quantity.amount;
		}
		return { amounts, weight };
	};

	for (const [id, rawRecipe] of Object.entries(raw.recipes)) {
		const file = FILES.recipe(id);
		const before = issues.length;
		idProblem('recipe', id, file);
		const parsed = recipeSchema.safeParse(rawRecipe);
		if (!parsed.success) {
			issues.push(...fromZod(parsed.error, file, rawRecipe, FIELD_NAMES.recipe));
			// Still look at the ingredient lines, so that everything wrong shows up in one go.
			const lines = isRecord(rawRecipe) ? rawRecipe.per_100g : undefined;
			if (isRecord(lines)) checkLines(file, lines);
			broken.push(id);
			continue;
		}
		const r = parsed.data;

		let portion = 0;
		const p = parseQuantity(r.portion);
		if (!p.ok) report('error', 'bad-quantity', file, p.problem, { where: 'portion' });
		else if (p.quantity.unit !== 'g') {
			report('error', 'portion-unit', file, `the portion is written in ${p.quantity.unit}, but it must be grams`, {
				where: 'portion',
				fix: 'Write it in g, like "250 g". For drinks, 1 ml counts as 1 g.'
			});
		} else portion = p.quantity.amount;

		if (!Object.keys(r.per_100g).length) report('error', 'no-ingredients', file, 'a recipe needs at least one ingredient', { where: 'per_100g' });
		const { amounts, weight } = checkLines(file, r.per_100g);

		if (!r.status && weight > HEAVY_RECIPE) {
			report('warning', 'heavy-recipe', file, `the ingredients add up to ${Math.round(weight)} g per 100 g of finished dish (${(weight / 100).toFixed(1)} times)`, {
				fix: 'Check the amounts and units. If it cannot be fixed now, add  status: needs-review  and a review_note.'
			});
		}
		if (!r.status && weight > 0 && weight < LIGHT_RECIPE) {
			report('warning', 'light-recipe', file, `the ingredients add up to only ${Math.round(weight)} g per 100 g of finished dish`, {
				fix: 'Ingredients may be missing, such as water.'
			});
		}
		if (r.status) {
			report('note', 'needs-review', file, r.review_note ?? 'marked needs-review');
			if (!r.review_note) report('warning', 'review-without-note', file, 'is marked needs-review but has no review_note explaining why');
		} else if (r.review_note) {
			report('warning', 'note-without-status', file, 'has a review_note but is not marked  status: needs-review');
		}
		if (!r.method) report('warning', 'no-method', file, 'has no method');

		if (issues.slice(before).every((i) => i.severity !== 'error')) {
			data.recipes[id] = {
				name: r.name,
				category: r.category,
				portion,
				per100g: amounts,
				method: r.method,
				source: r.source,
				needsReview: r.status === 'needs-review',
				reviewNote: r.review_note
			};
		} else broken.push(id);
	}

	// what is left over, and what is missing
	if (raw.ingredients !== undefined) {
		const used = new Set(Object.values(raw.recipes).flatMap((r) => Object.keys(((r as { per_100g?: object })?.per_100g ?? {}) as object)));
		for (const [id, ingredient] of Object.entries(data.ingredients)) {
			if (!used.has(id)) report('warning', 'unused-ingredient', FILES.ingredients, `"${id}" is used by no recipe`, { where: id });
			if (ingredient.store !== 'none' && ingredient.price === undefined) {
				report('warning', 'no-price', FILES.ingredients, `"${id}" has no price, so it is left out of the cost estimate`, { where: id });
			}
			if ((ingredient.unit === 'g' || ingredient.unit === 'ml') && ingredient.store !== 'none' && ingredient.pack === undefined) {
				report('note', 'no-pack', FILES.ingredients, `"${id}" has no pack size, so the shopping list shows only the exact need`, { where: id });
			}
		}
	}
	return { issues, data, broken };
}

/** Checks one plan against the data. A plan lives on the device, so this is for the example plans and for plans that are imported. */
export function validatePlan(raw: unknown, data: DataSet, file: string, broken: readonly string[] = []): Issue[] {
	const parsed = planSchema.safeParse(raw);
	if (!parsed.success) return fromZod(parsed.error, file, raw, FIELD_NAMES.plan);
	const issues: Issue[] = [];
	const report = (severity: Severity, code: string, message: string, extra: { where?: string; fix?: string } = {}) =>
		issues.push({ severity, code, file, message, ...extra });
	const plan = parsed.data;

	plan.days.forEach((day, d) => {
		const when = new Date(`${day.date}T00:00:00Z`);
		if (Number.isNaN(when.getTime()) || when.toISOString().slice(0, 10) !== day.date) {
			report('error', 'bad-date', `"${day.date}" is not a real date`, { where: `days > #${d + 1} > date` });
		}
		day.meals.forEach((meal, m) => {
			const seen = new Set<string>();
			meal.dishes.forEach((dish, k) => {
				const at = `days > #${d + 1} > meals > #${m + 1} > dishes > #${k + 1}`;
				const recipe = data.recipes[dish.recipe];
				if (!recipe && broken.includes(dish.recipe)) {
					// The recipe exists but has errors of its own, which are reported there.
				} else if (!recipe) {
					const guess = closest(dish.recipe, Object.keys(data.recipes));
					report('error', 'unknown-recipe', `there is no recipe "${dish.recipe}"`, {
						where: `${at} > recipe`,
						fix: guess ? `Did you mean "${guess}"?` : 'Use the name of a file in data/recipes/, without .yaml.'
					});
				} else if (recipe.needsReview) {
					report('warning', 'plan-uses-needs-review', `"${dish.recipe}" is marked needs-review, so its amounts may be wrong`, { where: `${at} > recipe` });
				}
				if (seen.has(dish.recipe)) report('warning', 'duplicate-dish', `"${dish.recipe}" is in this meal twice`, { where: at });
				seen.add(dish.recipe);
				if (dish.portion !== undefined) {
					const q = parseQuantity(dish.portion);
					if (!q.ok) report('error', 'bad-quantity', q.problem, { where: `${at} > portion` });
					else if (q.quantity.unit !== 'g') report('error', 'portion-unit', `the portion is written in ${q.quantity.unit}, but it must be grams`, { where: `${at} > portion` });
				}
			});
		});
	});
	for (const id of plan.shopping?.checked ?? []) {
		if (!(id in data.ingredients)) {
			const guess = closest(id, Object.keys(data.ingredients));
			report('error', 'unknown-ingredient', `there is no ingredient "${id}"`, { where: 'shopping > checked', fix: guess ? `Did you mean "${guess}"?` : undefined });
		}
	}
	return issues;
}
