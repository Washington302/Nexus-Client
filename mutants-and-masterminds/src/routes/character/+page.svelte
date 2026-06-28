<script lang="ts">
	import { session } from '$lib/stores/session.svelte';
	import { api } from '$lib/services/api';
	import type { MnmCharacter } from '$lib/services/api';
	import SplashHeader from '$lib/components/SplashHeader.svelte';
	import ComicPanel from '$lib/components/ComicPanel.svelte';
	import StatBubble from '$lib/components/StatBubble.svelte';
	import SkillTable from '$lib/components/SkillTable.svelte';
	import PillBadge from '$lib/components/PillBadge.svelte';
	import ConditionPip from '$lib/components/ConditionPip.svelte';
	import EditableWrapper from '$lib/components/EditableWrapper.svelte';
	import AbilitiesEditor from '$lib/components/editors/AbilitiesEditor.svelte';
	import DefensesEditor from '$lib/components/editors/DefensesEditor.svelte';
	import SkillsEditor from '$lib/components/editors/SkillsEditor.svelte';
	import AdvantagesEditor from '$lib/components/editors/AdvantagesEditor.svelte';
	import PowersEditor from '$lib/components/editors/PowersEditor.svelte';
	import ComplicationsEditor from '$lib/components/editors/ComplicationsEditor.svelte';
	import EquipmentEditor from '$lib/components/editors/EquipmentEditor.svelte';
	import HeadquartersEditor from '$lib/components/editors/HeadquartersEditor.svelte';
	import PowerPointsEditor from '$lib/components/editors/PowerPointsEditor.svelte';

	let draft = $state<MnmCharacter>(null!);
	let saving = $state(false);
	let saveError = $state<string | null>(null);
	let saveSuccess = $state(false);
	let autosaveDirty = $state(false);
	let originalSnapshot = $state<string | null>(null);
	let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
	let shareCopied = $state(false);

	type SectionKey = 'skills' | 'advantages' | 'equipment' | 'powers';
	let priorityOrder = $state<SectionKey[]>([]);

	$effect(() => {
		if (draft && priorityOrder.length === 0) {
			const weights: Record<SectionKey, number> = {
				skills: (draft.skills?.length ?? 0) + (draft.spentSkills ?? 0),
				advantages: (draft.advantages?.length ?? 0) + (draft.spentAdvantages ?? 0),
				equipment: (draft.equipmentPool?.items?.length ?? 0) + (draft.equipmentPool?.epSpent ?? 0) + (draft.headquarters?.length ?? 0) * 5,
				powers: (draft.powers?.length ?? 0) + (draft.spentPowers ?? 0),
			};
			priorityOrder = (['skills', 'advantages', 'equipment', 'powers'] as SectionKey[]).sort((a, b) => weights[b] - weights[a]);
		}
	});

	function movePriority(from: number, to: number) {
		if (to < 0 || to >= priorityOrder.length) return;
		const arr = [...priorityOrder];
		const [removed] = arr.splice(from, 1);
		arr.splice(to, 0, removed);
		priorityOrder = arr;
	}

	function scheduleAutosave() {
		if (autosaveTimer) clearTimeout(autosaveTimer);
		autosaveDirty = true;
		autosaveTimer = setTimeout(() => {
			if (draft && !saving) {
				saveCharacter();
			}
		}, 15000);
	}

	function cancelAutosave() {
		if (autosaveTimer) { clearTimeout(autosaveTimer); autosaveTimer = null; }
		autosaveDirty = false;
	}

	$effect(() => {
		const c = session.activeCharacter;
		if (c) {
			const d = JSON.parse(JSON.stringify(c));
			if (d.abilities == null) d.abilities = {};
			if (d.defenses == null) d.defenses = {};
			if (d.skills == null) d.skills = [];
			if (d.advantages == null) d.advantages = [];
			if (d.powers == null) d.powers = [];
			if (d.complications == null) d.complications = [];
			if (d.equipmentPool == null) d.equipmentPool = { totalEpAllowed: 0, epSpent: 0, items: [] };
			if (d.headquarters == null) d.headquarters = [];

			// Normalize Jackson property names from Lombok is-prefix fields
			if (d.powers) {
				for (const p of d.powers) {
					if ('array' in p && !('isArray' in p)) p.isArray = p.array;
					if (p.effects) {
						for (const e of p.effects) {
							if ('primary' in e && !('isPrimary' in e)) e.isPrimary = e.primary;
							if (e.modifiers) {
								for (const m of e.modifiers) {
									if ('flat' in m && !('isFlat' in m)) m.isFlat = m.flat;
								}
							}
						}
					}
					if (p.alternateEffects) {
						for (const a of p.alternateEffects) {
							if (a.effects) {
								for (const e of a.effects) {
									if ('primary' in e && !('isPrimary' in e)) e.isPrimary = e.primary;
									if (e.modifiers) {
										for (const m of e.modifiers) {
											if ('flat' in m && !('isFlat' in m)) m.isFlat = m.flat;
										}
									}
								}
							}
						}
					}
					delete p.array;
				}
			}

			const abKeys = ['strength','stamina','agility','dexterity','fighting','intellect','awareness','presence'] as const;
			for (const k of abKeys) {
				const finalKey = k + 'FinalValue';
				if (d.abilities[finalKey] == null) d.abilities[finalKey] = 0;
			}
			const defKeys = ['dodge','parry','fortitude','toughness','will'] as const;
			for (const k of defKeys) {
				const finalKey = k + 'FinalValue';
				if (d.defenses[finalKey] == null) d.defenses[finalKey] = 0;
			}
			// Auto-compute power costs
			if (d.powers) {
			function effectCost(e: any): number {
				let perRank = e.baseCostPerRank ?? 2;
				let flat = 0;
				for (const m of e.modifiers ?? []) {
					if (m.isFlat) {
						flat += m.type === 'FLAW' ? -m.costModifier : m.costModifier;
					} else {
						perRank += m.type === 'FLAW' ? -m.costModifier : m.costModifier;
					}
				}
				return perRank * (e.rank ?? 0) + flat;
			}
			function perRankCost(e: any): number {
				let perRank = e.baseCostPerRank ?? 2;
				for (const m of e.modifiers ?? []) {
					if (!m.isFlat) {
						perRank += m.type === 'FLAW' ? -m.costModifier : m.costModifier;
					}
				}
				return perRank;
			}
			for (const p of d.powers) {
				const active = (p.effects ?? []).reduce((sum: number, e: any) => sum + effectCost(e), 0);
				const alts = (p.alternateEffects ?? []).reduce((sum: number, a: any) => {
					const altActive = (a.effects ?? []).reduce((s: number, e: any) => s + effectCost(e), 0);
					return Math.max(sum, altActive);
				}, 0);
				p.totalPowerCost = Math.max(active, alts) + (p.alternateEffects?.length ?? 0);
				for (const e of p.effects ?? []) {
					e.calculatedCost = effectCost(e);
				}
				for (const a of p.alternateEffects ?? []) {
					a.costPerRank = (a.effects ?? []).reduce((sum: number, e: any) => sum + perRankCost(e), 0);
					a.currentAllocatedRank = a.effects[0]?.rank ?? 0;
					for (const e of a.effects ?? []) {
						e.calculatedCost = effectCost(e);
					}
				}
			}
			}

			draft = d;
			originalSnapshot = JSON.stringify(d);
			autosaveDirty = false;
		}
	});

	$effect(() => {
		if (!draft || originalSnapshot === null) return;
		const current = JSON.stringify(draft);
		if (current !== originalSnapshot) {
			scheduleAutosave();
		}
	});

	function abilityMod(val: number): string {
		const mod = Math.floor((val - 10) / 2);
		return mod >= 0 ? '+' + mod : String(mod);
	}

	function shareCharacter() {
		if (!draft) return;
		const json = JSON.stringify(draft);
		const encoded = btoa(encodeURIComponent(json));
		const url = `${window.location.origin}/share/${encoded}`;
		navigator.clipboard.writeText(url).then(() => {
			shareCopied = true;
			setTimeout(() => shareCopied = false, 2000);
		});
	}

	async function saveCharacter() {
		if (!draft) return;
		saving = true;
		saveError = null;
		saveSuccess = false;
		try {
			const payload = JSON.parse(JSON.stringify(draft));
			delete payload.createdAt;
			delete payload.updatedAt;
			if (payload.abilities) {
				for (const k of Object.keys(payload.abilities)) {
					if (typeof payload.abilities[k] === 'object') delete payload.abilities[k];
				}
			}
			if (payload.defenses) {
				for (const k of Object.keys(payload.defenses)) {
					if (typeof payload.defenses[k] === 'object') delete payload.defenses[k];
				}
			}
			// Strip Jackson-derived property names and ensure is-prefix versions are present
			for (const p of (payload.powers || [])) {
				delete p.array;
				if (typeof p.isArray !== 'boolean') p.isArray = false;
				for (const e of (p.effects || [])) {
					delete e.primary;
					if (typeof e.isPrimary !== 'boolean') e.isPrimary = false;
					for (const m of (e.modifiers || [])) {
						delete m.flat;
						if (typeof m.isFlat !== 'boolean') m.isFlat = false;
					}
				}
				for (const a of (p.alternateEffects || [])) {
					for (const e of (a.effects || [])) {
						delete e.primary;
						if (typeof e.isPrimary !== 'boolean') e.isPrimary = false;
						for (const m of (e.modifiers || [])) {
							delete m.flat;
							if (typeof m.isFlat !== 'boolean') m.isFlat = false;
						}
					}
				}
			}
			// Strip client-only fields before sending to backend
			const updated = await api.character.update(draft.id, payload);
			if (session.activeCharacter) {
				Object.assign(session.activeCharacter, updated);
			}
			originalSnapshot = JSON.stringify(draft);
			cancelAutosave();
			saveSuccess = true;
			setTimeout(() => saveSuccess = false, 2000);
		} catch (e) {
			saveError = (e as Error).message;
		} finally {
			saving = false;
		}
	}
</script>

{#if draft}
<div class="comic-wrap">
	<SplashHeader title="Unofficial " highlight="Mutants &amp; Masterminds" subtitle="Superhero Roleplaying · Character Sheet" />

	<div class="speech-bubble">
		&#9733; The tactical interface — built for heroes who need data <em>fast</em>. &#9733;
	</div>

	<div class="panel-grid-3">
		<ComicPanel header="&#9733; Identity" color="blue">
			<div class="field-group">
				<div class="field-hdr">Hero Name</div>
				<input class="input-demo" bind:value={draft.name} placeholder="Hero Name" />
			</div>
			<div class="field-group">
				<div class="field-hdr">Identity</div>
				<select class="input-demo" bind:value={draft.identity}>
					<option value="SECRET">Secret</option>
					<option value="PUBLIC">Public</option>
					<option value="DUAL">Dual</option>
				</select>
			</div>
			<div class="grid-2">
				<div class="field-group">
					<div class="field-hdr">Gender</div>
					<input class="input-demo" bind:value={draft.gender} placeholder="Gender" />
				</div>
				<div class="field-group">
					<div class="field-hdr">Age</div>
					<input class="input-demo" bind:value={draft.age} placeholder="Age" />
				</div>
			</div>
			<div class="grid-2">
				<div class="field-group">
					<div class="field-hdr">Height</div>
					<input class="input-demo" bind:value={draft.height} placeholder="Height" />
				</div>
				<div class="field-group">
					<div class="field-hdr">Weight</div>
					<input class="input-demo" bind:value={draft.weight} placeholder="Weight" />
				</div>
			</div>
			<div class="grid-2">
				<div class="field-group">
					<div class="field-hdr">Power Level</div>
					<input class="input-demo input-num" type="number" bind:value={draft.powerLevel} />
				</div>
			</div>
		</ComicPanel>

		<EditableWrapper title="Power Points" isEditable={true} onSave={async () => {}}>
			{#snippet children()}
			<ComicPanel header="&#9733; Power Points" color="dark">
				<div class="pp-display">
					<div class="pp-ring">
						<div class="pp-ring-inner">
							<div class="pp-num">{draft.totalAllowed ?? 0}</div>
							<div class="pp-lbl">Total PP</div>
						</div>
					</div>
					<div class="pp-ring used">
						<div class="pp-ring-inner">
							<div class="pp-num" style="color:var(--danger);">{draft.totalSpent ?? 0}</div>
							<div class="pp-lbl">Spent PP</div>
						</div>
					</div>
				</div>
				<hr class="divider" />
				<div class="pp-bar-wrap">
					<div class="pp-bar-bg">
						<div class="pp-bar-fill" style="width: {draft.totalAllowed ? (draft.totalSpent / draft.totalAllowed) * 100 : 0}%;"></div>
					</div>
					<div class="pp-bar-text">{draft.totalAllowed - draft.totalSpent} PP Remaining</div>
				</div>
			</ComicPanel>
			{/snippet}
			{#snippet editForm()}
				<PowerPointsEditor draft={draft} />
			{/snippet}
		</EditableWrapper>

		<ComicPanel header="&#9733; Conditions" color="red">
			<div style="margin-bottom: 8px;">
				<span class="action-word zap" style="font-size: 22px;">CONDITION</span>
			</div>
			<ConditionPip label="Normal" color="gray" />
			<ConditionPip label="Fatigued / Exhausted" color="yellow" />
			<ConditionPip label="Dazed / Stunned" color="red" />
			<ConditionPip label="Incapacitated" color="black" />
			<ConditionPip label="Hindered / Immobile" color="gray" />
			<ConditionPip label="Vulnerable / Defenseless" color="red" />
		</ComicPanel>
	</div>

	<EditableWrapper title="Abilities" isEditable={true} onSave={async () => {}}>
		{#snippet children()}
		<ComicPanel header="&#9733; Abilities — Stats Module" color="blue">
			<div style="margin-bottom: 8px;">
				<span class="action-word">WHAM!</span>
				<span class="stat-hint">Stat values lead every module</span>
			</div>
			<div class="stat-row-6">
				<StatBubble value={draft.abilities?.strengthFinalValue ?? 0} label="STR" color="danger" />
				<StatBubble value={draft.abilities?.staminaFinalValue ?? 0} label="STA" color="default" />
				<StatBubble value={draft.abilities?.agilityFinalValue ?? 0} label="AGL" color="default" />
				<StatBubble value={draft.abilities?.fightingFinalValue ?? 0} label="FGT" color="success" />
				<StatBubble value={draft.abilities?.intellectFinalValue ?? 0} label="INT" color="secondary" />
				<StatBubble value={draft.abilities?.presenceFinalValue ?? 0} label="PRE" color="default" />
			</div>
		</ComicPanel>
		{/snippet}
		{#snippet editForm()}
			<AbilitiesEditor abilities={draft.abilities} />
		{/snippet}
	</EditableWrapper>

	<div class="panel-grid">
		<EditableWrapper title="Defenses" isEditable={true} onSave={async () => {}}>
			{#snippet children()}
			<ComicPanel header="&#9733; Defenses" color="blue">
				<div class="def-row">
					<span class="def-pill">Dodge</span>
					<span class="input-box-demo">{draft.defenses?.dodgeFinalValue ?? 0}</span>
				</div>
				<div class="def-row">
					<span class="def-pill">Parry</span>
					<span class="input-box-demo">{draft.defenses?.parryFinalValue ?? 0}</span>
				</div>
				<div class="def-row">
					<span class="def-pill green">Fortitude</span>
					<span class="input-box-demo">{draft.defenses?.fortitudeFinalValue ?? 0}</span>
				</div>
				<div class="def-row">
					<span class="def-pill green">Toughness</span>
					<span class="input-box-demo">{draft.defenses?.toughnessFinalValue ?? 0}</span>
				</div>
				<div class="def-row">
					<span class="def-pill blue">Will</span>
					<span class="input-box-demo">{draft.defenses?.willFinalValue ?? 0}</span>
				</div>
				<hr class="divider" />
				<div class="note-box">
					<strong>Defense Bonus</strong> = 10 + ability modifier + ranks
				</div>
			</ComicPanel>
			{/snippet}
			{#snippet editForm()}
				<DefensesEditor defenses={draft.defenses} />
			{/snippet}
		</EditableWrapper>

		<ComicPanel header="&#9733; Combat" color="red">
			<div style="margin-bottom: 8px;">
				<span class="action-word pow" style="font-size: 26px; display: inline;">POW!</span>
			</div>
			<div class="field-group">
				<div class="field-hdr">Initiative Bonus</div>
				<span class="input-box-demo" style="width:60px;height:44px;">{abilityMod(draft.abilities?.agilityFinalValue ?? 0)}</span>
			</div>
		</ComicPanel>
	</div>

	<div class="all-view">
		{#each priorityOrder as key, i}
			<div class="section-wrap" class:full={i < 2} class:half={i >= 2}>
				{#if key === 'skills'}
				<EditableWrapper title="Skills" isEditable={true} onSave={async () => {}}>
					{#snippet children()}
					<ComicPanel header="&#9733; Skills" color="yellow">
						<SkillTable skills={draft.skills ?? []} />
					</ComicPanel>
					{/snippet}
					{#snippet editForm()}
						<SkillsEditor skills={draft.skills} />
					{/snippet}
				</EditableWrapper>
				{:else if key === 'advantages'}
				<EditableWrapper title="Advantages" isEditable={true} onSave={async () => {}}>
					{#snippet children()}
					<ComicPanel header="&#9733; Advantages" color="dark">
						{#each draft.advantages ?? [] as adv, i}
							<div class="advantage-row">
								<div class="advantage-bullet">&#9656;</div>
								<div class="advantage-name">{adv.name}{adv.ranks > 1 ? ' ' + adv.ranks : ''}</div>
								{#if adv.description}<div class="advantage-desc">{adv.description}</div>{/if}
							</div>
						{/each}
					</ComicPanel>
					{/snippet}
					{#snippet editForm()}
						<AdvantagesEditor advantages={draft.advantages} />
					{/snippet}
				</EditableWrapper>
				{:else if key === 'equipment'}
				<EditableWrapper title="Equipment" isEditable={true} onSave={async () => {}}>
					{#snippet children()}
					<ComicPanel header="&#9733; Equipment" color="blue">
						<div class="ep-bar">
							<span class="ep-label">EP {draft.equipmentPool.epSpent} / {draft.equipmentPool.totalEpAllowed}</span>
						</div>
						{#each draft.equipmentPool.items ?? [] as item, i}
							<div class="equipment-row">
								<div class="equipment-bullet">&#8226;</div>
								<div class="equipment-name">{item.itemName}</div>
								<div class="equipment-cost">{item.epCost} EP</div>
							</div>
							{#if item.description}<div class="equipment-desc">{item.description}</div>{/if}
						{:else}
							<div class="empty-state">No equipment</div>
						{/each}
						<hr class="divider" />
						<div class="ep-bar" style="margin-top:6px;">
							<span class="ep-label">&#9733; Headquarters</span>
						</div>
						{#each draft.headquarters ?? [] as hq, i}
							<div class="hq-row">
								<div class="hq-name">{hq.name}</div>
								<div class="hq-cost">{hq.totalEpCost} EP</div>
								{#if hq.isSharedTeamBase}<span class="shared-badge">Team Base</span>{/if}
							</div>
							<div class="hq-detail">{hq.sizeCategory} &middot; Toughness {hq.toughnessValue}</div>
							{#if hq.description}<div class="hq-desc">{hq.description}</div>{/if}
							{#if hq.features?.length}
								<div class="hq-features">{#each hq.features as f}<span class="feature-badge">{f}</span>{/each}</div>
							{/if}
							{#if hq.defenseSystems?.length}
								<div class="def-systems">
									<span class="def-sys-header">Defense Systems:</span>
									{#each hq.defenseSystems as ds}
										<span class="def-sys-item">{ds.name} <span class="def-sys-cost">({ds.totalPowerCost} PP)</span></span>
									{/each}
								</div>
							{/if}
							{#if i < draft.headquarters.length - 1}<hr class="divider" />{/if}
						{:else}
							<div class="empty-state">No headquarters</div>
						{/each}
					</ComicPanel>
					{/snippet}
					{#snippet editForm()}
						<EquipmentEditor equipmentPool={draft.equipmentPool} />
						<hr class="divider" />
						<HeadquartersEditor headquarters={draft.headquarters} />
					{/snippet}
				</EditableWrapper>
				{:else if key === 'powers'}
				<EditableWrapper title="Powers" isEditable={true} onSave={async () => {}}>
					{#snippet children()}
					<ComicPanel header="&#9733; Powers" color="blue">
						{#each draft.powers ?? [] as power, i}
							<div class="power-row">
								<div class="power-header">
									<span class="power-name">{power.name}</span>
									{#if power.isArray}<span class="array-badge">ARRAY</span>{/if}
									<PillBadge text="{power.totalPowerCost} PP" color="primary" />
								</div>
								{#if power.description}
									<div class="power-desc-text">{power.description}</div>
								{/if}
								{#if power.descriptors?.length}
									<div class="power-desc">{power.descriptors.join(', ')}</div>
								{/if}
								{#if power.isArray}
									<div class="array-slot active-slot">Active Slot</div>
								{/if}
								{#each power.effects as effect}
									<div class="effect-line">
										<span class="effect-name">{effect.effectName}</span>
										<span class="effect-detail">Rank {effect.rank} &middot; {effect.baseCostPerRank} PP/r &middot; <strong>{effect.calculatedCost} PP</strong></span>
										{#if effect.modifiers?.length}
											<div class="modifier-line">
												{#each effect.modifiers as mod}
													<span class="mod-badge" class:extra={mod.type === 'EXTRA'} class:flaw={mod.type === 'FLAW'}>{mod.name}{mod.isFlat ? '' : (mod.type === 'FLAW' ? ' (-' + mod.costModifier + ')' : ' (+' + mod.costModifier + ')')}</span>
												{/each}
											</div>
										{/if}
									</div>
								{/each}
								{#if power.isArray && power.alternateEffects?.length}
									<div class="alt-effects-divider">Alternate Effects</div>
									{#each power.alternateEffects as alt}
										<div class="alt-effect-block">
											<div class="alt-header">
												<span class="alt-name">{alt.name}</span>
												<span class="alt-meta">{alt.arrayType === 'DYNAMIC' ? 'Dynamic' : 'Alternate'} &middot; {alt.costPerRank} PP/r &middot; <strong>{alt.costPerRank * (alt.currentAllocatedRank || alt.effects[0]?.rank || 0)} PP</strong></span>
											</div>
											{#if alt.description}<div class="alt-desc">{alt.description}</div>{/if}
											{#each alt.effects as effect}
												<div class="effect-line">
													<span class="effect-name">{effect.effectName}</span>
													<span class="effect-detail">Rank {effect.rank} &middot; {effect.baseCostPerRank} PP/r &middot; <strong>{effect.calculatedCost} PP</strong></span>
													{#if effect.modifiers?.length}
														<div class="modifier-line">
															{#each effect.modifiers as mod}
																<span class="mod-badge" class:extra={mod.type === 'EXTRA'} class:flaw={mod.type === 'FLAW'}>{mod.name}{mod.isFlat ? '' : (mod.type === 'FLAW' ? ' (-' + mod.costModifier + ')' : ' (+' + mod.costModifier + ')')}</span>
															{/each}
														</div>
													{/if}
												</div>
											{/each}
										</div>
									{/each}
								{/if}
							</div>
						{/each}
					</ComicPanel>
					{/snippet}
					{#snippet editForm()}
						<PowersEditor powers={draft.powers} />
					{/snippet}
				</EditableWrapper>
				{/if}
			</div>
		{/each}
	</div>

	<div class="complications-spacer"></div>

	<EditableWrapper title="Complications" isEditable={true} onSave={async () => {}}>
		{#snippet children()}
		<ComicPanel header="&#9733; Notes &amp; Complications" color="yellow">
			{#each draft.complications ?? [] as comp, i}
				<div class="complication-row">
					<div class="comp-badge">{comp.type}</div>
					<div class="comp-text">{comp.description}</div>
				</div>
			{/each}
		</ComicPanel>
		{/snippet}
		{#snippet editForm()}
			<ComplicationsEditor complications={draft.complications} />
		{/snippet}
	</EditableWrapper>

	<div class="save-bar">
		<div class="save-left">
			<button onclick={saveCharacter} disabled={saving} class="save-btn">
				{saving ? 'Saving...' : 'Save Character'}
			</button>
			<button onclick={shareCharacter} class="share-btn">
				{shareCopied ? 'Copied!' : 'Share'}
			</button>
			{#if autosaveDirty}
				<span class="autosave-indicator">&bull; Unsaved changes &mdash; autosave in 15s</span>
			{/if}
			{#if saveError}
				<span class="save-error">{saveError}</span>
			{/if}
			{#if saveSuccess}
				<span class="save-success">Saved!</span>
			{/if}
		</div>
		<div class="priority-controls">
			<span class="priority-label">Section order:</span>
			{#each priorityOrder as key, i}
				<div class="priority-item">
					<span class="priority-name">{key}</span>
					<button class="move-btn" onclick={() => movePriority(i, i - 1)} disabled={i === 0}>&#9650;</button>
					<button class="move-btn" onclick={() => movePriority(i, i + 1)} disabled={i === priorityOrder.length - 1}>&#9660;</button>
				</div>
			{/each}
		</div>
	</div>

	<div class="signature-band" style="margin-top: 16px;">
		<div class="sig-dots"></div>
		<span style="position: relative; z-index: 1;">&#9733; UNOFFICIAL MUTANTS &amp; MASTERMINDS · CHARACTER SHEET · POWER LEVEL {draft.powerLevel} &#9733;</span>
	</div>
</div>
{/if}

<style>
	.comic-wrap {
		font-family: 'Nunito', sans-serif;
		background: var(--newsprint);
		padding: 20px;
		width: 100%;
		max-width: 1200px;
	}

	.speech-bubble {
		background: var(--panel-bg);
		border: 3px solid var(--border);
		border-radius: 16px;
		padding: 10px 14px;
		position: relative;
		display: inline-block;
		margin: 0 0 14px 10px;
		box-shadow: 3px 3px 0 var(--border);
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 600;
		color: var(--ink);
		letter-spacing: 0.02em;
		max-width: 90%;
	}
	.speech-bubble::before {
		content: '';
		position: absolute;
		bottom: -14px;
		left: 20px;
		border: 7px solid transparent;
		border-top-color: var(--border);
	}
	.speech-bubble::after {
		content: '';
		position: absolute;
		bottom: -10px;
		left: 22px;
		border: 5px solid transparent;
		border-top-color: var(--panel-bg);
	}

	.panel-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
		margin-bottom: 14px;
	}

	.panel-grid-3 {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 14px;
		margin-bottom: 14px;
	}

	.action-word {
		font-family: 'Bangers', cursive;
		font-size: 38px;
		letter-spacing: 0.04em;
		color: var(--danger);
		text-shadow: 2px 2px 0 #7A0000, 4px 4px 0 var(--ink);
		line-height: 1;
		display: block;
		margin-bottom: 4px;
	}
	.action-word.zap { color: var(--accent); text-shadow: 2px 2px 0 #8B6000, 4px 4px 0 var(--ink); }
	.action-word.pow { color: var(--secondary); text-shadow: 2px 2px 0 #0A1E5E, 4px 4px 0 var(--ink); }

	.stat-hint {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--accent);
	}

	.stat-row-6 {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 8px;
	}

	.field-group { margin-bottom: 8px; }

	.field-hdr {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		margin-bottom: 2px;
	}

	.input-demo {
		border: none;
		border-bottom: 3px solid var(--border);
		font-family: 'Nunito', sans-serif;
		font-size: 15px;
		padding: 4px 2px;
		width: 100%;
		background: transparent;
		color: var(--ink);
		outline: none;
	}
	select.input-demo {
		appearance: none;
		cursor: pointer;
	}
	.input-demo.input-num { width: 60px; }

	.input-box-demo {
		border: 3px solid var(--border);
		box-shadow: 2px 2px 0 var(--border);
		font-family: 'Bangers', cursive;
		font-size: 24px;
		text-align: center;
		width: 44px;
		height: 44px;
		color: var(--primary);
		background: var(--panel-bg);
		padding: 4px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

	.divider {
		border: none;
		border-top: 3px solid var(--border);
		margin: 6px 0;
	}

	.note-box {
		background: var(--newsprint);
		border: 2.5px solid var(--border);
		box-shadow: 3px 3px 0 var(--border);
		border-left: 6px solid var(--highlight);
		padding: 8px 10px;
		font-family: 'Nunito', sans-serif;
		font-size: 15px;
		color: var(--ink);
		line-height: 1.4;
	}

	.pp-display {
		display: flex;
		gap: 12px;
		justify-content: center;
		margin-bottom: 10px;
	}

	.pp-ring {
		width: 80px;
		height: 80px;
		border: 3px solid var(--highlight);
		box-shadow: 3px 3px 0 var(--border);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--highlight) 10%, transparent);
	}
	.pp-ring.used { border-color: var(--danger); background: color-mix(in srgb, var(--danger) 8%, transparent); }

	.pp-ring-inner { text-align: center; }

	.pp-num {
		font-family: 'Bangers', cursive;
		font-size: 26px;
		letter-spacing: 0.03em;
		color: var(--accent);
		line-height: 1;
	}
	.pp-ring.used .pp-num { color: var(--danger); }

	.pp-lbl {
		font-family: 'Oswald', sans-serif;
		font-size: 7px;
		font-weight: 700;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.12em;
	}

	.pp-bar-wrap { padding: 0 4px; }

	.pp-bar-bg {
		width: 100%;
		height: 12px;
		background: #333;
		border: 2px solid var(--border);
		box-shadow: 2px 2px 0 var(--border);
		overflow: hidden;
	}
	.pp-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--danger), var(--highlight), var(--success));
		transition: width 0.3s ease;
	}
	.pp-bar-text {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		text-align: center;
		margin-top: 4px;
	}

	.def-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8px;
	}

	.def-pill {
		display: inline-block;
		border: 2.5px solid var(--danger);
		background: var(--panel-bg);
		border-radius: 20px;
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--danger);
		padding: 2px 10px;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		box-shadow: 2px 2px 0 var(--border);
	}
	.def-pill.green { border-color: var(--success); color: var(--success); background: var(--panel-bg); }
	.def-pill.blue { border-color: var(--secondary); color: var(--secondary); background: var(--panel-bg); }

	.advantage-row {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		padding: 4px 0;
		border-bottom: 1.5px dashed var(--border);
	}
	.advantage-row:last-child { border-bottom: none; }

	.advantage-bullet {
		font-family: 'Bangers', cursive;
		font-size: 16px;
		color: var(--danger);
	}
	.advantage-name {
		font-family: 'Nunito', sans-serif;
		font-size: 14px;
		font-weight: 600;
		color: var(--ink);
		flex-shrink: 0;
	}
	.advantage-desc {
		font-family: 'Nunito', sans-serif;
		font-size: 15px;
		color: var(--accent);
		margin-left: 4px;
	}

	.power-row {
		padding: 8px 0;
		border-bottom: 1.5px dashed var(--border);
	}
	.power-row:last-child { border-bottom: none; }

	.power-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 2px;
	}
	.power-name {
		font-family: 'Bangers', cursive;
		font-size: 16px;
		letter-spacing: 0.04em;
		color: var(--accent);
		text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5);
	}
	.power-desc {
		font-family: 'Nunito', sans-serif;
		font-size: 15px;
		color: var(--ink);
		opacity: 0.75;
		line-height: 1.4;
	}
	.power-desc-text {
		font-family: 'Nunito', sans-serif;
		font-size: 14px;
		color: var(--ink);
		line-height: 1.45;
		margin: 4px 0 2px;
		padding: 4px 8px;
		background: color-mix(in srgb, var(--panel-bg) 60%, transparent);
		border-left: 3px solid var(--primary);
	}
	.array-badge {
		font-family: 'Oswald', sans-serif;
		font-size: 8px;
		font-weight: 700;
		color: white;
		background: var(--danger);
		padding: 1px 5px;
		margin-left: 6px;
		letter-spacing: 0.06em;
	}
	.effect-line {
		margin: 4px 0 2px 8px;
		padding-left: 8px;
		border-left: 2px solid var(--border);
	}
	.effect-name {
		font-family: 'Nunito', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--ink);
	}
	.effect-detail {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		color: var(--accent);
		margin-left: 6px;
	}
	.modifier-line {
		display: flex;
		flex-wrap: wrap;
		gap: 3px;
		margin-top: 2px;
	}
	.mod-badge {
		font-family: 'Oswald', sans-serif;
		font-size: 8px;
		font-weight: 700;
		padding: 1px 5px;
		display: inline-block;
	}
	.mod-badge.extra {
		background: color-mix(in srgb, var(--primary) 25%, transparent);
		color: var(--primary);
		border: 1px solid var(--primary);
	}
	.mod-badge.flaw {
		background: color-mix(in srgb, var(--danger) 25%, transparent);
		color: var(--danger);
		border: 1px solid var(--danger);
	}
	.array-slot {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
	.array-slot.active-slot {
		color: var(--primary);
		margin: 4px 0 2px;
		padding: 2px 6px;
		background: color-mix(in srgb, var(--primary) 12%, transparent);
		border-left: 3px solid var(--primary);
	}
	.alt-effects-divider {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 6px 0 3px;
		padding-top: 4px;
		border-top: 1.5px dashed var(--border);
	}
	.alt-effect-block {
		margin: 3px 0 3px 8px;
		padding: 4px 8px;
		background: color-mix(in srgb, var(--panel-bg) 50%, transparent);
		border: 1px solid var(--border);
	}
	.alt-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 2px;
	}
	.alt-name {
		font-family: 'Nunito', sans-serif;
		font-size: 14px;
		font-weight: 700;
		color: var(--ink);
	}
	.alt-meta {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		color: var(--accent);
	}
	.alt-desc {
		font-family: 'Nunito', sans-serif;
		font-size: 15px;
		color: var(--ink);
		opacity: 0.75;
		margin: 2px 0 4px;
		line-height: 1.4;
	}

	.complication-row {
		display: flex;
		gap: 10px;
		padding: 6px 0;
		border-bottom: 1.5px dashed var(--border);
		align-items: flex-start;
	}
	.complication-row:last-child { border-bottom: none; }

	.comp-badge {
		flex-shrink: 0;
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--primary);
		background: var(--panel-bg);
		border: 2px solid var(--primary);
		padding: 2px 8px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.comp-text {
		font-family: 'Nunito', sans-serif;
		font-size: 14px;
		color: var(--ink);
		line-height: 1.4;
	}

	.empty-state {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		color: var(--accent);
		text-align: center;
		padding: 8px;
	}

	.equipment-row {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 0;
		border-bottom: 1.5px dashed var(--border);
	}
	.equipment-row:last-child { border-bottom: none; }
	.equipment-desc {
		font-family: 'Nunito', sans-serif;
		font-size: 15px;
		color: var(--accent);
		margin: -2px 0 4px 18px;
	}
	.equipment-bullet {
		font-family: 'Bangers', cursive;
		font-size: 16px;
		color: var(--primary);
	}
	.equipment-name {
		font-family: 'Nunito', sans-serif;
		font-size: 14px;
		font-weight: 600;
		color: var(--ink);
		flex: 1;
	}
	.equipment-cost {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		font-weight: 700;
		color: var(--accent);
	}
	.ep-bar {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 6px;
		padding: 4px 8px;
		background: color-mix(in srgb, var(--primary) 12%, transparent);
		border: 1.5px solid var(--primary);
	}
	.ep-label {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--primary);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.hq-row {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 2px;
	}
	.hq-name {
		font-family: 'Bangers', cursive;
		font-size: 15px;
		color: var(--accent);
	}
	.hq-cost {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		font-weight: 700;
		color: var(--accent);
		margin-left: auto;
	}
	.shared-badge {
		font-family: 'Oswald', sans-serif;
		font-size: 8px;
		font-weight: 700;
		color: white;
		background: var(--success);
		padding: 1px 5px;
	}
	.hq-detail {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		color: var(--accent);
		margin-bottom: 2px;
	}
	.hq-desc {
		font-family: 'Nunito', sans-serif;
		font-size: 15px;
		color: var(--ink);
		margin-bottom: 4px;
		padding: 4px 8px;
		background: color-mix(in srgb, var(--panel-bg) 60%, transparent);
		border-left: 3px solid var(--primary);
	}
	.hq-features {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin-bottom: 4px;
	}
	.feature-badge {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--primary);
		background: color-mix(in srgb, var(--primary) 15%, transparent);
		border: 1.5px solid var(--primary);
		padding: 1px 6px;
	}
	.def-systems {
		margin-bottom: 4px;
	}
	.def-sys-header {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		display: block;
		margin-bottom: 2px;
	}
	.def-sys-item {
		font-family: 'Nunito', sans-serif;
		font-size: 15px;
		color: var(--ink);
		display: block;
		padding: 1px 0 1px 8px;
		border-left: 2px solid var(--danger);
		margin-bottom: 1px;
	}
	.def-sys-cost {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		color: var(--accent);
	}

	.all-view {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
	}
	.section-wrap.full {
		grid-column: 1 / -1;
	}
	.section-wrap.half {
		grid-column: span 1;
	}
	.all-view :global(.panel-body) {
		max-height: 400px;
		overflow-y: auto;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	.all-view :global(.panel-body::-webkit-scrollbar) {
		display: none;
	}

	.priority-controls {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-left: auto;
	}
	.priority-label {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		font-weight: 700;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
	.priority-item {
		display: flex;
		align-items: center;
		gap: 2px;
	}
	.priority-name {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--ink);
		text-transform: capitalize;
		padding: 2px 6px;
		background: var(--newsprint);
		border: 1.5px solid var(--border);
	}
	.move-btn {
		background: var(--panel-bg);
		border: 1.5px solid var(--border);
		color: var(--accent);
		font-size: 12px;
		width: 20px;
		height: 20px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		line-height: 1;
	}
	.move-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}
	.move-btn:hover:not(:disabled) {
		background: var(--primary);
		color: white;
	}
	.save-left {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.signature-band {
		background: var(--border);
		color: var(--accent);
		font-family: 'Bangers', cursive;
		font-size: 15px;
		letter-spacing: 0.15em;
		text-align: center;
		padding: 5px;
		position: relative;
		overflow: hidden;
	}
	.sig-dots {
		position: absolute;
		inset: 0;
		background-image: radial-gradient(circle, var(--highlight) 1px, transparent 1px);
		background-size: 10px 10px;
		opacity: 0.15;
	}

	.complications-spacer {
		height: 24px;
	}

	.save-bar {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-top: 16px;
		padding: 12px;
		background: var(--panel-bg);
		border: 3px solid var(--border);
		box-shadow: 4px 4px 0 var(--border);
	}
	.save-btn {
		font-family: 'Bangers', cursive;
		font-size: 16px;
		letter-spacing: 0.08em;
		color: white;
		background: var(--primary);
		border: 3px solid var(--border);
		box-shadow: 3px 3px 0 var(--border);
		padding: 8px 24px;
		cursor: pointer;
		text-transform: uppercase;
		transition: transform 0.1s;
	}
	.save-btn:hover:not(:disabled) { transform: translate(1px, 1px); box-shadow: 2px 2px 0 var(--border); }
	.save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
	.save-error {
		font-family: 'Nunito', sans-serif;
		font-size: 14px;
		color: var(--danger);
	}
	.save-success {
		font-family: 'Nunito', sans-serif;
		font-size: 14px;
		font-weight: 700;
		color: var(--success);
	}
	.autosave-indicator {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		color: var(--highlight);
		letter-spacing: 0.04em;
	}
</style>
