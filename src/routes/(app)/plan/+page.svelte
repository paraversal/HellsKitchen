<script lang="ts">
	import PlanGate from '#lib/screens/PlanGate.svelte';
	import PlanView from '#lib/screens/PlanView.svelte';
	import ShoppingList from '#lib/screens/ShoppingList.svelte';
</script>

<PlanGate padded>
	<div class="page">
		<div class="screen main"><PlanView /></div>
		<aside class="panel">
			<h2>Shopping</h2>
			<ShoppingList />
		</aside>
	</div>
</PlanGate>

<style>
	.page {
		display: block;
	}
	.panel {
		display: none;
	}
	/* A wide desktop has room for the shopping list next to the plan. */
	@media (min-width: 1280px) {
		.page {
			display: grid;
			grid-template-columns: 1fr 340px;
			align-items: start;
		}
		.panel {
			display: block;
			position: sticky;
			top: 0;
			height: 100dvh;
			overflow-y: auto;
			padding: var(--space-8) var(--space-5);
			background: var(--color-sheet);
			border-left: var(--border);
		}
		h2 {
			margin: 0 0 var(--space-4);
			font-size: 26px;
			font-weight: var(--weight-heavy);
		}
	}
</style>
