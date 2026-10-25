// Checks the data files and turns them into the one JSON file the app ships with: src/lib/generated/app-data.json.
// It runs before every dev server, build and type check (see the "pre" scripts in package.json). Errors in the data stop it.
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { toAppData } from '../src/lib/data/app-data.ts';
import { formatIssues } from '../src/lib/data/issues.ts';
import { validateData } from '../src/lib/data/validate.ts';
import { readDataFolder } from './read-data.ts';

const root = join(import.meta.dirname, '..');
const { raw, problems } = readDataFolder(root);
const { issues, data } = validateData(raw);
const errors = [...problems, ...issues].filter((i) => i.severity === 'error');
if (errors.length) {
	console.error(formatIssues(errors));
	process.exit(1);
}

const version = createHash('sha1').update(JSON.stringify(data)).digest('hex').slice(0, 8);
const app = toAppData(data, version);
mkdirSync(join(root, 'src/lib/generated'), { recursive: true });
writeFileSync(join(root, 'src/lib/generated/app-data.json'), JSON.stringify(app));
const hidden = Object.keys(data.recipes).length - Object.keys(app.recipes).length;
console.log(`App data ${version}: ${Object.keys(app.recipes).length} recipes (${hidden} left out as needs-review), ${Object.keys(app.ingredients).length} ingredients.`);
