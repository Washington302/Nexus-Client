<script lang="ts">
	import './layout.css';
	import '$lib/styles/app.css';
	import '$lib/stores/theme.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { session } from '$lib/stores/session.svelte';
	import SiteNav from '$lib/components/SiteNav.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	let { children } = $props();

	function isPublicRoute(pathname: string) {
		// /legal must stay reachable signed-out — it carries the disclaimers.
		return (
			pathname === '/' ||
			pathname === '/legal' ||
			pathname.startsWith('/auth/') ||
			pathname.startsWith('/share/')
		);
	}

	$effect(() => {
		if (!session.loading && !session.userId && !isPublicRoute(page.url.pathname)) {
			goto('/');
		}
	});
</script>

<SiteNav />
<main>
	{@render children()}
	<SiteFooter />
</main>

