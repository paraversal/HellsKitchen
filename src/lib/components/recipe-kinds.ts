import CakeSlice from '@lucide/svelte/icons/cake-slice';
import Croissant from '@lucide/svelte/icons/croissant';
import CupSoda from '@lucide/svelte/icons/cup-soda';
import PackageOpen from '@lucide/svelte/icons/package-open';
import Soup from '@lucide/svelte/icons/soup';
import type { Component } from 'svelte';
import type { Category } from '../kitchen-engine/types.ts';

/** What a recipe without a photo shows: an icon for its kind, on a plate in the color of the kind. Every main dish has the same one. Designed on the Design System sheet of UI.fig. */
export const RECIPE_KINDS: Record<Category, { icon: Component<{ size?: number }>; tint: string; accent: string }> = {
	main: { icon: Soup, tint: 'tomato-tint', accent: 'tomato' },
	brunch: { icon: Croissant, tint: 'mustard-tint', accent: 'mustard' },
	'helper-snack': { icon: CakeSlice, tint: 'plum-tint', accent: 'plum' },
	drink: { icon: CupSoda, tint: 'sky-tint', accent: 'sky' },
	misc: { icon: PackageOpen, tint: 'leaf-tint', accent: 'leaf' }
};
