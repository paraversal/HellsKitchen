// B3 of docs/ANIMATIONS.md: a dish was added to the plan from a recipe.
// Without fun the plus of the recipe turns into a check for a moment. With fun the plate flies, spinning and shedding crumbs, to the Plan tab.
import { adding } from '../plan/current.svelte.ts';
import { wait } from './easing.ts';
import { fly } from './fly.ts';
import { strength } from './fun.svelte.ts';
import { allows } from './mode.svelte.ts';
import { burst, ring } from './particles.ts';
import { hop, tabIcon } from './pill.ts';

/** The plate of a recipe that can be seen right now (the list, the page and the desktop header each have one). */
const visiblePlate = (id: string) => [...document.querySelectorAll<HTMLElement>(`[data-plate="${id}"]`)].find((el) => el.offsetParent !== null);

export async function dishAdded(recipe: string): Promise<void> {
	if (!allows.flights()) return;
	if (strength('B3') !== 'crazy') {
		adding.justAdded = recipe;
		await wait(900);
		if (adding.justAdded === recipe) adding.justAdded = null;
		return;
	}
	// The sheet that asked where to put the dish is still leaving, and it is above everything until it is gone.
	await wait(240);
	const source = visiblePlate(recipe)?.firstElementChild;
	const target = tabIcon('plan');
	if (!source || !target) return;
	await fly(source, target, {
		arc: 150,
		spin: 540,
		duration: 800,
		shrink: 0.5,
		trail: (x, y) => burst({ x, y, count: 3, kind: 'crumb', spread: 360, speed: 90, gravity: 300, life: 0.5, size: 5, colors: ['#f2b632', '#fff6e0'] })
	});
	const box = target.getBoundingClientRect();
	ring(box.left + box.width / 2, box.top + box.height / 2);
	hop(target);
}
