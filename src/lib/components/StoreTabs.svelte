<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import { easing } from '#lib/motion/easing.ts';
	import { allows } from '#lib/motion/mode.svelte.ts';

	// The store tabs of the shopping list. The number is how many items are still to buy there; a store with nothing left shows a check.
	// D5. The red line under the open tab slides to the next one.
	type Tab = { id: string; label: string; count: number };
	let { tabs, active = $bindable() }: { tabs: Tab[]; active: string } = $props();

	let bar = $state<HTMLElement>();
	const buttons: Record<string, HTMLElement> = {};
	let placed: { x: number; w: number } | null = null;

	function place(animate: boolean) {
		const button = buttons[active];
		if (!bar || !button?.offsetWidth) return;
		const to = { x: button.offsetLeft, w: button.offsetWidth };
		const frame = (spot: { x: number; w: number }) => ({ transform: `translateX(${spot.x}px) scaleX(${spot.w})` });
		bar.style.transform = frame(to).transform;
		if (animate && placed && allows.flights()) bar.animate([frame(placed), frame(to)], { duration: 380, easing: easing('spring-soft') });
		placed = to;
	}

	$effect(() => {
		void active;
		void tabs.length;
		place(true);
		buttons[active]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: allows.flights() ? 'smooth' : 'auto' });
	});

	// The tabs change width when the font has loaded, the window changes size, or a count changes. The line follows without moving.
	let row = $state<HTMLElement>();
	$effect(() => {
		if (!row) return;
		const watch = new ResizeObserver(() => place(false));
		watch.observe(row);
		for (const button of Object.values(buttons)) watch.observe(button);
		void document.fonts?.ready.then(() => place(false));
		return () => watch.disconnect();
	});
</script>

<div class="tabs" role="tablist" bind:this={row}>
	<span class="indicator" bind:this={bar} aria-hidden="true"></span>
	{#each tabs as tab (tab.id)}
		<button class="tab" class:active={tab.id === active} role="tab" aria-selected={tab.id === active} bind:this={buttons[tab.id]} onclick={() => (active = tab.id)}>
			<span class="name">{tab.label}</span>
			<span class="count" class:done={tab.count === 0}>{#if tab.count === 0}<CheckIcon size={13} strokeWidth={3.5} />{:else}{tab.count}{/if}</span>
		</button>
	{/each}
</div>

<style>
	.tabs {
		display: flex;
		gap: 24px;
		overflow-x: auto;
		overflow-y: hidden;
		overscroll-behavior-x: contain;
		border-bottom: var(--border);
		scrollbar-width: none;
		position: relative;
	}
	.indicator {
		position: absolute;
		left: 0;
		bottom: 0;
		width: 1px;
		height: 4px;
		border-radius: 2px 2px 0 0;
		background: var(--color-tomato);
		transform-origin: 0 50%;
		pointer-events: none;
	}
	.tab {
		display: flex;
		align-items: center;
		gap: 7px;
		padding: 0 0 10px;
		background: none;
		border: 0;
		border-bottom: 4px solid transparent;
		color: var(--color-ink-soft);
		font-weight: var(--weight-medium);
		white-space: nowrap;
		cursor: pointer;
	}
	@media (hover: hover) {
		.tab:hover {
			color: var(--color-ink);
		}
	}
	.active {
		color: var(--color-ink);
		font-weight: var(--weight-heavy);
	}
	.count {
		display: inline-flex;
		align-items: center;
		height: 20px;
		padding: 0 7px;
		border-radius: 10px;
		background: var(--color-line);
		color: var(--color-ink);
		font-size: var(--text-caption);
		font-weight: var(--weight-heavy);
	}
	.active .count {
		background: var(--color-mustard);
	}
	.count.done,
	.active .count.done {
		background: var(--color-leaf);
		color: var(--color-sheet);
	}
</style>
