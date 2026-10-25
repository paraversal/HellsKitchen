<script lang="ts">
	import type { Snippet } from 'svelte';

	// An on/off switch with its text.
	let { checked = $bindable(false), children }: { checked?: boolean; children: Snippet } = $props();
</script>

<button class="switch" class:on={checked} role="switch" aria-checked={checked} onclick={() => (checked = !checked)}>
	<span class="track"><span class="knob"></span></span>
	<span class="text">{@render children()}</span>
</button>

<style>
	.switch {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		padding: 0;
		border: 0;
		background: none;
		text-align: left;
		cursor: pointer;
	}
	.track {
		display: inline-flex;
		align-items: center;
		flex: none;
		width: 48px;
		height: 28px;
		padding: 3px;
		border-radius: 14px;
		background: var(--color-line);
	}
	.knob {
		width: 22px;
		height: 22px;
		border-radius: var(--radius-pill);
		background: var(--color-sheet);
		transition: transform 120ms ease-out;
	}
	.on .track {
		background: var(--color-leaf);
	}
	.on .knob {
		transform: translateX(20px);
	}
	.text {
		flex: 1;
	}
</style>
