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

<style>
	.editor-grid { display:flex; flex-direction:column; gap:8px; }
	.hq-block { display:flex; flex-direction:column; gap:6px; padding:8px; border:1.5px dashed var(--border); }
	.hq-header-row { display:flex; align-items:center; gap:8px; }
	.hq-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
	.field { display:flex; flex-direction:column; gap:2px; }
	.field-label { font-family:'Oswald',sans-serif; font-size:11px; font-weight:700; color:var(--accent); text-transform:uppercase; letter-spacing:0.06em; }
	.name-input { flex:1; padding:5px 8px; border:2px solid var(--border); font-family:'Nunito',sans-serif; font-size:12px; color:var(--ink); background:var(--newsprint); outline:none; }
	.name-input:focus { border-color:var(--primary); }
	.text-input { padding:4px 8px; border:2px solid var(--border); font-family:'Nunito',sans-serif; font-size:11px; color:var(--ink); background:var(--newsprint); outline:none; width:100%; box-sizing:border-box; }
	.text-input:focus { border-color:var(--primary); }
	.num-input { width:100%; padding:4px 6px; border:2px solid var(--border); font-family:'Oswald',sans-serif; font-size:11px; font-weight:700; color:var(--ink); background:var(--newsprint); text-align:center; outline:none; box-sizing:border-box; }
	.num-input:focus { border-color:var(--primary); }
	.sel-input { padding:4px 6px; border:2px solid var(--border); font-family:'Oswald',sans-serif; font-size:11px; font-weight:700; color:var(--ink); background:var(--newsprint); outline:none; }
	.sel-input:focus { border-color:var(--primary); }
	.desc-input { width:100%; padding:4px 8px; border:2px solid var(--border); font-family:'Nunito',sans-serif; font-size:11px; color:var(--ink); background:var(--newsprint); outline:none; resize:vertical; min-height:40px; box-sizing:border-box; }
	.desc-input:focus { border-color:var(--primary); }
	.feat-row { display:flex; align-items:center; gap:4px; margin-bottom:2px; }
	.ds-row { display:flex; align-items:center; gap:6px; margin-bottom:2px; padding:2px 4px; background:color-mix(in srgb, var(--panel-bg) 60%, transparent); border:1.5px solid var(--border); }
	.ds-name { flex:1; font-family:'Nunito',sans-serif; font-size:11px; font-weight:600; color:var(--ink); }
	.ds-pp { font-family:'Oswald',sans-serif; font-size:12px; font-weight:700; color:var(--accent); }
	.ds-actions { display:flex; gap:4px; margin-top:2px; }
	.edit-small-btn { background:var(--panel-bg); border:1.5px solid var(--border); color:var(--accent); font-family:'Oswald',sans-serif; font-size:12px; font-weight:700; padding:3px 8px; cursor:pointer; letter-spacing:0.04em; }
	.edit-small-btn:hover { background:var(--primary); color:white; }
	.inline-editor { padding:8px; border:1.5px solid var(--border); margin-top:4px; background:color-mix(in srgb, var(--panel-bg) 50%, transparent); }
	.remove-btn { background:var(--danger); border:2px solid var(--border); color:white; width:26px; height:26px; font-size:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; flex-shrink:0; }
	.remove-btn.small { width:20px; height:20px; font-size:12px; }
	.add-small-btn { background:var(--primary); border:2px solid var(--border); color:white; font-family:'Oswald',sans-serif; font-size:12px; font-weight:700; padding:3px 8px; cursor:pointer; align-self:flex-start; letter-spacing:0.04em; }
	.add-btn { background:var(--primary); border:2px solid var(--border); color:white; font-family:'Oswald',sans-serif; font-size:12px; font-weight:700; padding:6px 12px; cursor:pointer; align-self:flex-start; letter-spacing:0.04em; }
	.check-row { display:flex; align-items:center; gap:6px; font-family:'Nunito',sans-serif; font-size:12px; color:var(--ink); cursor:pointer; }
	.sum-display { font-family:'Bangers',cursive; font-size:16px; color:var(--primary); padding:2px 0; }
</style>
