<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Flame from '@lucide/svelte/icons/flame';
	import { tick } from 'svelte';
	import Button from '#lib/components/Button.svelte';
	import MealRow from '#lib/components/MealRow.svelte';
	import { easing, wait } from '#lib/motion/easing.ts';
	import { allows } from '#lib/motion/mode.svelte.ts';
	import { burst } from '#lib/motion/particles.ts';
	import { NAV } from '#lib/nav.ts';
	import Demo, { type Level } from './Demo.svelte';

	// ---- A1. Moving between the three places ----
	let tab = $state(0);
	let pill: HTMLElement;
	let tail: HTMLElement;
	const icons: HTMLElement[] = [];
	const TAB = 96;

	async function goTo(to: number, level: Level | null) {
		const from = tab;
		if (to === from) return;
		tab = to;
		const x = (i: number) => `translateX(${i * TAB}px)`;
		const soft = easing('spring-soft');
		const icon = icons[to];
		if (level === 'playful') {
			pill.animate(
				[
					{ transform: `${x(from)} scaleX(1)` },
					{ transform: `${x((from + to) / 2)} scaleX(${1 + Math.abs(to - from) * 0.5})`, offset: 0.4 },
					{ transform: `${x(to)} scaleX(0.9)`, offset: 0.75 },
					{ transform: `${x(to)} scaleX(1)` }
				],
				{ duration: 480, easing: 'ease-out' }
			);
			icon.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-9px)', offset: 0.4 }, { transform: 'translateY(0)' }], { duration: 480, delay: 120, easing: easing('spring-bouncy') });
		} else if (level === 'crazy') {
			pill.animate([{ transform: x(from) }, { transform: x(to) }], { duration: 260, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });
			tail.animate([{ transform: x(from) }, { transform: x(to) }], { duration: 620, easing: soft });
			const shows = [
				[{ transform: 'rotateX(0)' }, { transform: 'rotateX(360deg)' }],
				[{ transform: 'scaleX(1)' }, { transform: 'scaleX(0.3)', offset: 0.3 }, { transform: 'scaleX(1.35)', offset: 0.65 }, { transform: 'scaleX(1)' }],
				[{ transform: 'rotate(0)', transformOrigin: '50% 0' }, { transform: 'rotate(26deg)', transformOrigin: '50% 0', offset: 0.25 }, { transform: 'rotate(-18deg)', transformOrigin: '50% 0', offset: 0.55 }, { transform: 'rotate(8deg)', transformOrigin: '50% 0', offset: 0.8 }, { transform: 'rotate(0)', transformOrigin: '50% 0' }]
			];
			icon.animate(shows[to], { duration: 700, delay: 140, easing: 'ease-out' });
		} else {
			pill.animate([{ transform: x(from) }, { transform: x(to) }], { duration: 420, easing: soft });
		}
	}
	let a1Level = $state<Level | null>(null);

	// ---- A2. Pressing ----
	let a2Level = $state<Level | null>(null);
	let a2Stage: HTMLElement;
	let squash = $state(false);

	function press(event: PointerEvent) {
		if (a2Level === 'playful' || a2Level === 'crazy') squash = true;
		const box = a2Stage.getBoundingClientRect();
		if (a2Level === 'playful' || a2Level === 'crazy') {
			const dot = document.createElement('span');
			dot.style.cssText = `position:absolute;left:${event.clientX - box.left - 30}px;top:${event.clientY - box.top - 30}px;width:60px;height:60px;border-radius:50%;border:3px solid var(--color-tomato);pointer-events:none;animation:m-ring 520ms ease-out forwards`;
			a2Stage.append(dot);
			setTimeout(() => dot.remove(), 600);
		}
		if (a2Level === 'crazy') burst({ x: event.clientX, y: event.clientY, count: 16, kind: 'crumb', spread: 200, speed: 300, gravity: 700, life: 0.9, size: 7, colors: ['#f2b632', '#fff6e0', '#c24a2c'] });
	}
	function release() {
		squash = false;
	}

	// ---- A3. Sheets ----
	let a3Level = $state<Level>('regular');
	let sheetOpen = $state(false);
	let sheetPanel = $state<HTMLElement>();
	let backdrop = $state<HTMLElement>();
	let grip = $state<HTMLElement>();

	async function openSheet(level: Level) {
		a3Level = level;
		if (sheetOpen) return;
		sheetOpen = true;
		await tick();
		if (!sheetPanel || !backdrop || !allows.flights()) return;
		backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, fill: 'backwards' });
		if (level === 'regular') sheetPanel.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: 380, easing: easing('spring-soft') });
		if (level === 'playful') {
			sheetPanel.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: 520, easing: easing('spring-bouncy') });
			sheetPanel.querySelectorAll('.item').forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 320, delay: 120 + i * 60, easing: 'ease-out', fill: 'backwards' }));
			grip?.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(5deg)' }, { transform: 'rotate(0)' }], { duration: 500, delay: 300 });
		}
		if (level === 'crazy') sheetPanel.animate([{ transform: 'translate(-45%, 110%) rotate(-14deg)' }, { transform: 'translate(0, 0) rotate(0)' }], { duration: 640, easing: easing('spring-bouncy') });
	}
	async function closeSheet() {
		if (sheetPanel && allows.flights()) {
			const out =
				a3Level === 'crazy'
					? [{ transform: 'translate(0,0) rotate(0)' }, { transform: 'translate(70%, -30%) rotate(40deg)', opacity: 0 }]
					: [{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }];
			backdrop?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' });
			await sheetPanel.animate(out, { duration: a3Level === 'crazy' ? 420 : 220, easing: easing('ease-in'), fill: 'forwards' }).finished.catch(() => {});
		}
		sheetOpen = false;
	}

	// ---- A4. The confirm popup ----
	let a4Level = $state<Level>('regular');
	let confirming = $state(false);
	let popup = $state<HTMLElement>();
	let keepButton = $state<HTMLElement>();
	let crumpling = $state(false);

	async function askConfirm(level: Level) {
		a4Level = level;
		confirming = true;
		await tick();
		if (!popup || !allows.flights()) return;
		if (level === 'regular') popup.animate([{ transform: 'scale(0.94)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 180, easing: easing('ease-out') });
		else {
			popup.animate([{ transform: 'scale(0.7) rotate(0)', opacity: 0 }, { transform: 'scale(1.04) rotate(-3deg)', opacity: 1, offset: 0.4 }, { transform: 'scale(1) rotate(2.5deg)', offset: 0.6 }, { transform: 'scale(1) rotate(-1.5deg)', offset: 0.8 }, { transform: 'scale(1) rotate(0)' }], { duration: 560, easing: 'ease-out' });
			keepButton?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 600, delay: 600 });
		}
	}
	async function confirmDelete() {
		confirming = false;
		if (a4Level === 'crazy' && allows.flights()) {
			crumpling = true;
			await wait(1400);
			crumpling = false;
		}
	}

	// ---- A5. Toasts ----
	let a5Level = $state<Level>('regular');
	let toast = $state<{ id: number } | null>(null);
	let toastEl = $state<HTMLElement>();
	let toaster = $state<SVGSVGElement>();
	let toastStage: HTMLElement;
	let toastId = 0;

	async function showToast(level: Level) {
		a5Level = level;
		const id = ++toastId;
		toast = { id };
		await tick();
		if (!toastEl || !allows.flights()) return;
		if (level === 'regular') toastEl.animate([{ transform: 'translateY(44px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 380, easing: easing('spring-soft') });
		if (level === 'playful') toastEl.animate([{ transform: 'translateY(40px) scale(0.8)', opacity: 0 }, { transform: 'translateY(-10px) scale(1.04)', opacity: 1, offset: 0.55 }, { transform: 'translateY(0) scale(1)' }], { duration: 480, easing: easing('spring-bouncy') });
		if (level === 'crazy') {
			toaster?.animate([{ transform: 'translateY(90px)' }, { transform: 'translateY(0)' }], { duration: 300, easing: easing('spring-soft') });
			toastEl.animate([{ transform: 'translateY(52px) rotate(0) scale(0.7)', opacity: 0 }, { transform: 'translateY(52px) rotate(0) scale(0.7)', opacity: 1, offset: 0.25 }, { transform: 'translateY(-34px) rotate(-14deg) scale(1.05)', offset: 0.6 }, { transform: 'translateY(0) rotate(0) scale(1)' }], { duration: 760, easing: 'ease-out' });
			await wait(500);
			const box = toastEl.getBoundingClientRect();
			burst({ x: box.left + box.width / 2, y: box.top + box.height, count: 7, kind: 'crumb', angle: -90, spread: 90, speed: 220, gravity: 600, life: 0.8, size: 6, colors: ['#e7b36a', '#c88a3a'] });
		}
		await wait(2000);
		if (toastId !== id) return;
		if (level === 'crazy') toaster?.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(90px)' }], { duration: 260, fill: 'forwards' });
		await toastEl?.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(30px)' }], { duration: 240, fill: 'forwards' }).finished.catch(() => {});
		if (toastId === id) toast = null;
	}

	// ---- A6. Loading ----
	let a6Level = $state<Level | null>(null);
</script>

<Demo id="A1" title="Moving between the three places" hint="Tap a tab, or press a strength to go to the next place." onplay={(l) => { a1Level = l; void goTo((tab + 1) % 3, l); }}>
	{#snippet stage()}
		<svg width="0" height="0" style="position:absolute" aria-hidden="true">
			<filter id="goo-a1">
				<feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b" />
				<feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
			</filter>
		</svg>
		<div class="tabs">
			<div class="blobs" style:filter={a1Level === 'crazy' ? 'url(#goo-a1)' : undefined}>
				<span class="pill" bind:this={pill} style:transform="translateX({tab * TAB}px)"></span>
				<span class="pill" bind:this={tail} style:transform="translateX({tab * TAB}px)" style:opacity={a1Level === 'crazy' ? 1 : 0}></span>
			</div>
			{#each NAV as item, i (item.id)}
				<button class:active={tab === i} onclick={() => goTo(i, a1Level)}>
					<span class="icon" bind:this={icons[i]}><item.icon size={22} /></span>
					{item.label}
				</button>
			{/each}
		</div>
	{/snippet}
</Demo>

<Demo id="A2" title="Pressing things" hint="Choose a strength, then press the red button." levels={['regular', 'playful', 'crazy']} onplay={(l) => (a2Level = l)}>
	{#snippet stage()}
		<div class="press" bind:this={a2Stage}>
			<div class="pressable-wrap" class:squash class:regular={a2Level === 'regular'} onpointerdown={press} onpointerup={release} onpointerleave={release} onpointercancel={release} role="presentation">
				<Button>Add to plan</Button>
			</div>
		</div>
	{/snippet}
</Demo>

<Demo id="A3" title="Opening and closing a sheet" tall onplay={(l) => void openSheet(l)}>
	{#snippet stage()}
		<div class="phone">
			<div class="page"><strong>Plan</strong><span class="soft">Friday · Lunch</span></div>
			{#if sheetOpen}
				<div class="backdrop" bind:this={backdrop} role="presentation" onclick={closeSheet}></div>
				<div class="sheet" bind:this={sheetPanel}>
					<div class="grip" bind:this={grip}></div>
					<div class="item head"><strong>Lunch</strong><button class="x" aria-label="Close" onclick={closeSheet}>×</button></div>
					<div class="item field">12:30</div>
					<div class="item field">Everyone</div>
					<div class="item action">Delete this meal</div>
				</div>
			{/if}
		</div>
	{/snippet}
</Demo>

<Demo id="A4" title="The confirm popup" hint="Crazy also makes the meal behind it nervous, and crumples it when you delete." tall onplay={(l) => void askConfirm(l)}>
	{#snippet stage()}
		<div class="phone">
			<div class="page">
				<div class="row-wrap" class:nervous={confirming && a4Level === 'crazy'} class:crumple={crumpling}>
					<MealRow type="lunch" time="12:30" people={200} dishes={[{ id: 'lentil-dal', name: 'Lentil dal' }, { id: 'basmati-rice', name: 'Basmati rice' }]} />
				</div>
			</div>
			{#if confirming}
				<div class="backdrop" role="presentation" onclick={() => (confirming = false)}></div>
				<div class="popup" bind:this={popup}>
					<strong>Delete this meal?</strong>
					<span class="soft">Friday lunch and its 2 dishes will be taken out of the plan.</span>
					<Button onclick={confirmDelete}>Delete</Button>
					<span bind:this={keepButton} class="keep"><Button variant="secondary" onclick={() => (confirming = false)}>Keep</Button></span>
				</div>
			{/if}
		</div>
	{/snippet}
</Demo>

<Demo id="A5" title="Toasts" hint="The toaster is the one mascot-sized joke of the app." tall onplay={(l) => void showToast(l)}>
	{#snippet stage()}
		<div class="toast-stage" bind:this={toastStage}>
			{#if toast}
				{#key toast.id}
					{#if a5Level === 'crazy'}
						<svg class="toaster" bind:this={toaster} width="150" height="74" viewBox="0 0 150 74" aria-hidden="true">
							<rect x="4" y="14" width="142" height="58" rx="22" fill="var(--color-tomato)" />
							<rect x="30" y="8" width="90" height="12" rx="6" fill="var(--color-ink)" />
							<rect x="128" y="34" width="8" height="22" rx="4" fill="var(--color-mustard)" />
						</svg>
					{/if}
					<div class="toast" bind:this={toastEl}>
						{#if a5Level === 'playful'}
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-mustard)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path class="draw" d="M4 12.5l5 5L20 6.5" /></svg>
						{/if}
						Added to Friday lunch
					</div>
				{/key}
			{/if}
		</div>
	{/snippet}
</Demo>

<Demo id="A6" title="Loading" hint="Regular: a quiet skeleton. Playful: the flame in the logo flickers." levels={['regular', 'playful']} onplay={(l) => (a6Level = l)}>
	{#snippet stage({ run })}
		{#key run}
			<div class="loading">
				{#if a6Level === 'playful'}
					<span class="flame"><Flame size={44} /></span>
				{:else}
					<div class="skeleton"><span></span><span></span><span></span></div>
				{/if}
			</div>
		{/key}
	{/snippet}
</Demo>

<style>
	.tabs {
		position: relative;
		display: flex;
		width: calc(3 * 96px);
		padding: 10px 0;
		border-radius: var(--radius-l);
		background: var(--color-paper);
	}
	.blobs {
		position: absolute;
		inset: 10px 0 auto;
		height: 32px;
		pointer-events: none;
	}
	.pill {
		position: absolute;
		left: 18px;
		width: 60px;
		height: 32px;
		border-radius: 16px;
		background: var(--color-mustard);
	}
	.tabs button {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
		width: 96px;
		padding: 0;
		border: 0;
		background: none;
		color: var(--color-ink-soft);
		font-size: var(--text-caption);
		font-weight: var(--weight-medium);
		cursor: pointer;
	}
	.tabs button.active {
		color: var(--color-ink);
		font-weight: var(--weight-heavy);
	}
	.icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 60px;
		height: 32px;
		perspective: 120px;
	}
	.press {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
	}
	.pressable-wrap {
		transition: transform var(--motion-quick) var(--spring-bouncy);
	}
	.pressable-wrap:active.regular {
		transform: scale(0.97);
		transition-duration: var(--motion-instant);
	}
	.pressable-wrap.squash {
		transform: scale(1.07, 0.9);
		transition-duration: var(--motion-instant);
	}
	.phone {
		position: relative;
		width: 280px;
		height: 270px;
		overflow: hidden;
		border-radius: var(--radius-l);
		background: var(--color-paper);
		border: var(--border);
	}
	.page {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-5);
	}
	.backdrop {
		position: absolute;
		inset: 0;
		background: color-mix(in srgb, var(--color-ink) 45%, transparent);
	}
	.sheet {
		position: absolute;
		inset: auto 0 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4) var(--space-4);
		border-radius: var(--radius-l) var(--radius-l) 0 0;
		background: var(--color-paper);
	}
	.grip {
		width: 40px;
		height: 5px;
		margin: 0 auto var(--space-1);
		border-radius: 3px;
		background: var(--color-line);
	}
	.head {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.x {
		width: 28px;
		height: 28px;
		border: var(--border);
		border-radius: 50%;
		background: var(--color-sheet);
		cursor: pointer;
	}
	.field,
	.action {
		padding: 10px var(--space-3);
		border: var(--border);
		border-radius: var(--radius-s);
		background: var(--color-sheet);
		font-size: var(--text-small);
	}
	.action {
		text-align: center;
		font-weight: var(--weight-bold);
	}
	.popup {
		position: absolute;
		left: 28px;
		right: 28px;
		top: 50%;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-top: -105px;
		padding: var(--space-5);
		border-radius: var(--radius-xl);
		background: var(--color-paper);
		font-size: var(--text-small);
	}
	.popup :global(.button) {
		width: 100%;
	}
	.keep {
		display: block;
	}
	.row-wrap {
		padding: 0 var(--space-2);
		border-radius: var(--radius-m);
	}
	.nervous {
		animation: m-shake 0.5s linear infinite;
	}
	.crumple {
		animation: m-crumple 0.9s ease-in forwards;
	}
	.toast-stage {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end;
		padding-bottom: var(--space-4);
	}
	.toaster {
		position: absolute;
		bottom: 0;
	}
	.toast {
		position: relative;
		z-index: 1;
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: 16px;
		padding: 10px var(--space-4);
		border-radius: var(--radius-pill);
		background: var(--color-ink);
		color: var(--color-paper);
		font-size: var(--text-small);
		font-weight: var(--weight-medium);
	}
	.toaster + .toast {
		margin-bottom: 52px;
	}
	.draw {
		stroke-dasharray: 30;
		stroke-dashoffset: 30;
		animation: m-draw 0.4s 0.25s ease-out forwards;
	}
	.loading {
		min-width: 220px;
		display: grid;
		place-items: center;
	}
	.skeleton {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		width: 220px;
		animation: pulse 1.2s ease-in-out 3;
	}
	.skeleton span {
		height: 16px;
		border-radius: 8px;
		background: var(--color-line);
	}
	.skeleton span:nth-child(2) {
		width: 70%;
	}
	.skeleton span:nth-child(3) {
		width: 45%;
	}
	@keyframes pulse {
		50% {
			opacity: 0.45;
		}
	}
	.flame {
		display: inline-flex;
		color: var(--color-tomato);
		transform-origin: 50% 90%;
		animation: flicker 0.9s ease-in-out 4;
	}
	@keyframes flicker {
		0%, 100% { transform: scale(1, 1) rotate(0); }
		20% { transform: scale(0.94, 1.1) rotate(-4deg); }
		45% { transform: scale(1.06, 0.95) rotate(3deg); }
		70% { transform: scale(0.97, 1.07) rotate(-2deg); }
	}
</style>
