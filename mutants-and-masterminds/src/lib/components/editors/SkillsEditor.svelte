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

<style>
	.editor-grid {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.header-row {
		display: grid;
		grid-template-columns: 1fr 60px 56px 56px 30px;
		gap: 8px;
		border-bottom: 2px solid var(--border);
		padding-bottom: 4px;
		margin-bottom: 2px;
		align-items: center;
	}
	.header-cell {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		font-weight: 700;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		white-space: nowrap;
	}
	.header-cell.center { text-align: center; }
	.skill-row {
		display: grid;
		grid-template-columns: 1fr 60px 56px 56px 30px;
		gap: 8px;
		align-items: center;
		padding: 3px 0;
	}
	.skill-input {
		width: 100%;
		padding: 2px 6px;
		border: 2px solid var(--border);
		font-family: 'Nunito', sans-serif;
		font-size: 13px;
		color: var(--ink);
		background: var(--newsprint);
		outline: none;
	}
	.skill-input:focus {
		border-color: var(--primary);
	}
	.ranks-input {
		width: 100%;
		padding: 2px 6px;
		border: 2px solid var(--border);
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		font-weight: 700;
		color: var(--ink);
		background: var(--newsprint);
		text-align: center;
		outline: none;
	}
	.ranks-input:focus {
		border-color: var(--primary);
	}
	.ability-select {
		width: 100%;
		padding: 2px 4px;
		border: 2px solid var(--border);
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		font-weight: 700;
		color: var(--primary);
		background: var(--newsprint);
		outline: none;
		text-align: center;
	}
	.ability-select:focus {
		border-color: var(--primary);
	}
	.remove-btn {
		background: var(--danger);
		border: 2px solid var(--border);
		color: white;
		width: 22px;
		height: 22px;
		font-size: 12px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		flex-shrink: 0;
	}
	.add-btn {
		background: var(--primary);
		border: 2px solid var(--border);
		color: white;
		font-family: 'Oswald', sans-serif;
		font-size: 14px;
		font-weight: 700;
		padding: 6px 12px;
		cursor: pointer;
		align-self: flex-start;
		letter-spacing: 0.04em;
		margin-top: 4px;
	}
</style>
