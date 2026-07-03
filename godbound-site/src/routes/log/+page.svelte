<script lang="ts">
	import { session } from '$lib/stores/session.svelte';
	import { api } from '$lib/services/api';
	import type { GodboundCharacter } from '$lib/services/api';
	import { createDefaultSession, createDefaultNpc, createDefaultDivineGoal } from '$lib/utils/character';
	import SplashHeader from '$lib/components/SplashHeader.svelte';
	import SaveBar from '$lib/components/SaveBar.svelte';

	let draft = $state<GodboundCharacter | null>(null);
	let saving = $state(false);
	let saveError = $state<string | null>(null);
	let saveSuccess = $state(false);
	let selectedSessionId = $state<string | null>(null);

	$effect(() => {
		if (session.activeCharacter && !draft) {
			const loaded: GodboundCharacter = JSON.parse(JSON.stringify(session.activeCharacter));
			draft = loaded;
			const current = loaded.sessions.find((s) => s.current) ?? loaded.sessions[0];
			selectedSessionId = current?.id ?? null;
		}
	});

	const selectedSession = $derived(draft?.sessions.find((s) => s.id === selectedSessionId) ?? null);

	let showNewSession = $state(false);
	let newSessionTitle = $state('');
	let newSessionDate = $state('');

	function addSession() {
		if (!draft) return;
		const s = createDefaultSession(draft.sessions.length + 1);
		s.title = newSessionTitle;
		s.realDate = newSessionDate;
		draft.sessions = [...draft.sessions, s];
		selectedSessionId = s.id;
		showNewSession = false;
		newSessionTitle = '';
		newSessionDate = '';
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
		npc.sessionId = selectedSession.id;
		selectedSession.npcs = [...selectedSession.npcs, npc];
		showNewNpc = false;
		newNpcName = '';
		newNpcRole = '';
	}

	function removeNpc(id: string) {
		if (!selectedSession) return;
		selectedSession.npcs = selectedSession.npcs.filter((n) => n.id !== id);
	}

	let newSpoilItem = $state('');
	function addSpoilItem() {
		if (!selectedSession || !newSpoilItem) return;
		selectedSession.spoils.items = [...selectedSession.spoils.items, newSpoilItem];
		newSpoilItem = '';
	}
	function removeSpoilItem(i: number) {
		if (!selectedSession) return;
		selectedSession.spoils.items = selectedSession.spoils.items.filter((_, idx) => idx !== i);
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
					{#each draft.sessions as s}
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
							<div class="session-title-sm">{s.title}</div>
							{#if s.completedGoals.length}
								<div style="font-size:12px; color:var(--gold-dim);">&#10022; {s.completedGoals.length} goal(s) completed</div>
							{/if}
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
						<div style="display:flex; gap:16px; font-size:13px; color:var(--muted-foreground); margin-bottom:14px;">
							<span>{selectedSession.realDate}</span>
							<input type="text" bind:value={selectedSession.era} placeholder="Era" class="gb-input" style="width:140px;" />
							<input type="text" bind:value={selectedSession.location} placeholder="Location" class="gb-input" style="width:160px;" />
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
								<div style="display:flex; gap:8px; margin-bottom:8px;">
									<div class="field-group" style="margin:0; flex:1;">
										<label class="field-label" for="spoils-wealth">Wealth</label>
										<input id="spoils-wealth" type="number" bind:value={selectedSession.spoils.wealth} class="gb-input" />
									</div>
									<div class="field-group" style="margin:0; flex:1;">
										<label class="field-label" for="spoils-dominion">Dominion</label>
										<input id="spoils-dominion" type="number" bind:value={selectedSession.spoils.dominion} class="gb-input" />
									</div>
								</div>
								{#each selectedSession.spoils.items as item, i}
									<span class="tag">{item} <button onclick={() => removeSpoilItem(i)} style="background:none; border:none; color:inherit; cursor:pointer;">✕</button></span>
								{/each}
								<input
									type="text"
									bind:value={newSpoilItem}
									placeholder="Add item and press Enter..."
									class="gb-input"
									style="margin-top:8px;"
									onkeydown={(e) => e.key === 'Enter' && addSpoilItem()}
								/>
							</div>
						</div>

						<div style="margin-top:16px;">
							<div class="gb-panel-header">Summary of Deeds</div>
							<textarea bind:value={selectedSession.summary} class="gb-textarea" style="min-height:100px;"></textarea>
						</div>

						{#if selectedSession.postscripts.length}
							<div style="margin-top:16px;">
								<div class="gb-panel-header">Postscripts</div>
								{#each selectedSession.postscripts as ps}
									<div class="item-row"><span>{ps}</span></div>
								{/each}
							</div>
						{/if}
					</div>
				{:else}
					<div class="gb-panel"><p>No session selected. Create one above.</p></div>
				{/if}
			</div>
		</div>
	{/if}
</div>
