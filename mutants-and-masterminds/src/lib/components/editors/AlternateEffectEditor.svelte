<script lang="ts">
	import EffectEditor from './EffectEditor.svelte';
	import { createDefaultEffect } from '$lib/utils/character';

	let {
		alt,
		onRemove,
		depth = 0,
	}: {
		alt: any;
		onRemove: () => void;
		depth?: number;
	} = $props();

	function addEffect() {
		alt.effects.push(createDefaultEffect(alt.effects.length === 0));
	}

	function removeEffect(ei: number) {
		alt.effects.splice(ei, 1);
	}
</script>

<div class="alt-card">
	<div class="alt-header-row">
		<input type="text" class="alt-name-input" bind:value={alt.name} placeholder="Alternate name" />
		<select class="type-select" bind:value={alt.arrayType}>
			<option value="ALTERNATE">Alternate</option>
			<option value="DYNAMIC">Dynamic</option>
		</select>
		<button class="remove-btn sm" onclick={onRemove}>&#10005;</button>
	</div>
	<textarea class="alt-desc-input" bind:value={alt.description} placeholder="Description"></textarea>
	<div class="descriptors-row">
		<input type="text" class="desc-input" value={alt.descriptors?.[0] ?? ''}
			oninput={(e) => { const v = (e.target as HTMLInputElement).value; alt.descriptors = v ? [v] : []; }}
			placeholder="Descriptors" />
	</div>
	<div class="alt-meta-row">
		<label class="sm-label">Cost/r</label>
		<input type="number" class="sm-input sm-input-sm" bind:value={alt.costPerRank} />
		<label class="sm-label">Alloc Rank</label>
		<input type="number" class="sm-input sm-input-sm" bind:value={alt.currentAllocatedRank} />
	</div>
	<div class="alt-effects-list">
		{#each alt.effects as effect, ei}
			<EffectEditor effect={effect} onRemove={() => removeEffect(ei)} {depth} />
		{/each}
		<button class="add-effect-btn" onclick={addEffect}>+ Effect</button>
	</div>
</div>

