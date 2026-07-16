<script lang="ts">
	import type { WitcherStat, Skill } from '$lib/services/api';
	import { label } from '$lib/utils/character';

	let { stat, value, skills }: { stat: WitcherStat; value: number; skills: Skill[] } = $props();
</script>

<div class="attribute-card">
	<div class="attribute-card-header">
		<span class="attribute-card-name">{label(stat)}</span>
		<span class="attribute-card-value">{value}</span>
	</div>
	{#if skills.length > 0}
		<div>
			{#each skills as skill}
				<div class="skill-row">
					<span class="skill-row-name">
						{label(skill.skillName)}
						{#if skill.packageSkill}<span class="pkg-mark" title="Profession package skill">●</span
							>{/if}
					</span>
					<span class="skill-row-total">{skill.total}</span>
				</div>
			{/each}
		</div>
	{/if}
</div>
