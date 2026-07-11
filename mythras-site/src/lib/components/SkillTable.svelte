<script lang="ts">
	import type { Skill } from '$lib/services/api';

	let { skills = [] }: { skills: Skill[] } = $props();
</script>

<div class="skill-header-row">
	<div class="skill-hdr">Skill</div>
	<div class="skill-hdr">Total %</div>
</div>
{#each skills as skill}
	<div class="skill-row">
		<div class="skill-name">
			{skill.name}{skill.specialization ? ` (${skill.specialization})` : ''}
			<span style="opacity:0.6;">({skill.formula})</span>
		</div>
		<div class="skill-cell">{skill.total}%</div>
	</div>
{:else}
	<div class="empty-hint">No skills yet.</div>
{/each}
