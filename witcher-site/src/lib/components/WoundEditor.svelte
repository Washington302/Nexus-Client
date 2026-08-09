<script lang="ts">
	import type { CriticalWound, StatModifier, Skill } from '$lib/services/api';
	import {
		label,
		WOUND_SEVERITY_OPTIONS,
		WOUND_STATE_OPTIONS,
		WOUND_LOCATION_OPTIONS
	} from '$lib/utils/character';
	import StatModifierRows from '$lib/components/StatModifierRows.svelte';

	type EditingState = 'untreated' | 'stabilized' | 'treated';

	// The full edit form for one CriticalWound row — shared by the Critical Wounds and
	// Conditions boxes, since a condition (curse, disease, hex) is the same object with
	// Severity and Location left unset. `editingState` is bindable rather than owned
	// here because the tabs picking which per-state modifier list is showing are
	// shared across every row in both boxes, not per-row — same behavior as before
	// this was split into two boxes, just lifted one level.
	let {
		wound,
		skills,
		editingState = $bindable('untreated'),
		showBleedingAndHerbs = true
	}: {
		wound: CriticalWound;
		skills: Skill[];
		editingState?: EditingState;
		/** Off for Conditions: a curse or disease doesn't bleed, and Numbing Herbs is
		 *  specifically a wound/near-death relief, not a cure for sickness. */
		showBleedingAndHerbs?: boolean;
	} = $props();

	function modifiersFor(which: EditingState): StatModifier[] {
		if (which === 'treated') return wound.treatedModifiers;
		if (which === 'stabilized') return wound.stabilizedModifiers;
		return wound.untreatedModifiers;
	}
	function setModifiers(which: EditingState, value: StatModifier[]) {
		if (which === 'treated') wound.treatedModifiers = value;
		else if (which === 'stabilized') wound.stabilizedModifiers = value;
		else wound.untreatedModifiers = value;
	}
</script>

<div class="grid-2">
	<div class="field-group">
		<div class="field-hdr">Name</div>
		<input class="input-demo" type="text" bind:value={wound.name} placeholder="Name" />
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
		<span class="field-hint">Leave both Severity and Location blank for a condition.</span>
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
			{#if modifiersFor(which).length > 0}
				<span class="inner-tab-count">{modifiersFor(which).length}</span>
			{/if}
		</button>
	{/each}
</div>

{#key editingState}
	<StatModifierRows
		bind:modifiers={() => modifiersFor(editingState), (v) => setModifiers(editingState, v)}
		{skills}
		addLabel="+ Add {label(editingState)} Penalty"
	/>
{/key}

{#if showBleedingAndHerbs}
	<label class="finish-creation">
		<input type="checkbox" bind:checked={wound.bleeding} />
		<span>Bleeding</span>
	</label>
	<label class="finish-creation">
		<input type="checkbox" bind:checked={wound.numbingHerbsApplied} />
		<span>
			Numbing Herbs — lowers this wound's penalties by 2, and near-death penalties by 2, for 2d10
			rounds.
		</span>
	</label>
{/if}
