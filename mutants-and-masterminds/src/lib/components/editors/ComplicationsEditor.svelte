<script lang="ts">
	import type { Complication } from '$lib/services/api';

	let {
		complications
	}: {
		complications: Complication[]
	} = $props();

	function addComplication() {
		complications.push({ type: '', description: '' });
	}

	function removeComplication(i: number) {
		complications.splice(i, 1);
	}
</script>

<div class="editor-grid">
	{#each complications as comp, i}
		<div class="comp-row">
			<div class="comp-header">
				<select class="type-select" bind:value={comp.type}>
					<option value="">Select type...</option>
					<option value="ACCIDENT">Accident</option>
					<option value="ADDICTION">Addiction</option>
					<option value="DISABILITY">Disability</option>
					<option value="ENEMY">Enemy</option>
					<option value="FAME">Fame</option>
					<option value="HONOR">Honor</option>
					<option value="MOTIVATION">Motivation</option>
					<option value="POWER_LOSS">Power Loss</option>
					<option value="RELATIONSHIP">Relationship</option>
					<option value="REPUTATION">Reputation</option>
					<option value="RESPONSIBILITY">Responsibility</option>
					<option value="RIVALRY">Rivalry</option>
					<option value="SECRET">Secret</option>
					<option value="VULNERABILITY">Vulnerability</option>
					<option value="WEAKNESS">Weakness</option>
				</select>
				<button class="remove-btn" onclick={() => removeComplication(i)}>&#10005;</button>
			</div>
			<textarea class="desc-input" bind:value={comp.description} placeholder="Description" rows="2"></textarea>
		</div>
	{/each}
	<button class="add-btn" onclick={addComplication}>+ Add Complication</button>
</div>

