<script lang="ts">
	import '$lib/styles/app.css';
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
