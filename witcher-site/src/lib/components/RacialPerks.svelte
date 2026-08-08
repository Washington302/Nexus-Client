<script lang="ts">
	import type { WitcherCharacter } from '$lib/services/api';
	// `label` is deliberately not imported here: it would shadow the <label> element.
	import { modifierText, createDefaultRacialPerk } from '$lib/utils/character';
	import SheetSection from '$lib/components/SheetSection.svelte';
	import StatModifierRows from '$lib/components/StatModifierRows.svelte';

	// Perks replaced the old comma-separated traits box. A perk with no modifiers is
	// still just a narrative trait, so nothing is lost by the change — but one that
	// carries modifiers now actually moves the numbers on the sheet.
	//
	// They are never folded into the stored maxima: perks aren't purchased, so counting
	// them would break the chargen point budgets. That is why the sheet applies them and
	// the server doesn't.
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

	function addPerk() {
		draft.raceInfo.perks.push(createDefaultRacialPerk());
	}
	function removePerk(id: string) {
		draft.raceInfo.perks = draft.raceInfo.perks.filter((p) => p.id !== id);
	}
</script>

<SheetSection
	{editable}
	onOpen={onOpenEdit}
	onCancel={onCancelEdit}
	title="Racial Perks"
	color="gold"
>
	{#snippet view()}
		{#if draft.raceInfo.socialStanding}
			<div class="field-group">
				<div class="field-hdr">Social Standing</div>
				<div class="field-value">{draft.raceInfo.socialStanding}</div>
			</div>
		{/if}
		{#if draft.raceInfo.perks.length === 0}
			<p class="empty-hint">No perks recorded.</p>
		{:else}
			{#each draft.raceInfo.perks as perk (perk.id)}
				<div class="wound-row" class:perk-inactive={!perk.active}>
					<div class="wound-head">
						<span class="effect-name">{perk.name || 'Unnamed perk'}</span>
						{#if !perk.active}<span class="pill">Inactive</span>{/if}
					</div>
					{#if perk.modifiers.length > 0}
						<span class="effect-meta">{perk.modifiers.map(modifierText).join(' · ')}</span>
					{/if}
					{#if perk.description}<p class="ability-desc">{perk.description}</p>{/if}
				</div>
			{/each}
		{/if}
	{/snippet}

	{#snippet edit()}
		<div class="field-group">
			<div class="field-hdr">Social Standing</div>
			<input
				class="input-demo"
				type="text"
				bind:value={draft.raceInfo.socialStanding}
				placeholder="Feared, Hated, Equal…"
			/>
			<span class="field-hint">
				Free text. Any numbers it carries — Feared's +1 Intimidation and −1 Charisma — go in as perk
				modifiers below, so they actually apply.
			</span>
		</div>

		{#each draft.raceInfo.perks as perk (perk.id)}
			<div class="list-card">
				<div class="field-group">
					<div class="field-hdr">Name</div>
					<input class="input-demo" type="text" bind:value={perk.name} placeholder="Perk" />
				</div>
				<div class="field-group">
					<div class="field-hdr">Description</div>
					<textarea class="input-demo" rows="2" bind:value={perk.description}></textarea>
					<span class="field-hint">A perk with no modifiers is simply a narrative trait.</span>
				</div>

				<StatModifierRows bind:modifiers={perk.modifiers} skills={draft.skills} />

				<label class="finish-creation">
					<input type="checkbox" bind:checked={perk.active} />
					<span>Active — applies its modifiers to the sheet.</span>
				</label>

				<button
					type="button"
					class="remove-row-btn"
					aria-label="Remove perk"
					onclick={() => removePerk(perk.id)}>✕</button
				>
			</div>
		{/each}
		<button type="button" class="add-row-btn" onclick={addPerk}>+ Add Perk</button>
	{/snippet}
</SheetSection>
