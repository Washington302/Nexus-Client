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

	// ── Primary links: inline row on wide screens, collapsed panel on narrow ──
	//
	// The inline row is wider than a phone viewport (godbound ships eight links),
	// so laying it out unconditionally pushed documentElement.scrollWidth past
	// clientWidth and the whole page scrolled sideways with the last links off
	// screen. Below each app's nav breakpoint the row is hidden and `.nav-toggle`
	// opens `.nav-menu` instead; above it the toggle is hidden and the row is
	// back. Which width that happens at is a CSS decision, per app.
	let navOpen = $state(false);
	let navEl = $state<HTMLElement | null>(null);
	let navToggle = $state<HTMLElement | null>(null);

	$effect(() => {
		if (!navOpen) return;

		const onKey = (e: KeyboardEvent) => {
			if (e.key !== 'Escape') return;
			navOpen = false;
			navToggle?.focus();
		};
		const onPointerDown = (e: PointerEvent) => {
			if (navEl && !navEl.contains(e.target as Node)) navOpen = false;
		};
		// Widening past the breakpoint restores the inline row and hides the
		// toggle; the panel must not be left hanging under it. Asking the toggle
		// whether it is still rendered beats duplicating the breakpoint here — the
		// app's CSS stays the single source of truth for where it sits.
		const onResize = () => {
			if (navToggle && navToggle.offsetParent === null) navOpen = false;
		};

		document.addEventListener('keydown', onKey);
		document.addEventListener('pointerdown', onPointerDown);
		window.addEventListener('resize', onResize);
		return () => {
			document.removeEventListener('keydown', onKey);
			document.removeEventListener('pointerdown', onPointerDown);
			window.removeEventListener('resize', onResize);
		};
	});
</script>

<nav class="site-nav" bind:this={navEl}>
	<div class="nav-inner">
		<div class="nav-left">
			<button
				bind:this={navToggle}
				onclick={() => (navOpen = !navOpen)}
				class="nav-toggle"
				aria-label="Menu"
				aria-haspopup="true"
				aria-expanded={navOpen}
				aria-controls="site-nav-menu"
			>
				{navOpen ? '✕' : '☰'}
			</button>

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

	{#if navOpen}
		<div class="nav-menu" id="site-nav-menu">
			{#each links as link (link.href)}
				<a href={link.href} class="nav-menu-link" onclick={() => (navOpen = false)}>{link.label}</a>
			{/each}
		</div>
	{/if}
</nav>
