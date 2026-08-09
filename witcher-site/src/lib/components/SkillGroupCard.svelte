<script lang="ts">
	import type { WitcherStat, Skill } from '$lib/services/api';
	import { label, skillTotal } from '$lib/utils/character';

	// Collapsible group of every skill governed by one stat. The stat's own value is
	// shown for reference only — it's edited in the attribute table on the Stats tab.
	let { stat, statValue, skills }: { stat: WitcherStat; statValue: number; skills: Skill[] } =
		$props();

	let open = $state(false);
	const panelId = $derived(`skills-${stat.toLowerCase()}`);
	const invested = $derived(skills.reduce((sum, s) => sum + (s.points || 0), 0));
</script>

<div class="attribute-card" class:open>
	<button
		type="button"
		class="attribute-card-header"
		onclick={() => (open = !open)}
		aria-expanded={open}
		aria-controls={panelId}
	>
		<span class="attribute-card-name">{label(stat)}</span>
		<span class="attribute-card-meta">
			<span class="skill-group-count">{invested} pts</span>
			<span class="attribute-card-value">{statValue}</span>
			<span class="attribute-chevron" aria-hidden="true"></span>
		</span>
	</button>

	{#if open}
		<div class="attribute-card-body" id={panelId}>
			{#each skills as skill}
				<div class="skill-row">
					<span class="skill-row-name">
						{label(skill.skillName)}
						{#if skill.specialization}<span class="skill-specialization"
								>({skill.specialization})</span
							>{/if}
						{#if skill.packageSkill}<span class="pkg-mark" title="Profession package skill">●</span
							>{/if}
						{#if skill.costPerLevel === 2}<span class="cost-mark" title="Costs 2 points per level"
								>×2</span
							>{/if}
					</span>
					<span class="skill-row-total">{skillTotal(statValue, skill.points)}</span>
				</div>
			{/each}
		</div>
	{/if}
</div>
