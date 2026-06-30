<script lang="ts">
	import type { AbilitiesBlock } from '$lib/services/api';

	let {
		abilities
	}: {
		abilities: AbilitiesBlock
	} = $props();

	const abiKeys: Array<{ baseKey: keyof AbilitiesBlock; enhKey: keyof AbilitiesBlock; finalKey: keyof AbilitiesBlock; costKey: keyof AbilitiesBlock; label: string }> = [
		{ baseKey: 'strengthBaseRank', enhKey: 'strengthEnhancedRank', finalKey: 'strengthFinalValue', costKey: 'strengthCostModifier', label: 'Strength' },
		{ baseKey: 'staminaBaseRank', enhKey: 'staminaEnhancedRank', finalKey: 'staminaFinalValue', costKey: 'staminaCostModifier', label: 'Stamina' },
		{ baseKey: 'agilityBaseRank', enhKey: 'agilityEnhancedRank', finalKey: 'agilityFinalValue', costKey: 'agilityCostModifier', label: 'Agility' },
		{ baseKey: 'dexterityBaseRank', enhKey: 'dexterityEnhancedRank', finalKey: 'dexterityFinalValue', costKey: 'dexterityCostModifier', label: 'Dexterity' },
		{ baseKey: 'fightingBaseRank', enhKey: 'fightingEnhancedRank', finalKey: 'fightingFinalValue', costKey: 'fightingCostModifier', label: 'Fighting' },
		{ baseKey: 'intellectBaseRank', enhKey: 'intellectEnhancedRank', finalKey: 'intellectFinalValue', costKey: 'intellectCostModifier', label: 'Intellect' },
		{ baseKey: 'awarenessBaseRank', enhKey: 'awarenessEnhancedRank', finalKey: 'awarenessFinalValue', costKey: 'awarenessCostModifier', label: 'Awareness' },
		{ baseKey: 'presenceBaseRank', enhKey: 'presenceEnhancedRank', finalKey: 'presenceFinalValue', costKey: 'presenceCostModifier', label: 'Presence' },
	];

	const BASE_PP_PER_RANK = 2;

	function calcPP(field: typeof abiKeys[number]): number {
		const base = (abilities[field.baseKey] as number) ?? 0;
		const mod = (abilities[field.costKey] as number) ?? 0;
		return Math.max(0, base) * (BASE_PP_PER_RANK + mod);
	}

	$effect(() => {
		for (const f of abiKeys) {
			const base = (abilities[f.baseKey] as number) ?? 0;
			const enh = (abilities[f.enhKey] as number) ?? 0;
			(abilities as any)[f.finalKey] = base + enh;
		}
	});
</script>

<div class="editor-grid">
	{#each abiKeys as f}
		<div class="field-row">
			<label class="field-label">{f.label}</label>
			<input type="number" class="field-input" bind:value={abilities[f.baseKey]} />
			<span class="enh-label">+</span>
			<input type="number" class="field-input enh-input" bind:value={abilities[f.enhKey]} />
			<span class="final-val">={abilities[f.finalKey]}</span>
			<span class="pp-cost">{calcPP(f)} PP</span>
		</div>
	{/each}
</div>

<style>
	.editor-grid { display:flex; flex-direction:column; gap:6px; }
	.field-row { display:flex; align-items:center; gap:8px; }
	.field-label { font-family:'Oswald',sans-serif; font-size:14px; font-weight:600; color:var(--ink); width:80px; flex-shrink:0; }
	.field-input { width:60px; padding:4px 6px; border:2px solid var(--border); font-family:'Oswald',sans-serif; font-size:14px; font-weight:700; color:var(--ink); background:var(--newsprint); text-align:center; outline:none; }
	.field-input:focus { border-color:var(--primary); }
	.final-val { font-family:'Nunito',sans-serif; font-size:13px; color:var(--accent); min-width:24px; text-align:center; }
	.pp-cost { font-family:'Bangers',cursive; font-size:14px; color:var(--primary); min-width:40px; text-align:right; }
	.enh-label { font-family:'Oswald',sans-serif; font-size:13px; color:var(--accent); padding:0 1px; }
	.enh-input { width:40px; border-color:var(--secondary) !important; }
</style>
