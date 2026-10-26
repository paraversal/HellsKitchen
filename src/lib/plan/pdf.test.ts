import { describe, expect, it } from 'vitest';
import { PdfDoc, encode, recipesPdf, shoppingPdf, wrap } from './pdf.ts';
import type { Sheet } from './sheets.ts';

const text = (bytes: Uint8Array) => String.fromCharCode(...bytes);

describe('the PDF file', () => {
	it('is a PDF, with every object where the table at the end says it is', () => {
		const doc = new PdfDoc();
		doc.text('Hello');
		doc.newPage();
		doc.text('Second page');
		const file = text(doc.bytes());
		expect(file.startsWith('%PDF-1.4')).toBe(true);
		expect(file.trimEnd().endsWith('%%EOF')).toBe(true);
		const start = Number(/startxref\n(\d+)/.exec(file)?.[1]);
		expect(file.slice(start, start + 4)).toBe('xref');
		const entries = [...file.slice(start).matchAll(/(\d{10}) 00000 n /g)].map((m) => Number(m[1]));
		expect(entries).toHaveLength(8); // catalog, pages, two fonts, two pages with their content
		entries.forEach((offset, i) => expect(file.slice(offset, offset + `${i + 1} 0 obj`.length)).toBe(`${i + 1} 0 obj`));
		expect(file).toContain('/Count 2');
	});

	it('says how long each page is', () => {
		const doc = new PdfDoc();
		doc.text('Hello');
		const file = text(doc.bytes());
		const length = Number(/\/Length (\d+)/.exec(file)?.[1]);
		const body = /stream\n([\s\S]*?)\nendstream/.exec(file)?.[1] ?? '';
		expect(body.length).toBe(length);
	});
});

describe('text', () => {
	it('escapes what means something to a PDF, and writes the euro sign and quotes in the PDF alphabet', () => {
		expect(encode('a (b) \\ c')).toBe('a \\(b\\) \\\\ c');
		expect(encode('€5 – “ok”').split('').map((c) => c.charCodeAt(0))).toEqual([0x80, 0x35, 0x20, 0x96, 0x20, 0x93, 0x6f, 0x6b, 0x94]);
		expect(encode('Müsli ß')).toBe('Müsli ß');
		expect(encode('日本')).toBe('??');
	});

	it('breaks long text into lines that fit, and keeps line breaks', () => {
		const lines = wrap('one two three four five six seven eight nine ten', 11, 100);
		expect(lines.length).toBeGreaterThan(2);
		expect(lines.join(' ')).toBe('one two three four five six seven eight nine ten');
		expect(wrap('a\n\nb', 11, 500)).toEqual(['a', '', 'b']);
	});

	it('starts a new page when one is full', () => {
		const doc = new PdfDoc();
		for (let i = 0; i < 120; i++) doc.text(`Line ${i}`);
		expect(doc.pages).toBeGreaterThan(1);
	});
});

describe('what is printed', () => {
	it('puts every store of the shopping list on a page of its own', () => {
		const line = { id: 'a', name: 'Lentils (red)', buy: '2 × 5 kg', need: '9 kg needed', unpriced: false, checked: false };
		const file = text(shoppingPdf('My plan', [
			{ id: 's', name: 'Supermarket', lines: [line, { ...line, id: 'b', checked: true }], open: 1, cost: 12.5, unpriced: 0 },
			{ id: 'm', name: 'Market', lines: [line], open: 1, cost: 4, unpriced: 1 }
		]));
		expect(file).toContain('/Count 2');
		expect(file).toContain('(Supermarket)');
		expect(file).toContain('Lentils \\(red\\)');
	});

	it('puts every dish on a page of its own, with its method', () => {
		const sheet = (name: string): Sheet => ({
			key: name, recipe: name, name, day: { name: 'Friday', date: 'Jul 9' }, meal: 'lunch', time: '12:30', people: 200, forOrganisers: false, share: 1, appetite: 1, portion: 300, total: 60000,
			lines: [{ id: 'x', name: 'Rice', amount: '4 kg' }], method: 'Cook it.\nEat it.'
		});
		const file = text(recipesPdf([sheet('Dal'), sheet('Rice')]));
		expect(file).toContain('/Count 2');
		expect(file).toContain('(Dal)');
		expect(file).toContain('(Cook it.)');
	});

	it('still makes a file when there is nothing to print', () => {
		expect(text(shoppingPdf('x', [])).startsWith('%PDF')).toBe(true);
		expect(text(recipesPdf([])).startsWith('%PDF')).toBe(true);
	});
});
