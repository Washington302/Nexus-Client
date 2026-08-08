<script lang="ts">
	import type { WitcherCharacter, CriticalWound, StatModifier } from '$lib/services/api';
	import {
		label,
		activeModifiers,
		modifierText,
		createDefaultCriticalWound,
		WOUND_SEVERITY_OPTIONS,
		WOUND_STATE_OPTIONS,
		WOUND_LOCATION_OPTIONS
	} from '$lib/utils/character';
	import SheetSection from '$lib/components/SheetSection.svelte';
	import StatModifierRows from '$lib/components/StatModifierRows.svelte';

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

	// Which state's column is being edited. The tables print a different set of
	// penalties per state, and the backend stores all three, so treating a wound is a
	// state change rather than re-entering every modifier.
	let editingState = $state<'untreated' | 'stabilized' | 'treated'>('untreated');

	function modifiersFor(wound: CriticalWound, which: typeof editingState): StatModifier[] {
		if (which === 'treated') return wound.treatedModifiers;
		if (which === 'stabilized') return wound.stabilizedModifiers;
		return wound.untreatedModifiers;
	}

	/** Write-back half of the binding into whichever state's list is being edited. */
	function setModifiers(wound: CriticalWound, which: typeof editingState, value: StatModifier[]) {
		if (which === 'treated') wound.treatedModifiers = value;
		else if (which === 'stabilized') wound.stabilizedModifiers = value;
		else wound.untreatedModifiers = value;
	}

	function addWound() {
		draft.criticalWounds.push(createDefaultCriticalWound());
	}
	function removeWound(id: string) {
		draft.criticalWounds = draft.criticalWounds.filter((w) => w.id !== id);
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
		{#if draft.criticalWounds.length === 0}
			<p class="empty-hint">No critical wounds.</p>
		{:else}
			{#each draft.criticalWounds as wound (wound.id)}
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
						<span class="effect-meta">
							{mods.map(modifierText).join(' · ')}
						</span>
					{:else}
						<span class="effect-meta">No mechanical penalty in this state.</span>
					{/if}
					{#if wound.effectText}<p class="ability-desc">{wound.effectText}</p>{/if}
				</div>
			{/each}
		{/if}
	{/snippet}

	{#snippet edit()}
		{#each draft.criticalWounds as wound (wound.id)}
			<div class="list-card">
				<div class="grid-2">
					<div class="field-group">
						<div class="field-hdr">Name</div>
						<input class="input-demo" type="text" bind:value={wound.name} placeholder="Wound" />
					</div>
					<div class="field-group">
						<div class="field-hdr">Severity</div>
						<select class="input-demo" bind:value={wound.severity}>
							<option value={null}>&mdash;</option>
							{#each WOUND_SEVERITY_OPTIONS as opt}
								<option value={opt}>{label(opt)}</option>
							{/each}
						</select>
					</div>
				</div>
				<div class="grid-2">
					<div class="field-group">
						<div class="field-hdr">Location</div>
						<select class="input-demo" bind:value={wound.location}>
							<option value={null}>&mdash;</option>
							{#each WOUND_LOCATION_OPTIONS as opt}
								<option value={opt}>{label(opt)}</option>
							{/each}
						</select>
					</div>
					<div class="field-group">
						<div class="field-hdr">State</div>
						<select class="input-demo" bind:value={wound.state}>
							{#each WOUND_STATE_OPTIONS as opt}
								<option value={opt}>{label(opt)}</option>
							{/each}
						</select>
						<span class="field-hint">Selects which penalty set applies.</span>
					</div>
				</div>

				<div class="field-group">
					<div class="field-hdr">Effect</div>
					<textarea class="input-demo" rows="2" bind:value={wound.effectText}></textarea>
				</div>

				<!-- Penalties are entered per state, matching how the tables print them. -->
				<div class="inner-tabs">
					{#each ['untreated', 'stabilized', 'treated'] as const as which}
						<button
							type="button"
							class="inner-tab"
							class:active={editingState === which}
							onclick={() => (editingState = which)}
						>
							{label(which)}
							{#if modifiersFor(wound, which).length > 0}
								<span class="inner-tab-count">{modifiersFor(wound, which).length}</span>
							{/if}
						</button>
					{/each}
				</div>

				{#key editingState}
					<StatModifierRows
						bind:modifiers={
							() => modifiersFor(wound, editingState), (v) => setModifiers(wound, editingState, v)
						}
						skills={draft.skills}
						addLabel="+ Add {label(editingState)} Penalty"
					/>
				{/key}

				<label class="finish-creation">
					<input type="checkbox" bind:checked={wound.bleeding} />
					<span>Bleeding</span>
				</label>
				<label class="finish-creation">
					<input type="checkbox" bind:checked={wound.numbingHerbsApplied} />
					<span>
						Numbing Herbs — lowers this wound's penalties by 2, and near-death penalties by 2, for
						2d10 rounds.
					</span>
				</label>

				<button
					type="button"
					class="remove-row-btn"
					aria-label="Remove wound"
					onclick={() => removeWound(wound.id)}>✕</button
				>
			</div>
		{/each}
		<button type="button" class="add-row-btn" onclick={addWound}>+ Add Critical Wound</button>
	{/snippet}
</SheetSection>
