<script module lang="ts">
	export type Level = 'regular' | 'playful' | 'crazy';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { CHOICES, DROPPED, type ChoiceId } from '#lib/motion/choices.ts';
	import { motion } from '#lib/motion/mode.svelte.ts';

	// One idea of docs/ANIMATIONS.md, with a button for each strength it comes in. A button plays that strength on the stage.
	// `onplay` is told which strength was chosen, so the stage can play it.
	type Props = { id: string; title: string; hint?: string; levels?: Level[]; stage: Snippet<[{ level: Level | null; run: number }]>; tall?: boolean; onplay?: (level: Level) => void };
	let { id, title, hint, levels = ['regular', 'playful', 'crazy'], stage, tall = false, onplay }: Props = $props();

	const choice = $derived(id in CHOICES ? CHOICES[id as ChoiceId] : undefined);
	const dropped = $derived((DROPPED as readonly string[]).includes(id));
	let level = $state<Level | null>(null);
	let run = $state(0);
	const names: Record<Level, string> = { regular: 'Regular', playful: 'Playful', crazy: 'Crazy' };
	const allowed = (l: Level) => levels.includes(l) && motion.mode !== 'off' && !(motion.mode === 'calm' && l === 'crazy');
	function play(l: Level) {
		level = l;
		run++;
		onplay?.(l);
	}
</script>

<section class="demo">
	<header>
		<span class="id">{id}</span>
		<h3>{title}</h3>
	</header>
	{#if choice}
		<p class="chosen">In the app: <strong>{names[choice[0]]}</strong> without fun, <strong>{names[choice[1]]}</strong> with fun.</p>
	{:else if dropped}
		<p class="chosen">Dropped for now. Kept here as a reference.</p>
	{:else}
		<p class="chosen">Not in the app (yet).</p>
	{/if}
	{#if hint}<p class="hint">{hint}</p>{/if}
	<div class="levels" role="group" aria-label="Strength">
		{#each ['regular', 'playful', 'crazy'] as const as l (l)}
			<button class:on={level === l} disabled={!allowed(l)} onclick={() => play(l)}>{levels.includes(l) ? names[l] : '—'}</button>
		{/each}
	</div>
	<div class="stage" class:tall>{@render stage({ level, run })}</div>
</section>

<style>
	.demo {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-5) 0;
		border-top: var(--border);
	}
	header {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
	}
	.id {
		color: var(--color-tomato);
		font-size: var(--text-small);
		font-weight: var(--weight-heavy);
	}
	h3 {
		margin: 0;
		font-size: var(--text-strong);
		font-weight: var(--weight-heavy);
	}
	.chosen {
		margin: 0;
		color: var(--color-leaf);
		font-size: var(--text-small);
	}
	.hint {
		margin: 0;
		color: var(--color-ink-soft);
		font-size: var(--text-small);
	}
	.levels {
		display: flex;
		gap: var(--space-2);
	}
	.levels button {
		height: 36px;
		padding: 0 var(--space-4);
		border: var(--border);
		border-radius: var(--radius-pill);
		background: var(--color-sheet);
		font-size: var(--text-small);
		font-weight: var(--weight-medium);
		cursor: pointer;
	}
	.levels button.on {
		background: var(--color-ink);
		border-color: var(--color-ink);
		color: var(--color-paper);
	}
	.levels button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.stage {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 150px;
		padding: var(--space-4);
		overflow: hidden;
		border-radius: var(--radius-l);
		background: var(--color-sheet);
		border: var(--border);
	}
	.tall {
		min-height: 300px;
	}
</style>
