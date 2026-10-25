<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { NAV, type NavId } from '#lib/nav.ts';

	// The bar at the bottom of a phone screen. The place you are in has a mustard pill behind its icon.
	let { active }: { active: NavId } = $props();

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

<nav class="tabs" aria-label="Main">
	{#each NAV as item (item.id)}
		<a
			href={resolve(item.path)}
			onclick={click}
			class:active={item.id === active} aria-current={item.id === active ? 'page' : undefined}>
			<span class="pill"><item.icon size={22} /></span>
			{item.label}
		</a>
	{/each}
</nav>

<style>
	.tabs {
		display: flex;
		justify-content: space-between;
		padding: 10px 28px calc(10px + env(safe-area-inset-bottom));
		background: var(--color-paper);
		border-top: var(--border);
	}
	a {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
		width: 84px;
		color: var(--color-ink-soft);
		font-size: var(--text-caption);
		font-weight: var(--weight-medium);
		text-decoration: none;
		touch-action: manipulation;
	}
	.pill {
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
	.active .pill {
		background: var(--color-mustard);
	}
</style>
