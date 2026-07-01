<script lang="ts">
	import type { DefensesBlock } from '$lib/services/api';

	let {
		defenses = $bindable()
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
