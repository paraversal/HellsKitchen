import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

// Principle 2 in README.md: the kitchen engine is pure. Nothing in this folder may import from outside it,
// and in particular nothing from the app, the screens or the browser.
const folder = import.meta.dirname;
const files = readdirSync(folder, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.ts'));

function importsOf(source: string): string[] {
	return [...source.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
}

describe('kitchen engine isolation', () => {
	for (const file of files) {
		it(`${file} only imports from inside the engine`, () => {
			const isTest = file.endsWith('.test.ts');
			const outside = importsOf(readFileSync(join(folder, file), 'utf8')).filter((spec) => {
				if (spec.startsWith('.')) return !resolve(dirname(join(folder, file)), spec).startsWith(folder + sep);
				return !(isTest && (spec === 'vitest' || spec.startsWith('node:')));
			});
			expect(outside).toEqual([]);
		});
	}
});
