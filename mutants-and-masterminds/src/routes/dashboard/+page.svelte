<script lang="ts">
	import { session } from '$lib/stores/session.svelte';
	import SplashHeader from '$lib/components/SplashHeader.svelte';
	import ComicPanel from '$lib/components/ComicPanel.svelte';

	const cards = [
		{ href: '/characters', label: 'My Characters', desc: 'View and manage all your heroes' },
		{ href: '/character', label: 'Character Sheet', desc: 'Open the active character sheet' },
		{ href: '/campaigns', label: 'Campaign Manager', desc: 'Manage campaigns and rosters' },
		{ href: '/profile', label: 'Profile', desc: 'Manage your account settings' },
		{ href: '/sites', label: 'Find My Other Sites', desc: 'Links to the other apps I’m building' },
	];
</script>

<div class="page">
	<SplashHeader title="Hero" highlight="Dashboard" subtitle="Your command center" />

	<div class="card-grid">
		{#each cards as card}
			<a href={card.href} class="dash-card">
				<div class="dash-card-header">
					<span class="dash-card-icon">★</span>
					<span class="dash-card-label">{card.label}</span>
				</div>
				<p class="dash-card-desc">{card.desc}</p>
				<span class="dash-card-open">Open &#8594;</span>
			</a>
		{/each}
	</div>

	<ComicPanel header="★ Quick Stats" color="dark">
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
		<span style="position:relative;z-index:1;">★ UNOFFICIAL MUTANTS &amp; MASTERMINDS · DASHBOARD ★</span>
	</div>
</div>

