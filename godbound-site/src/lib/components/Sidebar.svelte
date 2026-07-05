<script lang="ts">
	import { page } from '$app/state';
	import { session, logout } from '$lib/stores/session.svelte';

	const navItems = [
		{ href: '/character', label: 'Character' },
		{ href: '/gifts', label: 'Gifts' },
		{ href: '/influence', label: 'Influence' },
		{ href: '/log', label: 'Log' },
	];

	const dominion = $derived(session.activeCharacter?.resources?.dominion ?? { total: 0, free: 0 });
	const dominionSpent = $derived(dominion.total - dominion.free);
	const dominionPct = $derived(dominion.total > 0 ? Math.min(100, Math.round((dominionSpent / dominion.total) * 100)) : 0);
</script>

<aside class="sidebar">
	<div class="sidebar-header">
		<div class="sidebar-avatar">{(session.activeCharacter?.name ?? 'G').charAt(0).toUpperCase()}</div>
		<div>
			<p class="sidebar-header-title">{session.activeCharacter?.name ?? 'No Character'}</p>
			<p class="sidebar-header-sub">Godbound of the Word</p>
		</div>
	</div>

	<nav class="sidebar-nav">
		{#each navItems as item}
			<a href={item.href} class="sidebar-nav-item" class:active={page.url.pathname === item.href}>{item.label}</a>
		{/each}
		<div class="sidebar-divider"></div>
		<a href="/campaigns" class="sidebar-nav-item" class:active={page.url.pathname.startsWith('/campaigns')}>Campaign</a>
		<a href="/characters" class="sidebar-nav-item" class:active={page.url.pathname === '/characters'}>All Characters</a>
		<a href="/dashboard" class="sidebar-nav-item" class:active={page.url.pathname === '/dashboard'}>Dashboard</a>
		<a href="/settings" class="sidebar-nav-item" class:active={page.url.pathname === '/settings'}>Settings</a>
	</nav>

	<div class="sidebar-footer">
		<p class="sidebar-footer-label">Divine Spark</p>
		<p class="sidebar-footer-value">{dominion.free} / {dominion.total} Dominion</p>
		<div class="sidebar-progress"><div class="sidebar-progress-fill" style="width:{dominionPct}%"></div></div>
	</div>

	<div class="sidebar-footer">
		<a href="/profile" class="sidebar-user-row">
			<div class="sidebar-user-avatar">{session.username?.charAt(0).toUpperCase() ?? '?'}</div>
			<div>
				<p class="sidebar-user-name">{session.username}</p>
				<p class="sidebar-user-sub">View Profile</p>
			</div>
		</a>
		<button class="sidebar-signout-btn" onclick={logout}>Sign Out</button>
	</div>
</aside>
