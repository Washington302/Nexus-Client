<script lang="ts">
	import type { WitcherCharacter } from '$lib/services/api';
	import {
		STAT_TABLE_ORDER,
		skillsForStat,
		effectiveStat,
		definingSkillAbility,
		createDefaultSpecialization,
		label
	} from '$lib/utils/character';
	import type { Skill } from '$lib/services/api';
	import SkillGroupCard from '$lib/components/SkillGroupCard.svelte';
	import SkillGroupEditor from '$lib/components/SkillGroupEditor.svelte';
	import EditableWrapper from '$lib/components/EditableWrapper.svelte';
	import ProfessionAbilities from '$lib/components/ProfessionAbilities.svelte';
	import Panel from '$lib/components/Panel.svelte';
	import { api } from '$lib/services/api';

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

	// One box, two economies. Which one is live is decided by the PERSISTED
	// creationComplete flag server-side, so the save that finishes creation is still
	// validated as creation and only the next one spends I.P.
	const inPlay = $derived(draft.levelingInfo.creationComplete);

	let ipError = $state<string | null>(null);
	// Deltas that have been clicked but not yet confirmed by the server, so the
	// number moves the instant you press a button instead of waiting on a round trip.
	let unconfirmed = $state(0);
	const availablePoints = $derived(draft.levelingInfo.improvementPointsAvailable + unconfirmed);

	// The adjust endpoint is a read-modify-write on the whole document server-side, so
	// two in-flight requests both read the same balance and one increment is lost.
	// Chaining keeps exactly one request in flight; the optimistic count above is what
	// keeps rapid clicking feeling instant despite that.
	let queue: Promise<void> = Promise.resolve();

	function step(delta: number) {
		if (availablePoints + delta < 0) return;
		unconfirmed += delta;
		ipError = null;
		queue = queue.then(async () => {
			try {
				// The balance is server-owned and stripped from ordinary saves, so this posts
				// straight through. It persists against the STORED record, so only the returned
				// balance is merged back — replacing the draft would blow away unsaved edits.
				const updated = await api.character.adjustImprovementPoints(draft.id, { amount: delta });
				draft.levelingInfo.improvementPointsAvailable =
					updated.levelingInfo.improvementPointsAvailable;
				draft.levelingInfo.improvementPointsEarned = updated.levelingInfo.improvementPointsEarned;
			} catch (e) {
				ipError = (e as Error).message;
			} finally {
				// Server value now accounts for this delta (or it failed) — either way it's
				// no longer pending.
				unconfirmed -= delta;
			}
		});
	}

	// Mirrors validateSkillBudgets: package skills (plus the Defining Skill) draw on a
	// 44-point pool, everything else draws on INT+REF. Shown live so you can see a
	// budget break before the server rejects the save.
	//
	// The Defining Skill contributes its LEVEL directly, not level*costPerLevel — it's
	// a ProfessionAbility now, which has no costPerLevel field, and the server's own
	// validateSkillBudgets prices it the same way (packageSpent = definingAbility.level).
	const packageSpent = $derived(
		(definingSkillAbility(draft.professionInfo.abilities)?.level ?? 0) +
			draft.skills
				.filter((s) => s.packageSkill)
				.reduce((sum, s) => sum + s.points * s.costPerLevel, 0)
	);
	const pickupSpent = $derived(
		draft.skills
			.filter((s) => !s.packageSkill)
			.reduce((sum, s) => sum + s.points * s.costPerLevel, 0)
	);
	const pickupAllowed = $derived(draft.statistics.intelligence + draft.statistics.reflexes);

	// Add/remove change the length of draft.skills, which the per-stat filtered slice
	// handed to the editor can't do on its own — these operate on the full array.
	function addSpecialization(template: Skill) {
		draft.skills.push(createDefaultSpecialization(template));
	}
	function removeSkill(id: string) {
		draft.skills = draft.skills.filter((s) => s.id !== id);
	}
</script>

<div class="sheet-body-grid">
	<section class="attribute-column">
		<Panel header={inPlay ? 'Improvement Points' : 'Creation Budgets'} color="plain">
			{#if inPlay}
				<div class="ip-stepper">
					{#if editable}
						<button
							type="button"
							class="ip-step"
							onclick={() => step(-1)}
							disabled={availablePoints <= 0}
							aria-label="Remove an Improvement Point">−</button
						>
					{/if}
					<div class="ip-balance">
						<div class="derived-label">Available I.P.</div>
						<div class="derived-value">{availablePoints}</div>
					</div>
					{#if editable}
						<button
							type="button"
							class="ip-step"
							onclick={() => step(1)}
							aria-label="Add an Improvement Point">+</button
						>
					{/if}
				</div>
				{#if ipError}
					<div class="modal-error">{ipError}</div>
				{/if}
				<span class="field-hint">
					Raising a skill costs its current level per step (doubled for ×2 skills); stats cost level
					× 10. The server prices each advancement and refuses a save you can't afford.
				</span>
			{:else}
				<div class="derived-grid">
					<div class="derived-item" class:over-budget={packageSpent > 44}>
						<div class="derived-label">Package</div>
						<div class="derived-value">{packageSpent}<span class="budget-cap">/44</span></div>
					</div>
					<div class="derived-item" class:over-budget={pickupSpent > pickupAllowed}>
						<div class="derived-label">Pick Up</div>
						<div class="derived-value">
							{pickupSpent}<span class="budget-cap">/{pickupAllowed}</span>
						</div>
					</div>
				</div>
				<span class="field-hint">
					Character-creation caps: package skills draw on 44 points; everything else on INT+REF.
					Skills marked ×2 cost double.
				</span>
				{#if editable}
					<label class="finish-creation">
						<input type="checkbox" bind:checked={draft.levelingInfo.creationComplete} />
						<span>
							Finish creation — switches to the I.P. economy. Takes effect on the save
							<em>after</em> this one, so budgets still apply to the save that flips it.
						</span>
					</label>
				{/if}
			{/if}
		</Panel>

		{#each STAT_TABLE_ORDER.filter((s) => skillsForStat(draft.skills, s).length > 0) as stat}
			<!-- Effective, not raw: a halved REF has to reach every skill it governs, since
		     the skill total is the number actually rolled against. -->
			{@const statVal = effectiveStat(
				draft.statistics,
				draft.derivedStats,
				draft.criticalWounds,
				draft.raceInfo.perks,
				stat
			)}
			{#if editable}
				<EditableWrapper
					title="{label(stat)} Skills"
					isEditable={true}
					onSave={async () => {}}
					onOpen={onOpenEdit}
					onCancel={onCancelEdit}
				>
					{#snippet children()}
						<SkillGroupCard {stat} statValue={statVal} skills={skillsForStat(draft.skills, stat)} />
					{/snippet}
					{#snippet editForm()}
						<SkillGroupEditor
							statValue={statVal}
							skills={skillsForStat(draft.skills, stat)}
							onAddSpecialization={addSpecialization}
							onRemoveSkill={removeSkill}
						/>
					{/snippet}
				</EditableWrapper>
			{:else}
				<SkillGroupCard {stat} statValue={statVal} skills={skillsForStat(draft.skills, stat)} />
			{/if}
		{/each}
	</section>

	<div class="sheet-side-column">
		<Panel header="Profession Abilities" color="gold">
			{#if draft.professionInfo.profession}
				<span class="field-hint" style="margin-bottom:12px;display:block;">
					{label(draft.professionInfo.profession)} tree — three branches, three tiers each.
				</span>
				<ProfessionAbilities {draft} {editable} />
			{:else}
				<p class="empty-hint">Choose a profession under Race &amp; Profession to build its tree.</p>
			{/if}
		</Panel>
	</div>
</div>
