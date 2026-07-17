<script lang="ts">
	import type { MnmCharacter } from '$lib/services/api';

	let {
		draft
	}: {
		draft: MnmCharacter
	} = $props();

	let totalSpent = $derived(
		(draft.spentAbilities ?? 0) +
		(draft.spentDefenses ?? 0) +
		(draft.spentSkills ?? 0) +
		(draft.spentAdvantages ?? 0) +
		(draft.spentPowers ?? 0)
	);
</script>

<div class="editor-grid">
	<div class="field-row">
		<label class="field-label pp-label">Total PP Allowed</label>
		<input type="number" class="field-input" bind:value={draft.totalAllowed} />
	</div>
	<hr class="divider" />
	<div class="cat-head">Spent Breakdown</div>
	<div class="field-row">
		<label class="field-label pp-label">Abilities</label>
		<span class="field-value pp-boxed">{draft.spentAbilities}</span>
	</div>
	<div class="field-row">
		<label class="field-label pp-label">Defenses</label>
		<span class="field-value pp-boxed">{draft.spentDefenses}</span>
	</div>
	<div class="field-row">
		<label class="field-label pp-label">Skills</label>
		<span class="field-value pp-boxed">{draft.spentSkills}</span>
	</div>
	<div class="field-row">
		<label class="field-label pp-label">Advantages</label>
		<span class="field-value pp-boxed">{draft.spentAdvantages}</span>
	</div>
	<div class="field-row">
		<label class="field-label pp-label">Powers</label>
		<span class="field-value pp-boxed">{draft.spentPowers}</span>
	</div>
	<hr class="divider" />
	<div class="field-row">
		<label class="field-label pp-label"><strong>Total Spent</strong></label>
		<span class="field-value pp-boxed"><strong>{totalSpent}</strong></span>
	</div>
	<div class="note">Remaining: <strong>{draft.totalAllowed - totalSpent}</strong> PP</div>
</div>

<style>
	.pp-label {
		width: 140px;
		flex-shrink: 0;
		margin-bottom: 0;
	}
	.pp-boxed {
		width: 100%;
		border: 2px solid var(--border);
		background: var(--newsprint);
	}
</style>

