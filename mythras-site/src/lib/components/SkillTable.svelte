<script lang="ts">
	import type { Characteristics, Skill } from '$lib/services/api';
	import { recomputeSkill } from '$lib/utils/character';

	let {
		skills = [],
		characteristics
	}: {
		skills: Skill[];
		characteristics: Characteristics;
	} = $props();

	function onPointsChange(skill: Skill) {
		recomputeSkill(skill, characteristics);
	}
</script>

<div class="skill-header-row">
	<div class="skill-hdr">Skill</div>
	<div class="skill-hdr">Base</div>
	<div class="skill-hdr">Cult.</div>
	<div class="skill-hdr">Career</div>
	<div class="skill-hdr">Total %</div>
</div>
{#each skills as skill}
	<div class="skill-row">
		<div class="skill-name">{skill.name} <span style="opacity:0.6;">({skill.formula})</span></div>
		<div class="skill-cell">{skill.base}</div>
		<input
			class="input-demo input-num"
			type="number"
			min="0"
			max="15"
			bind:value={skill.cultural}
			oninput={() => onPointsChange(skill)}
		/>
		<input
			class="input-demo input-num"
			type="number"
			min="0"
			max="15"
			bind:value={skill.career}
			oninput={() => onPointsChange(skill)}
		/>
		<div class="skill-cell">{skill.total}%</div>
	</div>
{/each}
