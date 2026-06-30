<script lang="ts">
	import type { EquipmentPool, PowerEffect } from '$lib/services/api';

	let { equipmentPool }: { equipmentPool: EquipmentPool } = $props();

	function addItem() {
		equipmentPool.items.push({ itemName: '', epCost: 0, description: '', embeddedEffects: [] });
	}

	function removeItem(i: number) {
		equipmentPool.items.splice(i, 1);
	}

	let total = $derived(equipmentPool.items.reduce((s, i) => s + i.epCost, 0));

	let expandedEffects = $state<Record<number, boolean>>({});

	function toggleEffects(i: number) {
		expandedEffects[i] = !expandedEffects[i];
	}

	function addEffect(itemIdx: number) {
		const effects = equipmentPool.items[itemIdx].embeddedEffects ??= [];
		effects.push({
			effectName: '', baseEffect: '', rank: 0, baseCostPerRank: 2,
			modifiers: [], calculatedCost: 0, isPrimary: true, isSummon: false,
		});
	}

	function removeEffect(itemIdx: number, effIdx: number) {
		equipmentPool.items[itemIdx].embeddedEffects?.splice(effIdx, 1);
	}

	function addModifier(itemIdx: number, effIdx: number) {
		const mods = equipmentPool.items[itemIdx].embeddedEffects![effIdx].modifiers ??= [];
		mods.push({ name: '', type: 'EXTRA', costModifier: 1, isFlat: false });
	}

	function removeModifier(itemIdx: number, effIdx: number, mIdx: number) {
		equipmentPool.items[itemIdx].embeddedEffects![effIdx].modifiers?.splice(mIdx, 1);
	}

	function calcEffectCost(e: PowerEffect): number {
		let perRank = e.baseCostPerRank ?? 2;
		let flat = 0;
		for (const m of e.modifiers ?? []) {
			if (m.isFlat) {
				flat += m.type === 'FLAW' ? -m.costModifier : m.costModifier;
			} else {
				perRank += m.type === 'FLAW' ? -m.costModifier : m.costModifier;
			}
		}
		return perRank * (e.rank ?? 0) + flat;
	}
</script>

<div class="editor-grid">
	<div class="pool-row">
		<div class="field-group">
			<label class="field-label">EP Allowed</label>
			<input type="number" class="small-input" bind:value={equipmentPool.totalEpAllowed} min="0" />
		</div>
		<div class="field-group">
			<label class="field-label">EP Spent</label>
			<span class="sum-display">{total}</span>
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
			<button class="toggle-btn" onclick={() => toggleEffects(i)}>
				{expandedEffects[i] ? 'Hide Effects' : 'Edit Effects'} ({item.embeddedEffects?.length ?? 0})
			</button>
			{#if expandedEffects[i]}
				<div class="effects-inline">
					{#each item.embeddedEffects ?? [] as effect, ei}
						<div class="effect-block">
							<div class="effect-row">
								<input type="text" class="effect-name-input" bind:value={effect.effectName} placeholder="Effect name" />
								<div class="cost-group">
									<label class="cost-label">Rank</label>
									<input type="number" class="tiny-input" bind:value={effect.rank} min="0" />
								</div>
								<div class="cost-group">
									<label class="cost-label">PP/r</label>
									<input type="number" class="tiny-input" bind:value={effect.baseCostPerRank} min="0" step="0.5" />
								</div>
								<span class="calc-cost">{calcEffectCost(effect)} PP</span>
								<button class="remove-btn small" onclick={() => removeEffect(i, ei)}>&#10005;</button>
							</div>
							{#each effect.modifiers ?? [] as mod, mi}
								<div class="mod-row">
									<input type="text" class="mod-name-input" bind:value={mod.name} placeholder="Modifier" />
									<select class="mod-type-select" bind:value={mod.type}>
										<option value="EXTRA">Extra</option>
										<option value="FLAW">Flaw</option>
									</select>
									<input type="number" class="tiny-input" bind:value={mod.costModifier} min="0" />
									<label class="flat-label">
										<input type="checkbox" bind:checked={mod.isFlat} />
										Flat
									</label>
									<button class="remove-btn small" onclick={() => removeModifier(i, ei, mi)}>&#10005;</button>
								</div>
							{/each}
							<button class="add-small-btn" onclick={() => addModifier(i, ei)}>+ Modifier</button>
						</div>
					{/each}
					<button class="add-small-btn" onclick={() => addEffect(i)}>+ Effect</button>
				</div>
			{/if}
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
	.toggle-btn { background:var(--panel-bg); border:1.5px solid var(--border); color:var(--accent); font-family:'Oswald',sans-serif; font-size:12px; font-weight:700; padding:3px 8px; cursor:pointer; letter-spacing:0.04em; align-self:flex-start; }
	.toggle-btn:hover { background:var(--primary); color:white; }
	.effects-inline { display:flex; flex-direction:column; gap:4px; padding:6px; border:1.5px solid var(--border); margin-top:2px; background:color-mix(in srgb, var(--panel-bg) 50%, transparent); }
	.effect-block { display:flex; flex-direction:column; gap:3px; padding:4px 6px; border:1.5px dashed var(--border); }
	.effect-row { display:flex; align-items:center; gap:6px; }
	.effect-name-input { flex:1; padding:2px 6px; border:1.5px solid var(--border); font-family:'Nunito',sans-serif; font-size:12px; color:var(--ink); background:var(--newsprint); outline:none; }
	.effect-name-input:focus { border-color:var(--primary); }
	.tiny-input { width:40px; padding:2px 4px; border:1.5px solid var(--border); font-family:'Oswald',sans-serif; font-size:12px; font-weight:700; color:var(--ink); background:var(--newsprint); text-align:center; outline:none; }
	.tiny-input:focus { border-color:var(--primary); }
	.calc-cost { font-family:'Bangers',cursive; font-size:14px; color:var(--primary); white-space:nowrap; }
	.mod-row { display:flex; align-items:center; gap:4px; margin-left:12px; }
	.mod-name-input { flex:1; min-width:80px; padding:1px 4px; border:1.5px solid var(--border); font-family:'Nunito',sans-serif; font-size:11px; color:var(--ink); background:var(--newsprint); outline:none; }
	.mod-name-input:focus { border-color:var(--primary); }
	.mod-type-select { padding:1px 2px; border:1.5px solid var(--border); font-family:'Oswald',sans-serif; font-size:11px; font-weight:700; color:var(--ink); background:var(--newsprint); outline:none; }
	.flat-label { display:flex; align-items:center; gap:2px; font-family:'Oswald',sans-serif; font-size:10px; color:var(--accent); white-space:nowrap; }
	.desc-input { width:100%; padding:4px 8px; border:2px solid var(--border); font-family:'Nunito',sans-serif; font-size:11px; color:var(--ink); background:var(--newsprint); outline:none; resize:vertical; min-height:36px; box-sizing:border-box; }
	.desc-input:focus { border-color:var(--primary); }
	.cost-group { display:flex; align-items:center; gap:4px; }
	.cost-label { font-family:'Oswald',sans-serif; font-size:12px; color:var(--accent); }
	.cost-input { width:48px; padding:3px 6px; border:2px solid var(--border); font-family:'Oswald',sans-serif; font-size:12px; font-weight:700; color:var(--ink); background:var(--newsprint); text-align:center; outline:none; }
	.cost-input:focus { border-color:var(--primary); }
	.item-block { display:flex; flex-direction:column; gap:4px; padding:6px; border:1.5px dashed var(--border); }
	.item-row { display:flex; align-items:center; gap:8px; }
	.remove-btn { background:var(--danger); border:2px solid var(--border); color:white; width:26px; height:26px; font-size:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; flex-shrink:0; }
	.remove-btn.small { width:20px; height:20px; font-size:11px; }
	.add-btn { background:var(--primary); border:2px solid var(--border); color:white; font-family:'Oswald',sans-serif; font-size:12px; font-weight:700; padding:6px 12px; cursor:pointer; align-self:flex-start; letter-spacing:0.04em; }
	.add-small-btn { background:var(--primary); border:1.5px solid var(--border); color:white; font-family:'Oswald',sans-serif; font-size:11px; font-weight:700; padding:2px 8px; cursor:pointer; align-self:flex-start; letter-spacing:0.04em; }
</style>
