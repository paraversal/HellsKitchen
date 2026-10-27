// Checks everything in data/, the words in config/words.yaml, and the example plans in docs/examples/.  Run it with:  npm run validate
// Errors stop a pull request from being merged. Warnings and notes are for information.
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { formatIssues, type Issue } from '../src/lib/data/issues.ts';
import { validateData, validatePlan } from '../src/lib/data/validate.ts';
import { readDataFolder, readWordsFile, readYaml } from './read-data.ts';

const root = join(import.meta.dirname, '..');
const all = process.argv.includes('--all');

const { raw, problems } = readDataFolder(root);
const { issues, data, broken } = validateData(raw);
const found: Issue[] = [...problems, ...issues];
readWordsFile(root, found);

const examples = join(root, 'docs/examples');
const plans = existsSync(examples) ? readdirSync(examples).filter((f) => f.endsWith('.yaml')) : [];
for (const name of plans) {
	const file = `docs/examples/${name}`;
	const plan = readYaml(root, file, found);
	if (plan !== undefined) found.push(...validatePlan(plan, data, file, broken));
}

console.log(`Checked ${Object.keys(raw.recipes).length} recipes, ${Object.keys(data.ingredients).length} ingredients, ${Object.keys(data.stores).length} stores and ${plans.length} example plan(s).\n`);
console.log(formatIssues(found, { all }));
process.exit(found.some((i) => i.severity === 'error') ? 1 : 0);
