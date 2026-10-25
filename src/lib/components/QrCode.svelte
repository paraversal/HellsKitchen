<script lang="ts">
	import QRCode from 'qrcode';

	// A QR code for a text, drawn as one shape so that it stays sharp at any size. Nothing is sent anywhere to make it.
	// A text too long for a code that a phone can read gives nothing.
	let { text, label, size = 232 }: { text: string; label: string; size?: number } = $props();

	/** Longer than this and the squares get too small to scan from a screen. */
	const MAX_TEXT = 1500;
	const QUIET = 4; // the empty border the scanners need, in squares

	const code = $derived.by(() => {
		if (text.length > MAX_TEXT) return undefined;
		try {
			const { modules } = QRCode.create(text, { errorCorrectionLevel: 'L' });
			let path = '';
			for (let y = 0; y < modules.size; y++) {
				for (let x = 0; x < modules.size; x++) if (modules.get(x, y)) path += `M${x + QUIET} ${y + QUIET}h1v1h-1z`;
			}
			return { path, side: modules.size + 2 * QUIET };
		} catch {
			return undefined;
		}
	});
</script>

{#if code}
	<svg viewBox="0 0 {code.side} {code.side}" width={size} height={size} role="img" aria-label={label} shape-rendering="crispEdges">
		<rect width={code.side} height={code.side} fill="var(--color-paper)" />
		<path d={code.path} fill="var(--color-ink)" />
	</svg>
{/if}

<style>
	svg {
		display: block;
		max-width: 100%;
		height: auto;
		border-radius: var(--radius-s);
	}
</style>
