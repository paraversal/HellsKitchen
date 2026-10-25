import type { Category } from './kitchen-engine/types.ts';

/** How the categories of recipes are named on screen, in the order they are listed. */
export const CATEGORIES: { id: Category; one: string; many: string }[] = [
	{ id: 'main', one: 'Main', many: 'Mains' },
	{ id: 'brunch', one: 'Brunch', many: 'Brunch' },
	{ id: 'helper-snack', one: 'Helper snack', many: 'Helper snacks' },
	{ id: 'drink', one: 'Drink', many: 'Drinks' },
	{ id: 'misc', one: 'Misc', many: 'Misc' }
];

export const categoryName = (id: Category) => CATEGORIES.find((c) => c.id === id)?.one ?? id;
