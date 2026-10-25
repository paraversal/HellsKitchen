// Short messages. showToast("Added to Saturday lunch") shows one for a moment.
let next = 0;

export const toasts = $state<{ items: { id: number; text: string }[] }>({ items: [] });

export function showToast(text: string, ms = 2400): void {
	const id = next++;
	toasts.items.push({ id, text });
	setTimeout(() => {
		toasts.items = toasts.items.filter((t) => t.id !== id);
	}, ms);
}
