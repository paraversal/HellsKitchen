<script lang="ts">
	import { tick, type Snippet } from 'svelte';

	// A value that can be changed where it stands: it looks like plain text, a press turns it into a box, and Enter or leaving the box keeps the change (Escape drops it).
	// `display` can show the value in another way while it is not being changed, like a number with rolling digits.
	type Props = { value: string; label: string; type?: 'text' | 'number'; min?: number; display?: Snippet; oncommit: (value: string) => void };
	let { value, label, type = 'text', min, display, oncommit }: Props = $props();

	let editing = $state(false);
	let draft = $state('');
	let input = $state<HTMLInputElement>();

	async function start() {
		draft = value;
		editing = true;
		await tick();
		input?.focus();
		input?.select();
	}

	function finish(keep: boolean) {
		if (!editing) return;
		editing = false;
		// A number box hands over a number, a text box a string.
		const text = String(draft ?? '');
		if (keep && text.trim() !== '' && text !== value) oncommit(text);
	}
</script>

{#if editing}
	<input
		bind:this={input}
		bind:value={draft}
		class:number={type === 'number'}
		type={type === 'number' ? 'number' : 'text'}
		inputmode={type === 'number' ? 'numeric' : undefined}
		enterkeyhint="done"
		{min}
		aria-label={label}
		onblur={() => finish(true)}
		onkeydown={(event) => {
			if (event.key === 'Enter') finish(true);
			if (event.key === 'Escape') finish(false);
		}}
	/>
{:else}
	<button class="edit pressable" aria-label="{label}: {value}. Press to change" onclick={start}>
		{#if display}{@render display()}{:else}{value}{/if}
	</button>
{/if}

<style>
	.edit {
		display: inline-flex;
		padding: 0;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		text-align: inherit;
		cursor: text;
	}
	input {
		width: 100%;
		min-width: 0;
		padding: 0 0.25em;
		border: var(--border);
		border-color: var(--color-ink);
		border-radius: var(--radius-s);
		outline: 0;
		background: var(--color-sheet);
		color: var(--color-ink);
		font: inherit;
		line-height: inherit;
	}
	input.number {
		width: 3.4ch;
		min-width: 3.4ch;
		appearance: textfield;
		-moz-appearance: textfield;
		text-align: center;
	}
	input.number::-webkit-outer-spin-button,
	input.number::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>
