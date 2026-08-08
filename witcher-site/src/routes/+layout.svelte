<script lang="ts">
	import './layout.css';
	import '$lib/styles/app.css';
	import '$lib/stores/theme.svelte';
	import SiteNav from '$lib/components/SiteNav.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	let { children } = $props();
</script>

<SiteNav />
<main>
	{@render children()}
	<SiteFooter />
</main>
