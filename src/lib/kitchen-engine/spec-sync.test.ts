import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EXAMPLES } from './examples/index.ts';

// SPEC.md is the single source of truth. This test keeps the code and the tests honest about it:
// every rule, worked example and known difference must exist on both sides.
const folder = import.meta.dirname;
const lib = join(folder, '..');
const spec = readFileSync(join(folder, 'SPEC.md'), 'utf8');

const read = (path: string) => readFileSync(path, 'utf8');
const sorted = (list: string[]) => [...list].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
const testFiles = readdirSync(lib, { recursive: true, encoding: 'utf8' })
	.filter((f) => f.endsWith('.test.ts'))
	.map((f) => read(join(lib, f)));

describe('the spec and the code agree', () => {
	const specRules = [...spec.matchAll(/^### (R\d+)\./gm)].map((m) => m[1]);
	const codeFiles = [...readdirSync(join(folder, 'rules')).map((f) => join(folder, 'rules', f)), join(lib, 'data', 'schema.ts')];
	const codeRules = codeFiles.flatMap((file) => [...read(file).matchAll(/^\/\/ (R\d+)\./gm)].map((m) => m[1]));

	it('every rule in the spec has code that names it, and the other way round', () => {
		expect(sorted(codeRules)).toEqual(sorted(specRules));
	});

	for (const rule of specRules) {
		it(`${rule} has a test with its id in the title`, () => {
			const titled = testFiles.some((source) => new RegExp(`describe\\(\\s*['"\`]${rule}[: .]`).test(source));
			expect(titled, `no describe('${rule}: ...') found`).toBe(true);
		});
	}

	it('every worked example in the code has a marker in the spec, and the other way round', () => {
		const marked = [...spec.matchAll(/<!-- example: ([\w-]+) -->/g)].map((m) => m[1]);
		expect(sorted(marked)).toEqual(sorted(EXAMPLES.map((e) => e.id)));
	});

	for (const example of EXAMPLES) {
		it(`${example.id}: the spec prints the number the code produces`, () => {
			const [shown] = Object.values(example.needs);
			expect(spec).toContain(shown.toLocaleString('en-US'));
		});
	}

	const known = spec.slice(spec.indexOf('## Known differences from the Excel'), spec.indexOf('## Open questions'));
	const numbers = [...known.matchAll(/^(\d+)\. /gm)].map((m) => m[1]);

	it('there is at least one known difference to test', () => {
		expect(numbers.length).toBeGreaterThan(0);
	});

	for (const n of numbers) {
		it(`Known difference ${n} has a test`, () => {
			expect(testFiles.some((source) => source.includes(`Known difference ${n}`))).toBe(true);
		});
	}
});
