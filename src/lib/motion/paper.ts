// E5 of docs/ANIMATIONS.md: pressing Print. With fun, a sheet of paper slides out of the printer icon before the page for paper opens.
import { goto } from '$app/navigation';
import { strength } from './fun.svelte.ts';
import { allows } from './mode.svelte.ts';

/** Does `go` now, or with fun after a sheet of paper has come out of the printer icon inside `node`. Answers whether it waited. */
export function paperThen(node: HTMLElement, go: () => void, delay = 650): boolean {
	if (strength('E5') !== 'playful' || !allows.flights()) {
		go();
		return false;
	}
	const icon = node.querySelector('svg')?.parentElement ?? node;
	icon.style.position = 'relative';
	const sheet = document.createElement('span');
	sheet.setAttribute('aria-hidden', 'true');
	sheet.style.cssText = 'position:absolute;left:50%;top:55%;width:14px;height:18px;margin-left:-7px;border:1.5px solid var(--color-line);border-radius:2px;background:#fff;opacity:0;z-index:0;pointer-events:none';
	icon.prepend(sheet);
	const svg = icon.querySelector('svg');
	if (svg) (svg as unknown as HTMLElement).style.position = 'relative';
	sheet.animate([{ transform: 'translateY(-10px)', opacity: 0 }, { transform: 'translateY(-10px)', opacity: 1, offset: 0.1 }, { transform: 'translateY(26px)', opacity: 1, offset: 0.75 }, { transform: 'translateY(26px)', opacity: 0 }], { duration: 900, easing: 'ease-out' }).finished.then(() => sheet.remove(), () => sheet.remove());
	// Printing must start inside the press itself: a phone refuses to open the print window for something that happens a moment later.
	if (delay === 0) go();
	else setTimeout(go, delay);
	return true;
}

/** Put on a link that leads to printing. */
export function paper(node: HTMLElement) {
	const click = (event: MouseEvent) => {
		const href = node.getAttribute('href') ?? '/';
		if (strength('E5') !== 'playful' || !allows.flights()) return;
		event.preventDefault();
		paperThen(node, () => void goto(href));
	};
	node.addEventListener('click', click);
	return { destroy: () => node.removeEventListener('click', click) };
}
