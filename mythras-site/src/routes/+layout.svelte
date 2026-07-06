<script lang="ts">
	import './layout.css';
	import '$lib/styles/app.css';
	import SiteNav from '$lib/components/SiteNav.svelte';

	let { children } = $props();
</script>

<SiteNav />
<main>
	{@render children()}
</main>
