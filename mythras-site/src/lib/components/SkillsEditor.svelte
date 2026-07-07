<script lang="ts">
	import type { MythrasCharacter, Skill } from '$lib/services/api';
	import {
		CHARACTERISTIC_OPTIONS,
		parseFormula,
		buildFormula,
		recomputeSkill
	} from '$lib/utils/character';

	let { draft }: { draft: MythrasCharacter } = $props();

	let activeTab = $state<'standard' | 'professional' | 'magical'>('standard');

	function activeSkills(): Skill[] {
		if (activeTab === 'standard') return draft.standardSkills;
		if (activeTab === 'professional') return draft.professionalSkills;
		return draft.magicSkills;
	}

	function addSkill() {
		activeSkills().push({
			name: '',
			formula: buildFormula('STR', 'STR'),
			professional: activeTab === 'professional',
			base: 0,
			cultural: 0,
			career: 0,
			bonus: 0,
			total: 0
		});
	}

	function removeSkill(index: number) {
		activeSkills().splice(index, 1);
	}

	function onFormulaPartChange(skill: Skill, part: 0 | 1, value: string) {
		const [c1, c2] = parseFormula(skill.formula);
		const next: [string, string] = part === 0 ? [value, c2] : [c1, value];
		skill.formula = buildFormula(next[0], next[1]);
		recomputeSkill(skill, draft.characteristics);
	}

	function onPointsChange(skill: Skill) {
		recomputeSkill(skill, draft.characteristics);
	}
</script>

<div class="sheet-tabs">
	<button class="sheet-tab" class:active={activeTab === 'standard'} onclick={() => (activeTab = 'standard')}
		>Standard</button
	>
	<button
		class="sheet-tab"
		class:active={activeTab === 'professional'}
		onclick={() => (activeTab = 'professional')}>Professional</button
	>
	<button class="sheet-tab" class:active={activeTab === 'magical'} onclick={() => (activeTab = 'magical')}
		>Magical</button
	>
</div>

{#each activeSkills() as skill, i}
	{@const [char1, char2] = parseFormula(skill.formula)}
	<div class="skill-edit-row">
		<div class="skill-edit-row-top">
			<input class="input-demo" bind:value={skill.name} placeholder="Skill name" />
			<button class="remove-row-btn" onclick={() => removeSkill(i)}>&#10005;</button>
		</div>
		<div class="skill-edit-row-bottom">
			<select class="input-demo" value={char1} onchange={(e) => onFormulaPartChange(skill, 0, e.currentTarget.value)}>
				{#each CHARACTERISTIC_OPTIONS as opt}
					<option value={opt}>{opt}</option>
				{/each}
			</select>
			<select class="input-demo" value={char2} onchange={(e) => onFormulaPartChange(skill, 1, e.currentTarget.value)}>
				{#each CHARACTERISTIC_OPTIONS as opt}
					<option value={opt}>{opt}</option>
				{/each}
			</select>
			<input
				class="input-demo input-num"
				type="number"
				min="0"
				max="15"
				bind:value={skill.cultural}
				oninput={() => onPointsChange(skill)}
				title="Cultural points"
			/>
			<input
				class="input-demo input-num"
				type="number"
				min="0"
				max="15"
				bind:value={skill.career}
				oninput={() => onPointsChange(skill)}
				title="Career points"
			/>
			<span class="skill-edit-total">{skill.total}%</span>
		</div>
	</div>
{:else}
	<div class="empty-hint">No skills yet.</div>
{/each}
<button class="add-row-btn" onclick={addSkill}>+ Add Skill</button>
