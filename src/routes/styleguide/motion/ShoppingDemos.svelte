<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import ChefHat from '@lucide/svelte/icons/chef-hat';
	import Flame from '@lucide/svelte/icons/flame';
	import { flip } from 'svelte/animate';
	import { tick } from 'svelte';
	import Odometer from '#lib/components/Odometer.svelte';
	import Plate from './Plate.svelte';
	import { NAV } from '#lib/nav.ts';
	import { easing, wait } from '#lib/motion/easing.ts';
	import { fly } from '#lib/motion/fly.ts';
	import { allows } from '#lib/motion/mode.svelte.ts';
	import { burst, ring, shower } from '#lib/motion/particles.ts';
	import Demo, { type Level } from './Demo.svelte';

	const BasketIcon = NAV[2].icon;

	// ---- D1. Ticking an item ----
	type Item = { id: number; name: string; amount: string; done: boolean; gone: boolean };
	const fresh = (): Item[] => [
		{ id: 1, name: 'Red lentils', amount: '21.6 kg', done: false, gone: false },
		{ id: 2, name: 'Basmati rice', amount: '36 kg', done: false, gone: false },
		{ id: 3, name: 'Curry powder', amount: '720 g', done: false, gone: false },
		{ id: 4, name: 'Coconut milk', amount: '14.4 L', done: false, gone: false }
	];
	let items = $state<Item[]>(fresh());
	let d1Level = $state<Level>('regular');
	const dots: Record<number, HTMLElement> = {};
	let basket = $state<HTMLElement>();
	const left = $derived(items.filter((i) => !i.done).length);

	async function tickItem(item: Item, level: Level = d1Level) {
		if (item.done) {
			item.done = false;
			return;
		}
		item.done = true;
		if (!allows.flights()) return;
		const dot = dots[item.id];
		if (level !== 'regular') {
			dot?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.4)', offset: 0.35 }, { transform: 'scale(1)' }], { duration: 420, easing: easing('spring-bouncy') });
			if (dot && level === 'playful') {
				const box = dot.getBoundingClientRect();
				ring(box.left + box.width / 2, box.top + box.height / 2, 'rgba(60,140,80,0.9)');
			}
		}
		if (level === 'crazy' && dot && basket) {
			await fly(dot, basket, { arc: 60, duration: 620, shrink: 0.35 });
			basket.animate([{ transform: 'rotate(0)', transformOrigin: '50% 0' }, { transform: 'rotate(24deg)', offset: 0.25 }, { transform: 'rotate(-16deg)', offset: 0.55 }, { transform: 'rotate(6deg)', offset: 0.8 }, { transform: 'rotate(0)' }], { duration: 560 });
			item.gone = true;
		}
	}
	function playTick(level: Level) {
		d1Level = level;
		const next = items.find((i) => !i.done);
		if (next) void tickItem(next, level);
		else items = fresh();
	}

	// ---- D2. The progress bar ----
	let step = $state(3);
	let d2Level = $state<Level>('regular');
	let sweep = $state(0);
	let bar = $state<HTMLElement>();
	const TOTAL = 12;

	function advance(level: Level) {
		d2Level = level;
		const next = step >= TOTAL ? 0 : step + 1;
		const crossed = [0.25, 0.5, 0.75].some((q) => Math.floor((next / TOTAL) * 4) > Math.floor((step / TOTAL) * 4) && Math.round(q * 4) === Math.floor((next / TOTAL) * 4));
		step = next;
		sweep++;
		if (level === 'playful' && crossed && allows.flights()) bar?.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(1.9)', offset: 0.35 }, { transform: 'scaleY(1)' }], { duration: 420, easing: easing('spring-bouncy') });
	}

	// ---- D3. A store is done ----
	let rows = $state([false, false, false, false]);
	let d3Done = $state(false);
	let d3Level = $state<Level>('regular');
	let tabBadge = $state<HTMLElement>();
	let stamp = $state(false);
	let stamping = $state<HTMLElement>();
	let d3Busy = false;
	const dots3: HTMLElement[] = [];

	async function finishStore(level: Level) {
		if (d3Busy) return;
		d3Busy = true;
		d3Level = level;
		rows = [false, false, false, false];
		d3Done = false;
		stamp = false;
		await wait(50);
		for (let i = 0; i < rows.length; i++) {
			rows[i] = true;
			if (level === 'crazy') dots3[i]?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.5)', offset: 0.4 }, { transform: 'scale(1)' }], { duration: 380, easing: easing('spring-bouncy') });
			await wait(level === 'crazy' ? 110 : 40);
		}
		d3Done = true;
		await tick();
		if (level !== 'regular' && tabBadge) {
			tabBadge.animate([{ transform: 'scale(0.4)' }, { transform: 'scale(1.3)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: 480, easing: easing('spring-bouncy') });
			const box = tabBadge.getBoundingClientRect();
			burst({ x: box.left + box.width / 2, y: box.top + box.height / 2, count: level === 'crazy' ? 60 : 36, speed: 480 });
		}
		if (level === 'crazy') {
			shower(1.8);
			stamp = true;
			await tick();
			stamping?.animate([{ transform: 'scale(3) rotate(-30deg)', opacity: 0 }, { transform: 'scale(0.9) rotate(-12deg)', opacity: 1, offset: 0.5 }, { transform: 'scale(1) rotate(-12deg)' }], { duration: 520, easing: easing('spring-bouncy') });
			await wait(1500);
		} else await wait(1500);
		rows = [false, false, false, false];
		d3Done = false;
		stamp = false;
		d3Busy = false;
	}

	// ---- D4. Everything bought ----
	let d4Level = $state<Level>('regular');
	let rain = $state(0);
	let d4Done = $state(false);
	let hat = $state<HTMLElement>();
	let basketD4 = $state<HTMLElement>();
	const rainPlates = Array.from({ length: 34 }, (_, i) => ({ id: i, x: Math.random() * 100, delay: Math.random() * 1.6, spin: (Math.random() - 0.5) * 900, size: 34 + Math.random() * 30, seed: ['lentil-dal', 'apple-crumble', 'tzatziki', 'baba-ganoush', 'chilli', 'salsa'][i % 6] }));

	async function allBought(level: Level) {
		d4Level = level;
		d4Done = false;
		await tick();
		d4Done = true;
		await tick();
		if (!allows.flights()) return;
		if (level === 'regular') {
			burst({ x: innerWidth / 2, y: innerHeight * 0.6, count: 24, speed: 360 });
		} else if (level === 'playful') {
			burst({ x: 0, y: innerHeight, count: 70, angle: -55, spread: 40, speed: 900, gravity: 1100, life: 2.2 });
			burst({ x: innerWidth, y: innerHeight, count: 70, angle: -125, spread: 40, speed: 900, gravity: 1100, life: 2.2 });
			basketD4?.animate([{ transform: 'translateY(0) rotate(0)' }, { transform: 'translateY(-10px) rotate(-12deg)' }, { transform: 'translateY(0) rotate(12deg)' }, { transform: 'translateY(-10px) rotate(-12deg)' }, { transform: 'translateY(0) rotate(0)' }], { duration: 1100, easing: 'ease-in-out' });
		} else {
			rain++;
			hat?.animate([{ transform: 'translateY(-90px) rotate(-30deg)', opacity: 0 }, { transform: 'translateY(0) rotate(-8deg)', opacity: 1, offset: 0.55 }, { transform: 'translateY(-10px) rotate(-8deg)', offset: 0.75 }, { transform: 'translateY(0) rotate(-8deg)' }], { duration: 900, delay: 700, easing: 'ease-out', fill: 'backwards' });
			await wait(4200);
			rain = 0;
		}
	}

	// ---- D5. Store tabs ----
	const stores = ['Supermarket', 'Asian market', 'Online'];
	let active = $state(0);
	let counts = $state([12, 5, 3]);
	let d5Level = $state<Level>('regular');
	let indicator = $state<HTMLElement>();
	const tabEls: HTMLElement[] = [];

	function measure(i: number) {
		const el = tabEls[i];
		return { x: el.offsetLeft, w: el.offsetWidth };
	}
	function moveTab(to: number, level: Level = d5Level) {
		if (to === active || !indicator) return;
		const a = measure(active);
		const b = measure(to);
		const frame = (x: number, w: number) => ({ transform: `translateX(${x}px) scaleX(${w})` });
		active = to;
		if (!allows.flights()) return;
		if (level === 'playful') {
			const lo = Math.min(a.x, b.x);
			const hi = Math.max(a.x + a.w, b.x + b.w);
			indicator.animate([{ ...frame(a.x, a.w) }, { ...frame(lo, hi - lo), offset: 0.45 }, { ...frame(b.x, b.w) }], { duration: 460, easing: 'ease-out' });
		} else indicator.animate([frame(a.x, a.w), frame(b.x, b.w)], { duration: 380, easing: easing('spring-soft') });
	}
	function playTabs(level: Level) {
		d5Level = level;
		const from = active;
		counts[from] = Math.max(0, counts[from] - 1);
		moveTab((active + 1) % 3, level);
	}
	const here = $derived(tabEls[active] ? { x: tabEls[active].offsetLeft, w: tabEls[active].offsetWidth } : { x: 0, w: 90 });
</script>

<Demo id="D1" title="Ticking an item" hint="Tap the circles, or press a strength to tick the next one. Crazy sends the item into the basket." tall onplay={playTick}>
	{#snippet stage()}
		<div class="shop">
			<ul class:wipe={d1Level !== 'regular'}>
				{#each items.filter((i) => !i.gone) as item (item.id)}
					<li animate:flip={{ duration: allows.flights() ? 300 : 0 }}>
						<button class="dot" class:done={item.done} aria-label="Bought: {item.name}" bind:this={dots[item.id]} onclick={() => tickItem(item)}>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path class="tick" d="M4 12.5l5 5L20 6.5" /></svg>
						</button>
						<span class="name" class:done={item.done}>{item.name}</span>
						<span class="amount">{item.amount}</span>
					</li>
				{/each}
			</ul>
			<div class="basket-bar">
				<span class="basket" bind:this={basket}><BasketIcon size={24} />{#if left}<b class="count">{left}</b>{/if}</span>
			</div>
		</div>
	{/snippet}
</Demo>

<Demo id="D2" title="The progress bar and the count" levels={['regular', 'playful']} onplay={advance}>
	{#snippet stage()}
		<div class="progress">
			<div class="track" bind:this={bar}>
				<div class="fill" style:width="{(step / TOTAL) * 100}%">
					{#key sweep}{#if d2Level === 'playful'}<span class="sweep"></span>{/if}{/key}
				</div>
			</div>
			<span class="fraction"><Odometer text={String(step)} /> / {TOTAL}</span>
		</div>
	{/snippet}
</Demo>

<Demo id="D3" title="A store is done" hint="Crazy: a wave of ticks, confetti from above, and a stamp." tall onplay={(l) => void finishStore(l)}>
	{#snippet stage()}
		<div class="store">
			<div class="store-tabs">
				<span class="store-tab">Supermarket
					<b class="pill" class:done={d3Done} bind:this={tabBadge}>{#if d3Done}<Check size={13} />{:else}{rows.filter((r) => !r).length}{/if}</b>
				</span>
				<span class="store-tab soft">Online <b class="pill">3</b></span>
			</div>
			<div class="meter"><div class="meter-fill" class:full={d3Done} style:width="{(rows.filter(Boolean).length / rows.length) * 100}%"></div></div>
			<ul class="mini">
				{#each rows as done, i (i)}
					<li><span class="dot sm" class:done bind:this={dots3[i]}><Check size={12} /></span><span class="name" class:done>Item {i + 1}</span></li>
				{/each}
			</ul>
			{#if stamp}<span class="stamp" bind:this={stamping}><ChefHat size={46} /></span>{/if}
		</div>
	{/snippet}
</Demo>

<Demo id="D4" title="Everything bought" hint="The finish line. Crazy rains the real plates and puts a chef's hat on the flame." tall onplay={(l) => void allBought(l)}>
	{#snippet stage()}
		<div class="finish">
			<span class="logo">
				<Flame size={30} />
				{#if d4Level === 'crazy' && d4Done}<span class="hat" bind:this={hat}><ChefHat size={34} /></span>{/if}
			</span>
			{#if d4Done}
				<span class="all-done" bind:this={basketD4}><Check size={22} /><BasketIcon size={30} /></span>
			{/if}
		</div>
		{#if rain}
			{#key rain}
				<div class="rain" aria-hidden="true">
					{#each rainPlates as plate (plate.id)}
						<span class="falling" style:left="{plate.x}%" style:animation-delay="{plate.delay}s" style:--spin="{plate.spin}deg"><Plate seed={plate.seed + plate.id} size={plate.size} /></span>
					{/each}
				</div>
			{/key}
		{/if}
	{/snippet}
</Demo>

<Demo id="D5" title="Store tabs" levels={['regular', 'playful']} onplay={playTabs}>
	{#snippet stage()}
		<div class="store-tabs wide">
			<span class="indicator" bind:this={indicator} style:transform="translateX({here.x}px) scaleX({here.w})"></span>
			{#each stores as store, i (store)}
				<button class="store-tab" class:on={active === i} bind:this={tabEls[i]} onclick={() => moveTab(i)}>
					{store}
					<b class="pill">{#if d5Level === 'playful'}<Odometer text={String(counts[i])} />{:else}{counts[i]}{/if}</b>
				</button>
			{/each}
		</div>
	{/snippet}
</Demo>

<style>
	.shop {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		width: min(300px, 100%);
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: 9px 0;
		border-bottom: 1px solid var(--color-line);
	}
	.dot {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: none;
		width: 26px;
		height: 26px;
		padding: 0;
		border: 2px solid var(--color-ink-soft);
		border-radius: 50%;
		background: transparent;
		color: var(--color-sheet);
		cursor: pointer;
		transition: background var(--motion-quick), border-color var(--motion-quick);
	}
	.dot.done {
		background: var(--color-leaf);
		border-color: var(--color-leaf);
	}
	.dot.sm {
		width: 20px;
		height: 20px;
	}
	.tick {
		stroke-dasharray: 26;
		stroke-dashoffset: 26;
		transition: stroke-dashoffset var(--motion-quick) 60ms;
	}
	.done .tick {
		stroke-dashoffset: 0;
	}
	.name {
		position: relative;
		flex: 0 1 auto;
		margin-right: auto;
		transition: color var(--motion-quick);
	}
	.name.done {
		color: var(--color-ink-soft);
	}
	.wipe .name::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		top: 55%;
		height: 2px;
		background: var(--color-ink-soft);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 280ms var(--ease-out);
	}
	.wipe .name.done::after {
		transform: scaleX(1);
	}
	.amount {
		font-weight: var(--weight-bold);
		font-size: var(--text-small);
	}
	.basket-bar {
		display: flex;
		justify-content: center;
		padding: var(--space-2) 0 0;
	}
	.basket {
		position: relative;
		display: inline-flex;
		color: var(--color-ink);
	}
	.count,
	.pill {
		display: inline-grid;
		place-items: center;
		min-width: 20px;
		height: 20px;
		padding: 0 6px;
		border-radius: 10px;
		background: var(--color-mustard);
		color: var(--color-ink);
		font-size: var(--text-caption);
		font-weight: var(--weight-heavy);
		line-height: 1;
	}
	.count {
		position: absolute;
		top: -8px;
		right: -14px;
	}
	.progress {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: min(300px, 100%);
	}
	.track {
		flex: 1;
		height: 10px;
		border-radius: 5px;
		background: var(--color-line);
		overflow: hidden;
	}
	.fill {
		position: relative;
		height: 100%;
		border-radius: 5px;
		background: var(--color-leaf);
		transition: width 600ms var(--spring-soft);
		overflow: hidden;
	}
	.sweep {
		position: absolute;
		inset: 0 auto 0 -30%;
		width: 30%;
		background: rgba(255, 255, 255, 0.55);
		animation: sweep 0.6s ease-out forwards;
	}
	@keyframes sweep {
		to {
			left: 110%;
		}
	}
	.fraction {
		display: inline-flex;
		gap: 4px;
		font-weight: var(--weight-bold);
	}
	.store {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		width: min(300px, 100%);
	}
	.store-tabs {
		position: relative;
		display: flex;
		gap: var(--space-5);
		border-bottom: var(--border);
	}
	.store-tabs.wide {
		width: min(340px, 100%);
	}
	.store-tab {
		display: flex;
		align-items: center;
		gap: 7px;
		padding: 0 0 10px;
		border: 0;
		background: none;
		color: var(--color-ink-soft);
		font: inherit;
		font-weight: var(--weight-medium);
		white-space: nowrap;
		cursor: pointer;
	}
	.store-tab.on,
	.store-tabs:not(.wide) .store-tab:first-child {
		color: var(--color-ink);
		font-weight: var(--weight-heavy);
	}
	.pill.done {
		background: var(--color-leaf);
		color: var(--color-sheet);
	}
	.indicator {
		position: absolute;
		left: 0;
		bottom: -1.5px;
		width: 1px;
		height: 4px;
		border-radius: 2px;
		background: var(--color-tomato);
		transform-origin: 0 50%;
	}
	.meter {
		height: 8px;
		border-radius: 4px;
		background: var(--color-line);
		overflow: hidden;
	}
	.meter-fill {
		height: 100%;
		border-radius: 4px;
		background: var(--color-mustard);
		transition: width 200ms ease-out, background var(--motion-normal);
	}
	.meter-fill.full {
		background: var(--color-leaf);
	}
	.mini li {
		padding: 6px 0;
	}
	.stamp {
		position: absolute;
		left: 50%;
		top: 40%;
		display: grid;
		place-items: center;
		width: 96px;
		height: 96px;
		margin: -48px 0 0 -48px;
		border: 5px solid var(--color-tomato);
		border-radius: 50%;
		background: var(--color-paper);
		color: var(--color-tomato);
		transform: rotate(-12deg);
	}
	.finish {
		display: flex;
		align-items: flex-end;
		gap: var(--space-6);
	}
	.logo {
		position: relative;
		display: grid;
		place-items: center;
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: var(--color-mustard);
		color: var(--color-tomato);
	}
	.hat {
		position: absolute;
		top: -26px;
		color: var(--color-ink);
		transform: rotate(-8deg);
	}
	.all-done {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--color-leaf);
	}
	.rain {
		position: fixed;
		inset: 0;
		z-index: 100000;
		overflow: hidden;
		pointer-events: none;
	}
	.falling {
		position: absolute;
		top: -80px;
		animation: fall 2.2s ease-in forwards;
	}
	@keyframes fall {
		to {
			transform: translateY(calc(100vh + 120px)) rotate(var(--spin));
		}
	}
</style>
