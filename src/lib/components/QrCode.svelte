<script lang="ts">
	import QRCode from 'qrcode';
	import { strength } from '#lib/motion/fun.svelte.ts';

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
			// E1. The three big squares in the corners are drawn first, then the rest, row by row. Each row is a shape of its own, so it can arrive on its own.
			const size = modules.size;
			const finder = (x: number, y: number) => (x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8);
			let corners = '';
			const rows: string[] = [];
			for (let y = 0; y < size; y++) {
				let row = '';
				for (let x = 0; x < size; x++) {
					if (!modules.get(x, y)) continue;
					const cell = `M${x + QUIET} ${y + QUIET}h1v1h-1z`;
					if (finder(x, y)) corners += cell;
					else row += cell;
				}
				rows.push(row);
			}
			return { corners, rows, side: size + 2 * QUIET };
		} catch {
			return undefined;
		}
	});
</script>

{#if code}
	<svg class={strength('E1')} viewBox="0 0 {code.side} {code.side}" width={size} height={size} role="img" aria-label={label} shape-rendering="crispEdges">
		<rect width={code.side} height={code.side} fill="var(--color-paper)" />
		<path class="corners" d={code.corners} fill="var(--color-ink)" />
		{#each code.rows as row, y (y)}<path class="row" style:--row={y} d={row} fill="var(--color-ink)" />{/each}
	</svg>
{/if}

<style>
	svg.regular {
		animation: fade 250ms ease-out;
	}
	svg.playful .corners {
		animation: fade 300ms ease-out backwards;
	}
	svg.playful .row {
		animation: fade 300ms ease-out backwards;
		animation-delay: calc(80ms + var(--row) * 7ms);
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
	}
	svg {
		display: block;
		max-width: 100%;
		height: auto;
		border-radius: var(--radius-s);
	}
</style>
