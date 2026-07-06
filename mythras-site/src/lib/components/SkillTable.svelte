<script lang="ts">
	import type { Skill } from '$lib/services/api';

	let { skills = [] }: { skills: Skill[] } = $props();
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
		<div class="skill-cell">{skill.cultural}</div>
		<div class="skill-cell">{skill.career}</div>
		<div class="skill-cell">{skill.total}%</div>
	</div>
{:else}
	<div class="empty-hint">No skills yet.</div>
{/each}
