<script lang="ts">
	import type { Skill, AbilityType } from '$lib/services/api';

	let {
		skills
	}: {
		skills: Skill[]
	} = $props();

	function abbr(ability: string): string {
		const map: Record<string, string> = {
			STRENGTH: 'STR', STAMINA: 'STA', AGILITY: 'AGL', DEXTERITY: 'DEX',
			FIGHTING: 'FGT', INTELLECT: 'INT', AWARENESS: 'AWE', PRESENCE: 'PRE'
		};
		return map[ability] || ability.slice(0, 3);
	}

	const abilityOptions: Array<{ value: AbilityType; label: string }> = [
		{ value: 'STRENGTH', label: 'STR' },
		{ value: 'STAMINA', label: 'STA' },
		{ value: 'AGILITY', label: 'AGL' },
		{ value: 'DEXTERITY', label: 'DEX' },
		{ value: 'FIGHTING', label: 'FGT' },
		{ value: 'INTELLECT', label: 'INT' },
		{ value: 'AWARENESS', label: 'AWE' },
		{ value: 'PRESENCE', label: 'PRE' },
	];

	function addSkill() {
		skills.push({
			skillName: '',
			keyAbility: 'AGILITY',
			ranks: 0,
			modifier: 0,
			finalBonus: 0,
			ppCost: 0,
		});
	}

	function removeSkill(i: number) {
		skills.splice(i, 1);
	}
</script>

<div class="editor-grid">
	<div class="header-row">
		<span class="header-cell">Skill</span>
		<span class="header-cell center">Ranks</span>
		<span class="header-cell center">Key</span>
		<span class="header-cell center">Mod</span>
		<span class="header-cell center"></span>
	</div>
	{#each skills as skill, i}
		<div class="skill-row">
			<input type="text" class="skill-input" bind:value={skill.skillName} placeholder="Skill name" />
			<input type="number" class="ranks-input" bind:value={skill.ranks} />
			<select class="ability-select" bind:value={skill.keyAbility}>
				{#each abilityOptions as opt}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>
			<input type="number" class="ranks-input" bind:value={skill.modifier} />
			<button class="remove-btn" onclick={() => removeSkill(i)}>&#10005;</button>
		</div>
	{/each}
	<button class="add-btn" onclick={addSkill}>+ Add Skill</button>
</div>

