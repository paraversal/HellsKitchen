// Which strength of each animation of docs/ANIMATIONS.md the app uses: [without fun, with fun].
// This table is the one place that decides it. The trial page (/styleguide/motion/) shows every strength, chosen or not, and marks the chosen ones from here.
export type Strength = 'regular' | 'playful' | 'crazy';

const R = 'regular';
const P = 'playful';
const C = 'crazy';

export const CHOICES = {
	A1: [R, P],
	A2: [R, C],
	A3: [R, P],
	A4: [R, C],
	A5: [R, P],
	A6: [P, P],
	B1: [R, P],
	B2: [R, P],
	B3: [R, C],
	B4: [R, C],
	B5: [R, C],
	B6: [R, R],
	C1: [R, R],
	C3: [P, C],
	C4: [R, R],
	C5: [R, P],
	D1: [R, C],
	D2: [R, R],
	D3: [R, C],
	D4: [R, P],
	D5: [R, R],
	E1: [R, P],
	E2: [P, P],
	E3: [R, P],
	E4: [R, P],
	E5: [R, P],
	F2: [R, R]
} as const satisfies Record<string, readonly [Strength, Strength]>;

export type ChoiceId = keyof typeof CHOICES;

/** Ideas that were looked at and dropped for now. Their demos stay on the trial page. */
export const DROPPED = ['F1', 'G1', 'H1', 'H5'] as const;
