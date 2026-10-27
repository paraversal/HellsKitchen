// The words the app uses for things an event may call differently, like the group that arrives early.
// They are set in config/words.yaml and checked here; npm run build:data turns them into src/lib/generated/words.json.
// It only works on what it is given and never reads files, like validate.ts.
import { z } from 'zod';
import { closest, type Issue } from './issues.ts';

export const WORDS_FILE = 'config/words.yaml';

/** A word as it is written in the middle of a sentence, for one and for more than one: "1 organiser", "32 organisers". */
export type Countable = { one: string; many: string };

export type Words = {
	/** The whole headcount of the event. */
	everyone: string;
	/** The smaller group that arrives early and has some meals on its own. */
	organisers: Countable;
};

export const DEFAULT_WORDS: Words = {
	everyone: 'everyone',
	organisers: { one: 'organiser', many: 'organisers' }
};

const word = z.string().trim().min(1);
const schema = z
	.object({
		everyone: word.optional(),
		organisers: z.object({ one: word, many: word }).strict().optional()
	})
	.strict();

/** The words of the file, with the app's own for anything left out. A file that cannot be used gives the app's own words and an error. */
export function readWords(raw: unknown): { words: Words; issues: Issue[] } {
	if (raw === undefined || raw === null) return { words: DEFAULT_WORDS, issues: [] };
	const result = schema.safeParse(raw);
	if (result.success) return { words: { ...DEFAULT_WORDS, ...result.data }, issues: [] };
	const issues = result.error.issues.map((issue): Issue => {
		const where = issue.path.join(' > ') || undefined;
		if (issue.code === 'unrecognized_keys') {
			const known = Object.keys(issue.path.length ? DEFAULT_WORDS.organisers : DEFAULT_WORDS);
			const unknown = issue.keys[0];
			const near = closest(unknown, known);
			return { severity: 'error', code: 'unknown-word', file: WORDS_FILE, where, message: `"${unknown}" is not a word the app uses`, fix: near ? `Did you mean "${near}"?` : `The words are: ${known.join(', ')}.` };
		}
		return { severity: 'error', code: 'bad-word', file: WORDS_FILE, where, message: 'this must be a word or a few, not empty', fix: 'For a group, write both forms, for example one: organiser and many: organisers.' };
	});
	return { words: DEFAULT_WORDS, issues };
}
