<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<main>
	<h1>Another page</h1>
	<p>Reaching this page proves that links work under the GitHub Pages sub-path, also offline.</p>
	<p><a href={resolve('/')}>Back</a></p>
</main>

<style>
	main {
		max-width: 36rem;
		margin: 0 auto;
		padding: 2rem 1.25rem;
	}
</style>
