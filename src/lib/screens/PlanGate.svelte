<script lang="ts">
	import type { Snippet } from 'svelte';
	import Flame from '@lucide/svelte/icons/flame';
	import Save from '@lucide/svelte/icons/save';
	import { cubicOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import { strength } from '#lib/motion/fun.svelte.ts';
	import { allows } from '#lib/motion/mode.svelte.ts';
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
		<div class="warning reminder" transition:slide={{ duration: allows.flights() ? 360 : 0, easing: cubicOut }}>
			<span class="reminder-text">
				<!-- E4. With fun the disk shakes once, as if it wanted attention. -->
				{#if strength('E4') === 'playful'}<span class="disk"><Save size={18} /></span>{/if}
				Your plan only lives on this device. Keep a copy?
			</span>
			<span class="buttons">
				<Button variant="secondary" onclick={() => saveFile(planStore.record!.plan, planStore.record!.updatedAt)}>Save a file</Button>
				<Button variant="secondary" onclick={() => (transfer.sharing = true)}>Share</Button>
				<Button variant="secondary" onclick={() => backup.reset()}>Later</Button>
			</span>
		</div>
	{/if}
	{@render children()}
{:else if planStore.status === 'loading'}
	<!-- A6. A flame that flickers while the plan is read. It shows only if reading takes longer than a moment. -->
	<div class="loading" role="status" aria-label="Loading the plan"><span class="flame"><Flame size={44} /></span></div>
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
	.loading {
		display: grid;
		place-items: center;
		padding: var(--space-9) 0;
		animation: appear 0.2s 0.25s backwards;
	}
	.flame {
		display: inline-flex;
		color: var(--color-tomato);
		transform-origin: 50% 90%;
		animation: flicker 0.9s ease-in-out infinite;
	}
	@keyframes appear {
		from {
			opacity: 0;
		}
	}
	@keyframes flicker {
		0%,
		100% {
			transform: scale(1, 1) rotate(0);
		}
		20% {
			transform: scale(0.94, 1.1) rotate(-4deg);
		}
		45% {
			transform: scale(1.06, 0.95) rotate(3deg);
		}
		70% {
			transform: scale(0.97, 1.07) rotate(-2deg);
		}
	}
	.reminder-text {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2);
	}
	.disk {
		display: inline-flex;
		flex: none;
		padding-top: 2px;
		animation: shake 0.6s 0.4s ease-in-out;
	}
	@keyframes shake {
		0%,
		100% {
			transform: rotate(0);
		}
		25% {
			transform: rotate(-14deg);
		}
		50% {
			transform: rotate(12deg);
		}
		75% {
			transform: rotate(-8deg);
		}
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
