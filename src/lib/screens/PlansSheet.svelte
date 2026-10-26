<script lang="ts">
	import Sheet from '#lib/components/Sheet.svelte';
	import PlansList from './PlansList.svelte';

	// The plans of this device, from the footer of the sidebar.
	let { open = $bindable() }: { open: boolean } = $props();
</script>

<Sheet bind:open title="Plans">
	<PlansList onchosen={() => (open = false)} />
</Sheet>
