<script lang="ts">
	import type { MythrasCharacter, FatigueLevel } from '$lib/services/api';
	import EditableSectionCard from '$lib/components/EditableSectionCard.svelte';
	import Panel from '$lib/components/Panel.svelte';

	let {
		draft,
		editable = true,
		onOpen,
		onCancel
	}: {
		draft: MythrasCharacter;
		editable?: boolean;
		onOpen?: () => void;
		onCancel?: () => void;
	} = $props();

	const FATIGUE_STEPS: FatigueLevel[] = [
		'Fresh',
		'Winded',
		'Tired',
		'Wearied',
		'Exhausted',
		'Debilitated',
		'Incapacitated',
		'Semi-Conscious',
		'Comatose',
		'Dead'
	];
</script>

{#snippet conditionView()}
	<div class="condition-strip">
		{#each draft.hitLocations as loc}
			<div class="condition-chip">
				<span class="condition-chip-label">{loc.name}</span>
				<span class="condition-chip-value">{loc.currentHp}/{loc.maxHp}</span>
			</div>
		{/each}
	</div>
	<div class="condition-row">
		<div class="fatigue-ladder">
			{#each FATIGUE_STEPS as step}
				<span class="fatigue-step" style="cursor:default;" class:active={draft.fatigueLevel === step}
					>{step}</span
				>
			{/each}
		</div>
		{#if draft.woundNotes}
			<div class="condition-wounds"><strong>Wounds:</strong> {draft.woundNotes}</div>
		{/if}
	</div>
{/snippet}

{#snippet conditionEdit()}
	<div class="field-hdr" style="margin-bottom:6px;">Hit Locations</div>
	{#each draft.hitLocations as loc}
		<div class="hitloc-row">
			<span class="hitloc-roll">{loc.d20Range}</span>
			<span class="hitloc-name">{loc.name}</span>
			<div class="hitloc-hp">
				<input class="input-demo input-num" type="number" bind:value={loc.currentHp} />
				/ {loc.maxHp}
			</div>
			<div>
				<input class="input-demo input-num" type="number" bind:value={loc.armorPoints} placeholder="AP" />
			</div>
		</div>
		<div class="field-group" style="margin-bottom:6px;">
			<input class="input-demo" bind:value={loc.armorWorn} placeholder="Armor worn on this location" />
		</div>
	{/each}

	<div class="field-hdr" style="margin-top:12px;margin-bottom:6px;">Fatigue</div>
	<div class="fatigue-ladder">
		{#each FATIGUE_STEPS as step}
			<button class="fatigue-step" class:active={draft.fatigueLevel === step} onclick={() => (draft.fatigueLevel = step)}
				>{step}</button
			>
		{/each}
	</div>

	<div class="field-group" style="margin-top:12px;">
		<div class="field-hdr">Wounds</div>
		<input class="input-demo" bind:value={draft.woundNotes} placeholder="Wound notes" />
	</div>
{/snippet}

<div class="condition-bar-wrap">
	{#if editable}
		<EditableSectionCard {onOpen} {onCancel} title="Condition" color="primary">
			{#snippet view()}
				{@render conditionView()}
			{/snippet}
			{#snippet edit()}
				{@render conditionEdit()}
			{/snippet}
		</EditableSectionCard>
	{:else}
		<Panel header="Condition" color="primary">
			{@render conditionView()}
		</Panel>
	{/if}
</div>
