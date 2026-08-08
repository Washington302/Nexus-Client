<script lang="ts">
	import type { WitcherCharacter, ProfessionAbility } from '$lib/services/api';
	import { abilityGrid, label, STAT_TABLE_ORDER, STAT_ABBREV } from '$lib/utils/character';
	import AbilityCard from '$lib/components/AbilityCard.svelte';
	import EditModal from '$lib/components/EditModal.svelte';

	// The profession's whole ability block: the Defining Skill pinned on top, then the
	// 3x3 tree of free-form slots. The Defining Skill is owned and edited HERE — it is
	// a profession ability, not identity data, so Race & Profession no longer touches it.
	let { draft, editable = true }: { draft: WitcherCharacter; editable?: boolean } = $props();

	const grid = $derived(abilityGrid(draft.professionInfo.abilities ?? []));
	const branchColors = ['one', 'two', 'three'] as const;

	let editing = $state<ProfessionAbility | null>(null);
	let modalOpen = $state(false);

	function openEditor(ability: ProfessionAbility) {
		// Edit a copy so Cancel discards cleanly; commit happens on Save.
		editing = { ...ability };
		modalOpen = true;
	}

	async function commit() {
		if (!editing) return;
		const list = draft.professionInfo.abilities ?? [];
		const existing = list.findIndex(
			(a) => a.branch === editing!.branch && a.tier === editing!.tier
		);
		if (existing >= 0) {
			list[existing] = { ...editing };
		} else {
			list.push({ ...editing });
		}
		draft.professionInfo.abilities = [...list];
		editing = null;
	}

	function cancel() {
		editing = null;
	}

	// Defining Skill edits go through the same copy-then-commit pattern, but against
	// the three existing ProfessionInfo fields (name/points/notes) — no phantom fields.
	let definingDraft = $state<{ name: string; points: number; notes: string } | null>(null);
	let definingModalOpen = $state(false);

	function openDefiningEditor() {
		definingDraft = {
			name: draft.professionInfo.definingSkillName,
			points: draft.professionInfo.definingSkillPoints,
			notes: draft.professionInfo.definingSkillNotes
		};
		definingModalOpen = true;
	}

	async function commitDefining() {
		if (!definingDraft) return;
		draft.professionInfo.definingSkillName = definingDraft.name;
		draft.professionInfo.definingSkillPoints = definingDraft.points;
		draft.professionInfo.definingSkillNotes = definingDraft.notes;
		definingDraft = null;
	}

	function cancelDefining() {
		definingDraft = null;
	}
</script>

<section class="ability-tree">
	<div class="ability-defining" class:empty={!draft.professionInfo.definingSkillName}>
		<div class="ability-head">
			<span class="ability-name">{draft.professionInfo.definingSkillName || 'Defining Skill'}</span>
			<span class="ability-stat">Defining</span>
		</div>
		{#if draft.professionInfo.definingSkillNotes}
			<p class="ability-desc">{draft.professionInfo.definingSkillNotes}</p>
		{:else}
			<p class="ability-desc muted">
				{draft.professionInfo.definingSkillName ? 'No description yet.' : 'Not set.'}
			</p>
		{/if}
		<div class="ability-foot">
			<span class="ability-level-label">Level</span>
			<span class="ability-level">{draft.professionInfo.definingSkillPoints}</span>
			{#if editable}
				<button type="button" class="ability-edit-btn" onclick={openDefiningEditor}>
					{draft.professionInfo.definingSkillName ? 'Edit' : 'Add'}
				</button>
			{/if}
		</div>
	</div>

	<div class="ability-branches">
		{#each grid as branch, branchIndex}
			<div class="ability-branch">
				{#each branch as ability}
					<AbilityCard
						{ability}
						branchColor={branchColors[branchIndex]}
						{editable}
						onEdit={openEditor}
					/>
				{/each}
			</div>
		{/each}
	</div>
</section>

{#if editable}
	<EditModal bind:open={modalOpen} title="Profession Ability" onSave={commit} onCancel={cancel}>
		{#if editing}
			<div class="field-group">
				<div class="field-hdr">Name</div>
				<!-- Placeholders stay structural. Real ability names and text come from the
				     rulebook and must be player-entered (WITCHER_CONTENT_POLICY.md). -->
				<input
					class="input-demo"
					type="text"
					bind:value={editing.name}
					placeholder="Ability name"
				/>
			</div>
			<div class="field-group">
				<div class="field-hdr">Governing Stat</div>
				<select class="input-demo" bind:value={editing.governingStat}>
					<option value={null}>N/A — not rolled</option>
					{#each STAT_TABLE_ORDER as stat}
						<option value={stat}>{label(stat)} ({STAT_ABBREV[stat]})</option>
					{/each}
				</select>
			</div>
			<div class="grid-2">
				<div class="field-group">
					<div class="field-hdr">Level</div>
					<input class="input-demo input-num" type="number" min="0" bind:value={editing.level} />
					<span class="field-hint">Purchased level.</span>
				</div>
				<div class="field-group">
					<div class="field-hdr">Current</div>
					<input
						class="input-demo input-num"
						type="number"
						min="0"
						bind:value={editing.currentLevel}
					/>
					<span class="field-hint">Drops when drained.</span>
				</div>
			</div>
			<div class="field-group">
				<div class="field-hdr">Description</div>
				<textarea class="input-demo" rows="6" bind:value={editing.description}></textarea>
			</div>
		{/if}
	</EditModal>

	<EditModal
		bind:open={definingModalOpen}
		title="Defining Skill"
		onSave={commitDefining}
		onCancel={cancelDefining}
	>
		{#if definingDraft}
			<div class="field-group">
				<div class="field-hdr">Name</div>
				<input
					class="input-demo"
					type="text"
					bind:value={definingDraft.name}
					placeholder="Defining skill name"
				/>
			</div>
			<div class="field-group">
				<div class="field-hdr">Level</div>
				<input
					class="input-demo input-num"
					type="number"
					min="0"
					bind:value={definingDraft.points}
				/>
				<span class="field-hint">Counts toward the 44-point creation package; minimum 1.</span>
			</div>
			<div class="field-group">
				<div class="field-hdr">Description</div>
				<textarea class="input-demo" rows="6" bind:value={definingDraft.notes}></textarea>
			</div>
		{/if}
	</EditModal>
{/if}
