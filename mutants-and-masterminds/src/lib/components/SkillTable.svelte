<script lang="ts">
	let {
		skills = []
	}: {
		skills: Array<{ skillName: string; keyAbility: string; ranks: number; modifier: number; finalBonus: number }>
	} = $props();

	function abbr(ability: string): string {
		const map: Record<string, string> = {
			STRENGTH: 'STR', STAMINA: 'STA', AGILITY: 'AGL', DEXTERITY: 'DEX',
			FIGHTING: 'FGT', INTELLECT: 'INT', AWARENESS: 'AWE', PRESENCE: 'PRE'
		};
		return map[ability] || ability.slice(0, 3);
	}
</script>

<div class="skill-header-row">
	<div class="skill-hdr">Skill</div>
	<div class="skill-hdr">Total</div>
	<div class="skill-hdr">Ability</div>
	<div class="skill-hdr">Ranks</div>
	<div class="skill-hdr">Other</div>
</div>
{#each skills as skill, i}
	<div class="skill-row">
		<div class="skill-name">{skill.skillName}</div>
		<div class="skill-cell">{skill.finalBonus >= 0 ? '+' : ''}{skill.finalBonus}</div>
		<div class="skill-cell">{abbr(skill.keyAbility)}</div>
		<div class="skill-cell">{skill.ranks}</div>
		<div class="skill-cell">{skill.modifier > 0 ? '+' + skill.modifier : '—'}</div>
	</div>
{/each}

