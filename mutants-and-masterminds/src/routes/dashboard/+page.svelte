<script lang="ts">
	import { session } from '$lib/stores/session.svelte';
	import SplashHeader from '$lib/components/SplashHeader.svelte';
	import ComicPanel from '$lib/components/ComicPanel.svelte';

	const cards = [
		{ href: '/characters', label: 'My Characters', desc: 'View and manage all your heroes' },
		{ href: '/character', label: 'Character Sheet', desc: 'Open the active character sheet' },
		{ href: '/profile', label: 'Profile', desc: 'Manage your account settings' },
	];
</script>

<div class="page">
	<SplashHeader title="Hero" highlight="Dashboard" subtitle="Your command center" />

	<div class="card-grid">
		{#each cards as card}
			<a href={card.href} class="dash-card">
				<div class="dash-card-header">
					<span class="dash-card-icon">&#9733;</span>
					<span class="dash-card-label">{card.label}</span>
				</div>
				<p class="dash-card-desc">{card.desc}</p>
				<span class="dash-card-open">Open &#8594;</span>
			</a>
		{/each}
	</div>

	<ComicPanel header="&#9733; Quick Stats" color="dark">
		<div class="stats-grid">
			<div class="stat-item">
				<div class="stat-number">{session.characters.length}</div>
				<div class="stat-description">Characters</div>
			</div>
			<div class="stat-item">
				<div class="stat-number">{session.userId ? 'Active' : '—'}</div>
				<div class="stat-description">Account</div>
			</div>
			<div class="stat-item">
				<div class="stat-number">{session.activeCharacter ? 'Active' : 'None'}</div>
				<div class="stat-description">Active Hero</div>
			</div>
		</div>
	</ComicPanel>

	{#if !session.userId}
		<div class="prompt">
			<p><a href="/auth/login">Sign in</a> to access all features.</p>
		</div>
	{/if}

	<div class="signature-band" style="margin-top:16px;">
		<div class="sig-dots"></div>
		<span style="position:relative;z-index:1;">&#9733; UNOFFICIAL MUTANTS &amp; MASTERMINDS · DASHBOARD &#9733;</span>
	</div>
</div>

<style>
	.page {
		font-family: 'Nunito', sans-serif;
		background: var(--newsprint);
		padding: 20px;
		width: 100%;
		max-width: 1200px;
	}

	.card-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
		margin-bottom: 14px;
	}

	.dash-card {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 20px;
		background: var(--panel-bg);
		border: 3px solid var(--border);
		box-shadow: 4px 4px 0 var(--border);
		text-decoration: none;
		transition: transform 0.1s;
	}
	.dash-card:hover { transform: translate(-1px, -1px); box-shadow: 5px 5px 0 var(--border); }

	.dash-card-header {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.dash-card-icon {
		font-family: 'Bangers', cursive;
		font-size: 20px;
		color: var(--danger);
	}

	.dash-card-label {
		font-family: 'Bangers', cursive;
		font-size: 20px;
		color: var(--primary);
		letter-spacing: 0.04em;
	}

	.dash-card-desc {
		font-family: 'Nunito', sans-serif;
		font-size: 14px;
		color: var(--accent);
		margin: 0;
		line-height: 1.4;
	}

	.dash-card-open {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		font-weight: 700;
		color: var(--danger);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
		text-align: center;
	}

	.stat-item { padding: 12px 0; }

	.stat-number {
		font-family: 'Bangers', cursive;
		font-size: 32px;
		color: var(--accent);
		text-shadow: 1px 1px 0 rgba(0,0,0,0.5);
		line-height: 1;
		margin-bottom: 4px;
	}

	.stat-description {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		font-weight: 700;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.prompt {
		background: var(--panel-bg);
		border: 3px solid var(--border);
		box-shadow: 4px 4px 0 var(--border);
		padding: 24px;
		margin-bottom: 14px;
		text-align: center;
		font-size: 16px;
	}
	.prompt a { color: var(--danger); font-weight: 700; }

	.signature-band {
		background: var(--border);
		color: var(--accent);
		font-family: 'Bangers', cursive;
		font-size: 15px;
		letter-spacing: 0.15em;
		text-align: center;
		padding: 5px;
		position: relative;
		overflow: hidden;
	}
	.sig-dots {
		position: absolute;
		inset: 0;
		background-image: radial-gradient(circle, var(--highlight) 1px, transparent 1px);
		background-size: 10px 10px;
		opacity: 0.15;
	}
</style>
