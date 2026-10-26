// How much the app moves: full, calm (no loops, no particles, no long flights) or off. It starts from the device's own wish for less motion.
// The page carries it as `data-motion` on the root element, so styles and scripts can both read it.
export type MotionMode = 'full' | 'calm' | 'off';

export const motion = $state<{ mode: MotionMode }>({ mode: 'full' });

export function startMotion(): () => void {
	const query = matchMedia('(prefers-reduced-motion: reduce)');
	const apply = () => {
		if (query.matches && motion.mode === 'full') motion.mode = 'calm';
	};
	apply();
	query.addEventListener('change', apply);
	return () => query.removeEventListener('change', apply);
}

export function setMotion(mode: MotionMode): void {
	motion.mode = mode;
	document.documentElement.dataset.motion = mode;
}

/** What scripts check before they start something big. */
export const allows = {
	flights: () => document.documentElement.dataset.motion !== 'off',
	particles: () => (document.documentElement.dataset.motion ?? 'full') === 'full'
};
