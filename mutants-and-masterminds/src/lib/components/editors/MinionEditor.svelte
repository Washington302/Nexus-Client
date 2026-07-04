<script lang="ts">
	import type { MinionStatBlock } from '$lib/services/api';
	import AbilitiesEditor from './AbilitiesEditor.svelte';
	import DefensesEditor from './DefensesEditor.svelte';
	import SkillsEditor from './SkillsEditor.svelte';
	import AdvantagesEditor from './AdvantagesEditor.svelte';
	import PowersEditor from './PowersEditor.svelte';

	let {
		minion,
		depth = 0,
	}: {
		minion: MinionStatBlock;
		depth?: number;
	} = $props();

	$effect(() => {
		if (!minion.combatState) {
			minion.combatState = { conditions: [], damage: 0, dying: 0, staggered: false, accumulatedToughnessPenalty: 0 };
		}
	});
</script>

<div class="minion-editor">
	<div class="mini-section">
		<div class="mini-section-label">Abilities</div>
		<AbilitiesEditor abilities={minion.abilities} />
	</div>
	<div class="mini-section">
		<div class="mini-section-label">Defenses</div>
		<DefensesEditor defenses={minion.defenses} />
	</div>
	<div class="mini-section">
		<div class="mini-section-label">Skills</div>
		<SkillsEditor skills={minion.skills} />
	</div>
	<div class="mini-section">
		<div class="mini-section-label">Advantages</div>
		<AdvantagesEditor advantages={minion.advantages} />
	</div>
	<div class="mini-section">
		<div class="mini-section-label">Combat State</div>
		<div class="combat-state-editor">
			<div class="cs-row">
				<label class="cs-lbl">Damage</label>
				<input type="number" class="cs-input" bind:value={minion.combatState.damage} min="0" />
				<label class="cs-lbl">Penalty</label>
				<input type="number" class="cs-input" bind:value={minion.combatState.accumulatedToughnessPenalty} min="0" />
			</div>
			<div class="cs-row">
				<label class="cs-lbl">Dying</label>
				<input type="number" class="cs-input" bind:value={minion.combatState.dying} min="0" max="3" />
				<label class="cs-check">
					<input type="checkbox" checked={minion.combatState.staggered} onchange={() => minion.combatState.staggered = !minion.combatState.staggered} />
					Staggered
				</label>
			</div>
		</div>
	</div>
	<div class="mini-section">
		<div class="mini-section-label">Powers</div>
		<PowersEditor powers={minion.powers} depth={depth} />
	</div>
</div>

