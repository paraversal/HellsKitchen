<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { strength } from '#lib/motion/fun.svelte.ts';
	import { hop, movePill, setPill, type Spot } from '#lib/motion/pill.ts';
	import { NAV, type NavId } from '#lib/nav.ts';
	import Odometer from './Odometer.svelte';

	// The bar at the bottom of a phone screen. The place you are in has a mustard pill behind its icon, which slides to the next place.
	let { active, openItems }: { active: NavId; openItems?: number } = $props();

	let nav = $state<HTMLElement>();
	let bg = $state<HTMLElement>();
	const pills: HTMLElement[] = [];
	const icons: HTMLElement[] = [];
	let placed: Spot | null = null;

	function spot(index: number): Spot | undefined {
		const box = nav?.getBoundingClientRect();
		const pill = pills[index]?.getBoundingClientRect();
		return box && pill?.width ? { x: pill.left - box.left, y: pill.top - box.top, w: pill.width, h: pill.height } : undefined;
	}

	function place(animate: boolean) {
		const index = NAV.findIndex((item) => item.id === active);
		const to = spot(index);
		if (!bg || !to) return;
		if (animate && placed) {
			const how = strength('A1');
			movePill(bg, placed, to, 'x', how);
			if (how === 'playful') hop(icons[index]);
		} else setPill(bg, to);
		placed = to;
	}

	$effect(() => {
		void active;
		if (nav && bg) place(true);
	});

	$effect(() => {
		if (!nav) return;
		const watch = new ResizeObserver(() => place(false));
		watch.observe(nav);
		return () => watch.disconnect();
	});

	// A touch that lands on the bar while the page is still gliding after a flick only stops the gliding: the phone swallows the tap and no click follows,
	// and it may not even report the start of the touch. So the bar acts when the finger lifts, if the finger did not travel: a swipe over the bar is not a tap.
	// The click that may still follow a normal tap is ignored.
	let touch: { x: number; y: number } | null = null;
	let handled = 0;

	function begin(event: TouchEvent) {
		touch = { x: event.touches[0].clientX, y: event.touches[0].clientY };
	}

	function end(event: TouchEvent) {
		const lifted = event.changedTouches[0];
		const began = touch;
		touch = null;
		if (began && Math.hypot(lifted.clientX - began.x, lifted.clientY - began.y) > 10) return;
		const link = document.elementFromPoint(lifted.clientX, lifted.clientY)?.closest<HTMLAnchorElement>('nav.tabs a');
		if (!link || (began && document.elementFromPoint(began.x, began.y)?.closest('nav.tabs a') !== link)) return;
		handled = event.timeStamp;
		void goto(link.pathname);
	}

	function click(event: MouseEvent) {
		if (handled && event.timeStamp - handled < 800) event.preventDefault();
	}
</script>

<svelte:window ontouchstart={begin} ontouchend={end} ontouchcancel={() => (touch = null)} />

<nav class="tabs" aria-label="Main" bind:this={nav}>
	<span class="slider" bind:this={bg} aria-hidden="true"></span>
	{#each NAV as item, i (item.id)}
		<a href={resolve(item.path)} onclick={click} class:active={item.id === active} aria-current={item.id === active ? 'page' : undefined}>
			<span class="pill" bind:this={pills[i]}>
				<span class="icon" data-tab-icon={item.id} bind:this={icons[i]}>
					<item.icon size={22} />
					{#if item.id === 'shopping' && openItems}<b class="badge"><Odometer text={String(openItems)} /></b>{/if}
				</span>
			</span>
			{item.label}
		</a>
	{/each}
</nav>

<style>
	.tabs {
		position: relative;
		display: flex;
		justify-content: space-around;
		padding: 10px 8px calc(10px + env(safe-area-inset-bottom));
		background: var(--color-paper);
		border-top: var(--border);
	}
	a {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
		flex: 1;
		max-width: 84px;
		color: var(--color-ink-soft);
		font-size: var(--text-caption);
		font-weight: var(--weight-medium);
		text-decoration: none;
		touch-action: manipulation;
	}
	.slider {
		position: absolute;
		left: 0;
		top: 0;
		border-radius: 16px;
		background: var(--color-mustard);
		pointer-events: none;
	}
	.icon {
		position: relative;
		display: inline-flex;
	}
	.badge {
		position: absolute;
		top: -9px;
		right: -14px;
		display: inline-flex;
		align-items: center;
		height: 16px;
		padding: 0 5px;
		border-radius: 8px;
		background: var(--color-tomato);
		color: var(--color-on-tomato);
		font-size: 10px;
		font-weight: var(--weight-heavy);
	}
	.pill {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 60px;
		height: 32px;
		border-radius: 16px;
	}
	@media (hover: hover) {
		a:not(.active):hover .pill {
			background: var(--color-mustard-tint);
		}
	}
	a:not(.active):active .pill {
		background: var(--color-mustard-tint);
	}
	.active {
		color: var(--color-ink);
		font-weight: var(--weight-heavy);
	}

</style>
