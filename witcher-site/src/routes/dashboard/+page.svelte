<script lang="ts">
	import { session } from '$lib/stores/session.svelte';
	import Panel from '$lib/components/Panel.svelte';

	const cards = [
		{ href: '/characters', label: 'My Characters', desc: 'View and manage all your characters' },
		{ href: '/character', label: 'Character Sheet', desc: 'Open the active character sheet' },
		{ href: '/profile', label: 'Profile', desc: 'Manage your account settings' }
	];
</script>

<div class="page">
	<div class="list-header">
		<h1 class="list-title">Dashboard</h1>
		<p class="list-subtitle">Your Witcher command center</p>
	</div>

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

	<div style="margin-top:16px;width:100%;">
		<Panel header="Quick Stats" color="plain">
			<div class="grid-2" style="gap:8px;display:grid;grid-template-columns:1fr 1fr;">
				<div class="stat-bubble">
					<div class="stat-num">{session.characters.length}</div>
					<div class="stat-lbl">Characters</div>
				</div>
				<div class="stat-bubble">
					<div class="stat-num">{session.userId ? 'Active' : '—'}</div>
					<div class="stat-lbl">Account</div>
				</div>
				<div class="stat-bubble">
					<div class="stat-num">
						{session.activeCharacter ? session.activeCharacter.name : 'None'}
					</div>
					<div class="stat-lbl">Active Character</div>
				</div>
			</div>
		</Panel>
	</div>

	{#if !session.userId}
		<div class="prompt-card" style="margin-top:16px;">
			<p><a href="/auth/login">Sign in</a> to access all features.</p>
		</div>
	{/if}
</div>
