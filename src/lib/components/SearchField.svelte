<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import X from '@lucide/svelte/icons/x';

	let { value = $bindable(''), placeholder }: { value?: string; placeholder: string } = $props();
</script>

<label class="field">
	<Search size={20} />
	<input type="search" bind:value {placeholder} aria-label={placeholder} />
	{#if value}<button type="button" class="clear" aria-label="Clear the search" onclick={() => (value = '')}><X size={18} /></button>{/if}
</label>

<style>
	.field {
		display: flex;
		align-items: center;
		gap: 10px;
		height: 48px;
		padding: 0 14px;
		border-radius: var(--radius-m);
		background: var(--color-sheet);
		border: var(--border);
		color: var(--color-ink-soft);
	}
	input {
		flex: 1;
		min-width: 0;
		border: 0;
		outline: 0;
		background: none;
		font: inherit;
		color: var(--color-ink);
	}
	/* The browser's own clear button is blue. This one has its own. */
	input::-webkit-search-cancel-button {
		-webkit-appearance: none;
	}
	.clear {
		display: inline-flex;
		padding: 4px;
		border: 0;
		background: none;
		color: var(--color-ink-soft);
		cursor: pointer;
	}
	input::placeholder {
		color: var(--color-ink-soft);
	}
</style>
