import Coffee from '@lucide/svelte/icons/coffee';
import Cookie from '@lucide/svelte/icons/cookie';
import Moon from '@lucide/svelte/icons/moon';
import Sun from '@lucide/svelte/icons/sun';
import Utensils from '@lucide/svelte/icons/utensils';
import type { Component } from 'svelte';

export type MealType = 'breakfast' | 'lunch' | 'coffee' | 'dinner' | 'snack';

/** How each kind of meal looks: its name, icon, and the tint behind the icon. */
export const MEAL_TYPES: Record<MealType, { label: string; short: string; icon: Component<{ size?: number }>; color: string; tint: string }> = {
	breakfast: { label: 'Breakfast', short: 'Breakfast', icon: Coffee, color: 'mustard', tint: 'mustard-tint' },
	lunch: { label: 'Lunch', short: 'Lunch', icon: Sun, color: 'leaf', tint: 'leaf-tint' },
	coffee: { label: 'Coffee & cake', short: 'Coffee', icon: Cookie, color: 'sky', tint: 'sky-tint' },
	dinner: { label: 'Dinner', short: 'Dinner', icon: Moon, color: 'plum', tint: 'plum-tint' },
	snack: { label: 'Snack', short: 'Snack', icon: Utensils, color: 'tomato', tint: 'tomato-tint' }
};
