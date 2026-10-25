<script lang="ts">
	// A labelled box for a short value. The change is handed over when the person is done typing (leaves the box or presses Enter),
	// not on every key, so half-typed numbers never reach the plan.
	type Props = {
		label: string;
		value: string;
		type?: 'text' | 'number' | 'time' | 'date';
		placeholder?: string;
		suffix?: string;
		min?: number;
		max?: number;
		step?: number | 'any';
		oncommit: (value: string) => void;
	};
	let { label, value, type = 'text', placeholder, suffix, min, max, step, oncommit }: Props = $props();

	let draft = $state('');
	$effect(() => {
		draft = value;
	});

	const commit = () => {
		if (draft !== value) oncommit(draft);
	};
</script>

<label class="field">
	<span class="label">{label}</span>
	<span class="box">
		{#if type === 'number'}
			<input type="number" inputmode="decimal" bind:value={draft} {placeholder} {min} {max} {step} onchange={commit} />
		{:else if type === 'time'}
			<input type="time" bind:value={draft} onchange={commit} />
		{:else if type === 'date'}
			<input type="date" bind:value={draft} onchange={commit} />
		{:else}
			<input type="text" bind:value={draft} {placeholder} onchange={commit} />
		{/if}
		{#if suffix}<span class="suffix">{suffix}</span>{/if}
	</span>
</label>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
	}
	.label {
		color: var(--color-ink-soft);
		font-size: var(--text-note);
		font-weight: var(--weight-medium);
	}
	.box {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		height: 48px;
		padding: 0 14px;
		border-radius: var(--radius-m);
		background: var(--color-sheet);
		border: var(--border);
	}
	.box:focus-within {
		border-color: var(--color-ink);
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
	.suffix {
		color: var(--color-ink-soft);
	}
</style>
