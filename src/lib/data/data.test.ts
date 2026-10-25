import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { formatIssues } from './issues.ts';
import { validateData, validatePlan } from './validate.ts';
import { readDataFolder, readYaml } from '../../../scripts/read-data.ts';

// The real data files. If a recipe is broken, this test fails and prints what is wrong, in plain language.
const root = join(import.meta.dirname, '../../..');
const { raw, problems } = readDataFolder(root);
const { issues, data, broken } = validateData(raw);

describe('the data folder', () => {
	it('has no errors', () => {
		const errors = [...problems, ...issues].filter((i) => i.severity === 'error');
		expect(errors, formatIssues(errors)).toEqual([]);
	});

	it('contains what the import brought in', () => {
		expect(Object.keys(data.recipes).length).toBeGreaterThanOrEqual(60);
		expect(Object.keys(data.ingredients).length).toBeGreaterThanOrEqual(186);
	});
});

describe('the example plan in docs/examples', () => {
	it('is valid against the real data', () => {
		const found = readYaml(root, 'docs/examples/plan.example.yaml', []);
		const plan = validatePlan(found, data, 'docs/examples/plan.example.yaml', broken);
		expect(plan, formatIssues(plan)).toEqual([]);
	});
});
