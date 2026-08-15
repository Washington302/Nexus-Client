<script lang="ts">
	import type { WitcherCharacter } from '$lib/services/api';
	import {
		label,
		activeModifiers,
		modifierText,
		isCondition,
		createDefaultCriticalWound
	} from '$lib/utils/character';
	import SheetSection from '@ui/SheetSection.svelte';
	import AccordionRow from '@ui/AccordionRow.svelte';
	import WoundEditor from '$lib/components/WoundEditor.svelte';

	let {
		draft,
		editable = true,
		onOpenEdit,
		onCancelEdit
	}: {
		draft: WitcherCharacter;
		editable?: boolean;
		onOpenEdit?: () => void;
		onCancelEdit?: () => void;
	} = $props();

	// Conditions (curses, disease, hexes) are the same CriticalWound object as a
	// physical injury — see isCondition() for why splitting the type wasn't worth it.
	// Two boxes, one array: distinct UI, shared data and shared stacking math.
	const wounds = $derived(draft.criticalWounds.filter((w) => !isCondition(w)));
	const conditions = $derived(draft.criticalWounds.filter(isCondition));

	// Which per-state modifier tab is showing — shared across every row in BOTH boxes,
	// same as it was shared across every row in the one box before the split.
	let editingState = $state<'untreated' | 'stabilized' | 'treated'>('untreated');

	function addRow() {
		const wound = createDefaultCriticalWound();
		draft.criticalWounds.push(wound);
		expanded = new Set(expanded).add(wound.id);
	}
	function removeWound(id: string) {
		draft.criticalWounds = draft.criticalWounds.filter((w) => w.id !== id);
	}

	// Collapsed by default — see AccordionRow. One set for both boxes: ids are UUIDs,
	// so a wound's id and a condition's id can never collide.
	let expanded = $state(new Set<string>());
	function toggleExpanded(id: string) {
		if (expanded.has(id)) expanded.delete(id);
		else expanded.add(id);
		expanded = new Set(expanded);
	}
</script>

<SheetSection
	{editable}
	onOpen={onOpenEdit}
	onCancel={onCancelEdit}
	title="Critical Wounds"
	color="plain"
>
	{#snippet view()}
		{#if wounds.length === 0}
			<p class="empty-hint">No critical wounds.</p>
		{:else}
			{#each wounds as wound (wound.id)}
				{@const mods = activeModifiers(wound)}
				<div class="wound-row">
					<div class="wound-head">
						<span class="effect-name">{wound.name || 'Unnamed wound'}</span>
						<span class="formula-tags">
							{#if wound.severity}<span class="pill">{label(wound.severity)}</span>{/if}
							{#if wound.location}<span class="pill">{label(wound.location)}</span>{/if}
							<span class="pill" class:wound-untreated={wound.state === 'UNTREATED'}
								>{label(wound.state)}</span
							>
							{#if wound.bleeding}<span class="pill wound-bleeding">Bleeding</span>{/if}
							{#if wound.numbingHerbsApplied}<span
									class="pill"
									title="Lowers this wound's penalties by 2, and near-death penalties by 2"
									>Numbed</span
								>{/if}
						</span>
					</div>
					{#if mods.length > 0}
						<span class="effect-meta">{mods.map(modifierText).join(' · ')}</span>
					{:else}
						<span class="effect-meta">No mechanical penalty in this state.</span>
					{/if}
					{#if wound.effectText}<p class="ability-desc">{wound.effectText}</p>{/if}
				</div>
			{/each}
		{/if}
	{/snippet}

	{#snippet edit()}
		{#each wounds as wound (wound.id)}
			<AccordionRow
				id={wound.id}
				open={expanded.has(wound.id)}
				onToggle={() => toggleExpanded(wound.id)}
				onRemove={() => removeWound(wound.id)}
				removeLabel="Remove wound"
			>
				{#snippet header()}
					<span class="effect-name">{wound.name || 'Unnamed wound'}</span>
					<span class="attribute-card-meta">
						<span class="formula-tags">
							{#if wound.severity}<span class="pill">{label(wound.severity)}</span>{/if}
							<span class="pill" class:wound-untreated={wound.state === 'UNTREATED'}
								>{label(wound.state)}</span
							>
						</span>
						<span class="attribute-chevron" aria-hidden="true"></span>
					</span>
				{/snippet}
				{#snippet body()}
					<WoundEditor {wound} skills={draft.skills} bind:editingState />
				{/snippet}
			</AccordionRow>
		{/each}
		<button type="button" class="add-row-btn" onclick={addRow}>+ Add Critical Wound</button>
	{/snippet}
</SheetSection>

<!-- Distinct box, same underlying array and the same StatModifier/multiplier math —
     Environmental Stress, a Nightmare Hex, Sewer Pox are all "no located, no
     severity-banded" rows of the exact same CriticalWound the box above edits. -->
<SheetSection
	{editable}
	onOpen={onOpenEdit}
	onCancel={onCancelEdit}
	title="Conditions"
	color="teal"
>
	{#snippet view()}
		<span class="field-hint" style="display:block;margin-bottom:8px;">
			Curses, disease, hexes and environmental effects — anything that isn't a located,
			severity-banded injury.
		</span>
		{#if conditions.length === 0}
			<p class="empty-hint">No conditions.</p>
		{:else}
			{#each conditions as cond (cond.id)}
				{@const mods = activeModifiers(cond)}
				<div class="wound-row">
					<div class="wound-head">
						<span class="effect-name">{cond.name || 'Unnamed condition'}</span>
						<span class="pill" class:wound-untreated={cond.state === 'UNTREATED'}
							>{label(cond.state)}</span
						>
					</div>
					{#if mods.length > 0}
						<span class="effect-meta">{mods.map(modifierText).join(' · ')}</span>
					{:else}
						<span class="effect-meta">No mechanical penalty in this state.</span>
					{/if}
					{#if cond.effectText}<p class="ability-desc">{cond.effectText}</p>{/if}
				</div>
			{/each}
		{/if}
	{/snippet}

	{#snippet edit()}
		{#each conditions as cond (cond.id)}
			<AccordionRow
				id={cond.id}
				open={expanded.has(cond.id)}
				onToggle={() => toggleExpanded(cond.id)}
				onRemove={() => removeWound(cond.id)}
				removeLabel="Remove condition"
			>
				{#snippet header()}
					<span class="effect-name">{cond.name || 'Unnamed condition'}</span>
					<span class="attribute-card-meta">
						<span class="pill" class:wound-untreated={cond.state === 'UNTREATED'}
							>{label(cond.state)}</span
						>
						<span class="attribute-chevron" aria-hidden="true"></span>
					</span>
				{/snippet}
				{#snippet body()}
					<WoundEditor
						wound={cond}
						skills={draft.skills}
						bind:editingState
						showBleedingAndHerbs={false}
					/>
				{/snippet}
			</AccordionRow>
		{/each}
		<button type="button" class="add-row-btn" onclick={addRow}>+ Add Condition</button>
	{/snippet}
</SheetSection>
