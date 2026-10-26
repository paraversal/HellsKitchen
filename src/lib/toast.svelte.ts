// Short messages. showToast("Added to Saturday lunch", "done") shows one for a moment.
// The tone says what kind of message it is: something was done, a plain piece of information, or something went wrong.
export type Tone = 'done' | 'info' | 'problem';

let next = 0;

export const toasts = $state<{ items: { id: number; text: string; tone: Tone }[] }>({ items: [] });

export function showToast(text: string, tone: Tone = 'info', ms = 2400): void {
	const id = next++;
	toasts.items.push({ id, text, tone });
	setTimeout(() => {
		toasts.items = toasts.items.filter((t) => t.id !== id);
	}, ms);
}
