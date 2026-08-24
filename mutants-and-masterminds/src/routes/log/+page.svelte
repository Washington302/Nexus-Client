<script lang="ts">
	import { session } from '$lib/stores/session.svelte';
	import { api } from '$lib/services/api';
	import type { MnmCharacter, CampaignSession } from '$lib/services/api';
	import { createDefaultSessionEntry, createDefaultNpc, prepareCharacterPayloadForSave } from '$lib/utils/character';
	import SplashHeader from '$lib/components/SplashHeader.svelte';

	let draft = $state<MnmCharacter | null>(null);
	let saving = $state(false);
	let saveError = $state<string | null>(null);
	let saveSuccess = $state(false);
	let selectedSessionId = $state<string | null>(null);
	let campaignSessions = $state<CampaignSession[]>([]);

	$effect(() => {
		if (session.activeCharacter && !draft) {
			const loaded: MnmCharacter = JSON.parse(JSON.stringify(session.activeCharacter));
			if (loaded.sessionLog == null) loaded.sessionLog = [];
			draft = loaded;
			const current = loaded.sessionLog.find((s) => s.current) ?? loaded.sessionLog[0];
			selectedSessionId = current?.id ?? null;
			if (loaded.campaignId) {
				api.campaign.get(loaded.campaignId).then((c) => (campaignSessions = c.sessions)).catch(() => {});
			}
		}
	});

	const selectedSession = $derived(draft?.sessionLog.find((s) => s.id === selectedSessionId) ?? null);

	let showNewSession = $state(false);
	let newSessionTitle = $state('');
	let newSessionDate = $state('');

	function addSession() {
		if (!draft) return;
		const s = createDefaultSessionEntry(draft.sessionLog.length + 1);
		s.title = newSessionTitle;
		s.realDate = newSessionDate;
		s.current = true;
		draft.sessionLog.forEach((existing) => (existing.current = false));
		draft.sessionLog = [...draft.sessionLog, s];
		selectedSessionId = s.id;
		showNewSession = false;
		newSessionTitle = '';
		newSessionDate = '';
	}

	function endSession() {
		if (!selectedSession) return;
		const confirmed = confirm(`End "${selectedSession.title || 'this session'}"?`);
		if (!confirmed) return;
		selectedSession.current = false;
	}

	let showNewNpc = $state(false);
	let newNpcName = $state('');
	let newNpcRole = $state('');

	function addNpc() {
		if (!selectedSession || !newNpcName) return;
		const npc = createDefaultNpc();
		npc.name = newNpcName;
		npc.role = newNpcRole;
		selectedSession.npcs = [...selectedSession.npcs, npc];
		showNewNpc = false;
		newNpcName = '';
		newNpcRole = '';
	}

	function removeNpc(id: string) {
		if (!selectedSession) return;
		selectedSession.npcs = selectedSession.npcs.filter((n) => n.id !== id);
	}

	let newLootItem = $state('');
	function addLootItem() {
		if (!selectedSession || !newLootItem) return;
		selectedSession.rewards = [...selectedSession.rewards, { label: newLootItem }];
		newLootItem = '';
	}
	function removeLootItem(i: number) {
		if (!selectedSession) return;
		selectedSession.rewards = selectedSession.rewards.filter((_, idx) => idx !== i);
	}

	let newPostscript = $state('');
	function appendPostscript() {
		if (!selectedSession || !newPostscript.trim()) return;
		const timestamp = new Date().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
		selectedSession.postscripts = [...selectedSession.postscripts, `${timestamp} — ${newPostscript.trim()}`];
		newPostscript = '';
	}

	async function handleSave() {
		if (!draft) return;
		saving = true;
		saveError = null;
		saveSuccess = false;
		try {
			const payload = prepareCharacterPayloadForSave(draft);
			const updated = await api.character.update(draft.id, payload);
			draft = updated;
			if (session.activeCharacter) {
				Object.assign(session.activeCharacter, updated);
			}
			const idx = session.characters.findIndex((c) => c.id === updated.id);
			if (idx >= 0) session.characters[idx] = updated;
			saveSuccess = true;
			setTimeout(() => (saveSuccess = false), 2000);
		} catch (e) {
			saveError = (e as Error).message;
		} finally {
			saving = false;
		}
	}
</script>

<div class="page">
	{#if !session.userId}
		<div class="prompt-card"><p><a href="/auth/login">Sign in</a> to view your session log.</p></div>
	{:else if !draft}
		<div class="prompt-card"><p>No active character. <a href="/characters">Create or select one</a>.</p></div>
	{:else}
		<SplashHeader title="Session " highlight="Log" subtitle="A record of your adventures" />

		<div class="save-bar-simple">
			<button onclick={handleSave} disabled={saving} class="comic-btn">
				{saving ? 'Saving...' : 'Save Log'}
			</button>
			{#if saveError}<span class="save-error">{saveError}</span>{/if}
			{#if saveSuccess}<span class="save-success">Saved!</span>{/if}
		</div>

		<div style="display:flex; justify-content:flex-end; margin-bottom:12px;">
			<button onclick={() => (showNewSession = !showNewSession)} class="comic-btn secondary">+ New Entry</button>
		</div>

		{#if showNewSession}
			<div class="panel-full" style="margin-bottom:14px;">
				<div class="panel-body">
					<div style="display:flex; gap:8px;">
						<input type="text" bind:value={newSessionTitle} placeholder="Session title" class="input-demo" />
						<input type="text" bind:value={newSessionDate} placeholder="In-world date" class="input-demo" />
					</div>
					<div style="display:flex; gap:8px; margin-top:10px;">
						<button onclick={addSession} disabled={!newSessionTitle} class="comic-btn">Create Entry</button>
						<button onclick={() => (showNewSession = false)} class="comic-btn secondary">Cancel</button>
					</div>
				</div>
			</div>
		{/if}

		<div class="panel-grid" style="grid-template-columns: 1fr 2fr; align-items:start;">
			<div class="panel-full">
				<div class="panel-header"><span class="panel-label">Session Logs</span></div>
				<div class="panel-body">
					{#each draft.sessionLog as s}
						<div
							class="session-list-item"
							class:current={s.id === selectedSessionId}
							onclick={() => (selectedSessionId = s.id)}
							onkeydown={(e) => e.key === 'Enter' && (selectedSessionId = s.id)}
							role="button"
							tabindex="0"
						>
							<div style="display:flex; justify-content:space-between;">
								<span class="session-number">Session {s.number}</span>
								<span class="session-number">{s.realDate}</span>
							</div>
							<div class="session-title-sm">{s.title}</div>
						</div>
					{/each}
					{#if draft.sessionLog.length === 0}
						<p style="font-size:14px; color:var(--accent);">No sessions logged yet.</p>
					{/if}
				</div>
			</div>

			<div class="panel-full">
				{#if selectedSession}
					<div class="panel-header"><span class="panel-label">{selectedSession.title || 'Untitled Session'}</span></div>
					<div class="panel-body">
						<input type="text" bind:value={selectedSession.title} class="input-demo" style="margin-bottom:8px;" placeholder="Session title" />
						<div style="display:flex; gap:16px; align-items:center; margin-bottom:14px;">
							<span class="session-number">{selectedSession.realDate}</span>
							<input type="text" bind:value={selectedSession.location} placeholder="Location" class="input-demo" style="width:200px;" />
							{#if campaignSessions.length > 0}
								<select bind:value={selectedSession.campaignSessionId} class="input-demo" style="width:200px;">
									<option value={null}>Not linked to a campaign session</option>
									{#each campaignSessions as cs}
										<option value={cs.id}>Session {cs.number}: {cs.title}</option>
									{/each}
								</select>
							{/if}
							{#if selectedSession.current}
								<button onclick={endSession} class="comic-btn secondary" style="margin-left:auto;">End Session</button>
							{/if}
						</div>

						<div class="card-grid">
							<div>
								<div style="display:flex; justify-content:space-between; align-items:center;">
									<div class="field-hdr">Major NPCs Encountered</div>
									<button onclick={() => (showNewNpc = !showNewNpc)} class="comic-btn secondary">+</button>
								</div>
								{#if showNewNpc}
									<div style="margin-top:8px;">
										<div class="field-group"><input type="text" bind:value={newNpcName} placeholder="NPC name" class="input-demo" /></div>
										<div class="field-group"><input type="text" bind:value={newNpcRole} placeholder="Title / role" class="input-demo" /></div>
										<div style="display:flex; gap:8px;">
											<button onclick={addNpc} disabled={!newNpcName} class="comic-btn">Add</button>
											<button onclick={() => (showNewNpc = false)} class="comic-btn secondary">Cancel</button>
										</div>
									</div>
								{/if}
								{#each selectedSession.npcs as npc}
									<div class="npc-row">
										<div class="avatar">{npc.name.charAt(0).toUpperCase()}</div>
										<div style="flex:1;">
											<div>{npc.name}</div>
											<div style="font-size:11px; color:var(--accent);">{npc.role}</div>
										</div>
										<button onclick={() => removeNpc(npc.id)} class="delete-btn">✕</button>
									</div>
								{/each}
							</div>

							<div>
								<div class="field-hdr">Loot &amp; Rewards</div>
								{#each selectedSession.rewards as reward, i}
									<span class="tag">{reward.label} <button onclick={() => removeLootItem(i)} class="tag-remove-btn">✕</button></span>
								{/each}
								<input
									type="text"
									bind:value={newLootItem}
									placeholder="Add item and press Enter..."
									class="input-demo"
									style="margin-top:8px;"
									onkeydown={(e) => e.key === 'Enter' && addLootItem()}
								/>
							</div>
						</div>

						<div style="margin-top:16px;">
							<div class="field-hdr">Summary of Events</div>
							<textarea bind:value={selectedSession.summary} class="input-demo" style="min-height:100px; resize:vertical;"></textarea>
						</div>

						<div style="margin-top:16px;">
							<div class="field-hdr">GM Notes</div>
							{#each selectedSession.postscripts as ps}
								<div class="npc-row"><span>{ps}</span></div>
							{/each}
							<textarea bind:value={newPostscript} placeholder="Add further notes..." class="input-demo" style="margin-top:8px; resize:vertical;"></textarea>
							<div style="display:flex; justify-content:flex-end; margin-top:10px;">
								<button onclick={appendPostscript} disabled={!newPostscript.trim()} class="comic-btn">Append Note</button>
							</div>
						</div>
					</div>
				{:else}
					<div class="panel-body"><p>No session selected. Create one above.</p></div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.page {
		max-width: 1100px;
		margin: 0 auto;
		padding: 20px;
	}
	.save-bar-simple {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 14px;
	}
	.save-error { color: var(--danger); font-size: 13px; }
	.save-success { color: var(--success); font-size: 13px; }
	.session-list-item {
		padding: 10px;
		border: 2px solid var(--border);
		margin-bottom: 8px;
		cursor: pointer;
		background: var(--newsprint);
	}
	.session-list-item.current { border-color: var(--primary); }
	.session-number { font-size: 12px; color: var(--accent); }
	.session-title-sm { font-weight: 600; }
	.npc-row {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 0;
		border-bottom: 1px solid var(--border);
	}
	.tag {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 8px;
		margin: 4px 4px 0 0;
		background: var(--newsprint);
		border: 2px solid var(--border);
		font-size: 13px;
	}
	.tag-remove-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--accent);
	}
	.tag-remove-btn:hover { color: var(--danger); }
</style>
