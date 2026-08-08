<script lang="ts">
	import type { WitcherCharacter, DerivedTarget } from '$lib/services/api';
	import { label, GAME_TYPE_OPTIONS, effectiveDerived, lifepathValue } from '$lib/utils/character';
	import AttributeTable from '$lib/components/AttributeTable.svelte';
	import CriticalWounds from '$lib/components/CriticalWounds.svelte';
	import RacialPerks from '$lib/components/RacialPerks.svelte';
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

	/** The Homeland lifepath entry, shown in Identity as Origin. */
	const origin = $derived(lifepathValue(draft.lifepathEvents, 'Homeland'));

	/** One derived value after every active wound and perk that targets it. */
	function withModifiers(value: number, target: DerivedTarget): number {
		return effectiveDerived(value, draft.criticalWounds, draft.raceInfo.perks, target);
	}
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
				perks={draft.raceInfo.perks}
				{editable}
			/>
		</Panel>

		<!-- Sits directly under the attribute table because it is what drives the
		     Effective column there. -->
		<CriticalWounds {draft} {editable} {onOpenEdit} {onCancelEdit} />

		<!-- Next to the wounds because they feed the same Effective column, from the
		     opposite direction. -->
		<RacialPerks {draft} {editable} {onOpenEdit} {onCancelEdit} />

		<!-- Recalculated server-side from Statistics, so these are read-only. The
		     numbers shown are after any wound or perk targeting them — a Dwarf's
		     Strong perk adds +25 Encumbrance, Heart Damage quarters SPD-derived
		     movement — since the server deliberately stores its own value unmodified. -->
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
					<div class="derived-value">
						{withModifiers(draft.derivedStats.meleeDamageBonus, 'MELEE_DAMAGE_BONUS')}
					</div>
				</div>
				<div class="derived-item">
					<div class="derived-label">Run</div>
					<div class="derived-value">{withModifiers(draft.derivedStats.run, 'RUN')}</div>
				</div>
				<div class="derived-item">
					<div class="derived-label">Leap</div>
					<div class="derived-value">{withModifiers(draft.derivedStats.leap, 'LEAP')}</div>
				</div>
				<div class="derived-item">
					<div class="derived-label">Recovery</div>
					<div class="derived-value">{withModifiers(draft.derivedStats.recovery, 'RECOVERY')}</div>
				</div>
				<div class="derived-item">
					<div class="derived-label">Encumbrance</div>
					<div class="derived-value">
						{withModifiers(draft.derivedStats.encumbrance, 'ENCUMBRANCE')}
					</div>
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
				{#if draft.age || draft.gender}
					<div class="grid-2">
						{#if draft.age}
							<div class="field-group">
								<div class="field-hdr">Age</div>
								<div class="field-value">{draft.age}</div>
							</div>
						{/if}
						{#if draft.gender}
							<div class="field-group">
								<div class="field-hdr">Gender</div>
								<div class="field-value">{draft.gender}</div>
							</div>
						{/if}
					</div>
				{/if}
				<!-- Origin is not a field of its own: Homeland is a rollable lifepath table
				     with mechanical effects, so it lives in lifepathEvents and is surfaced
				     here rather than being stored twice and drifting apart. -->
				{#if origin}
					<div class="field-group">
						<div class="field-hdr">Origin</div>
						<div class="field-value">{origin}</div>
					</div>
				{/if}
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
				{#if draft.raceInfo.socialStanding}
					<div class="field-group">
						<div class="field-hdr">Social Standing</div>
						<div class="field-value">{draft.raceInfo.socialStanding}</div>
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
