<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { resolve } from '$app/paths';
	import { motion, setMotion, type MotionMode } from '#lib/motion/mode.svelte.ts';
	import FrameDemos from './FrameDemos.svelte';
	import LifeDemos from './LifeDemos.svelte';
	import NumberDemos from './NumberDemos.svelte';
	import PlanDemos from './PlanDemos.svelte';
	import RecipeDemos from './RecipeDemos.svelte';
	import ShareDemos from './ShareDemos.svelte';
	import ShoppingDemos from './ShoppingDemos.svelte';
	import './motion.css';

	// The motion trial page. Every idea of docs/ANIMATIONS.md that can be shown on its own runs here at each of its strengths, so it can be judged on a phone before it goes into the real screens.
	const modes: { id: MotionMode; label: string }[] = [
		{ id: 'full', label: 'Full' },
		{ id: 'calm', label: 'Calm' },
		{ id: 'off', label: 'Off' }
	];

</script>

<svelte:head><title>Motion · Hell's Kitchen</title></svelte:head>

<main>
	<header>
		<a class="back" href={resolve('/styleguide')}><ArrowLeft size={18} /> Style sheet</a>
		<h1>Motion</h1>
		<p class="soft">Press a strength to see it. The ids are those of <code>docs/ANIMATIONS.md</code>. The strengths the app uses are marked under each title (set in <code>src/lib/motion/choices.ts</code>); the others are kept here as a reference.</p>
		<div class="modes" role="group" aria-label="How much the page moves">
			{#each modes as mode (mode.id)}
				<button class:on={motion.mode === mode.id} onclick={() => setMotion(mode.id)}>{mode.label}</button>
			{/each}
		</div>
		<p class="soft small">Calm leaves out everything Crazy and all particles. Off stops all of it. This is the setting the event settings will get.</p>
	</header>

	<section>
		<h2>A. The frame</h2>
		<FrameDemos />
	</section>

	<section>
		<h2>B. Plan</h2>
		<PlanDemos />
	</section>

	<section>
		<h2>Numbers</h2>
		<NumberDemos />
	</section>

	<section>
		<h2>D. Shopping</h2>
		<ShoppingDemos />
	</section>

	<section>
		<h2>E. Sharing and printing</h2>
		<ShareDemos />
	</section>

	<section>
		<h2>C. Recipes</h2>
		<RecipeDemos />
	</section>

	<section>
		<h2>F, G, H. Plans, illustration and easter eggs</h2>
		<LifeDemos />
		<p class="soft small">Not here, because they cannot be judged on a page: sound (H4), shake to stir (H3), the day of the event (H6), and the real things that need the real screens (the toasts of the app, view transitions between pages).</p>
	</section>
</main>

<style>
	main {
		max-width: 720px;
		margin: 0 auto;
		padding: var(--space-8) var(--space-5) var(--space-9);
		display: flex;
		flex-direction: column;
		gap: var(--space-7);
	}
	header {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}
	header p {
		margin: 0;
	}
	.small {
		font-size: var(--text-small);
	}
	.back {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		align-self: flex-start;
		font-weight: var(--weight-bold);
	}
	.modes {
		display: flex;
		gap: var(--space-2);
	}
	.modes button {
		height: 38px;
		padding: 0 var(--space-5);
		border: var(--border);
		border-radius: var(--radius-pill);
		background: var(--color-sheet);
		font-weight: var(--weight-medium);
		cursor: pointer;
	}
	.modes .on {
		background: var(--color-tomato);
		border-color: var(--color-tomato);
		color: var(--color-on-tomato);
	}
	h2 {
		margin: 0 0 var(--space-2);
		font-size: var(--text-heading);
		font-weight: var(--weight-heavy);
	}
	code {
		font-size: 0.9em;
	}
</style>
