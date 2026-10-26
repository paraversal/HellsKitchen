// The "fun" setting: it chooses between two sets of animations. See choices.ts for what each set holds.
// Calm motion (the device asks for less, or the page says so) always means the set without fun.
import { CHOICES, type ChoiceId, type Strength } from './choices.ts';
import { motion } from './mode.svelte.ts';

const KEY = 'hk-fun';

export const fun = $state({ on: true });

/** Reads the saved choice. Fun is on until someone turns it off. */
export function startFun(): void {
	try {
		fun.on = localStorage.getItem(KEY) !== '0';
	} catch {
		// private windows can refuse this. Fun stays on for this visit.
	}
}

export function setFun(on: boolean): void {
	fun.on = on;
	try {
		localStorage.setItem(KEY, on ? '1' : '0');
	} catch {
		// the choice then lasts until the page is closed
	}
}

/** Whether the animations with fun are in use right now. */
export const isFun = () => fun.on && motion.mode === 'full';

/** The strength of an animation for the setting right now. */
export const strength = (id: ChoiceId): Strength => CHOICES[id][isFun() ? 1 : 0];
