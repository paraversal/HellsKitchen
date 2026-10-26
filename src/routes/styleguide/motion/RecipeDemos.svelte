<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { flip } from 'svelte/animate';
	import { tick } from 'svelte';
	import Chip from '#lib/components/Chip.svelte';
	import IconButton from '#lib/components/IconButton.svelte';
	import Plate from './Plate.svelte';
	import { easing } from '#lib/motion/easing.ts';
	import { fly } from '#lib/motion/fly.ts';
	import { allows } from '#lib/motion/mode.svelte.ts';
	import Demo, { type Level } from './Demo.svelte';

	const recipes = [
		{ id: 'alc-free-punsch', name: 'Alc free punsch', kind: 'Drink' },
		{ id: 'apple-crumble', name: 'Apple crumble', kind: 'Brunch' },
		{ id: 'baba-ganoush', name: 'Baba ganoush', kind: 'Brunch' },
		{ id: 'beanballs', name: 'Beanballs', kind: 'Main' },
		{ id: 'chilli', name: 'Chilli con sweetpotato', kind: 'Main' },
		{ id: 'coffee', name: 'Coffee', kind: 'Drink' },
		{ id: 'couscous', name: 'Couscous salad', kind: 'Brunch' },
		{ id: 'curry', name: 'Curried lentil soup', kind: 'Main' },
		{ id: 'fried-potatos', name: 'Fried potatoes', kind: 'Main' },
		{ id: 'fruit', name: 'Fruits for everyone', kind: 'Brunch' }
	];

	// ---- C1. The list ----
	let c1Level = $state<Level>('regular');
	let filter = $state<'All' | 'Main' | 'Brunch'>('All');
	let c1Key = $state(0);
	let tilt = $state(0);
	let listEl = $state<HTMLElement>();
	let lastTop = 0;
	let tiltFrame = 0;
	const shown = $derived(recipes.filter((r) => filter === 'All' || r.kind === filter));
	const hasLetter = (i: number) => i === 0 || shown[i].name[0] !== shown[i - 1].name[0];

	function scrolled() {
		if (c1Level !== 'crazy' || !listEl) return;
		const delta = listEl.scrollTop - lastTop;
		lastTop = listEl.scrollTop;
		tilt = Math.max(-28, Math.min(28, tilt + delta * 0.9));
		cancelAnimationFrame(tiltFrame);
		const settle = () => {
			tilt *= 0.9;
			if (Math.abs(tilt) < 0.5) tilt = 0;
			else tiltFrame = requestAnimationFrame(settle);
		};
		tiltFrame = requestAnimationFrame(settle);
	}
	function wobble(event: PointerEvent) {
		if (c1Level === 'regular') return;
		(event.currentTarget as HTMLElement).querySelector('.plate-box')?.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-14deg)' }, { transform: 'rotate(10deg)' }, { transform: 'rotate(-5deg)' }, { transform: 'rotate(0)' }], { duration: 480 });
	}

	// ---- C3. Opening a recipe ----
	let opened = $state(false);
	let c3Level = $state<Level>('regular');
	let c3Plate = $state<HTMLElement>();
	let hero = $state<HTMLElement>();
	let detail = $state<HTMLElement>();
	const lines = ['Red lentils', 'Coconut cream', 'Tinned tomatoes', 'Ginger', 'Onions'];

	type Transition = { ready: Promise<void>; updateCallbackDone: Promise<void>; finished: Promise<void> };
	/** A view transition that does not complain when the browser skips it (for example when another one starts). */
	async function transition(change: () => Promise<void>) {
		const t = (document as Document & { startViewTransition: (cb: () => Promise<void>) => Transition }).startViewTransition(change);
		t.ready.catch(() => {});
		t.updateCallbackDone.catch(() => {});
		await t.finished.catch(() => {});
	}

	async function openRecipe(level: Level = c3Level) {
		c3Level = level;
		const change = async () => {
			opened = true;
			await tick();
		};
		if (level === 'playful' && 'startViewTransition' in document && allows.flights()) {
			await transition(change);
		} else if (level === 'crazy' && allows.flights() && c3Plate) {
			const from = c3Plate.querySelector('svg');
			await change();
			if (from && hero) void fly(from, hero, { arc: 70, spin: 360, duration: 600, shrink: 1.4 });
			detail?.animate([{ clipPath: 'circle(0px at 50% 26%)' }, { clipPath: 'circle(170% at 50% 26%)' }], { duration: 800, delay: 350, easing: 'cubic-bezier(0.3, 0.6, 0.3, 1)', fill: 'backwards' });
			detail?.querySelectorAll('li').forEach((li, i) => li.animate([{ transform: 'translateY(-40px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 520, delay: 800 + i * 90, easing: easing('spring-bouncy'), fill: 'backwards' }));
		} else {
			await change();
			if (allows.flights()) detail?.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 240, easing: easing('ease-out') });
		}
	}
	async function closeRecipe() {
		if (c3Level === 'playful' && 'startViewTransition' in document && allows.flights()) {
			await transition(async () => {
				opened = false;
				await tick();
			});
		} else opened = false;
	}
	function playC3(level: Level) {
		c3Level = level;
		if (opened) void closeRecipe();
		else void openRecipe(level);
	}

	// ---- C5. The ingredients ----
	let c5Level = $state<Level>('regular');
	let c5Key = $state(0);
</script>

<Demo id="C1" title="The recipe list" hint="Use the chips, scroll, press a plate. Playful wobbles plates on press; Crazy tilts them as you scroll." tall onplay={(l) => { c1Level = l; c1Key++; }}>
	{#snippet stage()}
		<div class="listbox">
			<div class="chips">
				{#each ['All', 'Main', 'Brunch'] as const as name (name)}
					<Chip active={filter === name} onclick={() => (filter = name)}>{name}</Chip>
				{/each}
			</div>
			{#key c1Key}
				<div class="list" bind:this={listEl} onscroll={scrolled}>
					{#each shown as recipe, i (recipe.id)}
						<div animate:flip={{ duration: allows.flights() ? 300 : 0 }}>
							{#if hasLetter(i)}<div class="letter" class:pop={c1Level !== 'regular'}>{recipe.name[0]}</div>{/if}
							<div class="row" class:enter={true} style:animation-delay="{Math.min(i, 11) * 45}ms" onpointerdown={wobble} role="presentation">
								<span class="plate-box" style:transform={c1Level === 'crazy' ? `rotate(${tilt}deg)` : undefined}><Plate seed={recipe.id} size={40} /></span>
								<span class="rname"><strong>{recipe.name}</strong><span class="soft">{recipe.kind}</span></span>
							</div>
						</div>
					{/each}
				</div>
			{/key}
		</div>
	{/snippet}
</Demo>

<Demo id="C3" title="Opening a recipe" hint="Press a strength to open (and again to close). Playful grows the plate; Crazy unrolls the page from it." tall onplay={playC3}>
	{#snippet stage()}
		<div class="phone">
			{#if !opened}
				<div class="open-row" role="presentation">
					<button class="open-button" onclick={() => openRecipe()}>
						<span class="plate-box big" bind:this={c3Plate} style:view-transition-name="plate"><Plate seed="curry" size={52} /></span>
						<span class="rname"><strong>Curried lentil soup</strong><span class="soft">Main · 13 ingredients</span></span>
					</button>
				</div>
			{:else}
				<div class="detail" bind:this={detail}>
					<IconButton icon={ArrowLeft} label="Back" size={34} onclick={closeRecipe} />
					<span class="hero" bind:this={hero} style:view-transition-name="plate"><Plate seed="curry" size={96} /></span>
					<strong>Curried lentil soup</strong>
					<ul>{#each lines as line (line)}<li>{line}</li>{/each}</ul>
				</div>
			{/if}
		</div>
	{/snippet}
</Demo>

<Demo id="C5" title="Ingredients on first view" levels={['regular', 'playful']} onplay={(l) => { c5Level = l; c5Key++; }}>
	{#snippet stage()}
		{#key c5Key}
			<ul class="ingredients">
				{#each lines as line, i (line)}
					<li class="drop {c5Level}" style:animation-delay="{i * 40}ms">{line}</li>
				{/each}
			</ul>
		{/key}
	{/snippet}
</Demo>

<style>
	.listbox {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		width: min(320px, 100%);
	}
	.chips {
		display: flex;
		gap: var(--space-2);
	}
	.list {
		height: 250px;
		overflow-y: auto;
		border-radius: var(--radius-m);
		background: var(--color-paper);
		padding: 0 var(--space-3);
	}
	.letter {
		position: sticky;
		top: 0;
		z-index: 1;
		padding: 6px 0 2px;
		background: var(--color-paper);
		color: var(--color-tomato);
		font-size: var(--text-heading);
		font-weight: var(--weight-heavy);
	}
	.row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: 8px 0;
		animation: m-fade-rise 0.3s ease-out backwards;
	}
	.plate-box {
		display: inline-flex;
		flex: none;
		transition: transform 120ms linear;
	}
	.rname {
		display: flex;
		flex-direction: column;
		font-size: var(--text-small);
	}
	.phone {
		position: relative;
		width: 280px;
		height: 300px;
		overflow: hidden;
		border-radius: var(--radius-l);
		background: var(--color-paper);
		border: var(--border);
	}
	.open-row {
		padding: var(--space-4);
	}
	.open-button {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		padding: var(--space-2);
		border: 0;
		border-radius: var(--radius-m);
		background: var(--color-sheet);
		font: inherit;
		text-align: left;
		cursor: pointer;
	}
	.detail {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		height: 100%;
		padding: var(--space-3);
		background: var(--color-paper);
	}
	.detail :global(.icon-button) {
		align-self: flex-start;
	}
	.hero {
		display: inline-flex;
	}
	.detail ul,
	.ingredients {
		width: 100%;
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: var(--text-small);
	}
	.detail li,
	.ingredients li {
		padding: 7px 0;
		border-bottom: 1px solid var(--color-line);
	}
	.ingredients {
		width: min(260px, 100%);
	}
	.drop {
		animation: m-fade-rise 0.3s ease-out backwards;
	}
	.drop.playful {
		animation: drop-in 0.55s var(--spring-bouncy) backwards;
	}
	@keyframes drop-in {
		from {
			opacity: 0;
			transform: translateY(-22px);
		}
	}
</style>
