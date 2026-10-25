<script lang="ts">
	import { page } from '$app/state';
	import RecipeDetail from '#lib/screens/RecipeDetail.svelte';
</script>

<!-- A new recipe starts again at the default number of portions. -->
{#key page.params.id}
	<RecipeDetail id={page.params.id ?? ''} />
{/key}
