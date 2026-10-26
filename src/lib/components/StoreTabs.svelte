<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
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

	/** Arrow keys move between the stores, as in any row of tabs; only the open tab is in the Tab order. */
	function keys(event: KeyboardEvent) {
		const at = tabs.findIndex((tab) => tab.id === active);
		const to = event.key === 'ArrowRight' ? at + 1 : event.key === 'ArrowLeft' ? at - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -2;
		if (to === -2) return;
		event.preventDefault();
		const next = tabs[(to + tabs.length) % tabs.length];
		active = next.id;
		buttons[next.id]?.focus();
	}

	// The tabs change width when the font has loaded, the window changes size, or a count changes. The line follows without moving.
	let row = $state<HTMLElement>();
	$effect(() => {
		if (!row) return;
		const watch = new ResizeObserver(() => {
			place(false);
			edges();
		});
		watch.observe(row);
		for (const button of Object.values(buttons)) watch.observe(button);
		void document.fonts?.ready.then(() => place(false));
		return () => watch.disconnect();
	});

	// When there are more stores than fit, an arrow at the edge says so, and moves the row along when pressed.
	let more = $state({ left: false, right: false });
	function edges() {
		if (!row) return;
		const left = row.scrollLeft > 2;
		const right = row.scrollLeft + row.clientWidth < row.scrollWidth - 2;
		if (left !== more.left || right !== more.right) more = { left, right };
	}
	function along(direction: 1 | -1) {
		row?.scrollBy({ left: direction * row.clientWidth * 0.7, behavior: allows.flights() ? 'smooth' : 'auto' });
	}
</script>

<div class="wrap">
	<div class="tabs" role="tablist" aria-label="Stores" tabindex="-1" bind:this={row} onkeydown={keys} onscroll={edges}>
		<span class="indicator" bind:this={bar} aria-hidden="true"></span>
		{#each tabs as tab (tab.id)}
			<button class="tab" class:active={tab.id === active} role="tab" aria-selected={tab.id === active} tabindex={tab.id === active ? 0 : -1} bind:this={buttons[tab.id]} onclick={() => (active = tab.id)}>
				<span class="name">{tab.label}</span>
				<span class="count" class:done={tab.count === 0}>{#if tab.count === 0}<CheckIcon size={13} strokeWidth={3.5} />{:else}{tab.count}{/if}</span>
			</button>
		{/each}
	</div>
	{#if more.left}<button class="more left" aria-hidden="true" tabindex="-1" onclick={() => along(-1)}><ChevronLeft size={18} strokeWidth={2.5} /></button>{/if}
	{#if more.right}<button class="more right" aria-hidden="true" tabindex="-1" onclick={() => along(1)}><ChevronRight size={18} strokeWidth={2.5} /></button>{/if}
</div>

<style>
	.wrap {
		position: relative;
	}
	/* The arrow sits on the paper over the cut-off tab, a little above the line under the tabs. */
	.more {
		position: absolute;
		top: 0;
		bottom: 5px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		padding: 0;
		border: 0;
		background: var(--color-paper);
		color: var(--color-ink-soft);
		cursor: pointer;
		animation: show var(--motion-quick) var(--ease-out);
	}
	.more.left {
		left: 0;
		justify-content: flex-start;
	}
	.more.right {
		right: 0;
		justify-content: flex-end;
	}
	@keyframes show {
		from {
			opacity: 0;
		}
	}
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
