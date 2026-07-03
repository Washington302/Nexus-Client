<script lang="ts">
	import './layout.css';
	import '$lib/styles/app.css';
	import '$lib/stores/theme.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { session } from '$lib/stores/session.svelte';
	import SiteNav from '$lib/components/SiteNav.svelte';

	let { children } = $props();

	function isPublicRoute(pathname: string) {
		return pathname === '/' || pathname.startsWith('/auth/') || pathname.startsWith('/share/');
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
</main>

