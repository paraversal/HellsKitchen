import { describe, expect, it } from 'vitest';
import { DEFAULT_WORDS, readWords } from './words.ts';

describe('words of the event', () => {
	it('keeps the app own words when there is no file, or the file leaves a word out', () => {
		expect(readWords(undefined)).toEqual({ words: DEFAULT_WORDS, issues: [] });
		expect(readWords({ everyone: 'all guests' }).words).toEqual({ everyone: 'all guests', organisers: DEFAULT_WORDS.organisers });
	});

	it('takes a group with both its forms, trimmed', () => {
		expect(readWords({ organisers: { one: ' helper ', many: 'helpers' } }).words.organisers).toEqual({ one: 'helper', many: 'helpers' });
	});

	it('says which word is unknown, with the likely one', () => {
		const { words, issues } = readWords({ organizers: { one: 'helper', many: 'helpers' } });
		expect(words).toEqual(DEFAULT_WORDS);
		expect(issues).toMatchObject([{ severity: 'error', code: 'unknown-word', file: 'config/words.yaml', fix: 'Did you mean "organisers"?' }]);
	});

	it('refuses an empty word, or a group with one form missing', () => {
		expect(readWords({ everyone: '' }).issues).toMatchObject([{ code: 'bad-word', where: 'everyone' }]);
		expect(readWords({ organisers: { one: 'helper' } }).issues).toMatchObject([{ code: 'bad-word', where: 'organisers > many' }]);
	});
});
