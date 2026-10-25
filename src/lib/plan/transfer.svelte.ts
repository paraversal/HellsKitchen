// Moving the open plan in and out of the app: the share sheet, the sheet that asks what to do with a plan that arrived,
// links, files, and the copies the person keeps. The formats are in transfer.ts.
import { resolve } from '$app/paths';
import { showToast } from '../toast.svelte.ts';
import type { PlanFile } from '../data/schema.ts';
import { backup } from './backup.svelte.ts';
import { planStore } from './browser.ts';
import { decodeShare, encodeShare, fileName, fromFile, readLink, toFile, type Decoded } from './transfer.ts';

/** A plan that arrived, by link or by file, waiting for the person to say what happens to it. */
export type Incoming = { source: 'link' | 'file'; result: Decoded };

export const transfer = $state<{ sharing: boolean; incoming: Incoming | null }>({ sharing: false, incoming: null });

/** The link to the open plan. The plan is in the part after the #, which a browser never sends anywhere. */
export function shareLink(plan: PlanFile, updatedAt: string): string {
	const path = resolve('/(app)/plan');
	return `${location.origin}${path.endsWith('/') ? path : `${path}/`}#${encodeShare(plan, updatedAt)}`;
}

export async function copyLink(link: string): Promise<void> {
	try {
		await navigator.clipboard.writeText(link);
		backup.reset();
		showToast('Link copied');
	} catch {
		showToast('The link could not be copied');
	}
}

export const canSend = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function';

export async function sendLink(link: string, title: string): Promise<void> {
	try {
		await navigator.share({ title, url: link });
		backup.reset();
	} catch (error) {
		// Closing the share window is not a problem.
		if (!(error instanceof DOMException && error.name === 'AbortError')) showToast('The link could not be sent');
	}
}

/** Gives the browser the whole plan, ticks included, as a file to keep. */
export function saveFile(plan: PlanFile, updatedAt: string): void {
	const blob = new Blob([toFile(plan, updatedAt, new Date().toISOString())], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = fileName(plan);
	document.body.append(anchor);
	anchor.click();
	anchor.remove();
	setTimeout(() => URL.revokeObjectURL(url), 10_000);
	backup.reset();
	showToast('Plan saved as a file');
}

export async function openFile(file: File): Promise<void> {
	transfer.sharing = false;
	transfer.incoming = { source: 'file', result: file.size > 2_000_000 ? { ok: false, problem: 'This file is too big to be a plan.' } : fromFile(await file.text()) };
}

/** Looks for a plan in the address (`#plan=...`), offers it, and takes it out of the address so that a reload does not offer it again. */
export function takeLinkFromAddress(): void {
	const result = readLink(location.hash);
	if (!result) return;
	transfer.sharing = false;
	transfer.incoming = { source: 'link', result };
	history.replaceState(history.state, '', location.pathname + location.search);
}

/** What the person chose for the plan that arrived. */
export function acceptIncoming(mode: 'replace' | 'new'): void {
	const incoming = transfer.incoming;
	if (!incoming?.result.ok || planStore.status !== 'ready') return;
	let plan = incoming.result.shared.plan;
	if (mode === 'replace') {
		// A link leaves the shopping ticks out. The ones on this device stay, they are still about the same shopping.
		if (!plan.shopping && planStore.plan?.shopping) plan = { ...plan, shopping: planStore.plan.shopping };
		planStore.replaceOpen(plan);
		showToast('Plan replaced');
	} else {
		planStore.addPlan(plan);
		showToast('Plan added next to your other plans');
	}
	transfer.incoming = null;
}
