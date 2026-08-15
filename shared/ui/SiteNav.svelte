<script lang="ts">
	// Session state arrives as props: this component must not import $lib, which
	// would resolve to a different module in each consuming app.
	let {
		blurb,
		links,
		menuLinks,
		signedIn = false,
		username = null,
		onSignOut
	}: {
		blurb: string;
		links: { href: string; label: string }[];
		menuLinks: { href: string; label: string }[];
		signedIn?: boolean;
		username?: string | null;
		onSignOut: () => void;
	} = $props();

	let menuOpen = $state(false);
	let menuWrap = $state<HTMLElement | null>(null);

	// The old per-app navs put the Escape handler on the dropdown itself, which is
	// a *sibling* of the toggle button: keydown fires on the focused button and
	// bubbles to their shared parent, never sideways to the dropdown, and nothing
	// ever focused it. Escape therefore did nothing in any of the four apps, and
	// clicking elsewhere left the menu hanging open.
	//
	// Both listeners live on the document and only while the menu is open, so they
	// work wherever focus happens to be and cost nothing when it is closed.
	$effect(() => {
		if (!menuOpen) return;

		const onKey = (e: KeyboardEvent) => {
			if (e.key !== 'Escape') return;
			menuOpen = false;
			(menuWrap?.querySelector('.user-btn') as HTMLElement | null)?.focus();
		};
		const onPointerDown = (e: PointerEvent) => {
			if (menuWrap && !menuWrap.contains(e.target as Node)) menuOpen = false;
		};

		document.addEventListener('keydown', onKey);
		document.addEventListener('pointerdown', onPointerDown);
		return () => {
			document.removeEventListener('keydown', onKey);
			document.removeEventListener('pointerdown', onPointerDown);
		};
	});
</script>

<nav class="site-nav">
	<div class="nav-inner">
		<div class="nav-left">
			<!-- The product name leads; the game it serves is a descriptive subtitle only.
			     The official game title may not be used as the app name. -->
			<a href="/" class="nav-brand">
				Scribe Sheets
				<span class="nav-brand-blurb">{blurb}</span>
			</a>
			<div class="nav-sep"></div>
			{#each links as link (link.href)}
				<a href={link.href} class="nav-link">{link.label}</a>
			{/each}
		</div>

		{#if signedIn}
			<div style="position: relative;" bind:this={menuWrap}>
				<button
					onclick={() => (menuOpen = !menuOpen)}
					class="user-btn"
					aria-haspopup="true"
					aria-expanded={menuOpen}
				>
					<div class="avatar">{username?.charAt(0).toUpperCase() || '?'}</div>
					<span class="user-name">{username}</span>
					<span class="chevron">{menuOpen ? '▲' : '▼'}</span>
				</button>

				{#if menuOpen}
					<div class="dropdown" role="menu">
						{#each menuLinks as item (item.href)}
							<a href={item.href} class="dropdown-item" role="menuitem" onclick={() => (menuOpen = false)}
								>{item.label}</a
							>
						{/each}
						<button onclick={onSignOut} class="dropdown-item signout" role="menuitem">Sign Out</button>
					</div>
				{/if}
			</div>
		{:else}
			<a href="/auth/login" class="signin-btn">Sign In</a>
		{/if}
	</div>
</nav>
