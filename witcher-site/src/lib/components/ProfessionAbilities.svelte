<script lang="ts">
	import type { WitcherCharacter, ProfessionAbility } from '$lib/services/api';
	import {
		abilityGrid,
		definingSkillAbility,
		createDefaultDefiningSkill,
		label,
		STAT_TABLE_ORDER,
		STAT_ABBREV
	} from '$lib/utils/character';
	import AbilityCard from '$lib/components/AbilityCard.svelte';
	import EditModal from '$lib/components/EditModal.svelte';

	// The profession's whole ability block: the Defining Skill pinned on top, then the
	// 3x3 tree of free-form slots.
	//
	// The Defining Skill is no longer a separate concept — per the rulebook (pg.61) it
	// is the trunk of the tree, sitting beneath all three branches. It's the one
	// `abilities` row flagged `definingSkill: true`, priced and edited exactly like any
	// other ability; `branch`/`tier` carry no meaning on that row and are left at 0.
	let { draft, editable = true }: { draft: WitcherCharacter; editable?: boolean } = $props();

	const grid = $derived(abilityGrid(draft.professionInfo.abilities));
	const definingSkill = $derived(definingSkillAbility(draft.professionInfo.abilities));
	const branchColors = ['one', 'two', 'three'] as const;

	let editing = $state<ProfessionAbility | null>(null);
	let modalOpen = $state(false);

	// A brand-new grid slot's default (from createDefaultAbility) isn't in the list yet
	// — id-matching a fresh id would never find it — so an id present in the persisted
	// list means "editing", not present means "adding". branch/tier can't be the key
	// here: both are meaningless (and 0/0) on the Defining Skill row.
	function openEditor(ability: ProfessionAbility) {
		// Edit a copy so Cancel discards cleanly; commit happens on Save.
		editing = { ...ability };
		modalOpen = true;
	}

	async function commit() {
		if (!editing) return;
		const list = draft.professionInfo.abilities;
		const existing = list.findIndex((a) => a.id === editing!.id);
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

	// The Defining Skill card edits the trunk row through the same copy-then-commit
	// pattern as any other ability, just with its own open/commit pair so the two
	// modals (and their "Add" vs "Edit" wording) stay independent.
	let definingModalOpen = $state(false);

	function openDefiningEditor() {
		editing = definingSkill ? { ...definingSkill } : createDefaultDefiningSkill();
		definingModalOpen = true;
	}

	async function commitDefining() {
		if (!editing) return;
		commit();
		definingModalOpen = false;
	}

	function cancelDefining() {
		editing = null;
		definingModalOpen = false;
	}
</script>

<section class="ability-tree">
	<div class="ability-defining" class:empty={!definingSkill?.name}>
		<div class="ability-head">
			<span class="ability-name">{definingSkill?.name || 'Defining Skill'}</span>
			<span class="ability-stat">
				{definingSkill?.governingStat ? STAT_ABBREV[definingSkill.governingStat] : 'Defining'}
			</span>
		</div>
		{#if definingSkill?.description}
			<p class="ability-desc">{definingSkill.description}</p>
		{:else}
			<p class="ability-desc muted">{definingSkill ? 'No description yet.' : 'Not set.'}</p>
		{/if}
		<div class="ability-foot">
			<span class="ability-level-label">Level</span>
			<span class="ability-level">{definingSkill?.level ?? 0}</span>
			{#if editable}
				<button type="button" class="ability-edit-btn" onclick={openDefiningEditor}>
					{definingSkill ? 'Edit' : 'Add'}
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
		{#if editing}
			<div class="field-group">
				<div class="field-hdr">Name</div>
				<input
					class="input-demo"
					type="text"
					bind:value={editing.name}
					placeholder="Defining skill name"
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
				<span class="field-hint">What this skill is rolled against — set by the profession.</span>
			</div>
			<div class="grid-2">
				<div class="field-group">
					<div class="field-hdr">Level</div>
					<input class="input-demo input-num" type="number" min="0" bind:value={editing.level} />
					<span class="field-hint">Counts toward the 44-point creation package; minimum 1.</span>
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
{/if}
