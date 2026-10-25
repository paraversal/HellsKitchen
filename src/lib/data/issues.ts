// What the validator reports. Every issue says what is wrong, where, and (when we can tell) how to fix it,
// in plain language, because the people reading it are not always programmers.

export type Severity = 'error' | 'warning' | 'note';

export type Issue = {
	severity: Severity;
	/** A short stable name for the kind of problem, like `unknown-ingredient`. */
	code: string;
	/** The file it is about, like `data/recipes/tzatziki.yaml`. */
	file: string;
	/** The place in the file, like `per_100g > garlic`. */
	where?: string;
	message: string;
	fix?: string;
};

/** The option closest to `word`, if one is close enough to be a likely typo. */
export function closest(word: string, options: string[]): string | undefined {
	let best: string | undefined;
	let bestDistance = Infinity;
	for (const option of options) {
		const d = distance(word, option);
		if (d < bestDistance) [best, bestDistance] = [option, d];
	}
	return bestDistance <= Math.max(2, Math.floor(word.length / 3)) ? best : undefined;
}

function distance(a: string, b: string): number {
	let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
	for (let i = 1; i <= a.length; i++) {
		const row = [i];
		for (let j = 1; j <= b.length; j++) {
			row[j] = Math.min(previous[j] + 1, row[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
		}
		previous = row;
	}
	return previous[b.length];
}

const SHOWN_PER_CODE = 5;

/** The report as text. Errors are always listed in full; warnings and notes are grouped and shortened unless `all` is set. */
export function formatIssues(issues: Issue[], options: { all?: boolean } = {}): string {
	const lines: string[] = [];
	const line = (issue: Issue) => {
		const place = issue.where ? ` > ${issue.where}` : '';
		lines.push(`  ${issue.file}${place}`, `    ${issue.message}`);
		if (issue.fix) lines.push(`    How to fix: ${issue.fix}`);
	};

	const errors = issues.filter((i) => i.severity === 'error');
	if (errors.length) {
		lines.push(`${errors.length} ${errors.length === 1 ? 'error' : 'errors'}, these must be fixed:`, '');
		errors.forEach(line);
		lines.push('');
	}
	for (const [severity, title] of [
		['warning', 'Warnings, worth a look:'],
		['note', 'Notes:']
	] as const) {
		const group = issues.filter((i) => i.severity === severity);
		if (!group.length) continue;
		lines.push(title, '');
		const byCode = new Map<string, Issue[]>();
		for (const issue of group) byCode.set(issue.code, [...(byCode.get(issue.code) ?? []), issue]);
		for (const [code, list] of byCode) {
			lines.push(`  ${code} (${list.length})`);
			const shown = options.all ? list : list.slice(0, SHOWN_PER_CODE);
			for (const issue of shown) {
				const place = issue.where ? ` > ${issue.where}` : '';
				lines.push(`    ${issue.file}${place}: ${issue.message}`);
			}
			if (shown.length < list.length) lines.push(`    ... and ${list.length - shown.length} more (use --all to list them)`);
		}
		lines.push('');
	}
	if (!issues.length) lines.push('No problems found.');
	return lines.join('\n');
}
