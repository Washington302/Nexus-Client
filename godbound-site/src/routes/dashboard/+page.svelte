<script lang="ts">
	import SplashHeader from '@ui/SplashHeader.svelte';

	const cards = [
		{ href: '/characters', label: 'My Characters', desc: 'View and manage all your ascended' },
		{ href: '/character', label: 'Character Sheet', desc: 'Open the active character sheet' },
		{ href: '/gifts', label: 'Divine Gifts', desc: 'Manage Words of Creation and Gifts' },
		{ href: '/influence', label: 'Dominion & Influence', desc: 'Track influence projects and realm changes' },
		{ href: '/log', label: 'Adventure Log', desc: 'Chronicle your sessions and divine goals' },
		{ href: '/campaigns', label: 'Campaign Manager', desc: 'Manage your Skies, rosters, and linked characters' },
		{ href: '/sites', label: 'Find My Other Sites', desc: 'Links to the other apps I’m building' },
	];
</script>

<div class="page">
	<SplashHeader title="Your" highlight="Dashboard" subtitle="Your command center" />

	<div class="card-grid">
		{#each cards as card}
			<a href={card.href} class="dash-card">
				<div class="dash-card-header">
					<span class="dash-card-label">{card.label}</span>
				</div>
				<p class="dash-card-desc">{card.desc}</p>
				<span class="dash-card-open">Open &#8594;</span>
			</a>
		{/each}
	</div>
</div>
