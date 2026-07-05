<script lang="ts">
	import { page } from '$app/state';
	import { api } from '$lib/services/api';
	import type { Campaign, CampaignRole, MnmCharacter } from '$lib/services/api';
	import { session } from '$lib/stores/session.svelte';
	import SplashHeader from '$lib/components/SplashHeader.svelte';
	import ComicPanel from '$lib/components/ComicPanel.svelte';
	import PillBadge from '$lib/components/PillBadge.svelte';

	let campaign = $state<Campaign | null>(null);
	let members = $state<Campaign['members']>([]);
	let linkedCharacters = $state<MnmCharacter[]>([]);
	let loading = $state(true);
	let loadError = $state<string | null>(null);

	const isOwner = $derived(!!campaign && campaign.ownerUserId === session.userId);

	$effect(() => {
		const id = page.params.id;
		if (!id) return;
		loading = true;
		loadError = null;
		Promise.all([api.campaign.get(id), api.character.byCampaign(id)])
			.then(([camp, chars]) => {
				campaign = camp;
				members = camp.members;
				linkedCharacters = chars;
			})
			.catch((e) => {
				loadError = (e as Error).message;
			})
			.finally(() => {
				loading = false;
			});
	});

	// ─── Roster ──────────────────────────────────────────────────────────────
	let inviteEmail = $state('');
	let inviteRole = $state<CampaignRole>('PLAYER');
	let inviting = $state(false);
	let inviteError = $state<string | null>(null);

	async function handleInvite() {
		if (!campaign) return;
		inviting = true;
		inviteError = null;
		try {
			const user = await api.users.lookupByEmail(inviteEmail);
			if (!user) {
				inviteError = 'No user found with that email.';
				return;
			}
			const updated = await api.campaign.addMember(campaign.id, {
				userId: user.id,
				displayName: user.username,
				role: inviteRole,
			});
			members = updated.members;
			inviteEmail = '';
		} catch (e) {
			inviteError = (e as Error).message;
		} finally {
			inviting = false;
		}
	}

	async function handleRemoveMember(userId: string) {
		if (!campaign) return;
		if (!confirm('Remove this member from the campaign?')) return;
		try {
			const updated = await api.campaign.removeMember(campaign.id, userId);
			members = updated.members;
		} catch {}
	}

	// ─── Linked Characters ──────────────────────────────────────────────────
	let linkCharacterId = $state('');
	let linking = $state(false);

	const linkableCharacters = $derived(
		session.characters.filter((c) => c.campaignId !== campaign?.id)
	);

	async function handleLinkCharacter() {
		if (!campaign || !linkCharacterId) return;
		linking = true;
		try {
			const char = session.characters.find((c) => c.id === linkCharacterId);
			if (!char) return;
			await api.character.update(char.id, { ...char, campaignId: campaign.id });
			linkedCharacters = await api.character.byCampaign(campaign.id);
			linkCharacterId = '';
		} catch {}
		finally {
			linking = false;
		}
	}
</script>

<div class="page">
	{#if loading}
		<div class="prompt-card"><p>Loading campaign...</p></div>
	{:else if loadError || !campaign}
		<div class="prompt-card"><p>{loadError ?? 'Campaign not found.'}</p></div>
	{:else}
		<SplashHeader title={campaign.name} highlight="" subtitle={campaign.setting ?? 'Mutants & Masterminds Campaign'} />

		<ComicPanel header="★ Roster" color="blue">
			<div class="roster-list">
				{#each members as member}
					<div class="roster-row">
						<span class="roster-name">{member.displayName}</span>
						<PillBadge text={member.role} color={member.role === 'OWNER' ? 'danger' : 'primary'} />
						{#if isOwner && member.userId !== campaign.ownerUserId}
							<button onclick={() => handleRemoveMember(member.userId)} class="delete-btn">Remove</button>
						{/if}
					</div>
				{/each}
			</div>

			{#if isOwner}
				<hr class="divider" />
				{#if inviteError}<div class="modal-error">{inviteError}</div>{/if}
				<div class="invite-row">
					<input type="email" bind:value={inviteEmail} placeholder="player@email.com" class="comic-input" />
					<select bind:value={inviteRole} class="comic-input">
						<option value="STORYTELLER">Storyteller</option>
						<option value="PLAYER">Player</option>
						<option value="SPECTATOR">Spectator</option>
					</select>
					<button onclick={handleInvite} disabled={inviting || !inviteEmail} class="comic-btn">{inviting ? 'Inviting...' : 'Invite'}</button>
				</div>
			{/if}
		</ComicPanel>

		<ComicPanel header="★ Linked Characters" color="dark">
			{#if linkedCharacters.length === 0}
				<p>No characters linked to this campaign yet.</p>
			{:else}
				<div class="roster-list">
					{#each linkedCharacters as char}
						<div class="roster-row">
							<a href={`/share/${char.id}`} class="roster-name">{char.name}</a>
							<PillBadge text="PL {char.powerLevel}" color="primary" />
						</div>
					{/each}
				</div>
			{/if}

			{#if linkableCharacters.length > 0}
				<hr class="divider" />
				<div class="invite-row">
					<select bind:value={linkCharacterId} class="comic-input">
						<option value="">Select one of your characters...</option>
						{#each linkableCharacters as char}
							<option value={char.id}>{char.name}</option>
						{/each}
					</select>
					<button onclick={handleLinkCharacter} disabled={linking || !linkCharacterId} class="comic-btn">{linking ? 'Linking...' : 'Link Character'}</button>
				</div>
			{/if}
		</ComicPanel>
	{/if}
</div>
