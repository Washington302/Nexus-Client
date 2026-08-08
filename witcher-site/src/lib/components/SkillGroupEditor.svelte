<script lang="ts">
	import type { Skill } from '$lib/services/api';
	import { label, skillTotal } from '$lib/utils/character';

	// `skills` is the filtered slice of draft.skills for one stat. filter() returns a
	// new array but the Skill objects are the same references, so binding to
	// skill.points writes straight through to the draft.
	// The stat value itself is not edited here — it lives in the attribute table.
	let { statValue, skills }: { statValue: number; skills: Skill[] } = $props();
</script>

<div class="skill-edit-row skill-edit-head">
	<span class="skill-edit-name">Skill</span>
	<span>Points</span>
	<span>Total</span>
</div>

{#each skills as skill}
	<div class="skill-edit-row">
		<span class="skill-edit-name">
			{label(skill.skillName)}
			{#if skill.costPerLevel === 2}<span class="cost-mark" title="Costs 2 points per level"
					>×2</span
				>{/if}
		</span>
		<input class="input-demo input-num" type="number" min="0" bind:value={skill.points} />
		<span class="skill-edit-total" title="Governing stat + points invested"
			>{skillTotal(statValue, skill.points)}</span
		>
	</div>
{/each}
