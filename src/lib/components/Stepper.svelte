<script lang="ts">
	import Minus from '@lucide/svelte/icons/minus';
	import Plus from '@lucide/svelte/icons/plus';
	import { easing } from '#lib/motion/easing.ts';
	import { strength } from '#lib/motion/fun.svelte.ts';
	import { allows } from '#lib/motion/mode.svelte.ts';
	import IconButton from './IconButton.svelte';
	import Odometer from './Odometer.svelte';

	// A number with a minus and a plus: the headcount, the portions.
	// B5. The digits roll. Holding a button counts on, faster the longer it is held. With fun, every step also gives the number a little bounce.
	type Props = { value: number; label?: string; step?: number; min?: number; size?: 'large' | 'medium'; name: string };
	let { value = $bindable(), label, step = 1, min = 0, size = 'large', name }: Props = $props();

	let figure: HTMLElement;
	let timer: ReturnType<typeof setTimeout> | undefined;

	function change(by: number) {
		const next = Math.max(min, value + by);
		if (next === value) return;
		value = next;
		if (strength('B5') === 'crazy' && allows.flights()) {
			figure.animate([{ transform: 'scale(1)' }, { transform: `scale(${by > 0 ? 1.12 : 0.92})`, offset: 0.35 }, { transform: 'scale(1)' }], { duration: 260, easing: easing('spring-bouncy') });
		}
	}

	function hold(by: number) {
		let delay = 420;
		let held = 0;
		change(by);
		const next = () => {
			held++;
			change(by * (held > 12 ? 5 : 1));
			delay = Math.max(40, delay * 0.82);
			timer = setTimeout(next, delay);
		};
		timer = setTimeout(next, delay);
	}
	const release = () => clearTimeout(timer);
	/** A press with a finger or a mouse is handled on pointer down. A click with no pointer (the keyboard) is handled here. */
	const key = (by: number) => (event: MouseEvent) => {
		if (event.detail === 0) change(by);
	};
</script>

<div class="stepper">
	<IconButton icon={Minus} label="Fewer {name}" size={40} onpointerdown={() => hold(-step)} onpointerup={release} onpointerleave={release} onpointercancel={release} onclick={key(-step)} />
	<output class={size} aria-label="{value} {name}" bind:this={figure}><Odometer text={String(value)} /></output>
	<IconButton icon={Plus} label="More {name}" size={40} variant="dark" onpointerdown={() => hold(step)} onpointerup={release} onpointerleave={release} onpointercancel={release} onclick={key(step)} />
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
