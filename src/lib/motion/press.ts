// How a pressed button answers the finger (A2 of docs/ANIMATIONS.md).
// Without fun a button just sinks a little (CSS). With fun it squashes, and the big red ones also throw crumbs.
import { strength } from './fun.svelte.ts';
import { allows } from './mode.svelte.ts';
import { burst } from './particles.ts';

export function press(node: HTMLElement, options: { crumbs?: boolean } = {}) {
	node.classList.add('press-fx');

	const down = (event: PointerEvent) => {
		if (strength('A2') !== 'crazy' || !allows.flights() || (node as HTMLButtonElement).disabled) return;
		node.classList.add('squash');
		if (options.crumbs) burst({ x: event.clientX, y: event.clientY, count: 14, kind: 'crumb', spread: 200, speed: 300, gravity: 700, life: 0.9, size: 7, colors: ['#f2b632', '#fff6e0', '#c24a2c'] });
	};
	const up = () => node.classList.remove('squash');

	node.addEventListener('pointerdown', down);
	for (const type of ['pointerup', 'pointerleave', 'pointercancel']) node.addEventListener(type, up);
	return {
		update(next: { crumbs?: boolean }) {
			options = next;
		},
		destroy() {
			node.removeEventListener('pointerdown', down);
			for (const type of ['pointerup', 'pointerleave', 'pointercancel']) node.removeEventListener(type, up);
		}
	};
}
