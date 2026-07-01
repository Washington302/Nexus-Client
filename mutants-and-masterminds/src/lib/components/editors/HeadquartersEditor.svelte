<script lang="ts">
	import type { Headquarters } from '$lib/services/api';
	import PowersEditor from './PowersEditor.svelte';

	let { headquarters }: { headquarters: Headquarters[] } = $props();

	let expandedDefense = $state<Record<number, boolean>>({});

	function toggleDefense(i: number) {
		expandedDefense[i] = !expandedDefense[i];
	}

	function add() {
		headquarters.push({
			name: '', location: '', description: '',
			sizeCategory: 'SMALL', sizeCost: 0, toughnessValue: 0, toughnessCost: 0,
			features: [], defenseSystems: [],
			totalEpCost: 0, isSharedTeamBase: false,
		});
	}

	function remove(i: number) {
		headquarters.splice(i, 1);
	}

	function addFeature(hq: Headquarters) {
		hq.features.push('');
	}

	function removeFeature(hq: Headquarters, fi: number) {
		hq.features.splice(fi, 1);
	}

	function addDefenseSystem(hq: Headquarters) {
		hq.defenseSystems.push({
			powerId: crypto.randomUUID(), name: '', description: '', descriptors: [], isArray: false, maxPpPool: 0,
			effects: [], alternateEffects: [], totalPowerCost: 0,
		});
	}

	function removeDefenseSystem(hq: Headquarters, di: number) {
		hq.defenseSystems.splice(di, 1);
	}
</script>

<div class="editor-grid">
	{#each headquarters as hq, i}
	<div class="hq-block">
		<div class="hq-header-row">
			<input type="text" class="name-input" bind:value={hq.name} placeholder="Headquarters name" />
			<button class="remove-btn" onclick={() => remove(i)}>&#10005;</button>
		</div>
		<div class="hq-grid">
			<div class="field"><label class="field-label">Location</label><input type="text" class="text-input" bind:value={hq.location} placeholder="Location" /></div>
			<div class="field"><label class="field-label">Size</label><select class="sel-input" bind:value={hq.sizeCategory}><option value="TINY">Tiny</option><option value="SMALL">Small</option><option value="MEDIUM">Medium</option><option value="LARGE">Large</option><option value="HUGE">Huge</option></select></div>
			<div class="field"><label class="field-label">Size Cost</label><input type="number" class="num-input" bind:value={hq.sizeCost} min="0" /></div>
			<div class="field"><label class="field-label">Toughness</label><input type="number" class="num-input" bind:value={hq.toughnessValue} min="0" /></div>
			<div class="field"><label class="field-label">Toughness Cost</label><input type="number" class="num-input" bind:value={hq.toughnessCost} min="0" /></div>
			<div class="field"><label class="field-label">Total EP</label><span class="sum-display">{hq.totalEpCost}</span></div>
		</div>
		<div class="field"><label class="field-label">Description</label><textarea class="desc-input" bind:value={hq.description} placeholder="Description"></textarea></div>
		<div class="field"><label class="field-label">Features</label>
			{#each hq.features as _, fi}
			<div class="feat-row"><input type="text" class="text-input" bind:value={hq.features[fi]} placeholder="Feature" /><button class="remove-btn small" onclick={() => removeFeature(hq, fi)}>&#10005;</button></div>
			{/each}
			<button class="add-small-btn" onclick={() => addFeature(hq)}>+ Feature</button>
		</div>
		<div class="field"><label class="field-label">Defense Systems</label>
			{#each hq.defenseSystems as _, di}
			<div class="ds-row">
				<span class="ds-name">{hq.defenseSystems[di].name || 'Unnamed system'}</span>
				<span class="ds-pp">{hq.defenseSystems[di].totalPowerCost} PP</span>
				<button class="remove-btn small" onclick={() => removeDefenseSystem(hq, di)}>&#10005;</button>
			</div>
			{/each}
			<div class="ds-actions">
				<button class="add-small-btn" onclick={() => addDefenseSystem(hq)}>+ Add System</button>
				<button class="edit-small-btn" onclick={() => toggleDefense(i)}>{expandedDefense[i] ? 'Hide Editor' : 'Edit All Systems'}</button>
			</div>
			{#if expandedDefense[i]}
			<div class="inline-editor">
				<PowersEditor powers={hq.defenseSystems} />
			</div>
			{/if}
		</div>
		<label class="check-row"><input type="checkbox" bind:checked={hq.isSharedTeamBase} /><span>Shared team base</span></label>
	</div>
	{/each}
	<button class="add-btn" onclick={add}>+ Add Headquarters</button>
</div>

