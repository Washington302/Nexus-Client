<script lang="ts">
	import type { WitcherCharacter } from '$lib/services/api';
	import {
		RACE_OPTIONS,
		PROFESSION_OPTIONS,
		label,
		listToText,
		textToList
	} from '$lib/utils/character';

	let { draft }: { draft: WitcherCharacter } = $props();
</script>

<div class="field-group">
	<div class="field-hdr">Race</div>
	<select class="input-demo" bind:value={draft.raceInfo.race}>
		<option value={null}>&mdash; Select &mdash;</option>
		{#each RACE_OPTIONS as opt}
			<option value={opt}>{label(opt)}</option>
		{/each}
	</select>
</div>

<div class="field-group">
	<div class="field-hdr">Racial Traits</div>
	<textarea
		class="input-demo"
		rows="2"
		value={listToText(draft.raceInfo.racialTraits)}
		oninput={(e) => (draft.raceInfo.racialTraits = textToList(e.currentTarget.value))}></textarea>
	<span class="field-hint">Comma-separated.</span>
</div>

<div class="field-group">
	<div class="field-hdr">Profession</div>
	<select class="input-demo" bind:value={draft.professionInfo.profession}>
		<option value={null}>&mdash; Select &mdash;</option>
		{#each PROFESSION_OPTIONS as opt}
			<option value={opt}>{label(opt)}</option>
		{/each}
	</select>
</div>

<!-- The Defining Skill lives under Profession Abilities on the Skills tab. -->

<div class="field-group">
	<div class="field-hdr">Magical Perks</div>
	<textarea class="input-demo" rows="2" bind:value={draft.professionInfo.magicalPerksNotes}
	></textarea>
</div>

<div class="field-group">
	<div class="field-hdr">Gear Package</div>
	<textarea class="input-demo" rows="2" bind:value={draft.professionInfo.gearPackageNotes}
	></textarea>
</div>
