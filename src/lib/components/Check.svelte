<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';

	// The round tick box of the shopping list.
	// D1. A tick that was just made draws itself. A tick that was already there when the list opened is simply there.
	// `still` draws only the circle, for a row that is itself the control (the whole shopping row), with `fresh` telling it the tick was just made.
	let { checked = $bindable(false), label = '', still = false, fresh: freshly = false }: { checked?: boolean; label?: string; still?: boolean; fresh?: boolean } = $props();
	let fresh = $state(false);
</script>

{#if still}
	<span class="check" class:checked class:fresh={freshly} aria-hidden="true">{#if checked}<CheckIcon size={16} strokeWidth={3} />{/if}</span>
{:else}
<button class="check" class:checked class:fresh role="checkbox" aria-checked={checked} aria-label={label} onclick={() => { fresh = true; checked = !checked; }}>
	{#if checked}<CheckIcon size={16} strokeWidth={3} />{/if}
</button>
{/if}

<style>
	.check {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: none;
		width: 26px;
		height: 26px;
		padding: 0;
		border-radius: var(--radius-pill);
		border: 2px solid var(--color-ink-soft);
		background: transparent;
		color: var(--color-sheet);
		cursor: pointer;
		transition: background var(--motion-quick), border-color var(--motion-quick);
	}
	@media (hover: hover) {
		.check:not(.checked):hover {
			border-color: var(--color-ink);
		}
	}
	.fresh.checked :global(path) {
		stroke-dasharray: 26;
		stroke-dashoffset: 26;
		animation: tick var(--motion-quick) 60ms var(--ease-out) forwards;
	}
	@keyframes tick {
		to {
			stroke-dashoffset: 0;
		}
	}
	.checked {
		background: var(--color-leaf);
		border-color: var(--color-leaf);
	}
</style>
