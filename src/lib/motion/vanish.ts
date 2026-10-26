// B4 of docs/ANIMATIONS.md: a thing that is taken out of the plan goes out with a little show.
// The plan has already changed when this runs, so the show is a copy of the thing, laid over the screen. Nothing waits for it.
import { easing } from './easing.ts';
import type { Strength } from './choices.ts';
import { allows } from './mode.svelte.ts';
import { burst } from './particles.ts';

/** Without fun the copy shrinks away. With fun it is crumpled into a ball, thrown out of the screen, and leaves a puff of flour. */
export function vanish(element: Element | null | undefined, how: Strength): void {
	if (!element || !allows.flights()) return;
	const box = element.getBoundingClientRect();
	if (!box.width) return;
	const copy = element.cloneNode(true) as HTMLElement;
	copy.style.cssText = `position:fixed;left:${box.left}px;top:${box.top}px;width:${box.width}px;height:${box.height}px;margin:0;pointer-events:none;z-index:100001;background:var(--color-paper);will-change:transform`;
	document.body.append(copy);
	const done = () => copy.remove();
	if (how === 'crazy') {
		copy
			.animate(
				[
					{ transform: 'translate(0, 0) scale(1) rotate(0)', borderRadius: '16px', opacity: 1 },
					{ transform: 'translate(0, -6px) scale(0.45, 0.6) rotate(-14deg)', borderRadius: '40%', opacity: 1, offset: 0.35 },
					{ transform: 'translate(10px, -30px) scale(0.3) rotate(10deg)', borderRadius: '50%', opacity: 1, offset: 0.55 },
					{ transform: 'translate(180px, -150px) scale(0.1) rotate(300deg)', borderRadius: '50%', opacity: 0 }
				],
				{ duration: 900, easing: 'ease-in', fill: 'forwards' }
			)
			.finished.then(done, done);
		setTimeout(() => burst({ x: box.left + box.width / 2, y: box.top + box.height / 2, count: 20, kind: 'crumb', spread: 360, speed: 240, gravity: 200, life: 0.7, size: 8, colors: ['#fff6e0', '#efe4cc'] }), 380);
	} else {
		copy
			.animate([{ opacity: 1, transform: 'scaleY(1)' }, { opacity: 0, transform: 'scaleY(0.2)' }], { duration: 240, easing: easing('ease-in'), fill: 'forwards' })
			.finished.then(done, done);
	}
}

/** A thing that shakes nervously until it is told to stop. */
export function nervous(element: Element | null | undefined): () => void {
	if (!element || !allows.flights()) return () => {};
	const shake = element.animate(
		[
			{ transform: 'translate(0, 0) rotate(0)' },
			{ transform: 'translate(-3px, 1px) rotate(-0.8deg)', offset: 0.2 },
			{ transform: 'translate(3px, -1px) rotate(0.8deg)', offset: 0.4 },
			{ transform: 'translate(-2px, 0) rotate(-0.5deg)', offset: 0.6 },
			{ transform: 'translate(2px, 1px) rotate(0.5deg)', offset: 0.8 },
			{ transform: 'translate(0, 0) rotate(0)' }
		],
		{ duration: 500, iterations: Infinity }
	);
	return () => shake.cancel();
}
