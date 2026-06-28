<script lang="ts">
	import './layout.css';
	import '$lib/stores/theme.svelte';
	import SiteNav from '$lib/components/SiteNav.svelte';

	let { children } = $props();
</script>

<SiteNav />
<main>
	{@render children()}
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 80%;
		max-width: 1200px;
		margin: 0 auto;
	}
</style>
