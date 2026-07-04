<script lang="ts">
	import '$lib/styles/app.css';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { session } from '$lib/stores/session.svelte';
	import SiteNav from '$lib/components/SiteNav.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';

	let { children } = $props();

	function isPublicRoute(pathname: string) {
		return pathname === '/' || pathname.startsWith('/auth/') || pathname.startsWith('/share/');
	}

	const CHARACTER_SCOPED_PREFIXES = ['/character', '/gifts', '/influence', '/log', '/campaigns'];
	function isCharacterScoped(pathname: string) {
		return CHARACTER_SCOPED_PREFIXES.some((p) => pathname.startsWith(p));
	}

	$effect(() => {
		if (!session.loading && !session.userId && !isPublicRoute(page.url.pathname)) {
			goto('/');
		}
	});
</script>

{#if isCharacterScoped(page.url.pathname)}
	<div class="app-shell">
		<Sidebar />
		<main>
			{@render children()}
		</main>
	</div>
{:else}
	<SiteNav />
	<main>
		{@render children()}
	</main>
{/if}
