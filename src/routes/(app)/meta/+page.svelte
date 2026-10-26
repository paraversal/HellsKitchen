<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { version } from '$app/env';
	import { resolve } from '$app/paths';
	import Switch from '#lib/components/Switch.svelte';
	import { appData } from '#lib/app-data.ts';
	import { RULES_VERSION } from '#lib/kitchen-engine/config.ts';
	import { fun, setFun } from '#lib/motion/fun.svelte.ts';
	import { motion } from '#lib/motion/mode.svelte.ts';
	import { planStore } from '#lib/plan/browser.ts';

	// The place for everything about the app itself: how it is set, how healthy its data is, and what it is made of.
	const health = appData.health;
	const plans = $derived(planStore.library ? Object.keys(planStore.library.plans).length : undefined);
	const count = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
</script>

<div class="screen">
	<h1>Meta</h1>

	<section>
		<h2>Settings</h2>
		<div class="row"><Switch bind:checked={() => fun.on, setFun}>Fun: playful animations and little surprises</Switch></div>
		{#if motion.mode !== 'full'}
			<p class="soft note">Your device asks for less motion, so the app keeps it calm whatever this says.</p>
		{/if}
	</section>

	{#if health}
		<section>
			<h2>The data</h2>
			<p class="soft note">What the recipes and ingredients of this version are made of, and what is still waiting for a look. It comes from the files in <code>data/</code>.</p>
			<div class="figures">
				<div><strong>{health.recipes.inApp}</strong><span>recipes in the app</span></div>
				<div><strong>{health.recipes.needsReview.length}</strong><span>waiting for review</span></div>
				<div><strong>{health.ingredients.total}</strong><span>ingredients</span></div>
				<div><strong>{health.stores.length - 1}</strong><span>stores</span></div>
			</div>

			{#snippet list(title: string, items: { id: string; name: string; note?: string }[], hint?: string)}
				{#if items.length}
					<details>
						<summary><span>{title}</span><b>{items.length}</b><ChevronRight size={18} /></summary>
						{#if hint}<p class="soft note">{hint}</p>{/if}
						<ul>
							{#each items as item (item.id)}
								<li><span>{item.name}</span>{#if item.note}<span class="soft note">{item.note}</span>{/if}</li>
							{/each}
						</ul>
					</details>
				{:else}
					<div class="fine"><span>{title}</span><b>0</b></div>
				{/if}
			{/snippet}

			{@render list('Recipes waiting for review', health.recipes.needsReview, 'They are left out of the app until someone has checked their amounts.')}
			{@render list('Ingredients without a price', health.ingredients.noPrice, 'They count as free in the cost estimate, which is then marked as partial.')}
			{@render list('Recipes without a method', health.recipes.noMethod)}
			{@render list('Ingredients no recipe uses', health.ingredients.unused)}
			<div class="fine"><span>Recipes that need no cooking</span><b>{health.recipes.noCooking}</b></div>
			<div class="fine"><span>Ingredients without a pack size</span><b>{health.ingredients.noPack}</b></div>
			<div class="fine"><span>Notes from the checks</span><b>{count(health.checks.warnings, 'warning')}, {count(health.checks.notes, 'note')}</b></div>

			<h3>Stores</h3>
			<ul class="stores">
				{#each health.stores as store (store.id)}
					<li><span>{store.name}</span><b>{count(store.ingredients, 'ingredient')}</b></li>
				{/each}
			</ul>
		</section>
	{/if}

	<section>
		<h2>The app</h2>
		<dl>
			<div><dt>Version</dt><dd>{version}</dd></div>
			<div><dt>Data</dt><dd>{appData.version}</dd></div>
			<div><dt>Kitchen rules</dt><dd>{RULES_VERSION}</dd></div>
			{#if plans !== undefined}<div><dt>Plans on this device</dt><dd>{plans}</dd></div>{/if}
		</dl>
		<p class="links">
			<a href={resolve('/styleguide')}>Style sheet</a>
			<a href={resolve('/styleguide/motion')}>Motion trial page</a>
			<a href={resolve('/status')}>Offline check</a>
		</p>
	</section>
</div>

<style>
	.screen {
		display: flex;
		flex-direction: column;
		gap: var(--space-7);
		max-width: 720px;
	}
	section {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	h2 {
		margin: 0;
		font-size: var(--text-heading);
		font-weight: var(--weight-heavy);
	}
	h3 {
		margin: var(--space-4) 0 0;
		font-size: var(--text-strong);
		font-weight: var(--weight-heavy);
	}
	p {
		margin: 0;
	}
	.note {
		font-size: var(--text-small);
	}
	.row {
		padding: var(--space-2) 0;
	}
	.figures {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
		gap: var(--space-4);
		padding: var(--space-3) 0;
	}
	.figures div {
		display: flex;
		flex-direction: column;
	}
	.figures strong {
		font-size: var(--text-title-large);
		font-weight: var(--weight-heavy);
		line-height: 1.1;
	}
	.figures span {
		color: var(--color-ink-soft);
		font-size: var(--text-small);
	}
	details,
	.fine,
	.stores li,
	dl div {
		border-top: 1px solid var(--color-line);
	}
	summary,
	.fine,
	.stores li,
	dl div {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) 0;
	}
	summary {
		cursor: pointer;
		list-style: none;
		font-weight: var(--weight-bold);
	}
	summary::-webkit-details-marker {
		display: none;
	}
	summary span {
		flex: 1;
	}
	summary :global(svg) {
		color: var(--color-ink-soft);
		transition: transform var(--motion-quick) var(--ease-out);
	}
	details[open] summary :global(svg) {
		transform: rotate(90deg);
	}
	.fine span,
	.stores li span {
		flex: 1;
	}
	b {
		font-variant-numeric: tabular-nums;
	}
	details ul,
	.stores {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	details li {
		display: flex;
		flex-direction: column;
		padding: 6px 0 6px var(--space-3);
	}
	dl {
		margin: 0;
	}
	dt {
		flex: 1;
	}
	dd {
		margin: 0;
		font-weight: var(--weight-bold);
		font-variant-numeric: tabular-nums;
	}
	.links {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		padding-top: var(--space-3);
		font-weight: var(--weight-bold);
	}
	code {
		font-size: 0.9em;
	}
</style>
