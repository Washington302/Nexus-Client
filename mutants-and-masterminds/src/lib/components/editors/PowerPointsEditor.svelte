<script lang="ts">
	import type { MnmCharacter } from '$lib/services/api';

	let {
		draft
	}: {
		draft: MnmCharacter
	} = $props();
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
		<input type="number" class="field-input" bind:value={draft.spentAbilities} />
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
		<input type="number" class="field-input" bind:value={draft.totalSpent} />
	</div>
	<div class="note">Remaining: <strong>{draft.totalAllowed - draft.totalSpent}</strong> PP</div>
</div>

<style>
	.editor-grid {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.field-row {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.field-label {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 600;
		color: var(--ink);
		width: 140px;
		flex-shrink: 0;
	}
	.field-input {
		flex: 1;
		padding: 6px 8px;
		border: 2px solid var(--border);
		font-family: 'Oswald', sans-serif;
		font-size: 16px;
		font-weight: 700;
		color: var(--ink);
		background: var(--newsprint);
		outline: none;
	}
	.field-input:focus {
		border-color: var(--primary);
	}
	.divider {
		border: none;
		border-top: 2px solid var(--border);
		margin: 2px 0;
	}
	.cat-head {
		font-family: 'Oswald', sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
	.note {
		font-family: 'Nunito', sans-serif;
		font-size: 14px;
		color: var(--accent);
	}
</style>
