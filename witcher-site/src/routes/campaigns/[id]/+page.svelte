<script lang="ts">
	import { page } from '$app/state';
	import { api } from '$lib/services/api';
	import type { Campaign, CampaignRole, WitcherCharacter, CampaignTimeline } from '$lib/services/api';
	import { session } from '$lib/stores/session.svelte';
	import PillBadge from '@ui/PillBadge.svelte';

	let campaign = $state<Campaign | null>(null);
	let members = $state<Campaign['members']>([]);
	let linkedCharacters = $state<WitcherCharacter[]>([]);
	let timeline = $state<CampaignTimeline | null>(null);
	let loading = $state(true);
	let loadError = $state<string | null>(null);

	const isOwner = $derived(!!campaign && campaign.ownerUserId === session.userId);
	const isStoryteller = $derived(
		isOwner || members.some((m) => m.userId === session.userId && m.role === 'STORYTELLER')
	);

	function reloadTimeline(id: string) {
		api.campaign.timeline(id).then((t) => (timeline = t)).catch(() => {});
	}

	$effect(() => {
		const id = page.params.id;
		if (!id) return;
		loading = true;
		loadError = null;
		Promise.all([api.campaign.get(id), api.character.byCampaign(id), api.campaign.timeline(id)])
			.then(([camp, chars, tl]) => {
				campaign = camp;
				members = camp.members;
				linkedCharacters = chars;
				timeline = tl;
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
				role: inviteRole
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
		} catch {
			/* ignore */
		}
	}

	// ─── Join link ──────────────────────────────────────────────────────────
	let copied = $state(false);
	let togglingVisibility = $state(false);

	const joinLink = $derived(
		campaign ? `${typeof window !== 'undefined' ? window.location.origin : ''}/campaigns/join/${campaign.id}` : ''
	);

	async function copyJoinLink() {
		if (!joinLink) return;
		await navigator.clipboard.writeText(joinLink);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	async function toggleVisibility() {
		if (!campaign) return;
		togglingVisibility = true;
		try {
			const next = campaign.visibility === 'LINK_JOINABLE' ? 'INVITE_ONLY' : 'LINK_JOINABLE';
			campaign = await api.campaign.setVisibility(campaign, next);
		} catch {
			/* ignore */
		} finally {
			togglingVisibility = false;
		}
	}

	// ─── Linked Characters ──────────────────────────────────────────────────
	let linkCharacterId = $state('');
	let linking = $state(false);
	let expandedCharacterId = $state<string | null>(null);

	const linkableCharacters = $derived(session.characters.filter((c) => c.campaignId !== campaign?.id));

	async function handleLinkCharacter() {
		if (!campaign || !linkCharacterId) return;
		linking = true;
		try {
			const char = session.characters.find((c) => c.id === linkCharacterId);
			if (!char) return;
			await api.character.update(char.id, { ...char, campaignId: campaign.id });
			linkedCharacters = await api.character.byCampaign(campaign.id);
			linkCharacterId = '';
		} catch {
			/* ignore */
		} finally {
			linking = false;
		}
	}

	let unlinkingId = $state<string | null>(null);

	async function handleUnlinkCharacter(charId: string) {
		if (!campaign) return;
		if (!confirm('Remove this character from the campaign? They can rejoin later.')) return;
		unlinkingId = charId;
		try {
			const char = session.characters.find((c) => c.id === charId);
			if (!char) return;
			await api.character.update(char.id, { ...char, campaignId: null });
			linkedCharacters = await api.character.byCampaign(campaign.id);
		} catch {
			/* ignore */
		} finally {
			unlinkingId = null;
		}
	}

	// ─── Timeline ───────────────────────────────────────────────────────────
	let showNewSession = $state(false);
	let newSessionTitle = $state('');
	let newSessionNumber = $state(1);
	let newSessionRealDate = $state('');
	let newSessionInWorldDate = $state('');
	let creatingSession = $state(false);

	function isOwnCharacter(characterId: string): boolean {
		return session.characters.some((c) => c.id === characterId);
	}

	async function handleCreateSession() {
		if (!campaign || !newSessionTitle) return;
		creatingSession = true;
		try {
			campaign = await api.campaign.createSession(campaign.id, {
				number: newSessionNumber,
				title: newSessionTitle,
				realDate: newSessionRealDate || undefined,
				inWorldDate: newSessionInWorldDate || undefined
			});
			reloadTimeline(campaign.id);
			showNewSession = false;
			newSessionTitle = '';
			newSessionRealDate = '';
			newSessionInWorldDate = '';
			newSessionNumber = (campaign.sessions.length ?? 0) + 1;
		} catch {
			/* ignore */
		} finally {
			creatingSession = false;
		}
	}
</script>

<div class="page">
	{#if loading}
		<div class="prompt-card"><p>Loading campaign...</p></div>
	{:else if loadError || !campaign}
		<div class="prompt-card"><p>{loadError ?? 'Campaign not found.'}</p></div>
	{:else}
		<div class="list-header">
			<h1 class="list-title">{campaign.name}</h1>
			<p class="list-subtitle">Campaign</p>
		</div>

		<div class="panel-full">
			<div class="panel-header plain"><span class="panel-label">Roster</span></div>
			<div class="panel-body">
				<div class="roster-list">
					{#each members as member}
						<div class="roster-row">
							<span class="roster-name">{member.displayName}</span>
							<PillBadge text={member.role} color={member.role === 'OWNER' ? 'error' : 'primary'} />
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
						<button onclick={handleInvite} disabled={inviting || !inviteEmail} class="comic-btn"
							>{inviting ? 'Inviting...' : 'Invite'}</button
						>
					</div>

					<hr class="divider" />
					<div class="invite-row">
						<button onclick={toggleVisibility} disabled={togglingVisibility} class="comic-btn secondary">
							{campaign.visibility === 'LINK_JOINABLE' ? 'Link joinable: On' : 'Link joinable: Off'}
						</button>
						{#if campaign.visibility === 'LINK_JOINABLE'}
							<button onclick={copyJoinLink} class="comic-btn secondary">{copied ? 'Copied!' : 'Copy join link'}</button>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<div class="panel-full">
			<div class="panel-header plain"><span class="panel-label">Linked Characters</span></div>
			<div class="panel-body">
				{#if linkedCharacters.length === 0}
					<p>No characters linked to this campaign yet.</p>
				{:else}
					<div class="roster-list">
						{#each linkedCharacters as char}
							<div class="roster-row" style="flex-direction:column; align-items:stretch;">
								<div style="display:flex; justify-content:space-between; align-items:center;">
									<button
										class="roster-name"
										style="background:none; border:none; text-align:left; cursor:pointer; padding:0;"
										onclick={() => (expandedCharacterId = expandedCharacterId === char.id ? null : char.id)}
									>
										{char.name} {expandedCharacterId === char.id ? '▾' : '▸'}
									</button>
									{#if isOwnCharacter(char.id)}
										<button
											onclick={() => handleUnlinkCharacter(char.id)}
											disabled={unlinkingId === char.id}
											class="delete-btn"
										>
											{unlinkingId === char.id ? 'Removing...' : 'Unlink'}
										</button>
									{/if}
								</div>
								{#if expandedCharacterId === char.id}
									<div style="font-size:13px; opacity:0.8; margin-top:6px; display:flex; gap:16px;">
										<span>Player: {char.player || 'Unknown'}</span>
										<span>Race: {char.raceInfo?.race ?? 'Unknown'}</span>
										<span>Profession: {char.professionInfo?.profession ?? 'Unassigned'}</span>
									</div>
								{/if}
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
						<button onclick={handleLinkCharacter} disabled={linking || !linkCharacterId} class="comic-btn"
							>{linking ? 'Linking...' : 'Link Character'}</button
						>
					</div>
				{/if}
			</div>
		</div>

		<div class="panel-full">
			<div class="panel-header plain"><span class="panel-label">Session Timeline</span></div>
			<div class="panel-body">
				{#if isStoryteller}
					<div style="display:flex; justify-content:flex-end;">
						<button onclick={() => (showNewSession = !showNewSession)} class="comic-btn secondary">+ New Session</button>
					</div>
				{/if}

				{#if isStoryteller && showNewSession}
					<div style="margin-top:10px;">
						<div style="display:flex; gap:8px;">
							<input type="number" bind:value={newSessionNumber} class="comic-input" style="width:80px;" placeholder="#" />
							<input type="text" bind:value={newSessionTitle} placeholder="Session title" class="comic-input" />
						</div>
						<div style="display:flex; gap:8px; margin-top:8px;">
							<input type="text" bind:value={newSessionRealDate} placeholder="Real date" class="comic-input" />
							<input type="text" bind:value={newSessionInWorldDate} placeholder="In-world date" class="comic-input" />
						</div>
						<div style="display:flex; gap:8px; margin-top:10px;">
							<button onclick={handleCreateSession} disabled={creatingSession || !newSessionTitle} class="comic-btn"
								>Create Session</button
							>
							<button onclick={() => (showNewSession = false)} class="comic-btn secondary">Cancel</button>
						</div>
					</div>
				{/if}

				{#if !timeline || (timeline.sessions.length === 0 && timeline.unassigned.length === 0)}
					<p style="margin-top:10px;">No chronicle entries yet.</p>
				{:else}
					{#each timeline.sessions as block}
						<hr class="divider" />
						<div style="display:flex; justify-content:space-between; margin-top:10px;">
							<strong>Session {block.number}: {block.title}</strong>
							<span style="font-size:13px; opacity:0.8;">{block.realDate}{block.inWorldDate ? ` · ${block.inWorldDate}` : ''}</span>
						</div>
						{#if block.entries.length === 0}
							<p style="font-size:13px; opacity:0.8;">No entries logged for this session yet.</p>
						{/if}
						{#each block.entries as te}
							<div class="roster-row" style="flex-direction:column; align-items:stretch; margin-top:8px;">
								<div style="display:flex; justify-content:space-between; align-items:baseline;">
									<strong>{te.characterName}</strong>
									<span style="font-size:12px; opacity:0.8;">played by {te.playerName}</span>
								</div>
								{#if te.entry.summary}<p style="margin-top:6px;">{te.entry.summary}</p>{/if}
								{#if te.entry.npcs.length}
									<p style="font-size:13px; opacity:0.8;">NPCs: {te.entry.npcs.map((n) => n.name).join(', ')}</p>
								{/if}
								{#if te.entry.rewards.length}
									<p style="font-size:13px; opacity:0.8;">Rewards: {te.entry.rewards
											.map((r) => (r.amount != null ? `${r.label} ${r.amount}` : r.label))
											.join(', ')}</p>
								{/if}
								{#each te.entry.postscripts as ps}
									<p style="font-size:12px; opacity:0.8;">{ps}</p>
								{/each}
								{#if isOwnCharacter(te.characterId)}
									<a href="/log" class="roster-name" style="font-size:13px;">Edit in your log &#8594;</a>
								{/if}
							</div>
						{/each}
					{/each}

					{#if timeline.unassigned.length > 0}
						<hr class="divider" />
						<strong>Unassigned Entries</strong>
						{#each timeline.unassigned as te}
							<div class="roster-row" style="flex-direction:column; align-items:stretch; margin-top:8px;">
								<div style="display:flex; justify-content:space-between; align-items:baseline;">
									<strong>{te.characterName}</strong>
									<span style="font-size:12px; opacity:0.8;">played by {te.playerName}</span>
								</div>
								{#if te.entry.title}<p style="font-size:13px;">{te.entry.title}</p>{/if}
								{#if te.entry.summary}<p style="margin-top:6px;">{te.entry.summary}</p>{/if}
								{#if isOwnCharacter(te.characterId)}
									<a href="/log" class="roster-name" style="font-size:13px;">Edit in your log &#8594;</a>
								{/if}
							</div>
						{/each}
					{/if}
				{/if}
			</div>
		</div>
	{/if}
</div>
