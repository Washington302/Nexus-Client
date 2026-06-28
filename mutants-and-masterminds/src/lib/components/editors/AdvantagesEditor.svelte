<script lang="ts">
	import type { Advantage } from '$lib/services/api';

	let {
		advantages
	}: {
		advantages: Advantage[]
	} = $props();

	function addAdvantage() {
		advantages.push({ name: '', ranks: 1, description: '' });
	}

	function removeAdvantage(i: number) {
		advantages.splice(i, 1);
	}
</script>

<div class="editor-grid">
	{#each advantages as adv, i}
		<div class="adv-block">
			<div class="adv-row">
				<input type="text" class="name-input" bind:value={adv.name} placeholder="Advantage name" />
				<div class="ranks-group">
					<label class="ranks-label">Ranks</label>
					<input type="number" class="ranks-input" bind:value={adv.ranks} min="1" />
				</div>
				<button class="remove-btn" onclick={() => removeAdvantage(i)}>&#10005;</button>
			</div>
			<textarea class="desc-input" bind:value={adv.description} placeholder="Description — what does this advantage do?"></textarea>
		</div>
	{/each}
	<button class="add-btn" onclick={addAdvantage}>+ Add Advantage</button>
</div>

<style>
	.editor-grid {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.adv-block {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 6px;
		border: 1.5px dashed var(--border);
	}
	.adv-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.name-input {
		flex: 1;
		padding: 5px 8px;
		border: 2px solid var(--border);
		font-family: 'Nunito', sans-serif;
		font-size: 14px;
		color: var(--ink);
		background: var(--newsprint);
		outline: none;
	}
	.name-input:focus {
		border-color: var(--primary);
	}
	.desc-input {
		width: 100%;
		padding: 5px 8px;
		border: 2px solid var(--border);
		font-family: 'Nunito', sans-serif;
		font-size: 15px;
		color: var(--ink);
		background: var(--newsprint);
		outline: none;
		resize: vertical;
		min-height: 48px;
		box-sizing: border-box;
	}
	.desc-input:focus {
		border-color: var(--primary);
	}
	.ranks-group {
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.ranks-label {
		font-family: 'Oswald', sans-serif;
		font-size: 12px;
		color: var(--accent);
	}
	.ranks-input {
		width: 48px;
		padding: 3px 6px;
		border: 2px solid var(--border);
		font-family: 'Oswald', sans-serif;
		font-size: 14px;
		font-weight: 700;
		color: var(--ink);
		background: var(--newsprint);
		text-align: center;
		outline: none;
	}
	.ranks-input:focus {
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
