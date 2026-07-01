<script lang="ts">
	import type { Power, PowerEffect } from '$lib/services/api';
	import { createDefaultMinionStatblock } from '$lib/utils/character';
	import PowerCardEditor from './PowerCardEditor.svelte';

	let {
		powers
	}: {
		powers: Power[]
	} = $props();

	function effectCost(effect: PowerEffect): number {
		let perRank = effect.baseCostPerRank;
		let flat = 0;
		for (const m of effect.modifiers) {
			if (m.isFlat) {
				flat += m.type === 'FLAW' ? -m.costModifier : m.costModifier;
			} else {
				perRank += m.type === 'FLAW' ? -m.costModifier : m.costModifier;
			}
		}
		return perRank * effect.rank + flat;
	}

	function powerCost(power: Power): number {
		const active = power.effects.reduce((sum, e) => sum + effectCost(e), 0);
		const alts = power.alternateEffects.reduce((sum, a) => {
			const altActive = a.effects.reduce((s, e) => s + effectCost(e), 0);
			return Math.max(sum, altActive);
		}, 0);
		return Math.max(active, alts) + power.alternateEffects.length;
	}

	function perRankCost(effect: PowerEffect): number {
		let perRank = effect.baseCostPerRank;
		for (const m of effect.modifiers) {
			if (!m.isFlat) {
				perRank += m.type === 'FLAW' ? -m.costModifier : m.costModifier;
			}
		}
		return perRank;
	}

	function calcDeviceCost(power: any): { raw: number; discount: number; final: number } {
		const raw = (power._embeddedPowers ?? []).reduce((s: number, ep: any) => s + (ep.totalPowerCost ?? 0), 0);
		let discount = 0;
		if (raw <= 5) {
			discount = power._deviceType === 'EASILY_REMOVABLE' ? 4 : 2;
		} else {
			const perFive = Math.ceil(raw / 5);
			discount = power._deviceType === 'EASILY_REMOVABLE' ? perFive * 2 : perFive;
		}
		return { raw, discount, final: Math.max(0, raw - discount) };
	}

	function calcPower(p: any) {
		p.totalPowerCost = powerCost(p);
		for (const alt of p.alternateEffects) {
			alt.costPerRank = alt.effects.reduce((sum, e) => sum + perRankCost(e), 0);
			alt.currentAllocatedRank = alt.effects[0]?.rank ?? 0;
			for (const e of alt.effects) {
				e.calculatedCost = effectCost(e);
			}
		}
		for (const e of p.effects) {
			if (e.effectName?.toLowerCase() === 'summon') e.isSummon = true;
			e.calculatedCost = effectCost(e);
			if (e.isSummon) {
				if (!e.summonExtension) {
					e.summonExtension = { summonRank: e.rank, minionPpBudget: e.rank * 15 };
				}
				e.summonExtension.summonRank = e.rank;
				e.summonExtension.minionPpBudget = e.rank * 15;
				if (!e.summonExtension.minionStatBlock) {
					e.summonExtension.minionStatBlock = createDefaultMinionStatblock(e.rank);
				}
			}
		}
	}

	$effect(() => {
		for (const power of powers) {
			if (power._deviceType) {
				for (const ep of (power._embeddedPowers ?? [])) {
					calcPower(ep);
				}
				const dc = calcDeviceCost(power);
				power.totalPowerCost = dc.final;
			} else {
				calcPower(power);
			}
		}
	});

	function addPower() {
		powers.push({
			powerId: crypto.randomUUID(),
			name: '',
			description: '',
			descriptors: [],
			isArray: false,
			maxPpPool: 0,
			effects: [],
			alternateEffects: [],
			totalPowerCost: 0,
		});
	}

	function addDevice() {
		powers.push({
			powerId: crypto.randomUUID(),
			name: '',
			description: '',
			descriptors: [],
			isArray: false,
			maxPpPool: 0,
			effects: [],
			alternateEffects: [],
			totalPowerCost: 0,
			_deviceType: 'REMOVABLE',
			_embeddedPowers: [],
		});
	}

	function removePower(i: number) {
		powers.splice(i, 1);
	}
</script>

<div class="editor-grid">
	{#each powers as power, i}
		<PowerCardEditor {power} onRemove={() => removePower(i)} />
	{/each}
	<div class="add-row">
		<button class="add-btn" onclick={addPower}>+ Add Power</button>
		<button class="add-device-btn" onclick={addDevice}>+ Add Device</button>
	</div>
</div>

