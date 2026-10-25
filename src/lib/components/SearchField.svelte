<script lang="ts">
	import Search from '@lucide/svelte/icons/search';

	let { value = $bindable(''), placeholder }: { value?: string; placeholder: string } = $props();
</script>

<label class="field">
	<Search size={20} />
	<input type="search" bind:value {placeholder} aria-label={placeholder} />
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
	input::placeholder {
		color: var(--color-ink-soft);
	}
</style>
