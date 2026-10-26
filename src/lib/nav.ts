import BookOpen from '@lucide/svelte/icons/book-open';
import CalendarDays from '@lucide/svelte/icons/calendar-days';
import Info from '@lucide/svelte/icons/info';
import ShoppingBasket from '@lucide/svelte/icons/shopping-basket';
import type { Component } from 'svelte';

export type NavId = 'plan' | 'recipes' | 'shopping' | 'meta';

/** The places of the app, in the order they are shown. */
export const NAV: { id: NavId; label: string; path: '/(app)/plan' | '/(app)/recipes' | '/(app)/shopping' | '/(app)/meta'; icon: Component<{ size?: number }> }[] = [
	{ id: 'plan', label: 'Plan', path: '/(app)/plan', icon: CalendarDays },
	{ id: 'recipes', label: 'Recipes', path: '/(app)/recipes', icon: BookOpen },
	{ id: 'shopping', label: 'Shopping', path: '/(app)/shopping', icon: ShoppingBasket },
	{ id: 'meta', label: 'Meta', path: '/(app)/meta', icon: Info }
];
