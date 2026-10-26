import BookOpen from '@lucide/svelte/icons/book-open';
import CalendarDays from '@lucide/svelte/icons/calendar-days';
import Carrot from '@lucide/svelte/icons/carrot';
import ShoppingBasket from '@lucide/svelte/icons/shopping-basket';
import type { Component } from 'svelte';

export type NavId = 'plan' | 'recipes' | 'shopping' | 'pantry';

/** The places of the app, in the order they are shown. */
export const NAV: { id: NavId; label: string; path: '/(app)/plan' | '/(app)/recipes' | '/(app)/shopping' | '/(app)/pantry'; icon: Component<{ size?: number }> }[] = [
	{ id: 'plan', label: 'Plan', path: '/(app)/plan', icon: CalendarDays },
	{ id: 'recipes', label: 'Recipes', path: '/(app)/recipes', icon: BookOpen },
	{ id: 'shopping', label: 'Shopping', path: '/(app)/shopping', icon: ShoppingBasket },
	{ id: 'pantry', label: 'Pantry', path: '/(app)/pantry', icon: Carrot }
];
