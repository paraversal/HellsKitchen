// A tiny, made-up data set for the engine's own tests. It is not the real data: those tests live in src/lib/integration.
import type { Data, Dish, Event, Meal, Plan } from './types.ts';

export const data: Data = {
	stores: { supermarket: 'Supermarket', market: 'Market', none: 'Not bought' },
	ingredients: {
		apple: { name: 'Apple', unit: 'g', store: 'supermarket', price: 3, pack: 5000 },
		'apple-juice': { name: 'Apple juice', unit: 'ml', store: 'supermarket', price: 2 },
		flour: { name: 'Flour', unit: 'g', store: 'supermarket' },
		lemon: { name: 'Lemon', unit: 'pcs', store: 'supermarket', price: 0.5 },
		pasta: { name: 'Pasta', unit: 'g', store: 'market', price: 1.5, pack: 5000 },
		tomato: { name: 'Tomato', unit: 'g', store: 'market', price: 2 },
		tea: { name: 'Tea', unit: 'pack', store: 'market', price: 4 },
		water: { name: 'Water', unit: 'ml', store: 'none' }
	},
	recipes: {
		punch: { name: 'Punch', category: 'drink', portion: 250, per100g: { apple: 10, 'apple-juice': 45, lemon: 0.011, water: 20 } },
		spaghetti: { name: 'Spaghetti', category: 'main', portion: 125, per100g: { pasta: 100 } },
		sauce: { name: 'Tomato sauce', category: 'main', portion: 150, per100g: { tomato: 80, water: 10 } },
		bread: { name: 'Bread', category: 'misc', portion: 250, per100g: { flour: 100 } },
		crumble: { name: 'Apple crumble', category: 'helper-snack', portion: 150, per100g: { apple: 52, flour: 31 } },
		teatime: { name: 'Tea time', category: 'misc', portion: 200, per100g: { tea: 0.1 } }
	}
};

export const event: Event = { everyone: 200, organisers: 32, appetiteFactor: 1.3 };

export const dish = (recipe: string, extra: Partial<Dish> = {}): Dish => ({ recipe, ...extra });

export const meal = (dishes: Dish[], extra: Partial<Meal> = {}): Meal => ({ type: 'dinner', for: 'everyone', appetite: false, dishes, ...extra });

export const plan = (meals: Meal[], planEvent: Event = event): Plan => ({ event: planEvent, days: [{ date: '2027-07-09', meals }] });
