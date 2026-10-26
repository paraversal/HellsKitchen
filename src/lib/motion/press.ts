// How a pressed button answers the finger (A2 of docs/ANIMATIONS.md).
// Without fun a button just sinks a little (CSS). With fun it squashes, throws a ring from the finger, and the big red ones also throw crumbs.
import { strength } from './fun.svelte.ts';
import { allows } from './mode.svelte.ts';
import { burst } from './particles.ts';

export function press(node: HTMLElement, options: { crumbs?: boolean } = {}) {
	node.classList.add('press-fx');

	const down = (event: PointerEvent) => {
		if (strength('A2') !== 'crazy' || !allows.flights() || (node as HTMLButtonElement).disabled) return;
		node.classList.add('squash');
		const dot = document.createElement('span');
		dot.setAttribute('aria-hidden', 'true');
		dot.style.cssText = `position:fixed;left:${event.clientX - 15}px;top:${event.clientY - 15}px;width:30px;height:30px;border-radius:50%;border:3px solid var(--color-tomato);pointer-events:none;z-index:100000`;
		document.body.append(dot);
		dot.animate([{ transform: 'scale(0.4)', opacity: 0.9 }, { transform: 'scale(2.2)', opacity: 0 }], { duration: 520, easing: 'ease-out' }).finished.then(() => dot.remove(), () => dot.remove());
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
