// Which things look pressed. The browser's own :active would also light up whatever a finger lands on at the start of a scroll, so pressed things are marked here instead:
// a mouse press marks at once; a finger marks only when it stays still for a moment, or when it lifts without having moved (a quick tap still shows).
// The mark is the attribute `data-pressed`, on the thing and on everything around it, as :active would be. Styles use `[data-pressed]`.

const HOLD_MS = 100;
const FLASH_MS = 140;
const MOVED_PX = 8;

export function startPressed(): () => void {
	let marked: Element[] = [];
	let timer: ReturnType<typeof setTimeout> | undefined;
	let from = { x: 0, y: 0 };
	let target: Element | null = null;

	const clear = () => {
		clearTimeout(timer);
		for (const element of marked) element.removeAttribute('data-pressed');
		marked = [];
		target = null;
	};

	const mark = () => {
		for (let element = target; element && element !== document.body; element = element.parentElement) {
			element.setAttribute('data-pressed', '');
			marked.push(element);
		}
	};

	const down = (event: PointerEvent) => {
		clear();
		target = event.target instanceof Element ? event.target : null;
		from = { x: event.clientX, y: event.clientY };
		if (event.pointerType === 'mouse') mark();
		else timer = setTimeout(mark, HOLD_MS);
	};

	const move = (event: PointerEvent) => {
		if (event.pointerType !== 'mouse' && Math.hypot(event.clientX - from.x, event.clientY - from.y) > MOVED_PX) clear();
	};

	const up = (event: PointerEvent) => {
		if (event.pointerType === 'mouse' || !target) return clear();
		// A quick tap: it is shown pressed for a moment, as it is let go.
		clearTimeout(timer);
		if (!marked.length) mark();
		timer = setTimeout(clear, FLASH_MS);
	};

	addEventListener('pointerdown', down, { capture: true, passive: true });
	addEventListener('pointermove', move, { capture: true, passive: true });
	addEventListener('pointerup', up, { capture: true, passive: true });
	addEventListener('pointercancel', clear, { capture: true, passive: true });
	return () => {
		clear();
		removeEventListener('pointerdown', down, true);
		removeEventListener('pointermove', move, true);
		removeEventListener('pointerup', up, true);
		removeEventListener('pointercancel', clear, true);
	};
}
