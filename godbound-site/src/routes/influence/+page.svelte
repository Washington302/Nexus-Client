<script lang="ts">
	import { session } from '$lib/stores/session.svelte';
	import { api } from '$lib/services/api';
	import type { GodboundCharacter } from '$lib/services/api';
	import { createDefaultInfluenceProject, createDefaultRealmChange, realmChangeCost } from '$lib/utils/character';
	import SplashHeader from '$lib/components/SplashHeader.svelte';
	import SaveBar from '$lib/components/SaveBar.svelte';

	let draft = $state<GodboundCharacter | null>(null);
	let saving = $state(false);
	let saveError = $state<string | null>(null);
	let saveSuccess = $state(false);

	$effect(() => {
		if (session.activeCharacter && !draft) {
			draft = JSON.parse(JSON.stringify(session.activeCharacter));
		}
	});

	let showNewProject = $state(false);
	let newProjectName = $state('');
	let newProjectDesc = $state('');
	let newProjectCost = $state(0);
	let newProjectTags = $state('');

	let influenceNote = $state<string | null>(null);

	function addProject() {
		if (!draft) return;
		if (newProjectCost > draft.resources.influence.free) {
			influenceNote = 'Not enough free Influence to establish this bond.';
			return;
		}
		const p = createDefaultInfluenceProject();
		p.name = newProjectName;
		p.description = newProjectDesc;
		p.cost = newProjectCost;
		p.tags = newProjectTags.split(',').map((t) => t.trim()).filter(Boolean);
		draft.influenceProjects = [...draft.influenceProjects, p];
		draft.resources.influence.free -= newProjectCost;
		influenceNote = null;
		showNewProject = false;
		newProjectName = '';
		newProjectDesc = '';
		newProjectCost = 0;
		newProjectTags = '';
	}

	function removeProject(id: string) {
		if (!draft) return;
		const project = draft.influenceProjects.find((p) => p.id === id);
		if (project) {
			draft.resources.influence.free = Math.min(draft.resources.influence.total, draft.resources.influence.free + project.cost);
		}
		draft.influenceProjects = draft.influenceProjects.filter((p) => p.id !== id);
	}

	let newChangeTitle = $state('');
	let newChangeDesc = $state('');
	let newChangeScale = $state<'Point' | 'Village' | 'City' | 'Nation' | 'World'>('Point');
	let newChangeComplexity = $state<'Simple' | 'Plausible' | 'Difficult' | 'Improbable' | 'Impossible'>('Simple');

	const newChangeCost = $derived(realmChangeCost(newChangeScale, newChangeComplexity));

	function addRealmChange() {
		if (!draft || !newChangeTitle) return;
		const rc = createDefaultRealmChange();
		rc.name = newChangeTitle;
		rc.description = newChangeDesc;
		rc.scale = newChangeScale;
		rc.complexity = newChangeComplexity;
		rc.cost = newChangeCost;
		draft.realmChanges = [...draft.realmChanges, rc];
		newChangeTitle = '';
		newChangeDesc = '';
	}

	function removeRealmChange(id: string) {
		if (!draft) return;
		const change = draft.realmChanges.find((c) => c.id === id);
		if (change?.spent) {
			draft.resources.dominion.free = Math.min(draft.resources.dominion.total, draft.resources.dominion.free + change.spent);
		}
		draft.realmChanges = draft.realmChanges.filter((c) => c.id !== id);
	}

	let investAmounts = $state<Record<string, number>>({});
	let realmChangeNote = $state<string | null>(null);

	function investInRealmChange(id: string) {
		if (!draft) return;
		const change = draft.realmChanges.find((c) => c.id === id);
		if (!change) return;
		const amount = investAmounts[id] ?? 0;
		if (amount <= 0) return;
		if (amount > draft.resources.dominion.free) {
			realmChangeNote = 'Not enough available Dominion to invest that much.';
			return;
		}
		change.spent = (change.spent ?? 0) + amount;
		draft.resources.dominion.free -= amount;
		investAmounts[id] = 0;
		realmChangeNote = null;
	}

	function setRealmChangeStatus(id: string, status: 'draft' | 'ongoing' | 'complete') {
		if (!draft) return;
		const rc = draft.realmChanges.find((c) => c.id === id);
		if (rc) rc.status = status;
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
		<div class="prompt-card"><p><a href="/auth/login">Sign in</a> to view your influence.</p></div>
	{:else if !draft}
		<div class="prompt-card"><p>No active character. <a href="/characters">Create or select one</a>.</p></div>
	{:else}
		<SplashHeader title="Dominion" highlight="&amp; Influence" subtitle="Your reach over the mortal realm" />

		<SaveBar {saving} {saveError} {saveSuccess} onSave={handleSave} />

		<div class="card-grid">
			<div class="stat-card">
				<div class="stat-card-label">Divine Agency</div>
				<div class="stat-card-title">Dominion</div>
				<div class="stat-card-row">
					<div class="field-group" style="margin:0; flex:1;">
						<label class="field-label" for="dom-total">Total Earned</label>
						<input id="dom-total" type="number" bind:value={draft.resources.dominion.total} class="gb-input" />
					</div>
					<div class="field-group" style="margin:0; flex:1;">
						<label class="field-label" for="dom-free">Available</label>
						<input id="dom-free" type="number" value={draft.resources.dominion.free} readonly class="gb-input" style="opacity:0.7; cursor:not-allowed;" />
					</div>
				</div>
			</div>
			<div class="stat-card">
				<div class="stat-card-label">Temporal Sway</div>
				<div class="stat-card-title">Influence</div>
				<div class="stat-card-row">
					<div class="field-group" style="margin:0; flex:1;">
						<label class="field-label" for="inf-total">Max Influence</label>
						<input id="inf-total" type="number" bind:value={draft.resources.influence.total} class="gb-input" />
					</div>
					<div class="field-group" style="margin:0; flex:1;">
						<label class="field-label" for="inf-free">Uncommitted</label>
						<input id="inf-free" type="number" value={draft.resources.influence.free} readonly class="gb-input" style="opacity:0.7; cursor:not-allowed;" />
					</div>
				</div>
			</div>
		</div>

		<div class="gb-panel">
			<div style="display:flex; justify-content:space-between; align-items:center;">
				<div class="gb-panel-header" style="margin-bottom:0;">Influence Projects</div>
				<button onclick={() => (showNewProject = !showNewProject)} class="gb-btn secondary">+ New</button>
			</div>

			{#if showNewProject}
				<div style="margin-top:12px; padding:12px; border:1px solid var(--border); border-radius:var(--radius);">
					<div class="field-group"><input type="text" bind:value={newProjectName} placeholder="Project name" class="gb-input" /></div>
					<div class="field-group"><input type="text" bind:value={newProjectDesc} placeholder="Description" class="gb-input" /></div>
					<div class="field-group"><input type="number" bind:value={newProjectCost} placeholder="Cost" class="gb-input" /></div>
					<div class="field-group"><input type="text" bind:value={newProjectTags} placeholder="Tags (comma-separated)" class="gb-input" /></div>
					<div class="modal-actions">
						<button onclick={addProject} disabled={!newProjectName || newProjectCost > draft.resources.influence.free} class="gb-btn">Establish Bond</button>
						<button onclick={() => (showNewProject = false)} class="gb-btn secondary">Cancel</button>
					</div>
				</div>
			{/if}

			{#if influenceNote}
				<p class="error-box" style="margin-top:12px;">{influenceNote}</p>
			{/if}

			{#each draft.influenceProjects as project}
				<div class="item-row" style="flex-direction:column; align-items:stretch;">
					<div style="display:flex; justify-content:space-between;">
						<strong>{project.name}</strong>
						<div>
							<span style="color:var(--gold-bright);">{project.cost} Influence</span>
							<button onclick={() => removeProject(project.id)} class="delete-btn" style="margin-left:8px;">✕</button>
						</div>
					</div>
					<p style="font-size:13px; color:var(--muted-foreground);">{project.description}</p>
					{#each project.tags as tag}<span class="tag">{tag}</span>{/each}
				</div>
			{/each}
		</div>

		<div class="gb-panel">
			<div class="gb-panel-header">Changes to the Realm</div>
			{#if realmChangeNote}
				<p class="error-box">{realmChangeNote}</p>
			{/if}
			{#each draft.realmChanges.filter((c) => c.status === 'ongoing') as change}
				<div class="item-row" style="flex-direction:column; align-items:stretch;">
					<strong>{change.name}</strong>
					<p style="font-size:13px; color:var(--muted-foreground);">{change.description}</p>
					<div style="display:flex; gap:16px; font-size:12px; color:var(--muted-foreground);">
						<span>Scale: {change.scale}</span>
						<span>Complexity: {change.complexity}</span>
						<span>{change.spent ?? 0} / {change.cost} Dominion invested</span>
					</div>
					<div class="progress-bar">
						<div class="progress-bar-fill" style="width:{Math.min(100, ((change.spent ?? 0) / change.cost) * 100)}%"></div>
					</div>
					<div style="display:flex; gap:8px; align-items:center;">
						<input
							type="number"
							min="0"
							placeholder="Invest this session..."
							class="gb-input"
							style="flex:1;"
							bind:value={investAmounts[change.id]}
						/>
						<button onclick={() => investInRealmChange(change.id)} class="gb-btn secondary">Invest</button>
					</div>
					<div class="modal-actions">
						<button
							onclick={() => setRealmChangeStatus(change.id, 'complete')}
							disabled={(change.spent ?? 0) < change.cost}
							class="gb-btn secondary"
						>
							Mark Complete
						</button>
						<button onclick={() => removeRealmChange(change.id)} class="delete-btn">Delete</button>
					</div>
				</div>
			{/each}

			<div class="card-grid" style="margin-top:12px;">
				{#each draft.realmChanges.filter((c) => c.status === 'complete') as change}
					<div class="item-row" style="flex-direction:column; align-items:stretch;">
						<strong style="color:var(--success);">&#10003; {change.name}</strong>
						<p style="font-size:12px; color:var(--muted-foreground);">{change.scale} &bull; {change.complexity}</p>
					</div>
				{/each}
				{#each draft.realmChanges.filter((c) => c.status === 'draft') as change}
					<div class="item-row" style="flex-direction:column; align-items:stretch; border:1px dashed var(--border); padding:10px; border-radius:var(--radius);">
						<strong style="color:var(--gold-bright);">{change.name}</strong>
						<p style="font-size:12px; color:var(--muted-foreground);">{change.scale} &bull; {change.complexity} &bull; {change.cost} Dominion</p>
						<div class="modal-actions">
							<button onclick={() => setRealmChangeStatus(change.id, 'ongoing')} class="gb-btn secondary">Start</button>
							<button onclick={() => removeRealmChange(change.id)} class="delete-btn">Delete</button>
						</div>
					</div>
				{/each}
			</div>

			<hr class="divider" />
			<div class="gb-panel-header">Chronicle a Divine Act</div>
			<div class="field-group"><input type="text" bind:value={newChangeTitle} placeholder="Title" class="gb-input" /></div>
			<div class="field-group"><input type="text" bind:value={newChangeDesc} placeholder="Description" class="gb-input" /></div>
			<div style="display:flex; gap:8px; margin-bottom:10px;">
				<select bind:value={newChangeScale} class="gb-select" style="flex:1;">
					<option value="Point">Point (1)</option>
					<option value="Village">Village (2)</option>
					<option value="City">City (6)</option>
					<option value="Nation">Nation (12)</option>
					<option value="World">World (24)</option>
				</select>
				<select bind:value={newChangeComplexity} class="gb-select" style="flex:1;">
					<option value="Simple">Simple (&times;1)</option>
					<option value="Plausible">Plausible (&times;2)</option>
					<option value="Difficult">Difficult (&times;4)</option>
					<option value="Improbable">Improbable (&times;8)</option>
					<option value="Impossible">Impossible (&times;16)</option>
				</select>
			</div>
			<div style="display:flex; justify-content:space-between; align-items:center;">
				<span>Total Cost: <strong style="color:var(--gold-bright);">{newChangeCost}</strong></span>
				<button onclick={addRealmChange} disabled={!newChangeTitle} class="gb-btn">Manifest</button>
			</div>
		</div>
	{/if}
</div>
