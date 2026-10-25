// Moving a plan between devices: as a link (the plan packed into the part of the address after the #, which no server ever receives),
// and as a file. Neither needs an account or a server. See docs/DATA.md.
import { deflateSync, inflateSync, strFromU8, strToU8 } from 'fflate';
import { z } from 'zod';
import { planSchema, type PlanFile } from '../data/schema.ts';

export type Shared = { plan: PlanFile; updatedAt: string };
export type Decoded = { ok: true; shared: Shared } | { ok: false; problem: string };

/** A link longer than this is not read. Plans are a few kilobytes at most. */
const MAX_LINK = 64_000;
/** A plan that unpacks to more than this is not read, however small the link was. */
const MAX_UNPACKED = 1_000_000;

const linkSchema = z.object({ v: z.literal(1), updatedAt: z.string(), plan: planSchema });
const fileSchema = z.object({ app: z.literal('hells-kitchen-plan'), version: z.literal(1), updatedAt: z.string(), plan: planSchema });

// --- base64 for addresses ---------------------------------------------------------------------------------

export function toBase64Url(bytes: Uint8Array): string {
	let text = '';
	for (let i = 0; i < bytes.length; i += 8192) text += String.fromCharCode(...bytes.subarray(i, i + 8192));
	return btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromBase64Url(text: string): Uint8Array {
	const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
	return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

/** Unpacks into a buffer that cannot grow, so a tiny link cannot swell into gigabytes: whatever does not fit is simply not written. */
function unpack(bytes: Uint8Array, limit: number): Uint8Array | undefined {
	try {
		const out = inflateSync(bytes, { out: new Uint8Array(limit + 1) });
		return out.length > limit ? undefined : out;
	} catch {
		return undefined;
	}
}

const problemWith = (error: z.ZodError) => {
	const issue = error.issues[0];
	return `This plan has a problem${issue?.path.length ? ` at ${issue.path.join(' > ')}` : ''}: ${issue?.message ?? 'it is not in the form of a plan'}.`;
};

// --- links ----------------------------------------------------------------------------------------------------

/** The shopping ticks are one person's progress, so they stay out of a link. */
export function forSharing(plan: PlanFile): PlanFile {
	const { shopping: _ticks, ...rest } = plan;
	return rest;
}

/** Whether two plans say the same, not counting the shopping ticks. */
export function samePlan(a: PlanFile, b: PlanFile): boolean {
	return JSON.stringify(forSharing(a)) === JSON.stringify(forSharing(b));
}

/** The text after the # of a link: `plan=...`. */
export function encodeShare(plan: PlanFile, updatedAt: string): string {
	const json = JSON.stringify({ v: 1, updatedAt, plan: forSharing(plan) });
	return `plan=${toBase64Url(deflateSync(strToU8(json), { level: 9 }))}`;
}

export function decodeShare(text: string): Decoded {
	const value = text.replace(/^#?plan=/, '');
	if (!value || value.length > MAX_LINK) return { ok: false, problem: 'This link does not hold a plan.' };
	let json: string;
	try {
		const unpacked = unpack(fromBase64Url(value), MAX_UNPACKED);
		if (!unpacked) return { ok: false, problem: 'This link does not hold a plan that can be read. It may have been cut off when it was sent.' };
		json = strFromU8(unpacked);
	} catch {
		return { ok: false, problem: 'This link does not hold a plan that can be read. It may have been cut off when it was sent.' };
	}
	let parsed: unknown;
	try {
		parsed = JSON.parse(json);
	} catch {
		return { ok: false, problem: 'This link does not hold a plan that can be read.' };
	}
	const result = linkSchema.safeParse(parsed);
	return result.success ? { ok: true, shared: { plan: result.data.plan, updatedAt: result.data.updatedAt } } : { ok: false, problem: problemWith(result.error) };
}

/** A plan in the address bar, if there is one: `#plan=...`. */
export function readLink(hash: string): Decoded | undefined {
	return hash.startsWith('#plan=') ? decodeShare(hash) : undefined;
}

// --- files ----------------------------------------------------------------------------------------------------------

/** A whole plan, including the ticks, to keep as a backup or to open on another device. */
export function toFile(plan: PlanFile, updatedAt: string, exportedAt: string): string {
	return `${JSON.stringify({ app: 'hells-kitchen-plan', version: 1, exportedAt, updatedAt, plan }, null, '\t')}\n`;
}

export function fromFile(text: string): Decoded {
	let parsed: unknown;
	try {
		parsed = JSON.parse(text);
	} catch {
		return { ok: false, problem: "This file is not a plan from Hell's Kitchen. It could not be read." };
	}
	const result = fileSchema.safeParse(parsed);
	return result.success ? { ok: true, shared: { plan: result.data.plan, updatedAt: result.data.updatedAt } } : { ok: false, problem: problemWith(result.error) };
}

/** A name for a saved file: `freshers-trip-2027.json`. */
export function fileName(plan: PlanFile): string {
	const slug = plan.name.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
	return `${slug || 'plan'}.json`;
}
