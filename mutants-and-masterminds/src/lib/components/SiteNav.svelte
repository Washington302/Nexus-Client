<script lang="ts">
	import { session, logout } from '$lib/stores/session.svelte';
	import SiteNav from '@ui/SiteNav.svelte';

	// This app's nav vocabulary. The shared SiteNav owns the markup; the link
	// lists and session wiring stay here, per app.
	const links = [
		{ href: '/characters', label: 'Characters' },
		{ href: '/campaigns', label: 'Campaigns' },
		{ href: '/log', label: 'Log' },
		{ href: '/dashboard', label: 'Dashboard' }
	];

	const menuLinks = [
		{ href: '/dashboard', label: 'Dashboard' },
		{ href: '/characters', label: 'My Characters' },
		{ href: '/campaigns', label: 'My Campaigns' },
		{ href: '/log', label: 'Log' },
		{ href: '/profile', label: 'Profile' },
		{ href: '/legal', label: 'About & Legal' }
	];
</script>

<SiteNav
	blurb="for Mutants &amp; Masterminds"
	{links}
	{menuLinks}
	signedIn={!!session.userId}
	username={session.username}
	onSignOut={logout}
/>
