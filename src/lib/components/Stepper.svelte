<script lang="ts">
	import Minus from '@lucide/svelte/icons/minus';
	import Plus from '@lucide/svelte/icons/plus';
	import IconButton from './IconButton.svelte';

	// A number with a minus and a plus: the headcount, the portions.
	type Props = { value: number; label?: string; step?: number; min?: number; size?: 'large' | 'medium'; name: string };
	let { value = $bindable(), label, step = 1, min = 0, size = 'large', name }: Props = $props();
</script>

<div class="stepper">
	<IconButton icon={Minus} label="Fewer {name}" size={40} onclick={() => (value = Math.max(min, value - step))} />
	<output class={size} aria-label={name}>{value}</output>
	<IconButton icon={Plus} label="More {name}" size={40} variant="dark" onclick={() => (value += step)} />
	{#if label}<span class="label">{label}</span>{/if}
</div>

<style>
	.stepper {
		display: flex;
		align-items: center;
		gap: 14px;
	}
	output {
		font-weight: var(--weight-heavy);
		line-height: 1.1;
		font-variant-numeric: tabular-nums;
	}
	.large {
		font-size: var(--text-counter);
	}
	.medium {
		font-size: var(--text-title-large);
	}
	.label {
		color: var(--color-ink-soft);
		font-size: var(--text-body);
	}
</style>
