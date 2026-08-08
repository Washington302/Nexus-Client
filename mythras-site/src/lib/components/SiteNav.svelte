<script lang="ts">
	import { session, logout } from '$lib/stores/session.svelte';

	let menuOpen = $state(false);
</script>

<nav class="site-nav">
	<div class="nav-inner">
		<div class="nav-left">
			<!-- The product name leads; the game it serves is a descriptive subtitle only.
			     The official game title may not be used as the app name. -->
			<a href="/" class="nav-brand">
				Scribe Sheets
				<span class="nav-brand-blurb">for Mythras</span>
			</a>
			<div class="nav-sep"></div>
			<a href="/characters" class="nav-link">Characters</a>
			<a href="/log" class="nav-link">Log</a>
			<a href="/dashboard" class="nav-link">Dashboard</a>
		</div>

		{#if session.userId}
			<div style="position: relative;">
				<button onclick={() => (menuOpen = !menuOpen)} class="user-btn">
					<div class="avatar">{session.username?.charAt(0).toUpperCase() || '?'}</div>
					<span class="user-name">{session.username}</span>
					<span class="chevron">{menuOpen ? '▲' : '▼'}</span>
				</button>

				{#if menuOpen}
					<div
						class="dropdown"
						onclick={() => (menuOpen = false)}
						role="menu"
						tabindex="-1"
						onkeydown={(e) => e.key === 'Escape' && (menuOpen = false)}
					>
						<a href="/dashboard" class="dropdown-item">Dashboard</a>
						<a href="/characters" class="dropdown-item">My Characters</a>
						<a href="/log" class="dropdown-item">Log</a>
						<a href="/profile" class="dropdown-item">Profile</a>
						<a href="/legal" class="dropdown-item">About &amp; Legal</a>
						<button onclick={logout} class="dropdown-item signout">Sign Out</button>
					</div>
				{/if}
			</div>
		{:else}
			<a href="/auth/login" class="signin-btn">Sign In</a>
		{/if}
	</div>
</nav>
