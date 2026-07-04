<script lang="ts">
	import type { AbilitiesBlock } from '$lib/services/api';

	let {
		abilities
	}: {
		abilities: AbilitiesBlock
	} = $props();

	const abiKeys: Array<{ baseKey: keyof AbilitiesBlock; enhKey: keyof AbilitiesBlock; finalKey: keyof AbilitiesBlock; costKey: keyof AbilitiesBlock; absentKey: keyof AbilitiesBlock; label: string }> = [
		{ baseKey: 'strengthBaseRank', enhKey: 'strengthEnhancedRank', finalKey: 'strengthFinalValue', costKey: 'strengthCostModifier', absentKey: 'strengthAbsent', label: 'Strength' },
		{ baseKey: 'staminaBaseRank', enhKey: 'staminaEnhancedRank', finalKey: 'staminaFinalValue', costKey: 'staminaCostModifier', absentKey: 'staminaAbsent', label: 'Stamina' },
		{ baseKey: 'agilityBaseRank', enhKey: 'agilityEnhancedRank', finalKey: 'agilityFinalValue', costKey: 'agilityCostModifier', absentKey: 'agilityAbsent', label: 'Agility' },
		{ baseKey: 'dexterityBaseRank', enhKey: 'dexterityEnhancedRank', finalKey: 'dexterityFinalValue', costKey: 'dexterityCostModifier', absentKey: 'dexterityAbsent', label: 'Dexterity' },
		{ baseKey: 'fightingBaseRank', enhKey: 'fightingEnhancedRank', finalKey: 'fightingFinalValue', costKey: 'fightingCostModifier', absentKey: 'fightingAbsent', label: 'Fighting' },
		{ baseKey: 'intellectBaseRank', enhKey: 'intellectEnhancedRank', finalKey: 'intellectFinalValue', costKey: 'intellectCostModifier', absentKey: 'intellectAbsent', label: 'Intellect' },
		{ baseKey: 'awarenessBaseRank', enhKey: 'awarenessEnhancedRank', finalKey: 'awarenessFinalValue', costKey: 'awarenessCostModifier', absentKey: 'awarenessAbsent', label: 'Awareness' },
		{ baseKey: 'presenceBaseRank', enhKey: 'presenceEnhancedRank', finalKey: 'presenceFinalValue', costKey: 'presenceCostModifier', absentKey: 'presenceAbsent', label: 'Presence' },
	];

	const BASE_PP_PER_RANK = 2;

	function calcPP(field: typeof abiKeys[number]): number {
		const base = (abilities[field.baseKey] as number) ?? 0;
		const mod = (abilities[field.costKey] as number) ?? 0;
		const absent = (abilities[field.absentKey] as boolean) ?? false;
		if (absent) return mod;
		return base >= 0 ? base * (BASE_PP_PER_RANK + mod) : Math.max(base, -5) * BASE_PP_PER_RANK;
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
			<input type="number" class="field-input" bind:value={abilities[f.baseKey]} disabled={abilities[f.absentKey] as boolean} />
			<span class="enh-label">+</span>
			<input type="number" class="field-input enh-input" bind:value={abilities[f.enhKey]} disabled={abilities[f.absentKey] as boolean} />
			<span class="final-val">={abilities[f.finalKey]}</span>
			<span class="pp-cost">{calcPP(f)} PP</span>
			<label class="absent-label">
				<input type="checkbox" bind:checked={abilities[f.absentKey] as boolean} />
				Absent
			</label>
		</div>
	{/each}
</div>

