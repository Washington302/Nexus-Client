<script lang="ts">
	import type { DefensesBlock } from '$lib/services/api';

	let {
		defenses
	}: {
		defenses: DefensesBlock
	} = $props();
</script>

<div class="editor-grid">
	<div class="field-group">
		<label class="field-label">Dodge</label>
		<input type="number" class="field-input" bind:value={defenses.dodgePointsBought} />
		<label class="sub-label">From Powers</label>
		<input type="number" class="field-input sub-input" bind:value={defenses.dodgeOtherModifiers} />
	</div>
	<div class="field-group">
		<label class="field-label">Parry</label>
		<input type="number" class="field-input" bind:value={defenses.parryPointsBought} />
		<label class="sub-label">From Powers</label>
		<input type="number" class="field-input sub-input" bind:value={defenses.parryOtherModifiers} />
	</div>
	<div class="field-group">
		<label class="field-label">Fortitude</label>
		<input type="number" class="field-input" bind:value={defenses.fortitudePointsBought} />
		<label class="sub-label">From Powers</label>
		<input type="number" class="field-input sub-input" bind:value={defenses.fortitudeOtherModifiers} />
	</div>
	<div class="field-group">
		<label class="field-label">Will</label>
		<input type="number" class="field-input" bind:value={defenses.willPointsBought} />
		<label class="sub-label">From Powers</label>
		<input type="number" class="field-input sub-input" bind:value={defenses.willOtherModifiers} />
	</div>
	<div class="field-group">
		<label class="field-label">Toughness</label>
		<input type="number" class="field-input" bind:value={defenses.toughnessPointsBought} />
		<label class="sub-label">From Powers</label>
		<input type="number" class="field-input sub-input" bind:value={defenses.toughnessOtherModifiers} />
	</div>
</div>

<style>
	.editor-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px 20px;
		margin-bottom: 8px;
	}
	.field-group {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.field-label {
		font-family: 'Oswald',sans-serif;
		font-size: 15px;
		font-weight: 700;
		color: var(--ink);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 2px;
	}
	.field-input {
		padding: 6px 8px;
		border: 2px solid var(--border);
		font-family: 'Oswald',sans-serif;
		font-size: 16px;
		font-weight: 700;
		color: var(--ink);
		background: var(--newsprint);
		outline: none;
		width: 100%;
	}
	.field-input:focus {
		border-color: var(--primary);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 30%, transparent);
	}
	.sub-label { font-family:'Oswald',sans-serif; font-size:11px; color:var(--secondary); margin-top:2px; text-transform:uppercase; letter-spacing:0.04em; }
	.sub-input { border-color:var(--secondary) !important; }
</style>