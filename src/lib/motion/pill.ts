// The coloured pill that slides behind the place you are in (A1 and F2 of docs/ANIMATIONS.md): in the tab bar on a phone, in the sidebar on a desktop.
import { easing } from './easing.ts';
import type { Strength } from './choices.ts';
import { allows } from './mode.svelte.ts';

export type Spot = { x: number; y: number; w: number; h: number };

const at = (spot: { x: number; y: number }, scale = '') => `translate(${spot.x}px, ${spot.y}px) ${scale}`.trim();

/** Puts the pill on a spot, without any movement. */
export function setPill(pill: HTMLElement, spot: Spot): void {
	pill.style.width = `${spot.w}px`;
	pill.style.height = `${spot.h}px`;
	pill.style.transform = at(spot);
}

/** Moves the pill from one spot to another. Regular: it slides and settles. Playful: it stretches on the way, like a drop of honey, and squashes when it lands. */
export function movePill(pill: HTMLElement, from: Spot, to: Spot, axis: 'x' | 'y', how: Strength): void {
	setPill(pill, to);
	if (!allows.flights()) return;
	if (how === 'playful') {
		const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
		const stretch = (n: number) => (axis === 'x' ? `scaleX(${n})` : `scaleY(${n})`);
		const far = 1 + Math.min(1, Math.hypot(to.x - from.x, to.y - from.y) / 160) * 0.8;
		pill.animate([{ transform: at(from, stretch(1)) }, { transform: at(mid, stretch(far)), offset: 0.4 }, { transform: at(to, stretch(0.9)), offset: 0.75 }, { transform: at(to, stretch(1)) }], { duration: 480, easing: 'ease-out' });
	} else pill.animate([{ transform: at(from) }, { transform: at(to) }], { duration: 420, easing: easing('spring-soft') });
}

/** A small hop of an icon, as the pill arrives under it. */
export function hop(icon: HTMLElement | undefined): void {
	if (!icon || !allows.flights()) return;
	icon.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-8px)', offset: 0.4 }, { transform: 'translateY(0)' }], { duration: 480, delay: 120, easing: easing('spring-bouncy') });
}

/** The visible entry of a place in the bars (the tab bar and the sidebar are never both on screen). */
export function tabIcon(id: string): HTMLElement | undefined {
	return [...document.querySelectorAll<HTMLElement>(`[data-tab-icon="${id}"]`)].find((el) => el.offsetParent !== null);
}
