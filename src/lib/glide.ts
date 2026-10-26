// What a touch does to a page that is still gliding after a flick.
// A phone stops the glide when a finger lands, and then, in some browsers, lets it go on a moment later; and it may hand the tap to whatever is under the finger.
// Here a touch on a gliding page ends the glide for good and is not a tap on the page. The one exception is the bar at the bottom: it answers at any speed (see TabBar).

const GLIDE_AFTER_SWIPE_MS = 4000;
const SILENCE_MS = 120;
const IGNORE_CLICK_MS = 450;
const MOVED_PX = 10;
const HOLD_MS = 350;

/** Holds the scrolling thing still for a moment, on its own spot. A phone cannot carry on a glide in something that cannot scroll, and the position is set to where it is, so there is no glide left to carry on. */
export function holdStill(scroller: EventTarget | null, ms = HOLD_MS): void {
	const page = !(scroller instanceof HTMLElement);
	const elements = page ? [document.documentElement, document.body] : [scroller];
	for (const element of elements) element.style.setProperty('overflow', 'hidden');
	if (page) scrollTo(scrollX, scrollY);
	else scroller.scrollTop = scroller.scrollTop;
	setTimeout(() => elements.forEach((element) => element.style.removeProperty('overflow')), ms);
}

export function startGlide(): () => void {
	let touching = false;
	let swiped = false;
	let startedAt = { x: 0, y: 0 };
	let lastSwipe = -Infinity;
	let gliding = false;
	let scroller: EventTarget | null = null;
	let silence: ReturnType<typeof setTimeout> | undefined;
	let killed = -Infinity;
	let killedOnStart = false;

	const kill = () => {
		holdStill(scroller);
		killed = performance.now();
		gliding = false;
	};

	const scrolled = (event: Event) => {
		if (touching || performance.now() - lastSwipe > GLIDE_AFTER_SWIPE_MS) return;
		gliding = true;
		scroller = event.target instanceof HTMLElement ? event.target : document;
		clearTimeout(silence);
		silence = setTimeout(() => (gliding = false), SILENCE_MS);
	};

	const start = (event: TouchEvent) => {
		touching = true;
		swiped = false;
		killedOnStart = false;
		startedAt = { x: event.touches[0].clientX, y: event.touches[0].clientY };
		if (gliding) {
			kill();
			killedOnStart = true;
		}
	};

	const move = (event: TouchEvent) => {
		const touch = event.touches[0];
		if (Math.hypot(touch.clientX - startedAt.x, touch.clientY - startedAt.y) > MOVED_PX) swiped = true;
	};

	const end = () => {
		// Some phones do not report the start of a touch that lands on a gliding page. Its end is then the first they report.
		const unseen = !touching;
		touching = false;
		if (swiped) lastSwipe = performance.now();
		else if (unseen && gliding && !killedOnStart) kill();
	};

	const cancel = () => (touching = false);

	/** A tap that only ended a glide is not a press on whatever is under the finger. */
	const click = (event: MouseEvent) => {
		if (performance.now() - killed > IGNORE_CLICK_MS) return;
		if ((event.target as Element | null)?.closest?.('nav.tabs')) return;
		event.preventDefault();
		event.stopPropagation();
	};

	addEventListener('scroll', scrolled, { capture: true, passive: true });
	addEventListener('touchstart', start, { capture: true, passive: true });
	addEventListener('touchmove', move, { capture: true, passive: true });
	addEventListener('touchend', end, { capture: true, passive: true });
	addEventListener('touchcancel', cancel, { capture: true, passive: true });
	addEventListener('click', click, true);
	return () => {
		removeEventListener('scroll', scrolled, true);
		removeEventListener('touchstart', start, true);
		removeEventListener('touchmove', move, true);
		removeEventListener('touchend', end, true);
		removeEventListener('touchcancel', cancel, true);
		removeEventListener('click', click, true);
	};
}
