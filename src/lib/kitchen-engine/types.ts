// The shapes the kitchen engine works with. They are the engine's own, so the engine needs nothing from outside this folder.
// The data layer (src/lib/data) produces values of these shapes.

/** Every ingredient is counted in one of these. All engine amounts are in this base unit: grams, millilitres, or counts. */
export type Unit = 'g' | 'ml' | 'pcs' | 'pack' | 'jar';

export type Category = 'main' | 'brunch' | 'helper-snack' | 'drink' | 'misc';

export type MealType = 'breakfast' | 'lunch' | 'coffee' | 'dinner' | 'snack';

export type Ingredient = {
	name: string;
	unit: Unit;
	/** The one store it is bought in. The store `none` means it is never bought, like tap water. */
	store: string;
	/** Euros per kilogram (unit g), per litre (unit ml), or per piece, pack or jar. */
	price?: number;
	/** The usual pack size in the ingredient's unit, for g and ml only. */
	pack?: number;
};

export type Recipe = {
	name: string;
	category: Category;
	/** Grams of finished dish one guest is expected to eat. */
	portion: number;
	/** Per 100 g of finished dish, in the ingredient's own unit. */
	per100g: Record<string, number>;
};

export type Data = {
	stores: Record<string, string>;
	ingredients: Record<string, Ingredient>;
	recipes: Record<string, Recipe>;
};

export type Event = {
	everyone: number;
	organisers: number;
	/** Multiplies the main dishes of meals that switch it on. 1 means no change. */
	appetiteFactor: number;
};

export type Dish = {
	recipe: string;
	/** Overrides the default share of the meal's people who get this dish. */
	share?: number;
	/** Overrides the recipe's grams per person. */
	portion?: number;
};

export type Meal = {
	type: MealType;
	for: 'everyone' | 'organisers';
	appetite: boolean;
	dishes: Dish[];
};

export type Plan = {
	event: Event;
	days: { date: string; meals: Meal[] }[];
};

// --- what comes out ----------------------------------------------------------------------------------

export type ShoppingItem = {
	ingredient: string;
	name: string;
	unit: Unit;
	/** The exact amount needed, in the base unit. */
	need: number;
	/** Whole packs to buy, rounded up. Missing when the ingredient has no pack size. */
	packs?: number;
	packSize?: number;
	/** Cost of the exact need. Missing when the ingredient has no price. */
	cost?: number;
};

export type StoreList = {
	store: string;
	name: string;
	items: ShoppingItem[];
	/** Cost of the priced items in this store. */
	cost: number;
	/** How many items in this store have no price. */
	unpriced: number;
};

export type CostEstimate = {
	/** Cost of everything that has a price. */
	total: number;
	/** The share of the food, by weight, that has a price, from 0 to 1. Missing when there is no weighable food. */
	coverage: number | null;
	/** Ingredients that are bought but have no price. */
	unpriced: string[];
};

export type Result = {
	rulesVersion: number;
	/** The exact total need per ingredient, in the base unit, including things that are never bought. */
	needs: Record<string, number>;
	stores: StoreList[];
	cost: CostEstimate;
};
