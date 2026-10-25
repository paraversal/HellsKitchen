// R1. A recipe is defined per 100 g of finished dish: the `per_100g` field below. See src/lib/kitchen-engine/SPEC.md.
// The shape of every data file, written once, as in docs/DATA.md. Field names are the ones used in the YAML files.
// This checks the SHAPE of one file at a time. The checks between files (does that ingredient exist?) are in validate.ts.
import { z } from 'zod';

export const UNITS = ['g', 'ml', 'pcs', 'pack', 'jar'] as const;
export const CATEGORIES = ['main', 'brunch', 'helper-snack', 'drink', 'misc'] as const;
export const MEAL_TYPES = ['breakfast', 'lunch', 'coffee', 'dinner', 'snack'] as const;

/** Ids use lower case letters, digits and single hyphens: `red-lentils`. */
export const ID_FORMAT = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const text = z.string().trim().min(1, 'must not be empty');

export const storesSchema = z.record(z.string(), text);

export const ingredientSchema = z.strictObject({
	name: text,
	unit: z.enum(UNITS),
	store: z.string(),
	price: z.number().positive('must be more than zero').optional(),
	pack: z.string().optional()
});
export const ingredientsSchema = z.record(z.string(), ingredientSchema);

export const recipeSchema = z.strictObject({
	name: text,
	category: z.enum(CATEGORIES),
	portion: z.string(),
	per_100g: z.record(z.string(), z.string()),
	method: z.string().optional(),
	source: z.string().optional(),
	status: z.literal('needs-review').optional(),
	review_note: z.string().optional()
});

const planDish = z.strictObject({
	recipe: z.string(),
	share: z.number().gt(0, 'must be more than zero').max(1, 'is a share of the meal, so at most 1').optional(),
	portion: z.string().optional()
});

const planMeal = z.strictObject({
	type: z.enum(MEAL_TYPES),
	time: z
		.string()
		.regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'must be a time like "19:00"')
		.optional(),
	for: z.enum(['everyone', 'organisers']).optional(),
	appetite: z.boolean().optional(),
	dishes: z.array(planDish).min(1, 'a meal needs at least one dish')
});

const planDay = z.strictObject({
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be a date like 2027-07-09'),
	meals: z.array(planMeal)
});

export const planSchema = z.strictObject({
	format: z.literal(1),
	rules_version: z.number().int().min(0),
	name: text,
	event: z.strictObject({
		everyone: z.number().int().positive('must be more than zero'),
		organisers: z.number().int().min(0),
		appetite_factor: z.number().positive('must be more than zero').optional()
	}),
	days: z.array(planDay).min(1, 'a plan needs at least one day'),
	shopping: z.strictObject({ checked: z.array(z.string()) }).optional()
});

/** Every field name a file of each kind may contain. Used to suggest the right name when someone mistypes one. */
export const FIELD_NAMES = {
	ingredient: Object.keys(ingredientSchema.shape),
	recipe: Object.keys(recipeSchema.shape),
	plan: [
		...Object.keys(planSchema.shape),
		'everyone', 'organisers', 'appetite_factor',
		...Object.keys(planDay.shape),
		...Object.keys(planMeal.shape),
		...Object.keys(planDish.shape),
		'checked'
	]
};
