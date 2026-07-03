<script lang="ts">
	import { api } from '$lib/services/api';
	import type { Campaign } from '$lib/services/api';
	import SplashHeader from '$lib/components/SplashHeader.svelte';

	let campaigns = $state<Campaign[]>([]);
	let loading = $state(true);
	let loadError = $state<string | null>(null);

	let showNewCampaign = $state(false);
	let newName = $state('');
	let newSetting = $state('');
	let creating = $state(false);
	let createError = $state<string | null>(null);

	$effect(() => {
		(async () => {
			try {
				campaigns = await api.campaign.myCampaigns();
			} catch (e) {
				loadError = (e as Error).message;
			} finally {
				loading = false;
			}
		})();
	});

	async function handleCreate() {
		creating = true;
		createError = null;
		try {
			const created = await api.campaign.create({
				name: newName,
				gameSystem: 'GODBOUND',
				setting: newSetting || undefined,
			});
			campaigns = [...campaigns, created];
			loadError = null;
			showNewCampaign = false;
			newName = '';
			newSetting = '';
		} catch (e) {
			createError = (e as Error).message;
		} finally {
			creating = false;
		}
	}

	async function handleDelete(id: string) {
		if (!confirm('Delete this campaign? This cannot be undone.')) return;
		try {
			await api.campaign.delete(id);
			campaigns = campaigns.filter((c) => c.id !== id);
		} catch {}
	}
</script>

<div class="page">
	<SplashHeader title="Campaign" highlight="Manager" subtitle="Your Skies and their rosters" />

	{#if loading}
		<div class="prompt-card">
			<p>Loading campaigns...</p>
		</div>
	{:else if loadError}
		<div class="prompt-card" style="text-align:center;">
			<p style="margin-bottom:16px;">{loadError}</p>
			<button onclick={() => (showNewCampaign = true)} class="gb-btn">Create Campaign</button>
		</div>
	{:else if campaigns.length === 0}
		<div class="prompt-card" style="text-align:center;">
			<p style="margin-bottom:16px;">No campaigns yet. Start your first Sky!</p>
			<button onclick={() => (showNewCampaign = true)} class="gb-btn">Create Campaign</button>
		</div>
	{:else}
		<div class="char-grid">
			{#each campaigns as campaign}
				<a href={`/campaigns/${campaign.id}`} class="char-card">
					<div class="char-card-header">
						<span class="char-name">{campaign.name}</span>
					</div>
					<div class="char-card-body">
						<div class="char-stat-row">
							<span class="char-stat-label">Members</span>
							<span class="char-stat-value">{campaign.members.length}</span>
						</div>
					</div>
					<div class="char-card-footer">
						<button onclick={(e) => { e.preventDefault(); handleDelete(campaign.id); }} class="delete-btn">Delete</button>
						<span class="open-indicator">Open &#8594;</span>
					</div>
				</a>
			{/each}

			<button onclick={() => (showNewCampaign = true)} class="add-card">
				<span class="add-icon">+</span>
				<span class="add-label">New Campaign</span>
			</button>
		</div>
	{/if}
</div>

{#if showNewCampaign}
	<div class="modal-overlay" onclick={() => (showNewCampaign = false)} onkeydown={(e) => e.key === 'Escape' && (showNewCampaign = false)} role="presentation">
		<div class="modal-box" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1" onkeydown={(e) => e.key === 'Escape' && (showNewCampaign = false)}>
			<h2 class="modal-title">New Campaign</h2>
			{#if createError}
				<div class="modal-error">{createError}</div>
			{/if}
			<div class="field-group">
				<label for="new-campaign-name" class="field-label">Campaign Name</label>
				<input id="new-campaign-name" type="text" bind:value={newName} required class="gb-input" placeholder="e.g. The Rusted Sky" />
			</div>
			<div class="field-group">
				<label for="new-campaign-setting" class="field-label">Setting (optional)</label>
				<input id="new-campaign-setting" type="text" bind:value={newSetting} class="gb-input" placeholder="e.g. The Shattered Realms" />
			</div>
			<div class="modal-actions">
				<button onclick={handleCreate} disabled={creating || !newName} class="gb-btn">{creating ? 'Creating...' : 'Create Campaign'}</button>
				<button onclick={() => (showNewCampaign = false)} class="gb-btn secondary">Cancel</button>
			</div>
		</div>
	</div>
{/if}
