<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';
	import { flip } from 'svelte/animate';
	import { tick } from 'svelte';
	import DayLabel from '#lib/components/DayLabel.svelte';
	import IconButton from '#lib/components/IconButton.svelte';
	import { MEAL_TYPES, type MealType } from '#lib/components/meal-types.ts';
	import Plate from '#lib/components/Plate.svelte';
	import { easing, wait } from '#lib/motion/easing.ts';
	import { allows } from '#lib/motion/mode.svelte.ts';
	import { fly } from '#lib/motion/fly.ts';
	import { burst, ring } from '#lib/motion/particles.ts';
	import { NAV } from '#lib/nav.ts';
	import Demo, { type Level } from './Demo.svelte';

	// ---- B1. Adding a day ----
	let b1Level = $state<Level>('regular');
	let b1Key = $state(0);
	let dayBox = $state<HTMLElement>();
	let strip = $state<HTMLElement>();
	let roll = $state<HTMLElement>();

	async function addDay(level: Level) {
		b1Level = level;
		b1Key++;
		await tick();
		if (!allows.flights()) return;
		if (level === 'regular') dayBox?.animate([{ maxHeight: '0px', opacity: 0 }, { maxHeight: '80px', opacity: 1 }], { duration: 300, easing: easing('ease-out') });
		if (level === 'playful') dayBox?.animate([{ transform: 'scale(1.7) rotate(-12deg)', opacity: 0 }, { transform: 'scale(0.95) rotate(1deg)', opacity: 1, offset: 0.5 }, { transform: 'scale(1) rotate(0)' }], { duration: 640, easing: easing('spring-bouncy') });
		if (level === 'crazy' && strip && roll) {
			const width = strip.offsetWidth;
			strip.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 750, easing: 'cubic-bezier(0.3, 0.6, 0.3, 1)', fill: 'backwards' });
			roll.animate([{ transform: 'translateX(0) rotate(0)' }, { transform: `translateX(${width}px) rotate(720deg)` }], { duration: 750, easing: 'cubic-bezier(0.3, 0.6, 0.3, 1)', fill: 'both' });
			await wait(760);
			roll.animate([{ opacity: 1 }, { opacity: 0, transform: `translate(${width + 24}px, 16px) rotate(900deg)` }], { duration: 300, fill: 'forwards' });
			strip.animate([{ transform: 'rotate(-1.5deg)' }, { transform: 'rotate(1.5deg)' }, { transform: 'rotate(-1.5deg)' }], { duration: 350, easing: 'ease-out' });
		}
	}

	// ---- B2. Adding a meal ----
	const kinds: MealType[] = ['breakfast', 'lunch', 'coffee', 'dinner', 'snack'];
	const bubbles: HTMLElement[] = [];
	const cells: HTMLElement[] = [];
	let b2Level = $state<Level>('regular');

	async function scene(i: number, level: Level) {
		const bubble = bubbles[i];
		const kind = kinds[i];
		if (!bubble || !allows.flights()) return;
		if (level === 'regular') bubble.animate([{ transform: 'scale(0.5)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 260, easing: easing('ease-out') });
		else if (level === 'playful') {
			const extras = bubble.parentElement?.querySelectorAll<HTMLElement>('.extra') ?? [];
			const jiggle = (angles: number[], duration = 560) => bubble.animate(angles.map((a, k) => ({ transform: `rotate(${a}deg)`, offset: k / (angles.length - 1) })), { duration, easing: 'ease-out' });
			if (kind === 'breakfast') {
				jiggle([0, -8, 8, -4, 0]);
				extras.forEach((el, k) => el.animate([{ opacity: 0, transform: 'translateY(6px) scaleY(0.4)' }, { opacity: 0.9, offset: 0.3 }, { opacity: 0, transform: 'translateY(-18px) scaleY(1.2)' }], { duration: 1100, delay: k * 220, easing: 'ease-out' }));
			}
			if (kind === 'lunch') {
				bubble.animate([{ transform: 'rotate(0) scale(1)' }, { transform: 'rotate(360deg) scale(1.18)', offset: 0.7 }, { transform: 'rotate(360deg) scale(1)' }], { duration: 700, easing: easing('spring-soft') });
				extras.forEach((el) => el.animate([{ opacity: 0.8, transform: 'scale(0.9)' }, { opacity: 0, transform: 'scale(1.7)' }], { duration: 700, delay: 120, easing: 'ease-out' }));
			}
			if (kind === 'coffee') {
				jiggle([0, -10, 10, -5, 0], 480);
				extras.forEach((el, k) => el.animate([{ opacity: 0, transform: 'translate(0, 0)' }, { opacity: 1, offset: 0.15 }, { opacity: 0, transform: `translate(${k ? 10 : -10}px, 30px) rotate(90deg)` }], { duration: 800, delay: 100 + k * 160, easing: 'ease-in' }));
			}
			if (kind === 'dinner') {
				jiggle([0, 14, -14, 9, -6, 0], 800);
				extras.forEach((el, k) => el.animate([{ opacity: 0, transform: 'scale(0) rotate(0)' }, { opacity: 1, transform: 'scale(1.2) rotate(45deg)', offset: 0.4 }, { opacity: 0, transform: 'scale(0) rotate(90deg)' }], { duration: 800, delay: 200 + k * 200 }));
			}
			if (kind === 'snack') jiggle([0, -16, 12, -9, 5, 0], 520);
		} else {
			const cell = cells[i];
			cells.forEach((c, k) => k !== i && c.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${k < i ? -7 : 7}px)`, offset: 0.55 }, { transform: 'translateX(0)' }], { duration: 640, delay: 320, easing: easing('spring-soft') }));
			bubble.animate([{ transform: 'translateY(-120px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1, offset: 0.34 }, { transform: 'translateY(-30px)', offset: 0.54 }, { transform: 'translateY(0)', offset: 0.72 }, { transform: 'translateY(-9px)', offset: 0.86 }, { transform: 'translateY(0)' }], { duration: 900, easing: 'ease-out' });
			await wait(310);
			const box = bubble.getBoundingClientRect();
			ring(box.left + box.width / 2, box.top + box.height - 4);
			void cell;
		}
	}
	function playMeals(level: Level) {
		b2Level = level;
		kinds.forEach((_, i) => setTimeout(() => void scene(i, level), i * 220));
	}

	// ---- B3. Adding a dish ----
	let b3Level = $state<Level>('regular');
	let added = $state(false);
	let checking = $state(false);
	let badge = $state(0);
	let b3Plate = $state<HTMLElement>();
	let b3Slot = $state<HTMLElement>();
	let b3Tab = $state<HTMLElement>();
	let b3Line = $state<HTMLElement>();
	let b3Busy = false;

	async function addDish(level: Level = b3Level) {
		if (b3Busy) return;
		b3Busy = true;
		b3Level = level;
		added = false;
		checking = false;
		badge = 0;
		await tick();
		const plate = b3Plate?.querySelector('svg');
		if (level === 'regular') {
			checking = true;
			added = true;
			await tick();
			b3Line?.animate([{ maxHeight: '0px', opacity: 0 }, { maxHeight: '40px', opacity: 1 }], { duration: 260, easing: easing('ease-out') });
			await wait(900);
		} else if (level === 'playful' && plate && b3Tab) {
			await fly(plate, b3Tab, { arc: 120, duration: 640, shrink: 0.4 });
			badge = 1;
			added = true;
			b3Tab.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-9px)', offset: 0.4 }, { transform: 'translateY(0)' }], { duration: 480, easing: easing('spring-bouncy') });
			await wait(900);
		} else if (level === 'crazy' && plate && b3Slot) {
			await fly(plate, b3Slot, {
				arc: 150,
				spin: 540,
				duration: 800,
				shrink: 0.5,
				trail: (x, y) => burst({ x, y, count: 3, kind: 'crumb', spread: 360, speed: 90, gravity: 300, life: 0.5, size: 5, colors: ['#f2b632', '#fff6e0'] })
			});
			const box = b3Slot.getBoundingClientRect();
			ring(box.left + box.width / 2, box.top + box.height / 2);
			added = true;
			await tick();
			b3Line?.animate([{ transform: 'scale(1.25)', opacity: 0.4 }, { transform: 'scale(1)', opacity: 1 }], { duration: 420, easing: easing('spring-bouncy') });
			await wait(900);
		}
		added = false;
		checking = false;
		badge = 0;
		b3Busy = false;
	}

	// ---- B4. Removing ----
	type Row = { id: number; kind: MealType; time: string };
	const start: Row[] = [
		{ id: 1, kind: 'breakfast', time: '08:30' },
		{ id: 2, kind: 'lunch', time: '12:30' },
		{ id: 3, kind: 'dinner', time: '19:00' }
	];
	let rows = $state<Row[]>(start.map((r) => ({ ...r })));
	let b4Level = $state<Level>('regular');
	const rowEls: Record<number, HTMLElement> = {};
	let leaving = $state<number | null>(null);

	async function removeRow(id: number, level: Level = b4Level) {
		const el = rowEls[id];
		if (!el || leaving !== null) return;
		leaving = id;
		if (allows.flights()) {
			if (level === 'regular') await el.animate([{ opacity: 1, transform: 'scaleY(1)' }, { opacity: 0, transform: 'scaleY(0.2)' }], { duration: 240, easing: easing('ease-in'), fill: 'forwards' }).finished.catch(() => {});
			if (level === 'playful') await el.animate([{ transform: 'translateX(0) scale(1)', opacity: 1, transformOrigin: '100% 50%' }, { transform: 'translateX(0) scale(0.1)', opacity: 0, transformOrigin: '100% 50%' }], { duration: 380, easing: 'cubic-bezier(0.6, -0.3, 0.8, 0.5)', fill: 'forwards' }).finished.catch(() => {});
			if (level === 'crazy') {
				const box = el.getBoundingClientRect();
				el.classList.add('thrown');
				await wait(380);
				burst({ x: box.left + box.width / 2, y: box.top + box.height / 2, count: 22, kind: 'crumb', spread: 360, speed: 260, gravity: 200, life: 0.7, size: 8, colors: ['#fff6e0', '#efe4cc'] });
				await wait(520);
			}
		}
		rows = rows.filter((r) => r.id !== id);
		leaving = null;
	}
	function playRemove(level: Level) {
		b4Level = level;
		if (!rows.length) rows = start.map((r) => ({ ...r }));
		else void removeRow(rows[Math.min(1, rows.length - 1)].id, level);
	}
</script>

<Demo id="B1" title="Adding a day" onplay={(l) => void addDay(l)}>
	{#snippet stage()}
		{#key b1Key}
			<div class="day-box" bind:this={dayBox}>
				{#if b1Level === 'crazy' && b1Key > 0}
					<div class="roll-line">
						<span class="roll" bind:this={roll}></span>
						<span class="strip" bind:this={strip}>Saturday</span>
						<span class="soft">Jul 13</span>
					</div>
				{:else}
					<DayLabel name="Saturday" date="Jul 13" />
				{/if}
			</div>
		{/key}
	{/snippet}
</Demo>

<Demo id="B2" title="Adding a meal" hint="Press a strength: all five kinds play, one after the other." onplay={playMeals}>
	{#snippet stage()}
		<div class="kinds">
			{#each kinds as kind, i (kind)}
				{@const meal = MEAL_TYPES[kind]}
				<div class="kind" bind:this={cells[i]}>
					<span class="bubble-wrap">
						<span class="bubble" bind:this={bubbles[i]} style:background="var(--color-{meal.tint})" style:color="var(--color-{meal.color})"><meal.icon size={24} /></span>
						{#if kind === 'breakfast'}<span class="extra steam s1"></span><span class="extra steam s2"></span>{/if}
						{#if kind === 'lunch'}<span class="extra halo"></span>{/if}
						{#if kind === 'coffee'}<span class="extra crumb c1"></span><span class="extra crumb c2"></span>{/if}
						{#if kind === 'dinner'}<span class="extra star t1"></span><span class="extra star t2"></span>{/if}
					</span>
					<span class="kind-name">{meal.short}</span>
				</div>
			{/each}
		</div>
	{/snippet}
</Demo>

<Demo id="B3" title="Adding a dish" hint="Regular: the plus turns into a check. Playful: the plate flies to the Plan tab. Crazy: it flies into the meal." tall onplay={(l) => void addDish(l)}>
	{#snippet stage()}
		<div class="flight">
			<div class="meal-box">
				<strong>Lunch</strong>
				<div class="slot" bind:this={b3Slot}>
					{#if added && b3Level !== 'playful'}
						<span class="line" bind:this={b3Line}><Plate seed="lentil-dal" size={22} /> Lentil dal</span>
					{:else}
						<span class="empty">&nbsp;</span>
					{/if}
				</div>
			</div>
			<div class="recipe">
				<span bind:this={b3Plate}><Plate seed="lentil-dal" size={48} /></span>
				<span class="recipe-name"><strong>Lentil dal</strong><span class="soft">Main · 9 ingredients</span></span>
				<IconButton icon={checking ? Check : Plus} label="Add Lentil dal to the plan" size={34} onclick={() => addDish(b3Level)} />
			</div>
			<div class="mini-tabs">
				{#each NAV as item, i (item.id)}
					{#if i === 0}
						<span class="mini-tab here"><span class="mini-icon" bind:this={b3Tab}><item.icon size={20} />{#if badge}<b class="badge">{badge}</b>{/if}</span></span>
					{:else}
						<span class="mini-tab"><span class="mini-icon"><item.icon size={20} /></span></span>
					{/if}
				{/each}
			</div>
		</div>
	{/snippet}
</Demo>

<Demo id="B4" title="Removing a meal" hint="Press a strength to remove the middle meal, or the cross on any row. Press again to bring them back." tall onplay={playRemove}>
	{#snippet stage()}
		<div class="list">
			{#each rows as row (row.id)}
				{@const meal = MEAL_TYPES[row.kind]}
				<div class="list-row-outer" animate:flip={{ duration: allows.flights() ? 320 : 0 }}>
					<div class="list-row" bind:this={rowEls[row.id]}>
						<span class="bubble small" style:background="var(--color-{meal.tint})" style:color="var(--color-{meal.color})"><meal.icon size={18} /></span>
						<strong>{meal.label}</strong>
						<span class="soft">{row.time}</span>
						<span class="push"></span>
						<IconButton icon={X} label="Remove {meal.label}" size={32} onclick={() => removeRow(row.id)} />
					</div>
				</div>
			{:else}
				<span class="soft">All gone. Press a strength to bring them back.</span>
			{/each}
		</div>
	{/snippet}
</Demo>

<style>
	.day-box {
		overflow: hidden;
		padding: var(--space-2) var(--space-3);
	}
	.roll-line {
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: 3px 0;
	}
	.strip {
		padding: 3px var(--space-3);
		border-radius: var(--radius-s);
		background: var(--color-mustard);
		font-size: var(--text-heading);
		font-weight: var(--weight-heavy);
		line-height: 1.3;
		transform: rotate(-1.5deg);
	}
	.roll {
		position: absolute;
		left: 0;
		top: 50%;
		width: 26px;
		height: 26px;
		margin: -13px 0 0 -4px;
		border-radius: 50%;
		border: 7px solid var(--color-mustard);
		background: var(--color-paper);
		box-shadow: inset 0 0 0 2px var(--color-line);
	}
	.kinds {
		display: flex;
		gap: var(--space-3);
		flex-wrap: wrap;
		justify-content: center;
	}
	.kind {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		width: 56px;
	}
	.kind-name {
		font-size: var(--text-caption);
		font-weight: var(--weight-medium);
	}
	.bubble-wrap {
		position: relative;
		display: inline-flex;
	}
	.bubble {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		border-radius: 50%;
	}
	.bubble.small {
		width: 32px;
		height: 32px;
	}
	.extra {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}
	.steam {
		top: -6px;
		width: 4px;
		height: 14px;
		border-radius: 3px;
		background: var(--color-ink-soft);
	}
	.s1 {
		left: 16px;
	}
	.s2 {
		left: 28px;
	}
	.halo {
		inset: -4px;
		border-radius: 50%;
		border: 3px solid var(--color-mustard);
	}
	.crumb {
		top: 30px;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--color-ink-soft);
	}
	.c1 {
		left: 14px;
	}
	.c2 {
		left: 28px;
	}
	.star {
		width: 10px;
		height: 10px;
		background: var(--color-mustard);
		clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%);
	}
	.t1 {
		top: -2px;
		right: -2px;
	}
	.t2 {
		top: 8px;
		left: -4px;
		width: 7px;
		height: 7px;
	}
	.flight {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		width: min(300px, 100%);
	}
	.meal-box {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-3);
		border-radius: var(--radius-m);
		background: var(--color-paper);
	}
	.slot {
		min-height: 30px;
		border-radius: var(--radius-s);
		border: 1.5px dashed var(--color-line);
		padding: 4px var(--space-2);
	}
	.line {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		overflow: hidden;
		font-size: var(--text-compact);
	}
	.empty {
		display: block;
		height: 22px;
	}
	.recipe {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}
	.recipe-name {
		display: flex;
		flex-direction: column;
		flex: 1;
		font-size: var(--text-small);
	}
	.mini-tabs {
		display: flex;
		justify-content: space-around;
		padding: 10px 0;
		border-radius: var(--radius-m);
		background: var(--color-paper);
		color: var(--color-ink-soft);
	}
	.mini-tab.here {
		color: var(--color-ink);
	}
	.mini-icon {
		position: relative;
		display: inline-flex;
		align-items: center;
	}
	.badge {
		position: absolute;
		top: -8px;
		right: -12px;
		display: grid;
		place-items: center;
		min-width: 16px;
		height: 16px;
		border-radius: 8px;
		background: var(--color-mustard);
		color: var(--color-ink);
		font-size: 10px;
		animation: m-pop 0.3s var(--spring-bouncy);
	}
	.list {
		display: flex;
		flex-direction: column;
		width: min(300px, 100%);
	}
	.list-row-outer {
		padding: 4px 0;
	}
	.list-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-m);
		background: var(--color-paper);
	}
	.push {
		flex: 1;
	}
	.list-row:global(.thrown) {
		animation: m-crumple 0.9s ease-in forwards;
	}
</style>
