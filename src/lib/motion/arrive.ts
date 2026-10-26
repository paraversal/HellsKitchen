// Things that are new on the plan screen: a day (B1) and a meal (B2) of docs/ANIMATIONS.md.
import { cubicOut } from 'svelte/easing';
import { slide } from 'svelte/transition';
import { easing } from './easing.ts';
import { strength } from './fun.svelte.ts';
import { allows } from './mode.svelte.ts';
import type { MealType } from '../components/meal-types.ts';

/** A new day. Without fun it opens up. With fun the strip of tape is slapped on: too big and crooked at first, then it settles. */
export function dayIn(node: HTMLElement) {
	if (!allows.flights()) return { duration: 0 };
	if (strength('B1') === 'playful') {
		node.querySelector('.tape')?.animate([{ transform: 'scale(1.7) rotate(-12deg)', opacity: 0 }, { transform: 'scale(0.95) rotate(1deg)', opacity: 1, offset: 0.5 }, { transform: 'scale(1) rotate(-1.5deg)' }], { duration: 640, easing: easing('spring-bouncy') });
		return { duration: 220, css: (t: number) => `opacity: ${t}` };
	}
	return slide(node, { duration: 300, easing: cubicOut });
}

/** A new meal. It opens up, and with fun the icon plays a little scene of its own kind. */
export function mealIn(node: HTMLElement) {
	if (!allows.flights()) return { duration: 0 };
	const icon = node.querySelector<HTMLElement>('.icon');
	if (strength('B2') === 'playful') mealScene(icon, node.querySelector<HTMLElement>('[data-type]')?.dataset.type as MealType | undefined);
	else icon?.animate([{ transform: 'scale(0.5)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 260, easing: easing('ease-out') });
	return slide(node, { duration: 300, easing: cubicOut });
}

function extra(icon: HTMLElement, css: string): HTMLElement {
	const el = document.createElement('span');
	el.setAttribute('aria-hidden', 'true');
	el.style.cssText = `position:absolute;pointer-events:none;opacity:0;${css}`;
	icon.append(el);
	setTimeout(() => el.remove(), 1600);
	return el;
}

/** B2. A small scene for each kind of meal: steam, a spinning sun, crumbs, a twinkling star, a clink. */
export function mealScene(icon: HTMLElement | null | undefined, type: MealType | undefined): void {
	if (!icon || !type || !allows.flights()) return;
	icon.style.position = 'relative';
	const jiggle = (angles: number[], duration: number) => icon.animate(angles.map((a, k) => ({ transform: `rotate(${a}deg)`, offset: k / (angles.length - 1) })), { duration, easing: 'ease-out' });
	if (type === 'breakfast') {
		jiggle([0, -8, 8, -4, 0], 560);
		[12, 24].forEach((left, k) => extra(icon, `top:-6px;left:${left}px;width:4px;height:14px;border-radius:3px;background:var(--color-ink-soft)`).animate([{ opacity: 0, transform: 'translateY(6px) scaleY(0.4)' }, { opacity: 0.9, offset: 0.3 }, { opacity: 0, transform: 'translateY(-18px) scaleY(1.2)' }], { duration: 1100, delay: k * 220, easing: 'ease-out' }));
	}
	if (type === 'lunch') {
		icon.animate([{ transform: 'rotate(0) scale(1)' }, { transform: 'rotate(360deg) scale(1.18)', offset: 0.7 }, { transform: 'rotate(360deg) scale(1)' }], { duration: 700, easing: easing('spring-soft') });
		extra(icon, 'inset:-4px;border-radius:50%;border:3px solid var(--color-mustard)').animate([{ opacity: 0.8, transform: 'scale(0.9)' }, { opacity: 0, transform: 'scale(1.7)' }], { duration: 700, delay: 120, easing: 'ease-out' });
	}
	if (type === 'coffee') {
		jiggle([0, -10, 10, -5, 0], 480);
		[10, 24].forEach((left, k) => extra(icon, `top:24px;left:${left}px;width:6px;height:6px;border-radius:50%;background:var(--color-ink-soft)`).animate([{ opacity: 0, transform: 'translate(0, 0)' }, { opacity: 1, offset: 0.15 }, { opacity: 0, transform: `translate(${k ? 10 : -10}px, 30px) rotate(90deg)` }], { duration: 800, delay: 100 + k * 160, easing: 'ease-in' }));
	}
	if (type === 'dinner') {
		jiggle([0, 14, -14, 9, -6, 0], 800);
		['top:-2px;right:-2px;width:10px;height:10px', 'top:8px;left:-4px;width:7px;height:7px'].forEach((place, k) =>
			extra(icon, `${place};background:var(--color-mustard);clip-path:polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)`).animate([{ opacity: 0, transform: 'scale(0) rotate(0)' }, { opacity: 1, transform: 'scale(1.2) rotate(45deg)', offset: 0.4 }, { opacity: 0, transform: 'scale(0) rotate(90deg)' }], { duration: 800, delay: 200 + k * 200 })
		);
	}
	if (type === 'snack') jiggle([0, -16, 12, -9, 5, 0], 520);
}
