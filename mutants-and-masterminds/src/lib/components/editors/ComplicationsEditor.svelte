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

<style>
	.editor-grid {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.comp-row {
		border: 2px solid var(--border);
		padding: 8px;
		background: var(--newsprint);
	}
	.comp-header {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 4px;
	}
	.type-select {
		flex: 1;
		padding: 4px 6px;
		border: 2px solid var(--border);
		font-family: 'Oswald', sans-serif;
		font-size: 14px;
		font-weight: 600;
		color: var(--ink);
		background: var(--panel-bg);
		outline: none;
	}
	.type-select:focus {
		border-color: var(--primary);
	}
	.desc-input {
		width: 100%;
		padding: 4px 8px;
		border: 2px solid var(--border);
		font-family: 'Nunito', sans-serif;
		font-size: 15px;
		color: var(--ink);
		background: var(--panel-bg);
		outline: none;
		resize: vertical;
	}
	.desc-input:focus {
		border-color: var(--primary);
	}
	.remove-btn {
		background: var(--danger);
		border: 2px solid var(--border);
		color: white;
		width: 26px;
		height: 26px;
		font-size: 14px;
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
	}
</style>
