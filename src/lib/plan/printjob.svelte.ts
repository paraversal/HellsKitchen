// What the open print page can turn into a PDF. Each print page says what it is, and the bar at the top of the print pages offers it.
export const printJob = $state<{ current: { name: string; build: () => Uint8Array } | null }>({ current: null });

/** An iPhone with the app on its home screen cannot open the print window. */
export const canPrint = () => typeof navigator === 'undefined' || (navigator as Navigator & { standalone?: boolean }).standalone !== true;

/** Gives the PDF to the phone's share sheet (which can print it, save it, or send it), or saves it as a file where there is no share sheet. */
export async function sharePdf(name: string, bytes: Uint8Array): Promise<void> {
	const file = new File([bytes as BlobPart], name, { type: 'application/pdf' });
	try {
		if (navigator.canShare?.({ files: [file] })) {
			await navigator.share({ files: [file], title: name });
			return;
		}
	} catch (error) {
		// Closing the share window is not a problem.
		if (error instanceof DOMException && error.name === 'AbortError') return;
	}
	const url = URL.createObjectURL(file);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = name;
	document.body.append(anchor);
	anchor.click();
	anchor.remove();
	setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
