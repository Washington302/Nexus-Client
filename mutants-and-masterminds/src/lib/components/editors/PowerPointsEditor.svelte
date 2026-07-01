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
		<label class="field-label">Total PP Allowed</label>
		<input type="number" class="field-input" bind:value={draft.totalAllowed} />
	</div>
	<hr class="divider" />
	<div class="cat-head">Spent Breakdown</div>
	<div class="field-row">
		<label class="field-label">Abilities</label>
		<span class="field-value">{draft.spentAbilities}</span>
	</div>
	<div class="field-row">
		<label class="field-label">Defenses</label>
		<input type="number" class="field-input" bind:value={draft.spentDefenses} />
	</div>
	<div class="field-row">
		<label class="field-label">Skills</label>
		<input type="number" class="field-input" bind:value={draft.spentSkills} />
	</div>
	<div class="field-row">
		<label class="field-label">Advantages</label>
		<input type="number" class="field-input" bind:value={draft.spentAdvantages} />
	</div>
	<div class="field-row">
		<label class="field-label">Powers</label>
		<input type="number" class="field-input" bind:value={draft.spentPowers} />
	</div>
	<hr class="divider" />
	<div class="field-row">
		<label class="field-label"><strong>Total Spent</strong></label>
		<span class="field-value"><strong>{totalSpent}</strong></span>
	</div>
	<div class="note">Remaining: <strong>{draft.totalAllowed - totalSpent}</strong> PP</div>
</div>

