<script lang="ts">
	import Coins from '@lucide/svelte/icons/coins';
	import Minus from '@lucide/svelte/icons/minus';
	import Plus from '@lucide/svelte/icons/plus';
	import User from '@lucide/svelte/icons/user';
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';
	import IconButton from '#lib/components/IconButton.svelte';
	import Odometer from '#lib/components/Odometer.svelte';
	import Plate from './Plate.svelte';
	import { formatAmount } from '#lib/format.ts';
	import { easing, wait } from '#lib/motion/easing.ts';
	import { allows } from '#lib/motion/mode.svelte.ts';
	import { burst, shower } from '#lib/motion/particles.ts';
	import { euro } from '#lib/plan/shopping.ts';
	import Demo, { type Level } from './Demo.svelte';

	// ---- B5. The people counter ----
	let people = $state(100);
	let b5Level = $state<Level>('regular');
	let number = $state<HTMLElement>();
	let b5Stage = $state<HTMLElement>();
	let timer: ReturnType<typeof setTimeout> | undefined;

	function change(by: number) {
		const next = Math.max(1, people + by);
		if (next === people) return;
		people = next;
		if (!allows.flights() || !number) return;
		if (b5Level !== 'regular') number.animate([{ transform: 'scale(1)' }, { transform: `scale(${by > 0 ? 1.12 : 0.92})`, offset: 0.35 }, { transform: 'scale(1)' }], { duration: 260, easing: easing('spring-bouncy') });
		if (b5Level === 'crazy' && (next % 50 === 0 || next === 200)) {
			number.animate([{ color: 'var(--color-ink)' }, { color: 'var(--color-mustard)', offset: 0.3 }, { color: 'var(--color-tomato)', offset: 0.6 }, { color: 'var(--color-ink)' }], { duration: 900 });
			const box = number.getBoundingClientRect();
			burst({ x: box.left + box.width / 2, y: box.top + box.height / 2, count: next === 200 ? 90 : 28, speed: next === 200 ? 650 : 420 });
			if (next === 200) {
				shower(2);
				b5Stage?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.03)', offset: 0.2 }, { transform: 'scale(0.99)', offset: 0.5 }, { transform: 'scale(1)' }], { duration: 600, easing: easing('spring-bouncy') });
			}
		}
	}
	function hold(by: number) {
		let delay = 420;
		let held = 0;
		change(by);
		const next = () => {
			held++;
			change(by * (held > 12 ? 5 : 1));
			delay = Math.max(40, delay * 0.82);
			timer = setTimeout(next, delay);
		};
		timer = setTimeout(next, delay);
	}
	const release = () => clearTimeout(timer);
	const crowd = $derived(Math.min(8, Math.max(1, Math.ceil(people / 25))));

	// ---- B6. The cost ----
	let cost = $state(1291);
	let b6Level = $state<Level>('regular');
	const tween = new Tween(1291, { duration: 600, easing: cubicOut });
	let amount = $state<HTMLElement>();
	let coin = $state<HTMLElement>();

	function setCost(next: number) {
		const before = cost;
		cost = next;
		if (!allows.flights()) {
			void tween.set(next, { duration: 0 });
			return;
		}
		void tween.set(next, { duration: b6Level === 'crazy' ? 0 : 600 });
		if (b6Level === 'playful') {
			amount?.animate([{ color: 'var(--color-ink)' }, { color: next > before ? 'var(--color-tomato)' : 'var(--color-leaf)', offset: 0.25 }, { color: 'var(--color-ink)' }], { duration: 900 });
			if (Math.abs(next - before) / before > 0.05) coin?.animate([{ transform: 'rotateY(0) translateY(0)' }, { transform: 'rotateY(720deg) translateY(-8px)', offset: 0.5 }, { transform: 'rotateY(1440deg) translateY(0)' }], { duration: 900, easing: 'ease-in-out' });
		}
	}
	const changeCost = (by: number) => setCost(Math.max(0, cost + by));

	// ---- C4. Portions on a recipe ----
	let portions = $state(40);
	let c4Level = $state<Level>('regular');
	const ingredients = [
		{ name: 'Red lentils', amount: 1.1, unit: 'g' as const },
		{ name: 'Water', amount: 3.2, unit: 'ml' as const },
		{ name: 'Onions', amount: 0.04, unit: 'pcs' as const }
	];
	const lines = $derived(
		ingredients.map((i) => {
			const [value, unit] = formatAmount(i.amount * portions * (i.unit === 'pcs' ? 100 : 100), i.unit).split(' ');
			return { name: i.name, value, unit };
		})
	);
	const c4Plates = $derived(Math.min(10, Math.floor(portions / 25)));
</script>

<Demo id="B5" title="The people counter" hint="Hold the plus to count fast. Crazy celebrates 150, 200 and 250 (200 is the real event)." tall onplay={(l) => { b5Level = l; change(50); if (people > 250) people = 100; }}>
	{#snippet stage()}
		<div class="counter" bind:this={b5Stage}>
			<div class="crowd">
				{#each Array(b5Level === 'playful' || b5Level === 'crazy' ? crowd : 0) as _, i (i)}
					<span in:scale={{ duration: 260, easing: cubicOut, start: 0.2 }} out:scale={{ duration: 140 }}><User size={18} /></span>
				{/each}
			</div>
			<div class="row">
				<span onpointerdown={() => hold(-1)} onpointerup={release} onpointerleave={release} onpointercancel={release} role="presentation"><IconButton icon={Minus} label="Fewer people" size={44} /></span>
				<span class="figure" bind:this={number}><Odometer text={String(people)} /></span>
				<span onpointerdown={() => hold(1)} onpointerup={release} onpointerleave={release} onpointercancel={release} role="presentation"><IconButton icon={Plus} label="More people" size={44} variant="dark" /></span>
			</div>
		</div>
	{/snippet}
</Demo>

<Demo id="B6" title="The cost" hint="Add or take away a dish. Crazy is a slot machine." onplay={(l) => { b6Level = l; changeCost(cost > 1500 ? -400 : 180); }}>
	{#snippet stage()}
		<div class="cost">
			<div class="amount-line">
				<span class="amount" bind:this={amount}>
					{#if b6Level === 'crazy'}<Odometer text={euro(cost)} laps={2} />{:else}{euro(Math.round(tween.current))}{/if}
				</span>
				<span class="coin" bind:this={coin}><Coins size={22} /></span>
			</div>
			<div class="buttons">
				<IconButton icon={Minus} label="Take a dish away" onclick={() => changeCost(-120)} />
				<IconButton icon={Plus} label="Add a dish" variant="dark" onclick={() => changeCost(180)} />
			</div>
		</div>
	{/snippet}
</Demo>

<Demo id="C4" title="Portions on a recipe page" hint="Change the portions. Playful flashes a unit that changes (g to kg). Crazy grows the plate." tall onplay={(l) => { c4Level = l; portions = portions >= 400 ? 40 : portions * 2; }}>
	{#snippet stage()}
		<div class="recipe-page">
			<div class="hero">
				{#if c4Level === 'crazy'}
					<span class="big-plate" style:transform="scale({0.8 + Math.min(portions, 400) / 260})"><Plate seed="lentil-dal" size={64} /></span>
					<span class="mini-plates">{#each Array(c4Plates) as _, i (i)}<span in:scale={{ duration: 300, start: 0.1 }}><Plate seed="lentil-dal" size={20} /></span>{/each}</span>
				{/if}
				<div class="portions">
					<IconButton icon={Minus} label="Fewer portions" size={36} onclick={() => (portions = Math.max(1, portions - 10))} />
					<strong class="portion-number"><Odometer text={String(portions)} /></strong>
					<IconButton icon={Plus} label="More portions" size={36} variant="dark" onclick={() => (portions += 10)} />
				</div>
			</div>
			<ul>
				{#each lines as line (line.name)}
					<li>
						<span>{line.name}</span>
						<span class="amounts">
							<Odometer text={line.value} />
							{#key line.unit}<span class="unit" class:flash={c4Level === 'playful' || c4Level === 'crazy'}>&nbsp;{line.unit}</span>{/key}
						</span>
					</li>
				{/each}
			</ul>
		</div>
	{/snippet}
</Demo>

<style>
	.counter {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
	}
	.crowd {
		display: flex;
		gap: 2px;
		min-height: 22px;
		color: var(--color-ink-soft);
	}
	.row {
		display: flex;
		align-items: center;
		gap: var(--space-5);
	}
	.figure {
		display: inline-flex;
		min-width: 3.1ch;
		justify-content: center;
		font-size: var(--text-counter);
		font-weight: var(--weight-heavy);
	}
	.cost {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
	}
	.amount-line {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		perspective: 200px;
	}
	.amount {
		font-size: var(--text-title-large);
		font-weight: var(--weight-heavy);
		font-variant-numeric: tabular-nums;
	}
	.coin {
		display: inline-flex;
		color: var(--color-mustard);
	}
	.buttons {
		display: flex;
		gap: var(--space-3);
	}
	.recipe-page {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		width: min(300px, 100%);
	}
	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
	}
	.big-plate {
		display: inline-flex;
		transition: transform 500ms var(--spring-bouncy);
	}
	.mini-plates {
		display: flex;
		gap: 3px;
		min-height: 20px;
	}
	.portions {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}
	.portion-number {
		display: inline-flex;
		min-width: 3ch;
		justify-content: center;
		font-size: var(--text-title);
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: flex;
		justify-content: space-between;
		padding: var(--space-2) 0;
		border-bottom: 1px solid var(--color-line);
	}
	.amounts {
		display: inline-flex;
		font-weight: var(--weight-bold);
	}
	.flash {
		display: inline-block;
		animation: unit-flash 0.7s ease-out;
	}
	@keyframes unit-flash {
		0% {
			transform: scale(1.8);
			color: var(--color-tomato);
		}
		100% {
			transform: scale(1);
		}
	}
</style>
