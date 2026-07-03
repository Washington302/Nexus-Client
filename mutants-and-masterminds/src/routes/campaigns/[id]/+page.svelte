<script lang="ts">
	import { page } from '$app/state';
	import { api } from '$lib/services/api';
	import type { Campaign, CampaignRole, MnmCharacter, CampaignNpc } from '$lib/services/api';
	import { createDefaultMinionStatblock } from '$lib/utils/character';
	import { session } from '$lib/stores/session.svelte';
	import SplashHeader from '$lib/components/SplashHeader.svelte';
	import ComicPanel from '$lib/components/ComicPanel.svelte';
	import PillBadge from '$lib/components/PillBadge.svelte';
	import MinionEditor from '$lib/components/editors/MinionEditor.svelte';

	let campaign = $state<Campaign | null>(null);
	let members = $state<Campaign['members']>([]);
	let linkedCharacters = $state<MnmCharacter[]>([]);
	let npcs = $state<CampaignNpc[]>([]);
	let loading = $state(true);
	let loadError = $state<string | null>(null);

	const isOwner = $derived(!!campaign && campaign.ownerUserId === session.userId);

	$effect(() => {
		const id = page.params.id;
		if (!id) return;
		loading = true;
		loadError = null;
		Promise.all([api.campaign.get(id), api.character.byCampaign(id), api.npc.list(id).catch(() => [])])
			.then(([camp, chars, npcList]) => {
				campaign = camp;
				members = camp.members;
				linkedCharacters = chars;
				npcs = npcList;
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

	// ─── NPC Library ────────────────────────────────────────────────────────
	let editingNpc = $state<CampaignNpc | null>(null);
	let npcDraftName = $state('');
	let npcDraftStatBlock = $state<ReturnType<typeof createDefaultMinionStatblock> | null>(null);
	let savingNpc = $state(false);
	let npcError = $state<string | null>(null);

	function openNewNpc() {
		editingNpc = null;
		npcDraftName = 'New NPC';
		npcDraftStatBlock = createDefaultMinionStatblock(campaign?.powerLevel ?? 10);
		npcError = null;
	}

	function openEditNpc(npc: CampaignNpc) {
		editingNpc = npc;
		npcDraftName = npc.name;
		npcDraftStatBlock = JSON.parse(JSON.stringify(npc.statBlock));
		npcError = null;
	}

	function closeNpcModal() {
		editingNpc = null;
		npcDraftStatBlock = null;
	}

	async function handleSaveNpc() {
		if (!campaign || !npcDraftStatBlock) return;
		savingNpc = true;
		npcError = null;
		try {
			const payload = { name: npcDraftName, statBlock: npcDraftStatBlock };
			if (editingNpc) {
				const updated = await api.npc.update(campaign.id, editingNpc.id, payload);
				npcs = npcs.map((n) => (n.id === updated.id ? updated : n));
			} else {
				const created = await api.npc.create(campaign.id, payload);
				npcs = [...npcs, created];
			}
			closeNpcModal();
		} catch (e) {
			npcError = (e as Error).message;
		} finally {
			savingNpc = false;
		}
	}

	async function handleDeleteNpc(npcId: string) {
		if (!campaign) return;
		if (!confirm('Delete this NPC?')) return;
		try {
			await api.npc.delete(campaign.id, npcId);
			npcs = npcs.filter((n) => n.id !== npcId);
		} catch {}
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

		<ComicPanel header="★ NPC Library" color="red">
			{#if npcs.length === 0}
				<p>No NPCs yet.</p>
			{:else}
				<div class="char-grid">
					{#each npcs as npc}
						<div
							class="char-card"
							onclick={() => openEditNpc(npc)}
							onkeydown={(e) => e.key === 'Enter' && openEditNpc(npc)}
							role="button"
							tabindex="0"
							style="text-align:left; cursor:pointer;"
						>
							<div class="char-card-header">
								<span class="char-name">{npc.name}</span>
								<PillBadge text="PL {npc.statBlock.powerLevel}" color="primary" />
							</div>
							<div class="char-card-footer">
								<button onclick={(e) => { e.stopPropagation(); handleDeleteNpc(npc.id); }} class="delete-btn">Delete</button>
								<span class="open-indicator">Edit &#8594;</span>
							</div>
						</div>
					{/each}
				</div>
			{/if}
			<button onclick={openNewNpc} class="comic-btn" style="margin-top:12px;">+ New NPC</button>
		</ComicPanel>
	{/if}
</div>

{#if npcDraftStatBlock}
	<div class="modal-overlay" onclick={closeNpcModal} onkeydown={(e) => e.key === 'Escape' && closeNpcModal()} role="presentation">
		<div class="modal-box" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1" onkeydown={(e) => e.key === 'Escape' && closeNpcModal()} style="max-width:720px;">
			<h2 class="modal-title">★ {editingNpc ? 'Edit NPC' : 'New NPC'} ★</h2>
			{#if npcError}<div class="modal-error">{npcError}</div>{/if}
			<div class="field-group">
				<label for="npc-name" class="field-label">NPC Name</label>
				<input id="npc-name" type="text" bind:value={npcDraftName} class="comic-input" />
			</div>
			<MinionEditor minion={npcDraftStatBlock} />
			<div class="modal-actions">
				<button onclick={handleSaveNpc} disabled={savingNpc || !npcDraftName} class="comic-btn">{savingNpc ? 'Saving...' : 'Save NPC'}</button>
				<button onclick={closeNpcModal} class="comic-btn secondary">Cancel</button>
			</div>
		</div>
	</div>
{/if}
