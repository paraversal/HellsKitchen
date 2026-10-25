import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// The components may only use design tokens that exist. A typo in a color name would otherwise fail silently, as a missing color.
const src = join(import.meta.dirname, '../..');
const read = (path: string) => readFileSync(join(src, path), 'utf8');
const files = (readdirSync(src, { recursive: true, encoding: 'utf8' }) as string[]).filter((f) => /\.(svelte|css)$/.test(f) && !f.startsWith('lib/styles/tokens'));

const defined = new Set([...(read('lib/styles/tokens.colors.css') + read('lib/styles/tokens.css')).matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));

describe('design tokens', () => {
	it('define the colors of the design and the font', () => {
		for (const name of ['--color-paper', '--color-ink', '--color-tomato', '--color-mustard', '--color-on-tomato', '--font']) {
			expect(defined.has(name), name).toBe(true);
		}
	});

	for (const file of files) {
		it(`${file} only uses tokens that exist`, () => {
			const source = read(file);
			const own = new Set([...source.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
			// A name built in code, like var(--color-{tint}), is checked by the last test instead.
			const used = [...source.matchAll(/var\((--[\w-]+)(?![{$\w-])/g)].map((m) => m[1]);
			expect(used.filter((name) => !defined.has(name) && !own.has(name))).toEqual([]);
		});
	}

	it('every color name used to build a color in code is a color token', () => {
		const names = new Set<string>();
		for (const match of read('lib/components/meal-types.ts').matchAll(/(?:color|tint): '([\w-]+)'/g)) names.add(match[1]);
		const plates = read('lib/components/Plate.svelte').match(/const PLATES[\s\S]*?\];\n/)?.[0] ?? '';
		for (const match of plates.matchAll(/'([\w-]+)'/g)) names.add(match[1]);
		expect(names.size).toBeGreaterThan(8);
		expect([...names].filter((name) => !defined.has(`--color-${name}`))).toEqual([]);
	});
});
