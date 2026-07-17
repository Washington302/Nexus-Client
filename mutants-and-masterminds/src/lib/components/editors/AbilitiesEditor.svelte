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
		const absent = (abilities[field.absentKey] as boolean) ?? false;
		// Lacking an ability entirely is a flat -10 PP, regardless of rank.
		if (absent) return -10;
		// RAW: abilities cost a flat 2 PP/rank (rebate for negative ranks too), floored at -5.
		return Math.max(base, -5) * BASE_PP_PER_RANK;
	}

	$effect(() => {
		for (const f of abiKeys) {
			const base = (abilities[f.baseKey] as number) ?? 0;
			const enh = (abilities[f.enhKey] as number) ?? 0;
			(abilities as any)[f.finalKey] = base + enh;
		}
	});

	function toggleAbsent(field: typeof abiKeys[number]) {
		const absent = (abilities[field.absentKey] as boolean) ?? false;
		(abilities as any)[field.costKey] = absent ? -10 : 0;
	}
</script>

<div class="editor-grid">
	{#each abiKeys as f}
		<div class="field-row">
			<label class="field-label ability-label">{f.label}</label>
			{#if abilities[f.absentKey]}
				<span class="final-val absent-dash">—</span>
			{:else}
				<input type="number" class="field-input" bind:value={abilities[f.baseKey]} />
				<span class="enh-label">+</span>
				<input type="number" class="field-input enh-input" bind:value={abilities[f.enhKey]} />
				<span class="final-val">={abilities[f.finalKey]}</span>
			{/if}
			<span class="pp-cost">{calcPP(f)} PP</span>
			<label class="absent-label">
				<input type="checkbox" bind:checked={abilities[f.absentKey] as boolean} onchange={() => toggleAbsent(f)} />
				Absent
			</label>
		</div>
	{/each}
</div>

<style>
	.ability-label {
		width: 90px;
		flex-shrink: 0;
		margin-bottom: 0;
	}
</style>
