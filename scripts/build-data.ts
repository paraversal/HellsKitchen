// Checks the data files and turns them into the JSON the app ships with: src/lib/generated/app-data.json, and words.json from config/words.yaml.
// It runs before every dev server, build and type check (see the "pre" scripts in package.json). Errors in the data stop it.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { toAppData } from '../src/lib/data/app-data.ts';
import { dataHealth } from '../src/lib/data/health.ts';
import { formatIssues } from '../src/lib/data/issues.ts';
import { validateData } from '../src/lib/data/validate.ts';
import { buildImages } from './build-images.ts';
import { readDataFolder, readWordsFile } from './read-data.ts';

const root = join(import.meta.dirname, '..');
const { raw, problems } = readDataFolder(root);
const words = readWordsFile(root, problems);
const { issues, data } = validateData(raw);
const errors = [...problems, ...issues].filter((i) => i.severity === 'error');
if (errors.length) {
	console.error(formatIssues(errors));
	process.exit(1);
}

const version = createHash('sha1').update(JSON.stringify(data)).digest('hex').slice(0, 8);
const app = toAppData(data, version, dataHealth(data, [...problems, ...issues]));
mkdirSync(join(root, 'src/lib/generated'), { recursive: true });
// Only write when something changed. Rewriting an identical file would make a running dev server reload its modules for nothing.
const file = join(root, 'src/lib/generated/app-data.json');
const json = JSON.stringify(app);
if (!existsSync(file) || readFileSync(file, 'utf8') !== json) writeFileSync(file, json);
// The words of the event, from config/words.yaml, in their own file: they are not part of the data version.
const wordsFile = join(root, 'src/lib/generated/words.json');
const wordsJson = JSON.stringify(words);
if (!existsSync(wordsFile) || readFileSync(wordsFile, 'utf8') !== wordsJson) writeFileSync(wordsFile, wordsJson);
const imagesMade = await buildImages(root, raw.images ?? [], data.images ?? []);
const hidden = Object.keys(data.recipes).length - Object.keys(app.recipes).length;
console.log(`App data ${version}: ${Object.keys(app.recipes).length} recipes (${hidden} left out as needs-review), ${Object.keys(app.ingredients).length} ingredients, ${(data.images ?? []).length} photos${imagesMade ? ` (${imagesMade} pictures made)` : ''}.`);
