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

<style>
	.skill-header-row {
		display: grid;
		grid-template-columns: 1fr 56px 56px 56px 56px;
		gap: 8px;
		border-bottom: 2px solid var(--border);
		padding-bottom: 4px;
		margin-bottom: 4px;
	}
	.skill-hdr {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		font-weight: 700;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		text-align: center;
		white-space: nowrap;
	}
	.skill-hdr:first-child { text-align: left; }
	.skill-row {
		display: grid;
		grid-template-columns: 1fr 56px 56px 56px 56px;
		gap: 8px;
		align-items: center;
		padding: 4px 0;
	}
	.skill-row:nth-child(even) { background: #f0f0f0; margin: 0 -12px; padding: 4px 12px; }
	.skill-name {
		font-family: 'Nunito', sans-serif;
		font-size: 13px;
		font-weight: 600;
		color: var(--ink);
	}
	.skill-cell {
		font-family: 'Oswald', sans-serif;
		font-size: 13px;
		font-weight: 700;
		color: var(--primary);
		text-align: center;
	}
</style>
