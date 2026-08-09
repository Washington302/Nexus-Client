<script lang="ts">
	import type { WitcherCharacter } from '$lib/services/api';
	// `label` is deliberately not imported here: it would shadow the <label> element.
	import { modifierText, createDefaultRacialPerk } from '$lib/utils/character';
	import SheetSection from '$lib/components/SheetSection.svelte';
	import StatModifierRows from '$lib/components/StatModifierRows.svelte';
	import AccordionRow from '$lib/components/AccordionRow.svelte';

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
		const perk = createDefaultRacialPerk();
		draft.raceInfo.perks.push(perk);
		expanded = new Set(expanded).add(perk.id);
	}
	function removePerk(id: string) {
		draft.raceInfo.perks = draft.raceInfo.perks.filter((p) => p.id !== id);
	}

	// Collapsed by default — see AccordionRow. Keyed by id, not stored on the perk.
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
			<AccordionRow
				id={perk.id}
				open={expanded.has(perk.id)}
				onToggle={() => toggleExpanded(perk.id)}
				onRemove={() => removePerk(perk.id)}
				removeLabel="Remove perk"
			>
				{#snippet header()}
					<span class="effect-name">{perk.name || 'Unnamed perk'}</span>
					<span class="attribute-card-meta">
						{#if perk.modifiers.length > 0}
							<span class="effect-meta">{perk.modifiers.map(modifierText).join(' · ')}</span>
						{/if}
						{#if !perk.active}<span class="pill">Inactive</span>{/if}
						<span class="attribute-chevron" aria-hidden="true"></span>
					</span>
				{/snippet}
				{#snippet body()}
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
				{/snippet}
			</AccordionRow>
		{/each}
		<button type="button" class="add-row-btn" onclick={addPerk}>+ Add Perk</button>
	{/snippet}
</SheetSection>
