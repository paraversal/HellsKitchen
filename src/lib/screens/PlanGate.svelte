<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '#lib/components/Button.svelte';
	import { backup } from '#lib/plan/backup.svelte.ts';
	import { planStore } from '#lib/plan/browser.ts';
	import { saveFile, transfer } from '#lib/plan/transfer.svelte.ts';

	// Shows its content once the saved plans have been read. If they could not be read, it says so, and offers to try again.
	// It never offers an empty plan in that case, because saving one could cover the real one.
	// `padded` gives the message the same space around it as a screen has.
	let { children, padded = false }: { children: Snippet; padded?: boolean } = $props();
	let confirming = $state(false);
</script>

{#if planStore.status === 'ready'}
	{#if planStore.saveProblem}<p class="warning" role="alert">{planStore.saveProblem}</p>{/if}
	{#if backup.due && planStore.record}
		<div class="warning reminder">
			<span>Your plan only lives on this device. Keep a copy?</span>
			<span class="buttons">
				<Button variant="secondary" onclick={() => saveFile(planStore.record!.plan, planStore.record!.updatedAt)}>Save a file</Button>
				<Button variant="secondary" onclick={() => (transfer.sharing = true)}>Share</Button>
				<Button variant="secondary" onclick={() => backup.reset()}>Later</Button>
			</span>
		</div>
	{/if}
	{@render children()}
{:else if planStore.status === 'unreadable'}
	<div class="problem" class:padded role="alert">
		<h2>Your plan is not available yet</h2>
		<p>{planStore.problem}</p>
		<div class="actions">
			<Button onclick={() => planStore.load()}>Try again</Button>
			{#if !confirming}
				<Button variant="secondary" onclick={() => (confirming = true)}>Start a new plan</Button>
			{:else}
				<p class="soft">This replaces anything saved on this device that the app cannot read right now.</p>
				<Button variant="secondary" onclick={() => planStore.startOver()}>Yes, start a new plan</Button>
			{/if}
		</div>
	</div>
{/if}

<style>
	.warning {
		margin: 0 0 var(--space-4);
		padding: 10px var(--space-4);
		border-radius: var(--radius-m);
		background: var(--color-mustard-tint);
		font-size: var(--text-small);
	}
	.reminder {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.buttons {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
	.padded {
		padding: var(--space-6) var(--space-5);
	}
	.problem {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		max-width: 32rem;
	}
	h2 {
		margin: 0;
		font-size: var(--text-heading);
		font-weight: var(--weight-heavy);
	}
	p {
		margin: 0;
	}
	.actions {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-3);
		margin-top: var(--space-2);
	}
</style>
