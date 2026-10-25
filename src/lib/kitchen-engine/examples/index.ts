// The worked examples from SPEC.md. Each is also a test (examples.test.ts), so the numbers printed in the spec cannot drift from the code.
// Every example has a marker line in SPEC.md, <!-- example: ID -->, and a test checks that the two lists match.
import type { Data, Plan } from '../types.ts';

export type Example = {
	id: string;
	rule: string;
	data: Data;
	plan: Plan;
	/** The exact total need per ingredient, in the base unit. */
	needs: Record<string, number>;
	/** Packs to buy per ingredient. */
	packs?: Record<string, number>;
};

const event = { everyone: 200, organisers: 32, appetiteFactor: 1.3 };
const stores = { supermarket: 'Supermarket', none: 'Not bought' };

export const EXAMPLES: Example[] = [
	{
		// Alcohol-free punch for 200 people. The old Excel buys only half of this, which was a bug.
		id: 'R6-punch-apple',
		rule: 'R6',
		data: {
			stores,
			ingredients: { apple: { name: 'Apple', unit: 'g', store: 'supermarket' } },
			recipes: { punch: { name: 'Punch', category: 'drink', portion: 250, per100g: { apple: 10 } } }
		},
		plan: { event, days: [{ date: '2027-07-09', meals: [{ type: 'dinner', for: 'everyone', appetite: false, dishes: [{ recipe: 'punch' }] }] }] },
		needs: { apple: 5000 }
	},
	{
		// Dry spaghetti is one of two main dishes in a Friday meal where the appetite factor is on.
		id: 'R6-spaghetti-friday',
		rule: 'R6',
		data: {
			stores,
			ingredients: { pasta: { name: 'Pasta', unit: 'g', store: 'supermarket' }, tomato: { name: 'Tomato', unit: 'g', store: 'supermarket' } },
			recipes: {
				spaghetti: { name: 'Spaghetti', category: 'main', portion: 125, per100g: { pasta: 100 } },
				sauce: { name: 'Tomato sauce', category: 'main', portion: 150, per100g: { tomato: 80 } }
			}
		},
		plan: {
			event,
			days: [{ date: '2027-07-09', meals: [{ type: 'dinner', for: 'everyone', appetite: true, dishes: [{ recipe: 'spaghetti' }, { recipe: 'sauce' }] }] }]
		},
		needs: { pasta: 16250, tomato: 15600 }
	},
	{
		// The only main dish in a meal feeds everyone.
		id: 'R4-single-main',
		rule: 'R4',
		data: {
			stores,
			ingredients: { pasta: { name: 'Pasta', unit: 'g', store: 'supermarket' } },
			recipes: { spaghetti: { name: 'Spaghetti', category: 'main', portion: 125, per100g: { pasta: 100 } } }
		},
		plan: { event, days: [{ date: '2027-07-09', meals: [{ type: 'dinner', for: 'everyone', appetite: false, dishes: [{ recipe: 'spaghetti' }] }] }] },
		needs: { pasta: 25000 }
	},
	{
		// 74.6 kg of potatoes, sold in 10 kg sacks.
		id: 'R10-potatoes',
		rule: 'R10',
		data: {
			stores,
			ingredients: { potatoes: { name: 'Potatoes', unit: 'g', store: 'supermarket', pack: 10000 } },
			recipes: { gratin: { name: 'Gratin', category: 'misc', portion: 373, per100g: { potatoes: 100 } } }
		},
		plan: { event, days: [{ date: '2027-07-09', meals: [{ type: 'dinner', for: 'everyone', appetite: false, dishes: [{ recipe: 'gratin' }] }] }] },
		needs: { potatoes: 74600 },
		packs: { potatoes: 8 }
	}
];
