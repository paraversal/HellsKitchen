import Coffee from '@lucide/svelte/icons/coffee';
import Cookie from '@lucide/svelte/icons/cookie';
import Moon from '@lucide/svelte/icons/moon';
import Sun from '@lucide/svelte/icons/sun';
import Utensils from '@lucide/svelte/icons/utensils';
import type { Component } from 'svelte';
import { MEAL_LABELS } from '../plan/meal-labels.ts';

export type MealType = 'breakfast' | 'lunch' | 'coffee' | 'dinner' | 'snack';

/** How each kind of meal looks: its name, icon, and the tint behind the icon. */
export const MEAL_TYPES: Record<MealType, { label: string; short: string; icon: Component<{ size?: number }>; color: string; tint: string }> = {
	breakfast: { ...MEAL_LABELS.breakfast, icon: Coffee, color: 'mustard-ink', tint: 'mustard-tint' },
	lunch: { ...MEAL_LABELS.lunch, icon: Sun, color: 'leaf', tint: 'leaf-tint' },
	coffee: { ...MEAL_LABELS.coffee, icon: Cookie, color: 'sky', tint: 'sky-tint' },
	dinner: { ...MEAL_LABELS.dinner, icon: Moon, color: 'plum', tint: 'plum-tint' },
	snack: { ...MEAL_LABELS.snack, icon: Utensils, color: 'tomato', tint: 'tomato-tint' }
};
