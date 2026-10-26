<script lang="ts">
	import ChefHat from '@lucide/svelte/icons/chef-hat';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Check from '@lucide/svelte/icons/check';
	import Printer from '@lucide/svelte/icons/printer';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import { resolve } from '$app/paths';
	import EmptyNote from '#lib/components/EmptyNote.svelte';
	import IconButton from '#lib/components/IconButton.svelte';
	import NoPricePill from '#lib/components/NoPricePill.svelte';
	import Odometer from '#lib/components/Odometer.svelte';
	import ShopRow from '#lib/components/ShopRow.svelte';
	import StoreTabs from '#lib/components/StoreTabs.svelte';
	import { easing } from '#lib/motion/easing.ts';
	import { fly } from '#lib/motion/fly.ts';
	import { strength } from '#lib/motion/fun.svelte.ts';
	import { allows } from '#lib/motion/mode.svelte.ts';
	import { burst, shower } from '#lib/motion/particles.ts';
	import { tabIcon } from '#lib/motion/pill.ts';
	import { planStore } from '#lib/plan/browser.ts';
	import { current } from '#lib/plan/current.svelte.ts';
	import { setChecked } from '#lib/plan/plan.ts';
	import { euro, type ShoppingLine } from '#lib/plan/shopping.ts';

	// The shopping list of the open plan: one tab per store, with what is left to buy there.
	const view = $derived(current.shopping);
	let selected = $state<string | null>(null);
	const store = $derived(view?.stores.find((s) => s.id === selected) ?? view?.stores[0]);
	const tabs = $derived(view?.stores.map((s) => ({ id: s.id, label: s.name, count: s.open })) ?? []);
	const done = $derived(store ? store.lines.filter((l) => l.checked).length : 0);

	// D1. With fun, a ticked item flies into the basket of the Shopping tab and the list closes over the gap. The bought items wait under "Bought", where they can be ticked off again.
	const leaving = $derived(strength('D1') === 'crazy');
	const todo = $derived(store ? (leaving ? store.lines.filter((l) => !l.checked) : store.lines) : []);
	const bought = $derived(store && leaving ? store.lines.filter((l) => l.checked) : []);
	let showBought = $state(false);

	function tick(line: ShoppingLine, value: boolean) {
		if (value && leaving && allows.flights()) {
			const check = document.querySelector<HTMLElement>(`[data-line="${line.id}"] .check`);
			const basket = tabIcon('shopping');
			if (check && basket) {
				void fly(check, basket, {
					arc: 60,
					duration: 620,
					shrink: 0.35,
					prepare: (copy) => {
						copy.style.background = 'var(--color-leaf)';
						copy.style.borderColor = 'var(--color-leaf)';
					}
				}).then(() => {
					basket.animate([{ transform: 'rotate(0)', transformOrigin: '50% 0' }, { transform: 'rotate(24deg)', offset: 0.25 }, { transform: 'rotate(-16deg)', offset: 0.55 }, { transform: 'rotate(6deg)', offset: 0.8 }, { transform: 'rotate(0)' }], { duration: 560 });
				});
			}
		}
		planStore.change((p) => setChecked(p, line.id, value));
	}

	// D3 and D4. A store that has nothing left to buy gets a check (see the store tabs). The moment the last item of a store is ticked, there is a little celebration,
	// and a bigger one when it was the last item of the whole list.
	let before = new Map<string, number>();
	let beforePlan: string | undefined;
	let stamp = $state(false);
	$effect(() => {
		if (!view) return;
		const plan = planStore.library?.current;
		const now = new Map(view.stores.map((s) => [s.id, s.open]));
		const finished = plan === beforePlan && view.stores.some((s) => (before.get(s.id) ?? 0) > 0 && s.open === 0);
		before = now;
		beforePlan = plan;
		if (!finished || !allows.flights()) return;
		if (view.open === 0) allBought();
		else storeDone();
	});

	function storeDone() {
		if (strength('D3') !== 'crazy' || !allows.particles()) return;
		shower(1.8);
		stamp = true;
		setTimeout(() => (stamp = false), 1700);
	}

	function allBought() {
		if (strength('D4') === 'playful') {
			burst({ x: 0, y: innerHeight, count: 70, angle: -55, spread: 40, speed: 900, gravity: 1100, life: 2.2 });
			burst({ x: innerWidth, y: innerHeight, count: 70, angle: -125, spread: 40, speed: 900, gravity: 1100, life: 2.2 });
			tabIcon('shopping')?.animate([{ transform: 'translateY(0) rotate(0)' }, { transform: 'translateY(-10px) rotate(-12deg)' }, { transform: 'translateY(0) rotate(12deg)' }, { transform: 'translateY(-10px) rotate(-12deg)' }, { transform: 'translateY(0) rotate(0)' }], { duration: 1100, easing: 'ease-in-out' });
		} else burst({ x: innerWidth / 2, y: innerHeight * 0.6, count: 24, speed: 360 });
	}
</script>

{#if view && store}
	<div class="list">
		{#if view.open === 0}
			<p class="all-done" role="status"><Check size={20} strokeWidth={3} /> Everything is bought</p>
		{/if}
		<StoreTabs {tabs} bind:active={() => store.id, (id) => (selected = id)} />

		<div class="summary">
			<span class="cost"><strong>{euro(store.cost)}</strong> <span class="soft">estimated</span></span>
			<span class="end">
				{#if store.unpriced}<NoPricePill count={store.unpriced} />{/if}
				<IconButton icon={Printer} label="Print the list for {store.name}" size={36} href="{resolve('/print/shopping')}?store={store.id}" />
			</span>
		</div>

		<div class="progress">
			<div class="meter" role="meter" aria-label="Bought in {store.name}" aria-valuemin={0} aria-valuemax={store.lines.length} aria-valuenow={done}>
				<div class="fill" style:width="{(done / store.lines.length) * 100}%"></div>
			</div>
			<span class="count"><Odometer text={String(done)} /> / {store.lines.length}</span>
		</div>

		<ul>
			{#each todo as line (line.id)}
				<li data-line={line.id} animate:flip={{ duration: allows.flights() ? 300 : 0 }} out:slide={{ duration: allows.flights() ? 260 : 0, easing: cubicOut }}>
					<ShopRow name={line.name} buy={line.buy} need={line.need} unpriced={line.unpriced} bind:checked={() => line.checked, (value) => tick(line, value)} />
				</li>
			{/each}
		</ul>

		{#if bought.length}
			<button class="bought-toggle" aria-expanded={showBought} onclick={() => (showBought = !showBought)}>
				Bought · {bought.length}
				<span class="chevron" class:open={showBought}><ChevronDown size={18} /></span>
			</button>
			{#if showBought}
				<ul transition:slide={{ duration: allows.flights() ? 260 : 0 }}>
					{#each bought as line (line.id)}
						<li data-line={line.id}>
							<ShopRow name={line.name} buy={line.buy} need={line.need} unpriced={line.unpriced} bind:checked={() => line.checked, (value) => tick(line, value)} />
						</li>
					{/each}
				</ul>
			{/if}
		{/if}
	</div>
	{#if stamp}<span class="stamp" aria-hidden="true"><ChefHat size={46} /></span>{/if}
{:else}
	<EmptyNote>
		<span>Nothing to buy yet.</span>
		<a href={resolve('/(app)/plan')}>Put dishes in the plan</a>
	</EmptyNote>
{/if}

<style>
	.list {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}
	.end {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}
	.cost strong {
		font-size: 20px;
		font-weight: var(--weight-heavy);
	}
	.cost .soft {
		font-size: var(--text-note);
	}
	.progress {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}
	.meter {
		flex: 1;
		height: 10px;
		border-radius: 5px;
		background: var(--color-line);
		overflow: hidden;
	}
	.fill {
		height: 100%;
		border-radius: 5px;
		background: var(--color-leaf);
		transition: width 600ms var(--spring-soft);
	}
	.count {
		display: inline-flex;
		gap: 4px;
	}
	.all-done {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin: 0;
		color: var(--color-leaf);
		font-weight: var(--weight-heavy);
		animation: arrive var(--motion-normal) var(--ease-out);
	}
	@keyframes arrive {
		from {
			opacity: 0;
			transform: translateY(-6px);
		}
	}
	.bought-toggle {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		align-self: flex-start;
		padding: var(--space-2) 0;
		border: 0;
		background: none;
		color: var(--color-ink-soft);
		font: inherit;
		font-weight: var(--weight-bold);
		cursor: pointer;
	}
	.chevron {
		display: inline-flex;
		transition: transform var(--motion-quick) var(--ease-out);
	}
	.chevron.open {
		transform: rotate(180deg);
	}
	.stamp {
		position: fixed;
		left: 50%;
		top: 40%;
		z-index: 100002;
		display: grid;
		place-items: center;
		width: 96px;
		height: 96px;
		margin: -48px 0 0 -48px;
		border: 5px solid var(--color-tomato);
		border-radius: 50%;
		background: var(--color-paper);
		color: var(--color-tomato);
		animation: stamp 520ms var(--spring-bouncy);
		transform: rotate(-12deg);
		pointer-events: none;
	}
	@keyframes stamp {
		from {
			transform: scale(3) rotate(-30deg);
			opacity: 0;
		}
	}
	.count {
		font-size: var(--text-small);
		font-weight: var(--weight-bold);
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li + li {
		border-top: 1px solid var(--color-line);
	}
</style>
