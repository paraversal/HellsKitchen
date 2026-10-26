// Things that fly from one place on the screen to another: a plate into a meal, a ticked item into the basket.
// The thing is copied into a layer above everything and moved along a curve; the real elements stay where they are.
import { allows } from './mode.svelte.ts';

export type FlyOptions = {
	/** How high the arc rises, in pixels. 0 is a straight line. */
	arc?: number;
	/** Turns on the way, in degrees. */
	spin?: number;
	duration?: number;
	/** Called now and then on the way with the position, for a trail. */
	trail?: (x: number, y: number) => void;
	/** The size at the end, as a share of the size at the start. */
	shrink?: number;
	/** Changes the copy before it flies, for example to show it ticked. */
	prepare?: (copy: HTMLElement) => void;
	/** Where it starts, when `source` is a copy that is not on the page (its own box is empty then). */
	from?: DOMRect;
};

const center = (box: DOMRect) => ({ x: box.left + box.width / 2, y: box.top + box.height / 2 });

/** Flies a copy of `source` to the middle of `target`. Resolves when it lands. */
export async function fly(source: Element, target: Element, { arc = 90, spin = 0, duration = 700, trail, shrink = 1, from: start, prepare }: FlyOptions = {}): Promise<void> {
	if (!allows.flights()) return;
	const from = start ?? source.getBoundingClientRect();
	const to = target.getBoundingClientRect();
	const a = center(from);
	const b = center(to);
	const copy = source.cloneNode(true) as HTMLElement;
	copy.removeAttribute('id');
	copy.style.cssText = `position:fixed;left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;margin:0;pointer-events:none;z-index:100001;will-change:transform`;
	prepare?.(copy);
	document.body.append(copy);

	const steps = 24;
	const keyframes: Keyframe[] = [];
	for (let i = 0; i <= steps; i++) {
		const t = i / steps;
		// A curve that rises in the middle: the straight line plus a bump of `arc` pixels.
		const x = a.x + (b.x - a.x) * t - a.x;
		const y = a.y + (b.y - a.y) * t - a.y - Math.sin(Math.PI * t) * arc;
		const scale = 1 + (shrink - 1) * t;
		keyframes.push({ transform: `translate(${x}px, ${y}px) rotate(${spin * t}deg) scale(${scale})` });
	}
	const animation = copy.animate(keyframes, { duration, easing: 'cubic-bezier(0.45, 0, 0.35, 1)', fill: 'forwards' });
	const timer = trail
		? setInterval(() => {
				const box = copy.getBoundingClientRect();
				trail(box.left + box.width / 2, box.top + box.height / 2);
			}, 55)
		: undefined;
	try {
		await animation.finished.catch(() => {});
	} finally {
		clearInterval(timer);
		copy.remove();
	}
}
