// Reads the data files from disk and hands them to the validator. The only code that touches the files.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse, YAMLParseError } from 'yaml';
import type { Issue } from '../src/lib/data/issues.ts';
import type { RawData } from '../src/lib/data/validate.ts';

/** Reads one YAML file. If it cannot be read, says why in plain language and returns undefined. */
export function readYaml(root: string, file: string, problems: Issue[]): unknown {
	try {
		return parse(readFileSync(join(root, file), 'utf8'));
	} catch (error) {
		if (!(error instanceof YAMLParseError)) throw error;
		const line = error.linePos?.[0].line;
		const first = error.message.split('\n')[0].replace(/ at line \d+, column \d+:?$/, '');
		problems.push({
			severity: 'error',
			code: 'yaml-syntax',
			file,
			where: line ? `line ${line}` : undefined,
			message: error.code === 'DUPLICATE_KEY' ? 'the same name is used twice here, and every id must be unique' : first,
			fix: error.code === 'DUPLICATE_KEY' ? 'Rename or remove one of them.' : 'Check the indentation (two spaces per level) and that every line has a colon after its name.'
		});
		return undefined;
	}
}

/** The files in data/: stores, ingredients, and one file per recipe. */
export function readDataFolder(root: string): { raw: RawData; problems: Issue[] } {
	const problems: Issue[] = [];
	const raw: RawData = {
		stores: readYaml(root, 'data/stores.yaml', problems),
		ingredients: readYaml(root, 'data/ingredients.yaml', problems),
		recipes: {}
	};
	const folder = join(root, 'data/recipes');
	const names = existsSync(folder) ? readdirSync(folder).sort() : [];
	for (const name of names) {
		if (!name.endsWith('.yaml')) {
			problems.push({
				severity: 'error',
				code: 'wrong-file-name',
				file: `data/recipes/${name}`,
				message: 'recipe files must end in .yaml',
				fix: 'Rename the file, for example tzatziki.yaml.'
			});
			continue;
		}
		const content = readYaml(root, `data/recipes/${name}`, problems);
		if (content !== undefined) raw.recipes[name.slice(0, -'.yaml'.length)] = content;
	}
	return { raw, problems };
}
