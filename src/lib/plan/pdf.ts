// A small PDF writer, for the one thing the browser cannot do on every phone: print. Only plain text and lines, in the PDF's own Helvetica, so nothing needs to be embedded.
// An iPhone that has the app on its home screen cannot open the print window, but it can share a PDF, and its share sheet can print or save that.
import type { Sheet } from './sheets.ts';
import { sheetFacts } from './sheets.ts';
import { MEAL_LABELS } from './meal-labels.ts';
import { euro, type StoreView } from './shopping.ts';

const W = 595;
const H = 842;
const MARGIN = 42;

// Widths of the characters 32 to 126 of Helvetica, in thousandths of the size. Anything else is counted as an average letter.
const WIDTHS = [
	278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778,
	722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556,
	556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584
];

const measure = (text: string, size: number, bold: boolean) => {
	let total = 0;
	for (const char of text) {
		const code = char.charCodeAt(0);
		total += code >= 32 && code <= 126 ? WIDTHS[code - 32] : 556;
	}
	return (total / 1000) * size * (bold ? 1.06 : 1);
};

const SPECIAL: Record<string, number> = { '€': 0x80, '…': 0x85, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97, ' ': 0x20, ' ': 0x20 };

/** The text as it is written in the file: one byte per character, in the PDF's usual Western alphabet, with the characters that mean something to a PDF escaped. */
export function encode(text: string): string {
	let out = '';
	for (const char of text) {
		const code = char.charCodeAt(0);
		const byte = SPECIAL[char] ?? (code < 256 && code >= 32 ? code : 0x3f);
		const letter = String.fromCharCode(byte);
		out += letter === '(' || letter === ')' || letter === '\\' ? `\\${letter}` : letter;
	}
	return out;
}

/** Breaks a text into lines that fit a width. A line break in the text stays one. */
export function wrap(text: string, size: number, width: number, bold = false): string[] {
	const lines: string[] = [];
	for (const paragraph of text.split('\n')) {
		let line = '';
		for (const word of paragraph.split(/\s+/).filter(Boolean)) {
			const next = line ? `${line} ${word}` : word;
			if (line && measure(next, size, bold) > width) {
				lines.push(line);
				line = word;
			} else line = next;
		}
		lines.push(line);
	}
	return lines;
}

type Style = { size?: number; bold?: boolean; gray?: number; x?: number; width?: number; after?: number };

export class PdfDoc {
	#pages: string[][] = [[]];
	y = H - MARGIN;

	get pages() {
		return this.#pages.length;
	}

	newPage() {
		this.#pages.push([]);
		this.y = H - MARGIN;
	}

	/** Makes sure `height` fits on the page, or starts a new one. */
	room(height: number) {
		if (this.y - height < MARGIN) this.newPage();
	}

	#put(op: string) {
		this.#pages[this.#pages.length - 1].push(op);
	}

	#write(text: string, x: number, y: number, size: number, bold: boolean, gray: number) {
		this.#put(`${gray} g BT /${bold ? 'F2' : 'F1'} ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${encode(text)}) Tj ET`);
	}

	/** Text that wraps, and moves the cursor down. */
	text(text: string, { size = 11, bold = false, gray = 0, x = MARGIN, width = W - MARGIN - x, after = 0 }: Style = {}) {
		const lead = size * 1.35;
		for (const line of wrap(text, size, width, bold)) {
			this.room(lead);
			this.y -= lead;
			if (line) this.#write(line, x, this.y + size * 0.3, size, bold, gray);
		}
		this.y -= after;
	}

	/** A line of the list: a box to tick, a name, and amounts at the right. */
	row({ name, buy, need, ticked, size = 11 }: { name: string; buy: string; need?: string; ticked?: boolean; size?: number }) {
		const lead = size * 2;
		this.room(lead);
		this.y -= lead;
		const base = this.y + size * 0.55;
		this.#put(`0 G 1 w ${MARGIN} ${(base - 1).toFixed(2)} 9 9 re ${ticked ? 'B' : 'S'}`);
		this.#write(name, MARGIN + 18, base, size, false, 0);
		const buyWidth = measure(buy, size, true);
		this.#write(buy, W - MARGIN - buyWidth, base, size, true, 0);
		if (need) this.#write(need, W - MARGIN - buyWidth - 14 - measure(need, size - 2, false), base, size - 2, false, 0.4);
		this.#put(`0.75 G 0.5 w ${MARGIN} ${(base - 7).toFixed(2)} m ${W - MARGIN} ${(base - 7).toFixed(2)} l S`);
	}

	/** A line of text with an amount at the right. */
	pair(left: string, right: string, size = 11) {
		const lead = size * 1.9;
		this.room(lead);
		this.y -= lead;
		const base = this.y + size * 0.55;
		this.#write(left, MARGIN, base, size, false, 0);
		this.#write(right, W - MARGIN - measure(right, size, true), base, size, true, 0);
		this.#put(`0.75 G 0.5 w ${MARGIN} ${(base - 7).toFixed(2)} m ${W - MARGIN} ${(base - 7).toFixed(2)} l S`);
	}

	rule(thick = 1.5, after = 8) {
		this.y -= 4;
		this.#put(`0 G ${thick} w ${MARGIN} ${this.y.toFixed(2)} m ${W - MARGIN} ${this.y.toFixed(2)} l S`);
		this.y -= after;
	}

	space(points: number) {
		this.y -= points;
	}

	/** The file: objects 1 to 4 are the catalog, the list of pages and the two fonts, then every page is a pair of objects. */
	bytes(): Uint8Array {
		const objects: string[] = [];
		const pageIds = this.#pages.map((_, i) => 5 + i * 2);
		objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
		objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${this.#pages.length} >>`;
		objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
		objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
		this.#pages.forEach((ops, i) => {
			const content = ops.join('\n');
			objects[5 + i * 2] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + i * 2} 0 R >>`;
			objects[6 + i * 2] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
		});
		let file = '%PDF-1.4\n';
		const offsets: number[] = [];
		for (let id = 1; id < objects.length; id++) {
			offsets[id] = file.length;
			file += `${id} 0 obj\n${objects[id]}\nendobj\n`;
		}
		const xref = file.length;
		file += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
		for (let id = 1; id < objects.length; id++) file += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
		file += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
		return Uint8Array.from(file, (char) => char.charCodeAt(0) & 0xff);
	}
}

// --- the two things that are printed ---------------------------------------------------------------------

/** The shopping list, a page for every store. */
export function shoppingPdf(planName: string, stores: StoreView[]): Uint8Array {
	const doc = new PdfDoc();
	stores.forEach((store, i) => {
		if (i) doc.newPage();
		doc.text(store.name, { size: 26, bold: true });
		doc.text(`${planName} · about ${euro(store.cost)}${store.unpriced ? `, ${store.unpriced} without a price` : ''}`, { size: 10, gray: 0.35 });
		doc.rule(1.5, 6);
		for (const line of store.lines) doc.row({ name: line.name, buy: line.buy, need: line.need, ticked: line.checked });
	});
	if (!stores.length) doc.text('Nothing to buy yet. Put dishes in the plan first.');
	return doc.bytes();
}

/** The recipe sheets, a page for every dish. */
export function recipesPdf(sheets: Sheet[]): Uint8Array {
	const doc = new PdfDoc();
	sheets.forEach((sheet, i) => {
		if (i) doc.newPage();
		doc.text(`${sheet.day.name} ${sheet.day.date} · ${MEAL_LABELS[sheet.meal].label}${sheet.time ? ` ${sheet.time}` : ''}`.toUpperCase(), { size: 9.5, bold: true, gray: 0.3 });
		doc.text(sheet.name, { size: 24, bold: true });
		doc.text(sheetFacts(sheet).join(' · '), { size: 11 });
		doc.rule(1.5, 10);
		doc.text('Ingredients', { size: 13, bold: true, after: 2 });
		for (const line of sheet.lines) doc.pair(line.name, line.amount);
		if (sheet.method) {
			doc.space(14);
			doc.room(60);
			doc.text('Method', { size: 13, bold: true, after: 4 });
			doc.text(sheet.method, { size: 11 });
		}
	});
	if (!sheets.length) doc.text('No dishes in the plan yet. Put dishes in a meal first.');
	return doc.bytes();
}
