<script lang="ts">
	import ChefHat from '@lucide/svelte/icons/chef-hat';
	import Flame from '@lucide/svelte/icons/flame';
	import { flip } from 'svelte/animate';
	import { tick } from 'svelte';
	import Badge from '#lib/components/Badge.svelte';
	import Button from '#lib/components/Button.svelte';
	import Odometer from '#lib/components/Odometer.svelte';
	import Plate from './Plate.svelte';
	import { NAV } from '#lib/nav.ts';
	import { easing, wait } from '#lib/motion/easing.ts';
	import { allows } from '#lib/motion/mode.svelte.ts';
	import Demo, { type Level } from './Demo.svelte';

	// ---- F1. Switching, adding and deleting plans ----
	type Card = { id: number; name: string };
	let plans = $state<Card[]>([
		{ id: 1, name: "Freshers' Trip 2027" },
		{ id: 2, name: 'Summer camp' },
		{ id: 3, name: 'Birthday' }
	]);
	let openId = $state(1);
	let f1Level = $state<Level>('regular');
	let deck = $state<{ id: number; tear: boolean }[]>([{ id: 1, tear: false }, { id: 2, tear: false }]);
	let deckNext = 3;
	let preview = $state<HTMLElement>();
	let previewName = $state("Freshers' Trip 2027");
	const cardEls: Record<number, HTMLElement> = {};

	async function switchPlan(level: Level) {
		f1Level = level;
		const index = plans.findIndex((p) => p.id === openId);
		const next = plans[(index + 1) % plans.length];
		if (level === 'playful' && preview && allows.flights()) {
			const half = preview.animate([{ transform: 'rotateY(0)' }, { transform: 'rotateY(90deg)' }], { duration: 200, easing: 'ease-in', fill: 'forwards' });
			await half.finished.catch(() => {});
			previewName = next.name;
			openId = next.id;
			await preview.animate([{ transform: 'rotateY(-90deg)' }, { transform: 'rotateY(0)' }], { duration: 260, easing: 'ease-out' }).finished.catch(() => {});
			half.cancel();
		} else {
			openId = next.id;
			previewName = next.name;
			if (level === 'regular') plans = [next, ...plans.filter((p) => p.id !== next.id)];
		}
	}
	async function dealOrTear() {
		f1Level = 'crazy';
		if (deck.length >= 4) {
			const top = deck[deck.length - 1];
			const el = cardEls[top.id];
			if (el && allows.flights()) {
				top.tear = true;
				await wait(520);
			}
			deck = deck.filter((c) => c.id !== top.id);
		} else {
			deck = [...deck, { id: deckNext++, tear: false }];
			await tick();
			cardEls[deck[deck.length - 1].id]?.animate([{ transform: 'translate(140px, -160px) rotate(40deg)', opacity: 0 }, { transform: 'translate(0, 0) rotate(var(--r))', opacity: 1 }], { duration: 560, easing: easing('spring-bouncy') });
		}
	}

	// ---- F2. The sidebar ----
	let side = $state(0);
	let f2Level = $state<Level>('regular');
	let pillEl = $state<HTMLElement>();
	let flame = $state<HTMLElement>();
	let shopCount = $state(50);
	const STEP = 52;

	function goSide(to: number, level: Level = f2Level) {
		if (to === side) return;
		const from = side;
		side = to;
		if (!allows.flights()) return;
		pillEl?.animate([{ transform: `translateY(${from * STEP}px)` }, { transform: `translateY(${to * STEP}px)` }], { duration: 400, easing: easing('spring-soft') });
		if (level === 'playful') {
			flame?.animate([{ transform: 'scale(1) rotate(0)', filter: 'none' }, { transform: 'scale(1.35) rotate(-8deg)', offset: 0.3 }, { transform: 'scale(0.95) rotate(5deg)', offset: 0.6 }, { transform: 'scale(1) rotate(0)' }], { duration: 700, easing: 'ease-out' });
			if (to === 2) shopCount = Math.max(0, shopCount - 3);
		}
	}
	function playSide(level: Level) {
		f2Level = level;
		goSide((side + 1) % 3, level);
	}

	// ---- G1. Plates ----
	let g1Level = $state<Level>('playful');
	const plateEls: HTMLElement[] = [];
	const seeds = ['lentil-dal', 'apple-crumble', 'tzatziki', 'baba-ganoush', 'salsa', 'chilli'];
	let steaming = $state<number | null>(null);

	async function touchPlate(i: number, level: Level = g1Level) {
		const el = plateEls[i];
		if (!el || !allows.flights()) return;
		if (level === 'playful') {
			el.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-14deg)' }, { transform: 'rotate(10deg)' }, { transform: 'rotate(-5deg)' }, { transform: 'rotate(0)' }], { duration: 480 });
			steaming = i;
			await wait(3000);
			if (steaming === i) steaming = null;
		}
		if (level === 'crazy') el.animate([{ transform: 'translateY(0) rotateX(0)' }, { transform: 'translateY(-22px) rotateX(540deg)', offset: 0.2 }, { transform: 'translateY(0) rotateX(1080deg)', offset: 0.4 }, { transform: 'translateY(-8px) rotateX(1260deg)', offset: 0.55 }, { transform: 'translateY(0) rotateX(1440deg) scaleY(0.9)', offset: 0.7 }, { transform: 'translateY(0) rotateX(1470deg)', offset: 0.85 }, { transform: 'translateY(0) rotateX(1440deg)' }], { duration: 1300, easing: 'ease-out' });
	}
	function playPlates(level: Level) {
		g1Level = level;
		plateEls.forEach((_, i) => setTimeout(() => void touchPlate(i, level), i * 120));
	}

	// ---- G2. Empty states ----
	let g2Level = $state<Level>('regular');
	let g2Key = $state(0);
	let emptyPlate = $state<HTMLElement>();
	let fork = $state<HTMLElement>();
	let knife = $state<HTMLElement>();

	async function showEmpty(level: Level) {
		g2Level = level;
		g2Key++;
		await tick();
		if (!allows.flights()) return;
		if (level === 'playful') emptyPlate?.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-12px)' }, { transform: 'translateY(0)' }, { transform: 'translateY(-6px)' }, { transform: 'translateY(0)' }], { duration: 1300, easing: 'ease-in-out' });
		if (level === 'crazy') {
			const tap = (el: HTMLElement | undefined, side: number, delay: number) =>
				el?.animate(
					[
						{ transform: `translateX(${side * 40}px) rotate(${side * 20}deg)`, opacity: 0 },
						{ transform: `translateX(${side * 6}px) rotate(${side * 4}deg)`, opacity: 1, offset: 0.25 },
						{ transform: `translateX(${side * 12}px) rotate(${side * 10}deg)`, offset: 0.35 },
						{ transform: `translateX(${side * 6}px) rotate(${side * 4}deg)`, offset: 0.45 },
						{ transform: `translateX(${side * 12}px) rotate(${side * 10}deg)`, offset: 0.55 },
						{ transform: `translateX(${side * 6}px) rotate(${side * 4}deg)`, offset: 0.65 },
						{ transform: `translateX(${side * 46}px) rotate(${side * 84}deg)` }
					],
					{ duration: 1600, delay, easing: 'ease-in-out', fill: 'forwards' }
				);
			tap(fork, -1, 0);
			tap(knife, 1, 120);
		}
	}

	// ---- H1. The logo, five taps ----
	let taps = $state(0);
	let raining = $state(0);
	const rain = Array.from({ length: 30 }, (_, i) => ({ id: i, x: Math.random() * 100, delay: Math.random() * 1.4, spin: (Math.random() - 0.5) * 900, size: 32 + Math.random() * 28 }));
	async function tapLogo() {
		taps++;
		if (taps < 5) return;
		taps = 0;
		raining++;
		await wait(4000);
		raining = 0;
	}

	// ---- H5. Buzz ----
	let buzzed = $state<string>('');
	function buzz() {
		buzzed = 'vibrate' in navigator ? (navigator.vibrate(30) ? 'Buzzed.' : 'This device did not buzz.') : 'This device cannot buzz from a web page (iPhones cannot).';
	}
</script>

<Demo id="F1" title="Switching, adding and deleting a plan" hint="Regular: the list rearranges. Playful: the page flips like a card. Crazy: a deck, where a new plan is dealt and the top one is torn (press again, four cards are the limit)." tall levels={['regular', 'playful', 'crazy']} onplay={(l) => void (l === 'crazy' ? dealOrTear() : switchPlan(l))}>
	{#snippet stage({ level })}
		{#if level === 'crazy'}
			<div class="deck">
				{#each deck as card, i (card.id)}
					<div class="deck-card" class:tear={card.tear} bind:this={cardEls[card.id]} style:--r="{(i - deck.length / 2) * 4}deg" style:transform="rotate({(i - deck.length / 2) * 4}deg)" style:z-index={i}>
						<strong>Plan {card.id}</strong><i></i><i></i><i></i>
						{#if card.tear}<span class="half left"></span><span class="half right"></span>{/if}
					</div>
				{/each}
			</div>
		{:else}
			<div class="f1">
				<div class="preview" bind:this={preview}><strong>{previewName}</strong><span class="soft">2 days · 7 meals</span></div>
				<ul>
					{#each plans as plan (plan.id)}
						<li animate:flip={{ duration: allows.flights() ? 320 : 0 }}><span>{plan.name}</span>{#if plan.id === openId}<Badge tone="leaf">Open</Badge>{/if}</li>
					{/each}
				</ul>
			</div>
		{/if}
	{/snippet}
</Demo>

<Demo id="F2" title="The sidebar" levels={['regular', 'playful']} onplay={playSide}>
	{#snippet stage()}
		<aside class="side">
			<span class="brand"><span class="logo" bind:this={flame}><Flame size={18} /></span> Hell's Kitchen</span>
			<nav>
				<span class="side-pill" bind:this={pillEl} style:transform="translateY({side * STEP}px)"></span>
				{#each NAV as item, i (item.id)}
					<button class:on={side === i} onclick={() => goSide(i)}>
						<item.icon size={20} /> {item.label}
						{#if item.id === 'shopping'}<b class="count"><Odometer text={String(shopCount)} /></b>{/if}
					</button>
				{/each}
			</nav>
		</aside>
	{/snippet}
</Demo>

<Demo id="G1" title="Plates" hint="Regular: nothing moves. Playful: a plate wobbles and steams. Crazy: tap a plate and it spins like a coin." levels={['playful', 'crazy']} tall onplay={playPlates}>
	{#snippet stage()}
		<div class="plates">
			{#each seeds as seed, i (seed)}
				<button class="plate-button" onclick={() => touchPlate(i)} aria-label="Plate">
					<span class="plate-spin" bind:this={plateEls[i]}><Plate {seed} size={64} /></span>
					{#if steaming === i}<span class="wisps"><i></i><i></i><i></i></span>{/if}
				</button>
			{/each}
		</div>
	{/snippet}
</Demo>

<Demo id="G2" title="An empty screen" onplay={(l) => void showEmpty(l)}>
	{#snippet stage()}
		{#key g2Key}
			<div class="empty" class:fade={g2Level === 'regular'}>
				<span class="cutlery">
					{#if g2Level === 'crazy'}<span class="fork" bind:this={fork}></span>{/if}
					<span class="empty-plate" bind:this={emptyPlate}><Plate seed="nothing-yet" size={64} /></span>
					{#if g2Level === 'crazy'}<span class="knife" bind:this={knife}></span>{/if}
				</span>
				<span>Nothing to buy yet.</span>
				<span class="soft">Put dishes in the plan</span>
			</div>
		{/key}
	{/snippet}
</Demo>

<Demo id="H1" title="Tap the flame five times" hint="An easter egg. Tap the logo." levels={['crazy']} tall onplay={() => (taps = 4)}>
	{#snippet stage()}
		<button class="logo-big" onclick={tapLogo} aria-label="Logo">
			<Flame size={42} />
			{#if taps > 0}<span class="taps">{taps}</span>{/if}
		</button>
		{#if raining}
			{#key raining}
				<div class="rain" aria-hidden="true">
					{#each rain as p (p.id)}
						<span class="falling" style:left="{p.x}%" style:animation-delay="{p.delay}s" style:--spin="{p.spin}deg"><Plate seed={`rain-${p.id}`} size={p.size} /></span>
					{/each}
				</div>
			{/key}
		{/if}
	{/snippet}
</Demo>

<Demo id="H5" title="A buzz on Android" hint="iPhones do not allow it from a web page." levels={['regular']} onplay={buzz}>
	{#snippet stage()}
		<div class="buzz"><Button variant="secondary" onclick={buzz}>Buzz</Button><span class="soft">{buzzed}</span></div>
	{/snippet}
</Demo>

<style>
	.f1 {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		width: min(300px, 100%);
		perspective: 600px;
	}
	.preview {
		display: flex;
		flex-direction: column;
		padding: var(--space-4);
		border-radius: var(--radius-m);
		background: var(--color-paper);
		border: var(--border);
		font-size: var(--text-strong);
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-2) 0;
		border-bottom: 1px solid var(--color-line);
	}
	.deck {
		position: relative;
		width: 190px;
		height: 220px;
	}
	.deck-card {
		position: absolute;
		inset: 20px 10px 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: var(--space-4);
		border-radius: var(--radius-m);
		background: var(--color-paper);
		border: var(--border);
		box-shadow: 0 2px 0 var(--color-line);
	}
	.deck-card i {
		height: 8px;
		border-radius: 4px;
		background: var(--color-line);
	}
	.deck-card.tear > :not(.half) {
		visibility: hidden;
	}
	.half {
		position: absolute;
		inset: -1.5px;
		border-radius: var(--radius-m);
		background: var(--color-paper);
		border: var(--border);
	}
	.half.left {
		clip-path: polygon(0 0, 55% 0, 45% 30%, 58% 55%, 46% 100%, 0 100%);
		animation: tear-left 0.55s ease-in forwards;
	}
	.half.right {
		clip-path: polygon(55% 0, 100% 0, 100% 100%, 46% 100%, 58% 55%, 45% 30%);
		animation: tear-right 0.55s ease-in forwards;
	}
	@keyframes tear-left {
		to {
			transform: translate(-120px, 80px) rotate(-30deg);
			opacity: 0;
		}
	}
	@keyframes tear-right {
		to {
			transform: translate(120px, 90px) rotate(30deg);
			opacity: 0;
		}
	}
	.side {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		width: 220px;
		padding: var(--space-5) 14px;
		border-radius: var(--radius-l);
		background: var(--color-tomato);
		color: var(--color-on-tomato);
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
		font-weight: var(--weight-heavy);
	}
	.logo {
		display: inline-grid;
		place-items: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--color-mustard);
		color: var(--color-tomato);
	}
	nav {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.side-pill {
		position: absolute;
		inset: 0 0 auto;
		height: 46px;
		border-radius: 14px;
		background: var(--color-on-tomato);
	}
	nav button {
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--space-3);
		height: 46px;
		padding: 0 14px;
		border: 0;
		border-radius: 14px;
		background: none;
		color: inherit;
		font: inherit;
		font-weight: var(--weight-medium);
		cursor: pointer;
	}
	nav button.on {
		color: var(--color-tomato);
		font-weight: var(--weight-heavy);
	}
	.count {
		display: inline-flex;
		margin-left: auto;
		align-items: center;
		height: 22px;
		padding: 0 8px;
		border-radius: 11px;
		background: var(--color-mustard);
		color: var(--color-ink);
		font-size: var(--text-caption);
	}
	.plates {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-5);
		perspective: 500px;
	}
	.plate-button {
		position: relative;
		padding: 0;
		border: 0;
		background: none;
		cursor: pointer;
	}
	.plate-spin {
		display: inline-flex;
	}
	.wisps {
		position: absolute;
		left: 50%;
		top: -6px;
		display: flex;
		gap: 6px;
		margin-left: -14px;
	}
	.wisps i {
		width: 4px;
		height: 16px;
		border-radius: 3px;
		background: var(--color-ink-soft);
		opacity: 0;
		animation: steam 1.4s ease-out infinite;
	}
	.wisps i:nth-child(2) {
		animation-delay: 0.35s;
	}
	.wisps i:nth-child(3) {
		animation-delay: 0.7s;
	}
	@keyframes steam {
		0% {
			opacity: 0;
			transform: translateY(8px) scaleY(0.4);
		}
		30% {
			opacity: 0.8;
		}
		100% {
			opacity: 0;
			transform: translateY(-20px) scaleY(1.2);
		}
	}
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		color: var(--color-ink-soft);
	}
	.empty.fade {
		animation: m-fade-rise 0.3s ease-out;
	}
	.cutlery {
		position: relative;
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.fork,
	.knife {
		width: 10px;
		height: 56px;
		border-radius: 5px;
		background: var(--color-ink-soft);
		opacity: 0;
	}
	.knife {
		width: 12px;
		border-radius: 6px 6px 3px 3px;
	}
	.logo-big {
		position: relative;
		display: grid;
		place-items: center;
		width: 84px;
		height: 84px;
		border: 0;
		border-radius: 50%;
		background: var(--color-mustard);
		color: var(--color-tomato);
		cursor: pointer;
		transition: transform var(--motion-instant);
	}
	.logo-big:active {
		transform: scale(0.94);
	}
	.taps {
		position: absolute;
		right: -4px;
		top: -4px;
		display: grid;
		place-items: center;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--color-ink);
		color: var(--color-paper);
		font-size: var(--text-note);
		font-weight: var(--weight-heavy);
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
	.buzz {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		text-align: center;
	}
</style>
