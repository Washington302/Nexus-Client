<script lang="ts">
	import type { WitcherCharacter } from '$lib/services/api';
	import { label, listToText, GAME_TYPE_OPTIONS } from '$lib/utils/character';
	import AttributeTable from '$lib/components/AttributeTable.svelte';
	import CriticalWounds from '$lib/components/CriticalWounds.svelte';
	import Panel from '$lib/components/Panel.svelte';
	import SheetSection from '$lib/components/SheetSection.svelte';
	import IdentityEditor from '$lib/components/IdentityEditor.svelte';
	import RaceProfessionEditor from '$lib/components/RaceProfessionEditor.svelte';

	// Stats tab body: attributes and derived combat numbers on the left, identity and
	// profession panels on the right. Skills live on their own tab now.
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
</script>

<div class="sheet-body-grid">
	<section class="attribute-column">
		<!-- The attribute table edits inline (no modal): stats move during play, and
		     max vs. current both live here so they exist in exactly one place. -->
		<Panel header="Attributes" color="plain">
			<AttributeTable
				statistics={draft.statistics}
				derivedStats={draft.derivedStats}
				criticalWounds={draft.criticalWounds}
				{editable}
			/>
		</Panel>

		<!-- Sits directly under the attribute table because it is what drives the
		     Effective column there. -->
		<CriticalWounds {draft} {editable} {onOpenEdit} {onCancelEdit} />

		<!-- Every value here is recalculated server-side from Statistics, so this
		     panel is read-only and has no edit affordance. -->
		<Panel header="Combat &amp; Movement" color="plain">
			<div class="derived-grid">
				<div class="derived-item">
					<div class="derived-label">Punch</div>
					<div class="derived-value sm">{draft.derivedStats.punchDamage || '—'}</div>
				</div>
				<div class="derived-item">
					<div class="derived-label">Kick</div>
					<div class="derived-value sm">{draft.derivedStats.kickDamage || '—'}</div>
				</div>
				<div class="derived-item">
					<div class="derived-label">Melee Dmg</div>
					<div class="derived-value">{draft.derivedStats.meleeDamageBonus}</div>
				</div>
				<div class="derived-item">
					<div class="derived-label">Run</div>
					<div class="derived-value">{draft.derivedStats.run}</div>
				</div>
				<div class="derived-item">
					<div class="derived-label">Leap</div>
					<div class="derived-value">{draft.derivedStats.leap}</div>
				</div>
				<div class="derived-item">
					<div class="derived-label">Recovery</div>
					<div class="derived-value">{draft.derivedStats.recovery}</div>
				</div>
				<div class="derived-item">
					<div class="derived-label">Encumbrance</div>
					<div class="derived-value">{draft.derivedStats.encumbrance}</div>
				</div>
			</div>
		</Panel>
	</section>

	<div class="sheet-side-column">
		<SheetSection
			{editable}
			onOpen={onOpenEdit}
			onCancel={onCancelEdit}
			title="Identity"
			color="primary"
		>
			{#snippet view()}
				{#if draft.portraitUrl}
					<div class="field-group">
						<img class="portrait-preview" src={draft.portraitUrl} alt={draft.name} />
					</div>
				{/if}
				<div class="field-group">
					<div class="field-hdr">Name</div>
					<div class="field-value">{draft.name}</div>
				</div>
				<div class="field-group">
					<div class="field-hdr">Visibility</div>
					<div class="field-value">{draft.public ? 'Public (shareable link)' : 'Private'}</div>
				</div>
			{/snippet}
			{#snippet edit()}
				<IdentityEditor {draft} />
			{/snippet}
		</SheetSection>

		<SheetSection
			{editable}
			onOpen={onOpenEdit}
			onCancel={onCancelEdit}
			title="Race &amp; Profession"
			color="gold"
		>
			{#snippet view()}
				<div class="field-group">
					<div class="field-hdr">Race</div>
					<div class="field-value">
						{draft.raceInfo.race ? label(draft.raceInfo.race) : '—'}
					</div>
				</div>
				{#if draft.raceInfo.racialTraits.length > 0}
					<div class="field-group">
						<div class="field-hdr">Racial Traits</div>
						<div class="field-value">{listToText(draft.raceInfo.racialTraits)}</div>
					</div>
				{/if}
				<div class="field-group">
					<div class="field-hdr">Profession</div>
					<div class="field-value">
						{draft.professionInfo.profession ? label(draft.professionInfo.profession) : '—'}
					</div>
				</div>
				{#if draft.professionInfo.magicalPerksNotes}
					<div class="field-group">
						<div class="field-hdr">Magical Perks</div>
						<div class="field-value notes-block">{draft.professionInfo.magicalPerksNotes}</div>
					</div>
				{/if}
				{#if draft.professionInfo.gearPackageNotes}
					<div class="field-group">
						<div class="field-hdr">Gear Package</div>
						<div class="field-value notes-block">{draft.professionInfo.gearPackageNotes}</div>
					</div>
				{/if}
			{/snippet}
			{#snippet edit()}
				<RaceProfessionEditor {draft} />
			{/snippet}
		</SheetSection>

		<SheetSection
			{editable}
			onOpen={onOpenEdit}
			onCancel={onCancelEdit}
			title="Point Buy"
			color="plain"
		>
			{#snippet view()}
				<div class="field-group">
					<div class="field-hdr">Game Type</div>
					<div class="field-value">{label(draft.statistics.gameType)}</div>
				</div>
				<span class="field-hint">Sets the point pool available for the nine Statistics.</span>
			{/snippet}
			{#snippet edit()}
				<div class="field-group">
					<div class="field-hdr">Game Type</div>
					<select class="input-demo" bind:value={draft.statistics.gameType}>
						{#each GAME_TYPE_OPTIONS as opt}
							<option value={opt}>{label(opt)}</option>
						{/each}
					</select>
				</div>
			{/snippet}
		</SheetSection>
	</div>
</div>
