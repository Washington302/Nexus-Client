<script lang="ts">
	// The layout's own nav is always signed-out in dev, so this renders a second
	// one in the signed-in state — the only way to exercise the dropdown's
	// keyboard and click-away behaviour without an account.
	import SiteNav from '@ui/SiteNav.svelte';

	let { blurb = 'gallery' }: { blurb?: string } = $props();

	const links = [{ href: '/characters', label: 'Characters' }];
	const menuLinks = [
		{ href: '/dashboard', label: 'Dashboard' },
		{ href: '/profile', label: 'Profile' }
	];
	let signedIn = $state(true);
</script>

<h2>SiteNav — signed in</h2>
<p>
	Open the user menu, then press <kbd>Escape</kbd> or click elsewhere; both must close it and Escape
	must return focus to the toggle.
</p>
<SiteNav {blurb} {links} {menuLinks} {signedIn} username="testuser" onSignOut={() => (signedIn = false)} />
