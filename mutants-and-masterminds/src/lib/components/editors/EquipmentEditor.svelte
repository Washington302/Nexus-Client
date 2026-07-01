<script lang="ts">
	import type { EquipmentPool, PowerEffect } from '$lib/services/api';
	import ModifierRow from './ModifierRow.svelte';
	import { effectCost } from '$lib/utils/character';

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
		return effectCost(e);
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
								<ModifierRow modifier={mod} onRemove={() => removeModifier(i, ei, mi)} />
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

