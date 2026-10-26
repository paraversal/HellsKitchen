<script lang="ts">
	import { onMount } from 'svelte';
	import { planStore } from '#lib/plan/browser.ts';
	import { printJob } from '#lib/plan/printjob.svelte.ts';
	import { shoppingPdf } from '#lib/plan/pdf.ts';
	import { current } from '#lib/plan/current.svelte.ts';
	import { euro } from '#lib/plan/shopping.ts';

	// The shopping list on paper: every store on a page of its own, or only the one in `?store=`.
	// Boxes to tick with a pen. What is already ticked in the app is ticked here too.
	let only = $state<string | null>(null);
	onMount(() => (only = new URLSearchParams(location.search).get('store')));

	const stores = $derived((current.shopping?.stores ?? []).filter((s) => !only || s.id === only));

	// The same list as a PDF, for phones that cannot print.
	$effect(() => {
		const name = planStore.plan?.name ?? 'plan';
		const chosen = stores;
		printJob.current = { name: `shopping-list-${only ?? 'all'}.pdf`, build: () => shoppingPdf(name, chosen) };
		return () => (printJob.current = null);
	});
</script>

{#each stores as store (store.id)}
	<section>
		<header>
			<h1>{store.name}</h1>
			<p>{planStore.plan?.name} · about {euro(store.cost)}{store.unpriced ? `, ${store.unpriced} without a price` : ''}</p>
		</header>
		<ul>
			{#each store.lines as line (line.id)}
				<li>
					<span class="box" class:done={line.checked} aria-hidden="true"></span>
					<span class="name">{line.name}</span>
					<span class="buy">{line.buy}</span>
					<span class="need">{line.need ?? ''}</span>
				</li>
			{/each}
		</ul>
	</section>
{:else}
	<p>Nothing to buy yet. Put dishes in the plan first.</p>
{/each}

<style>
	section + section {
		break-before: page;
		margin-top: 56px;
	}
	header {
		margin-bottom: var(--space-4);
		padding-bottom: var(--space-2);
		border-bottom: 2px solid #000;
	}
	h1 {
		margin: 0;
		font-size: 28px;
		font-weight: var(--weight-heavy);
	}
	header p {
		margin: 4px 0 0;
		font-size: var(--text-small);
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: grid;
		grid-template-columns: 22px 1fr auto 120px;
		align-items: center;
		gap: var(--space-3);
		padding: 7px 0;
		border-bottom: 1px solid #bbb;
		break-inside: avoid;
		font-size: var(--text-body);
	}
	.box {
		width: 16px;
		height: 16px;
		border: 1.5px solid #000;
		border-radius: 3px;
	}
	.box.done {
		background: #000;
	}
	.buy {
		font-weight: var(--weight-bold);
		font-variant-numeric: tabular-nums;
	}
	.need {
		color: #444;
		font-size: var(--text-note);
		text-align: right;
	}
	@media print {
		section + section {
			margin-top: 0;
		}
	}
</style>
