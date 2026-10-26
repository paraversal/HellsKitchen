<script lang="ts">
	import FileDown from '@lucide/svelte/icons/file-down';
	import Printer from '@lucide/svelte/icons/printer';
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { slash } from '#lib/paths.ts';
	import Button from '#lib/components/Button.svelte';
	import { paperThen } from '#lib/motion/paper.ts';
	import { planStore } from '#lib/plan/browser.ts';
	import { canPrint, printJob, sharePdf } from '#lib/plan/printjob.svelte.ts';

	// The pages meant for paper. On a screen they show a bar with Back, Print and a PDF; on paper they are just the page.
	// A PDF can also be made in the print window of a browser. On an iPhone with the app on its home screen there is no print window, so the PDF goes to the share sheet, which can print it.
	let { children } = $props();

	onMount(() => {
		if (planStore.status !== 'ready') void planStore.load();
	});
</script>

<svelte:head>
	<title>Print · Hell's Kitchen</title>
</svelte:head>

<div class="bar">
	<a href={slash(resolve('/(app)/plan'))}>Back to the plan</a>
	<div class="actions">
		{#if printJob.current}
			<Button variant={canPrint() ? 'secondary' : 'primary'} icon={FileDown} onclick={() => sharePdf(printJob.current!.name, printJob.current!.build())}>PDF</Button>
		{/if}
		{#if canPrint()}
			<Button icon={Printer} disabled={planStore.status !== 'ready'} onclick={(event) => paperThen(event.currentTarget, () => window.print(), 0)}>Print</Button>
		{/if}
	</div>
</div>

<main>
	{#if planStore.status === 'ready'}
		{@render children()}
	{:else if planStore.status === 'unreadable'}
		<p>Your plan is not available yet. {planStore.problem}</p>
	{/if}
</main>

<style>
	.bar {
		position: sticky;
		top: 0;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-5);
		background: var(--color-sheet);
		border-bottom: var(--border);
	}
	.actions {
		display: flex;
		gap: var(--space-2);
	}
	.bar a {
		color: inherit;
		font-weight: var(--weight-bold);
	}
	main {
		max-width: 800px;
		margin: 0 auto;
		padding: var(--space-6) var(--space-5);
		background: #fff;
		color: #000;
	}

	@page {
		size: A4;
		margin: 14mm;
	}
	@media print {
		.bar {
			display: none;
		}
		:global(body) {
			background: #fff;
		}
		main {
			max-width: none;
			padding: 0;
		}
	}
</style>
