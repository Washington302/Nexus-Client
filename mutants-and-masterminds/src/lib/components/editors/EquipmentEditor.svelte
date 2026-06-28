<script lang="ts">
	import type { EquipmentPool } from '$lib/services/api';

	let { equipmentPool }: { equipmentPool: EquipmentPool } = $props();

	function addItem() {
		equipmentPool.items.push({ itemName: '', epCost: 0, description: '' });
	}

	function removeItem(i: number) {
		equipmentPool.items.splice(i, 1);
	}

	let total = $derived(equipmentPool.items.reduce((s, i) => s + i.epCost, 0));
</script>

<div class="editor-grid">
	<div class="pool-row">
		<div class="field-group">
			<label class="field-label">EP Allowed</label>
			<input type="number" class="small-input" bind:value={equipmentPool.totalEpAllowed} min="0" />
		</div>
		<div class="field-group">
			<label class="field-label">EP Spent</label>
			<input type="number" class="small-input" bind:value={equipmentPool.epSpent} min="0" />
		</div>
		<div class="field-group">
			<label class="field-label">Sum of Items</label>
			<span class="sum-display">{total}</span>
		</div>
	</div>

	{#each equipmentPool.items as item, i}
		<div class="item-block">
			<div class="item-row">
				<input type="text" class="name-input" bind:value={item.itemName} placeholder="Item name" />
				<div class="cost-group">
					<label class="cost-label">EP</label>
					<input type="number" class="cost-input" bind:value={item.epCost} min="0" />
				</div>
				<button class="remove-btn" onclick={() => removeItem(i)}>&#10005;</button>
			</div>
			<textarea class="desc-input" bind:value={item.description} placeholder="Description"></textarea>
		</div>
	{/each}
	<button class="add-btn" onclick={addItem}>+ Add Equipment</button>
</div>

<style>
	.editor-grid { display:flex; flex-direction:column; gap:6px; }
	.pool-row { display:flex; gap:12px; margin-bottom:6px; }
	.field-group { display:flex; align-items:center; gap:4px; }
	.field-label { font-family:'Oswald',sans-serif; font-size:12px; color:var(--accent); text-transform:uppercase; letter-spacing:0.08em; }
	.small-input { width:56px; padding:3px 6px; border:2px solid var(--border); font-family:'Oswald',sans-serif; font-size:12px; font-weight:700; color:var(--ink); background:var(--newsprint); text-align:center; outline:none; }
	.small-input:focus { border-color:var(--primary); }
	.sum-display { font-family:'Bangers',cursive; font-size:18px; color:var(--primary); }
	.item-row { display:flex; align-items:center; gap:8px; }
	.name-input { flex:1; padding:5px 8px; border:2px solid var(--border); font-family:'Nunito',sans-serif; font-size:12px; color:var(--ink); background:var(--newsprint); outline:none; }
	.name-input:focus { border-color:var(--primary); }
	.desc-input { width:100%; padding:4px 8px; border:2px solid var(--border); font-family:'Nunito',sans-serif; font-size:11px; color:var(--ink); background:var(--newsprint); outline:none; resize:vertical; min-height:36px; box-sizing:border-box; }
	.desc-input:focus { border-color:var(--primary); }
	.cost-group { display:flex; align-items:center; gap:4px; }
	.cost-label { font-family:'Oswald',sans-serif; font-size:12px; color:var(--accent); }
	.cost-input { width:48px; padding:3px 6px; border:2px solid var(--border); font-family:'Oswald',sans-serif; font-size:12px; font-weight:700; color:var(--ink); background:var(--newsprint); text-align:center; outline:none; }
	.cost-input:focus { border-color:var(--primary); }
	.item-block { display:flex; flex-direction:column; gap:4px; padding:6px; border:1.5px dashed var(--border); }
	.item-row { display:flex; align-items:center; gap:8px; }
	.remove-btn { background:var(--danger); border:2px solid var(--border); color:white; width:26px; height:26px; font-size:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; flex-shrink:0; }
	.add-btn { background:var(--primary); border:2px solid var(--border); color:white; font-family:'Oswald',sans-serif; font-size:12px; font-weight:700; padding:6px 12px; cursor:pointer; align-self:flex-start; letter-spacing:0.04em; }
</style>
