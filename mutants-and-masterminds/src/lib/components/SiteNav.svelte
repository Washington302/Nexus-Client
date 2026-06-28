<script lang="ts">
	import { COMIC, FONT } from '$lib/constants';
	import { session, logout } from '$lib/stores/session.svelte';

	let menuOpen = $state(false);
</script>

<nav class="site-nav">
	<div class="nav-inner">
		<div class="nav-left">
			<a href="/" class="nav-brand">Unofficial M&amp;M</a>
			<div class="nav-sep"></div>
			<a href="/characters" class="nav-link">Characters</a>
			<a href="/dashboard" class="nav-link">Dashboard</a>
		</div>

		{#if session.userId}
			<div style="position: relative;">
				<button
					onclick={() => (menuOpen = !menuOpen)}
					class="user-btn"
				>
					<div class="avatar">{session.username?.charAt(0).toUpperCase() || '?'}</div>
					<span class="user-name">{session.username}</span>
					<span class="chevron">{menuOpen ? '▲' : '▼'}</span>
				</button>

				{#if menuOpen}
					<div class="dropdown" onclick={() => (menuOpen = false)} role="menu" tabindex="-1" onkeydown={(e) => e.key === 'Escape' && (menuOpen = false)}>
						<a href="/dashboard" class="dropdown-item">Dashboard</a>
						<a href="/characters" class="dropdown-item">My Characters</a>
						<a href="/profile" class="dropdown-item">Profile</a>
						<button onclick={logout} class="dropdown-item signout">Sign Out</button>
					</div>
				{/if}
			</div>
		{:else}
			<a href="/auth/login" class="signin-btn">Sign In</a>
		{/if}
	</div>
</nav>

<style>
	.site-nav {
		position: sticky;
		top: 0;
		z-index: 200;
		width: 100%;
		background: var(--border);
		border-bottom: 3px solid var(--danger);
		box-sizing: border-box;
	}
	.nav-inner {
		max-width: 1000px;
		margin: 0 auto;
		padding: 0 20px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 48px;
	}
	.nav-left {
		display: flex;
		align-items: center;
		gap: 20px;
	}
	.nav-brand {
		font-family: 'Bangers', cursive;
		font-size: 22px;
		color: var(--accent);
		text-decoration: none;
		text-shadow: 1px 1px 0 var(--ink);
		letter-spacing: 0.05em;
	}
	.nav-sep {
		width: 1px;
		height: 20px;
		background: var(--accent);
	}
	.nav-link {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 600;
		color: var(--accent);
		text-decoration: none;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		transition: color 0.15s;
		padding: 4px 8px;
	}
	.nav-link:hover { color: var(--accent); }
	.signin-btn {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--panel-bg);
		text-decoration: none;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		border: 1.5px solid var(--border);
		padding: 5px 14px;
		transition: border-color 0.15s;
	}
	.signin-btn:hover { border-color: var(--highlight); }
	.user-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		background: none;
		border: 1.5px solid var(--border);
		padding: 4px 10px;
		cursor: pointer;
		border-radius: 3px;
		transition: border-color 0.15s;
	}
	.user-btn:hover { border-color: var(--highlight); }
	.avatar {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--danger);
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'Bangers', cursive;
		font-size: 15px;
		color: var(--panel-bg);
	}
	.user-name {
		font-family: 'Nunito', sans-serif;
		font-size: 14px;
		font-weight: 600;
		color: var(--panel-bg);
	}
	.chevron {
		font-size: 15px;
		color: var(--accent);
	}
	.dropdown {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		background: var(--panel-bg);
		border: 3px solid var(--border);
		box-shadow: 4px 4px 0 var(--border);
		min-width: 180px;
		z-index: 300;
		overflow: hidden;
	}
	.dropdown-item {
		display: block;
		font-family: 'Oswald', sans-serif;
		font-size: 14px;
		font-weight: 600;
		color: var(--ink);
		text-decoration: none;
		padding: 10px 16px;
		border-bottom: 1px solid var(--border);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		background: none;
		width: 100%;
		text-align: left;
		cursor: pointer;
		transition: background 0.15s;
	}
	.dropdown-item:hover { background: var(--newsprint); }
	.dropdown-item.signout { color: var(--danger); font-weight: 700; border-bottom: none; }
</style>
