<script lang="ts">
	import { session } from '$lib/stores/session.svelte';
	import { api } from '$lib/services/api';
	import type { GodboundCharacter, CampaignSession } from '$lib/services/api';
	import { createDefaultSessionEntry, createDefaultNpc, createDefaultDivineGoal } from '$lib/utils/character';
	import { gameRules } from '$lib/stores/gameRules.svelte';
	import SplashHeader from '@ui/SplashHeader.svelte';
	import SaveBar from '$lib/components/SaveBar.svelte';

	let draft = $state<GodboundCharacter | null>(null);
	let saving = $state(false);
	let saveError = $state<string | null>(null);
	let saveSuccess = $state(false);
	let selectedSessionId = $state<string | null>(null);
	let campaignSessions = $state<CampaignSession[]>([]);

	$effect(() => {
		if (session.activeCharacter && !draft) {
			const loaded: GodboundCharacter = JSON.parse(JSON.stringify(session.activeCharacter));
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

	function dominionReward() {
		if (!selectedSession) return null;
		return selectedSession.rewards.find((r) => r.label === 'Dominion') ?? null;
	}

	function endSession() {
		if (!draft || !selectedSession) return;
		const earned = dominionReward()?.amount || 0;
		const confirmed = confirm(`End "${selectedSession.title || 'this session'}" and add ${earned} Dominion to your pool?`);
		if (!confirmed) return;
		draft.resources.dominion.total += earned;
		draft.resources.dominion.free += earned;
		selectedSession.current = false;
	}

	let showNewGoal = $state(false);
	let newGoalDesc = $state('');
	let newGoalDifficulty = $state('');

	function addGoal() {
		if (!draft || !newGoalDesc) return;
		const g = createDefaultDivineGoal();
		g.description = newGoalDesc;
		g.difficulty = newGoalDifficulty;
		draft.divineGoals = [...draft.divineGoals, g];
		showNewGoal = false;
		newGoalDesc = '';
		newGoalDifficulty = '';
	}

	function removeGoal(id: string) {
		if (!draft) return;
		draft.divineGoals = draft.divineGoals.filter((g) => g.id !== id);
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

	function rewardAmount(label: string): number {
		return selectedSession?.rewards.find((r) => r.label === label)?.amount ?? 0;
	}
	function setRewardAmount(label: string, amount: number) {
		if (!selectedSession) return;
		const existing = selectedSession.rewards.find((r) => r.label === label);
		if (existing) existing.amount = amount;
		else selectedSession.rewards = [...selectedSession.rewards, { label, amount }];
	}

	let newRewardItem = $state('');
	function addRewardItem() {
		if (!selectedSession || !newRewardItem) return;
		selectedSession.rewards = [...selectedSession.rewards, { label: newRewardItem }];
		newRewardItem = '';
	}
	function removeReward(i: number) {
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
			const updated = await api.character.update(draft.id, draft);
			draft = updated;
			session.activeCharacter = updated;
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
		<div class="prompt-card"><p><a href="/auth/login">Sign in</a> to view your chronicle.</p></div>
	{:else if !draft}
		<div class="prompt-card"><p>No active character. <a href="/characters">Create or select one</a>.</p></div>
	{:else}
		<SplashHeader title="Adventure" highlight="Log" subtitle="Chronicle of deeds" />

		<SaveBar {saving} {saveError} {saveSuccess} onSave={handleSave} />

		<div style="display:flex; justify-content:flex-end; margin-bottom:12px;">
			<button onclick={() => (showNewSession = !showNewSession)} class="gb-btn">+ New Entry</button>
		</div>

		{#if showNewSession}
			<div class="gb-panel">
				<div style="display:flex; gap:8px;">
					<input type="text" bind:value={newSessionTitle} placeholder="Session title" class="gb-input" />
					<input type="text" bind:value={newSessionDate} placeholder="In-world date" class="gb-input" />
				</div>
				<div class="modal-actions">
					<button onclick={addSession} disabled={!newSessionTitle} class="gb-btn">Create Entry</button>
					<button onclick={() => (showNewSession = false)} class="gb-btn secondary">Cancel</button>
				</div>
			</div>
		{/if}

		<div class="sheet-grid" style="grid-template-columns: 1fr 2fr;">
			<div class="sheet-col">
				<div class="gb-panel">
					<div class="gb-panel-header">Session Logs</div>
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
								<span class="session-number" class:current={s.id === selectedSessionId}>Session {s.number}</span>
								<span class="session-number">{s.realDate}</span>
							</div>
							<div class="session-title-sm" class:current={s.id === selectedSessionId}>{s.title}</div>
						</div>
					{/each}
				</div>

				<div class="gb-panel">
					<div style="display:flex; justify-content:space-between; align-items:center;">
						<div class="gb-panel-header" style="margin-bottom:0;">Divine Goals</div>
						<button onclick={() => (showNewGoal = !showNewGoal)} class="gb-btn secondary">+</button>
					</div>
					{#if showNewGoal}
						<div style="margin-top:10px;">
							<div class="field-group"><input type="text" bind:value={newGoalDesc} placeholder="Goal description" class="gb-input" /></div>
							<div class="field-group"><input type="text" bind:value={newGoalDifficulty} placeholder="Difficulty (optional)" class="gb-input" /></div>
							<div class="modal-actions">
								<button onclick={addGoal} disabled={!newGoalDesc} class="gb-btn">Add Goal</button>
								<button onclick={() => (showNewGoal = false)} class="gb-btn secondary">Cancel</button>
							</div>
						</div>
					{/if}
					{#each draft.divineGoals as goal}
						<div class="item-row">
							<input type="checkbox" bind:checked={goal.complete} />
							<div style="flex:1;">
								<div style="text-decoration: {goal.complete ? 'line-through' : 'none'};">{goal.description}</div>
								{#if goal.difficulty}<div style="font-size:11px; color:var(--muted-foreground);">Difficulty: {goal.difficulty}</div>{/if}
								{#if goal.completedInSession}<div style="font-size:11px; color:var(--gold-dim);">&#10022; Completed in: {goal.completedInSession}</div>{/if}
							</div>
							<button onclick={() => removeGoal(goal.id)} class="delete-btn">✕</button>
						</div>
					{/each}
				</div>
			</div>

			<div class="sheet-col">
				{#if selectedSession}
					<div class="gb-panel">
						<input type="text" bind:value={selectedSession.title} class="gb-input" style="font-family:var(--font-serif); font-size:22px; background:none; border:none; padding:0; margin-bottom:8px;" />
						<div style="display:flex; gap:16px; align-items:center; font-size:13px; color:var(--muted-foreground); margin-bottom:14px;">
							<span>{selectedSession.realDate}</span>
							<input type="text" bind:value={selectedSession.inWorldDate} placeholder="In-world date" class="gb-input" style="width:140px;" />
							<input type="text" bind:value={selectedSession.location} placeholder="Location" class="gb-input" style="width:160px;" />
							{#if campaignSessions.length > 0}
								<select bind:value={selectedSession.campaignSessionId} class="gb-input" style="width:180px;">
									<option value={null}>Not linked to a campaign session</option>
									{#each campaignSessions as cs}
										<option value={cs.id}>Session {cs.number}: {cs.title}</option>
									{/each}
								</select>
							{/if}
							{#if gameRules.enableDominionReminders && selectedSession.current}
								<button onclick={endSession} class="gb-btn secondary" style="margin-left:auto;">End Session</button>
							{/if}
						</div>

						<div class="card-grid">
							<div>
								<div style="display:flex; justify-content:space-between; align-items:center;">
									<div class="gb-panel-header" style="margin-bottom:0;">Major NPCs Encountered</div>
									<button onclick={() => (showNewNpc = !showNewNpc)} class="gb-btn secondary">+</button>
								</div>
								{#if showNewNpc}
									<div style="margin-top:8px;">
										<div class="field-group"><input type="text" bind:value={newNpcName} placeholder="NPC name" class="gb-input" /></div>
										<div class="field-group"><input type="text" bind:value={newNpcRole} placeholder="Title / role" class="gb-input" /></div>
										<div class="modal-actions">
											<button onclick={addNpc} disabled={!newNpcName} class="gb-btn">Add</button>
											<button onclick={() => (showNewNpc = false)} class="gb-btn secondary">Cancel</button>
										</div>
									</div>
								{/if}
								{#each selectedSession.npcs as npc}
									<div class="item-row">
										<div class="avatar">{npc.name.charAt(0).toUpperCase()}</div>
										<div style="flex:1;">
											<div>{npc.name}</div>
											<div style="font-size:11px; color:var(--muted-foreground);">{npc.role}</div>
										</div>
										<button onclick={() => removeNpc(npc.id)} class="delete-btn">✕</button>
									</div>
								{/each}
							</div>

							<div>
								<div class="gb-panel-header">Divine Spoils</div>
								<div class="hp-grid" style="margin-bottom:12px;">
									<div class="hp-box">
										<div class="hp-box-label">Wealth</div>
										<input type="number" class="hp-box-input" value={rewardAmount('Wealth')} oninput={(e) => setRewardAmount('Wealth', Number(e.currentTarget.value))} />
									</div>
									<div class="hp-box">
										<div class="hp-box-label">Dominion</div>
										<input type="number" class="hp-box-input" value={rewardAmount('Dominion')} oninput={(e) => setRewardAmount('Dominion', Number(e.currentTarget.value))} />
									</div>
								</div>
								{#each selectedSession.rewards as reward, i}
									{#if reward.label !== 'Wealth' && reward.label !== 'Dominion'}
										<span class="tag">{reward.label} <button onclick={() => removeReward(i)} class="tag-remove-btn">✕</button></span>
									{/if}
								{/each}
								<input
									type="text"
									bind:value={newRewardItem}
									placeholder="Add item and press Enter..."
									class="gb-input"
									style="margin-top:8px;"
									onkeydown={(e) => e.key === 'Enter' && addRewardItem()}
								/>
							</div>
						</div>

						<div style="margin-top:16px;">
							<div class="gb-panel-header">Summary of Deeds</div>
							<textarea bind:value={selectedSession.summary} class="gb-textarea" style="min-height:100px;"></textarea>
						</div>

						<div style="margin-top:16px;">
							<div class="gb-panel-header">Scribe's Postscript</div>
							{#each selectedSession.postscripts as ps}
								<div class="item-row"><span>{ps}</span></div>
							{/each}
							<textarea bind:value={newPostscript} placeholder="Add further notes to the ledger..." class="gb-textarea" style="margin-top:8px;"></textarea>
							<div style="display:flex; justify-content:flex-end; margin-top:10px;">
								<button onclick={appendPostscript} disabled={!newPostscript.trim()} class="ledger-append-btn">Append to Ledger</button>
							</div>
						</div>
					</div>
				{:else}
					<div class="gb-panel"><p>No session selected. Create one above.</p></div>
				{/if}
			</div>
		</div>
	{/if}
</div>
