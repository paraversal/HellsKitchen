// C3 of docs/ANIMATIONS.md: opening a recipe from the list.
// Regular: the page fades in and rises a little. Playful (on a phone): the plate of the list grows into the plate of the page, as one thing, with the browser's view transitions.
// Crazy (not used for now, kept for the trial page): the plate flies up to its place, the page unrolls from it, and the ingredients drop onto it one by one.
import type { onNavigate } from '$app/navigation';
import { wait } from './easing.ts';
import { fly } from './fly.ts';
import { strength } from './fun.svelte.ts';
import { allows } from './mode.svelte.ts';
import { easing } from './easing.ts';

/** The recipe whose plate is being moved between the list and the page. Its plate in the list carries the transition name. */
export const opened = $state<{ id: string | null }>({ id: null });

let pending: { id: string; copy: Element; box: DOMRect; at: number } | null = null;
/** Set while a view transition carries the page in, so that the page does not also fade in. */
let transitioned = false;

/** Called when a recipe is pressed in the list: remembers its plate, as it looked and where it was. */
export function markOpen(id: string, plate: Element | null | undefined): void {
	opened.id = id;
	const picture = plate?.firstElementChild;
	pending = picture ? { id, copy: picture.cloneNode(true) as Element, box: picture.getBoundingClientRect(), at: performance.now() } : null;
}

/** Called by SvelteKit before a navigation. Opening and closing a recipe on a phone is a view transition, unless fun has its own show. */
type Navigation = Parameters<Parameters<typeof onNavigate>[0]>[0];

export function recipeNavigate(navigation: Navigation): Promise<void> | void {
	transitioned = false;
	const places = [navigation.from?.route.id, navigation.to?.route.id];
	const recipes = ['/(app)/recipes', '/(app)/recipes/[id]'];
	if (strength('C3') !== 'playful' || !('startViewTransition' in document) || !allows.flights()) return;
	if (!matchMedia('(max-width: 899px)').matches) return;
	if (!places.includes('/(app)/recipes/[id]') || !places.every((place) => place && recipes.includes(place))) return;
	transitioned = true;
	return new Promise((resolve) => {
		const transition = document.startViewTransition(async () => {
			resolve();
			await navigation.complete;
		});
		transition.ready.catch(() => {});
		transition.updateCallbackDone.catch(() => {});
		transition.finished.catch(() => {});
	});
}

/** The page of a recipe has appeared. With fun, it makes its entrance. `plate` is the plate of the page, `page` the whole page. */
export async function recipeOpened(id: string, plate: Element | undefined, page: HTMLElement | undefined): Promise<void> {
	opened.id = id;
	const from = pending?.id === id && performance.now() - pending.at < 2000 ? pending : null;
	pending = null;
	const carried = transitioned;
	transitioned = false;
	if (!allows.flights() || !page) return;
	if (strength('C3') !== 'crazy') {
		if (!carried) page.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 240, easing: easing('ease-out') });
		return;
	}
	if (from && plate) void fly(from.copy, plate, { from: from.box, arc: 70, spin: 360, duration: 600, shrink: 1.4 });
	page.animate([{ clipPath: 'circle(0px at 50% 26%)' }, { clipPath: 'circle(170% at 50% 26%)' }], { duration: 800, delay: from ? 350 : 0, easing: 'cubic-bezier(0.3, 0.6, 0.3, 1)', fill: 'backwards' });
	await wait(0);
	page.querySelectorAll('.ingredients li').forEach((li, i) => li.animate([{ transform: 'translateY(-40px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 520, delay: 800 + i * 70, easing: easing('spring-bouncy'), fill: 'backwards' }));
}
