<script lang="ts">
	import type { ProfessionAbility, WitcherStat } from '$lib/services/api';
	import { STAT_ABBREV } from '$lib/utils/character';

	// One free-form node of the profession tree. Empty slots still render so the shape
	// of the tree is visible and you can fill them in as the character advances.
	let {
		ability,
		branchColor,
		editable = true,
		onEdit
	}: {
		ability: ProfessionAbility;
		branchColor: 'one' | 'two' | 'three';
		editable?: boolean;
		onEdit?: (ability: ProfessionAbility) => void;
	} = $props();

	const filled = $derived(ability.name.trim().length > 0);
</script>

<div class="ability-card {branchColor}" class:empty={!filled}>
	<div class="ability-head">
		<span class="ability-name">{filled ? ability.name : 'Empty slot'}</span>
		<span class="ability-stat">
			{ability.governingStat ? STAT_ABBREV[ability.governingStat as WitcherStat] : 'N/A'}
		</span>
	</div>

	<div class="ability-body">
		{#if ability.description}
			<p class="ability-desc">{ability.description}</p>
		{:else}
			<p class="ability-desc muted">
				{filled ? 'No description yet.' : 'Not taken.'}
			</p>
		{/if}
	</div>

	<div class="ability-foot">
		<span class="ability-level-label">Level</span>
		<span class="ability-level">{ability.level}</span>
		{#if editable}
			<button type="button" class="ability-edit-btn" onclick={() => onEdit?.(ability)}>
				{filled ? 'Edit' : 'Add'}
			</button>
		{/if}
	</div>
</div>
