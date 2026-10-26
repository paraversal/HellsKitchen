// What each kind of meal is called. Kept apart from the icons (components/meal-types.ts) so that plain code, like the PDF writer, can use the names.
export const MEAL_LABELS = {
	breakfast: { label: 'Breakfast', short: 'Breakfast' },
	lunch: { label: 'Lunch', short: 'Lunch' },
	coffee: { label: 'Coffee & cake', short: 'Coffee' },
	dinner: { label: 'Dinner', short: 'Dinner' },
	snack: { label: 'Snack', short: 'Snack' }
} as const;
