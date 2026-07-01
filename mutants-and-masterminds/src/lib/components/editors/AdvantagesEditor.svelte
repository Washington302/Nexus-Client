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

