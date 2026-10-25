<script lang="ts">
	import PlanGate from '#lib/screens/PlanGate.svelte';
	import ShoppingList from '#lib/screens/ShoppingList.svelte';
</script>

<div class="screen">
	<h1>Shopping</h1>
	<div class="content">
		<PlanGate><ShoppingList /></PlanGate>
	</div>
</div>

<style>
	.content {
		max-width: 640px;
		margin-top: var(--space-4);
	}
</style>
