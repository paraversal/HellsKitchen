// The words of config/words.yaml, as the app uses them. Made by `npm run build:data` (it runs before dev, build and check).
import type { Countable, Words } from './data/words.ts';
import generated from './generated/words.json';

export const words = generated as Words;

/** The word with a capital, where it starts a label: "Organisers". */
export const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** A number with its word: "1 organiser", "32 organisers". */
export const counted = (n: number, word: Countable) => `${n} ${n === 1 ? word.one : word.many}`;
