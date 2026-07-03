import type { AlternateEffect, PowerEffect, PowerModifier, ResistanceType } from '$lib/services/api';

export function abilityMod(val: number): number {
	return val;
}

export function effectResistance(e: { effectName?: string; resistance?: ResistanceType; modifiers?: Array<{ name?: string }> }): ResistanceType {
	if (e.resistance) return e.resistance;
	const name = (e.effectName ?? '').toLowerCase();
	const modNames = (e.modifiers ?? []).map((m: any) => (m.name ?? '').toLowerCase());
	const isDamaging = name.includes('damage') || modNames.some((n: string) => n.includes('damaging'));
	if (name.includes('affliction')) return 'WILL_FORTITUDE';
	if (isDamaging) return 'TOUGHNESS';
	if (name.includes('move')) return 'STRENGTH_DODGE';
	if (name.includes('nullify') || name.includes('weaken')) return 'FORTITUDE';
	return 'DODGE';
}

export function resistanceLabel(r: ResistanceType): string {
	const labels: Record<ResistanceType, string> = {
		TOUGHNESS: 'Toughness',
		DODGE: 'Dodge',
		FORTITUDE: 'Fortitude',
		WILL: 'Will',
		WILL_FORTITUDE: 'Will / Fortitude',
		STRENGTH_DODGE: 'Strength / Dodge',
		PARRY: 'Parry',
		NONE: 'None',
	};
	return labels[r] ?? 'Dodge';
}

export function abilityModStr(val: number): string {
	const mod = abilityMod(val);
	if (mod > 0) return '+' + mod;
	if (mod < 0) return String(mod);
	return '0';
}

export function effectCost(e: { baseCostPerRank?: number; rank?: number; modifiers?: Array<{ isFlat: boolean; type: string; costModifier: number }> }): number {
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

export function perRankCost(e: { baseCostPerRank?: number; modifiers?: Array<{ isFlat: boolean; type: string; costModifier: number }> }): number {
	let perRank = e.baseCostPerRank ?? 2;
	for (const m of e.modifiers ?? []) {
		if (!m.isFlat) {
			perRank += m.type === 'FLAW' ? -m.costModifier : m.costModifier;
		}
	}
	return perRank;
}

export function powerTotalCost(effects: any[], alternateEffects: any[]): number {
	const active = (effects ?? []).reduce((sum: number, e: any) => sum + effectCost(e), 0);
	const alts = (alternateEffects ?? []).reduce((sum: number, a: any) => {
		const altActive = (a.effects ?? []).reduce((s: number, e: any) => s + effectCost(e), 0);
		return Math.max(sum, altActive);
	}, 0);
	return Math.max(active, alts) + (alternateEffects?.length ?? 0);
}

export function computeDeviceCost(power: any, embeddedPowers: any[] = power?._embeddedPowers ?? []): { raw: number; discount: number; final: number } {
	const raw = (embeddedPowers ?? []).reduce((sum: number, ep: any) => sum + (ep.totalPowerCost ?? 0), 0);
	let discount = 0;
	if (raw <= 5) {
		discount = power?._deviceType === 'EASILY_REMOVABLE' ? 4 : 2;
	} else {
		const perFive = Math.ceil(raw / 5);
		discount = power?._deviceType === 'EASILY_REMOVABLE' ? perFive * 2 : perFive;
	}
	return { raw, discount, final: Math.max(0, raw - discount) };
}

export function createDefaultEffect(isPrimary = false): PowerEffect {
	return {
		effectName: '',
		baseEffect: '',
		isPrimary,
		rank: 1,
		baseCostPerRank: 2,
		modifiers: [],
		calculatedCost: 0,
		isSummon: false,
		manualAtkBonus: 0,
		manualRankBonus: 0,
	};
}

export function createDefaultAlternateEffect(): AlternateEffect {
	return {
		powerId: crypto.randomUUID(),
		name: '',
		description: '',
		descriptors: [],
		arrayType: 'ALTERNATE',
		costPerRank: 0,
		currentAllocatedRank: 0,
		effects: [],
	};
}

export function createDefaultModifier(): PowerModifier {
	return { name: '', type: 'EXTRA', costModifier: 1, isFlat: false };
}

export function calcPower(power: any): void {
	power.totalPowerCost = powerTotalCost(power.effects, power.alternateEffects);
	for (const e of power.effects ?? []) {
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
	for (const alt of power.alternateEffects ?? []) {
		alt.costPerRank = (alt.effects ?? []).reduce((sum: number, e: any) => sum + perRankCost(e), 0);
		alt.currentAllocatedRank = alt.effects[0]?.rank ?? 0;
		for (const e of alt.effects ?? []) {
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
}

export function recomputeCharacterCosts(draft: any): void {
	if (!draft) return;
	ensureDefaults(draft);
	for (const p of draft.powers ?? []) {
		if (p._deviceType) {
			for (const ep of p._embeddedPowers ?? []) calcPower(ep);
			const deviceCost = computeDeviceCost(p, p._embeddedPowers ?? []);
			p.totalPowerCost = deviceCost.final;
		} else {
			calcPower(p);
		}
	}
	const abiKeys = ['strength','stamina','agility','dexterity','fighting','intellect','awareness','presence'] as const;
	let totalAbiPP = 0;
	for (const key of abiKeys) {
		const base = draft.abilities?.[key + 'BaseRank'] ?? 0;
		const mod = draft.abilities?.[key + 'CostModifier'] ?? 0;
		const enh = draft.abilities?.[key + 'EnhancedRank'] ?? 0;
		draft.abilities[key + 'FinalValue'] = base + enh;
		totalAbiPP += Math.max(0, base) * (2 + mod);
	}
	draft.spentAbilities = totalAbiPP;
	const abilityMap: Record<string, string> = { STRENGTH:'strength', STAMINA:'stamina', AGILITY:'agility', DEXTERITY:'dexterity', FIGHTING:'fighting', INTELLECT:'intellect', AWARENESS:'awareness', PRESENCE:'presence' };
	let totalSkillRanks = 0;
	for (const skill of draft.skills ?? []) {
		const abiKey = abilityMap[skill.keyAbility] ?? 'agility';
		const abiVal = draft.abilities?.[abiKey + 'FinalValue'] ?? 0;
		skill.finalBonus = (skill.ranks ?? 0) + abilityMod(abiVal) + (skill.modifier ?? 0);
		totalSkillRanks += (skill.ranks ?? 0);
	}
	draft.spentSkills = Math.ceil(totalSkillRanks / 2);
	const hqs = draft.headquarters ?? [];
	for (const hq of hqs) {
		const dsCost = (hq.defenseSystems ?? []).reduce((sum: number, ds: any) => sum + (ds.totalPowerCost ?? 0), 0);
		hq.totalEpCost = Math.round((hq.sizeCost ?? 0) + (hq.toughnessCost ?? 0) + dsCost);
	}
	const itemsCost = (draft.equipmentPool?.items ?? []).reduce((sum: number, item: any) => sum + (item.epCost ?? 0), 0);
	const hqCost = hqs.reduce((sum: number, hq: any) => sum + (hq.totalEpCost ?? 0), 0);
	if (draft.equipmentPool) draft.equipmentPool.epSpent = Math.round(itemsCost + hqCost);
	draft.spentPowers = (draft.powers ?? []).reduce((sum: number, power: any) => sum + (power.totalPowerCost ?? 0), 0);
	draft.totalSpent = (draft.spentAbilities ?? 0) + (draft.spentDefenses ?? 0) + (draft.spentSkills ?? 0) + (draft.spentAdvantages ?? 0) + (draft.spentPowers ?? 0);
}

export function prepareCharacterPayloadForSave(draft: any): any {
	const payload = JSON.parse(JSON.stringify(draft));
	delete payload.createdAt;
	delete payload.updatedAt;
	for (const skill of (payload.skills || [])) {
		if (typeof skill.ppCost !== 'number') skill.ppCost = 0;
	}
	if (typeof payload.spentAbilities !== 'number') payload.spentAbilities = 0;
	if (typeof payload.totalSpent !== 'number') payload.totalSpent = 0;
	if (payload.equipmentPool) {
		if (typeof payload.equipmentPool.epSpent !== 'number') payload.equipmentPool.epSpent = 0;
		if (typeof payload.equipmentPool.totalEpAllowed !== 'number') payload.equipmentPool.totalEpAllowed = 0;
	}
	for (const hq of (payload.headquarters || [])) {
		if (typeof hq.totalEpCost !== 'number') hq.totalEpCost = 0;
	}
	if (payload.abilities) {
		for (const key of Object.keys(payload.abilities)) {
			if (typeof payload.abilities[key] === 'object') delete payload.abilities[key];
		}
	}
	if (payload.defenses) {
		for (const key of Object.keys(payload.defenses)) {
			if (typeof payload.defenses[key] === 'object') delete payload.defenses[key];
		}
	}
	for (const power of (payload.powers || [])) {
		normalizePowerForSave(power);
	}
	const devices: any[] = [];
	const regularPowers: any[] = [];
	for (const power of (payload.powers || [])) {
		if (power._deviceType) {
			const embeddedPowers = (power._embeddedPowers || []).map((ep: any) => {
				normalizePowerForSave(ep);
				delete ep._deviceType;
				delete ep._embeddedPowers;
				return ep;
			});
			const { raw, discount, final } = computeDeviceCost(power, embeddedPowers);
			devices.push({
				deviceId: power.powerId,
				name: power.name,
				deviceType: power._deviceType,
				embeddedPowers,
				rawCombinedCost: raw,
				pointDiscount: discount,
				finalDeviceCost: final,
			});
		} else {
			regularPowers.push(power);
		}
	}
	payload.powers = regularPowers;
	payload.devices = devices;
	payload.spentPowers = regularPowers.reduce((sum: number, power: any) => sum + (power.totalPowerCost ?? 0), 0) + devices.reduce((sum: number, device: any) => sum + (device.finalDeviceCost ?? 0), 0);
	return payload;
}

export function abiVal(abilities: any, key: string): number { return abilities?.[key + 'FinalValue'] ?? 0; }
export function abiMod(abilities: any, key: string): number { return abilityMod(abiVal(abilities, key)); }
export function abiAbsent(abilities: any, key: string): boolean { return abilities?.[key + 'Absent'] ?? false; }
export function defPointsBought(defenses: any, key: string): number { return defenses?.[key + 'PointsBought'] ?? 0; }
export function defOtherMods(defenses: any, key: string): number { return defenses?.[key + 'OtherModifiers'] ?? 0; }

export function getDefenseFinal(abilities: any, defenses: any, key: string, abilityKey: string): { value: number; immune: boolean } {
	if (abiAbsent(abilities, abilityKey)) return { value: 0, immune: true };
	return { value: Math.max(0, abiMod(abilities, abilityKey) + defPointsBought(defenses, key) + defOtherMods(defenses, key)), immune: false };
}

export function getToughnessFinal(abilities: any, defenses: any, advantages: any[]): { value: number; immune: boolean } {
	if (abiAbsent(abilities, 'stamina')) return { value: 0, immune: true };
	let defRoll = 0;
	for (const a of advantages ?? []) {
		if ((a.name ?? '').toLowerCase().includes('defensive roll')) defRoll += a.ranks ?? 0;
	}
	return { value: Math.max(0, abiMod(abilities, 'stamina') + defPointsBought(defenses, 'toughness') + defRoll + defOtherMods(defenses, 'toughness')), immune: false };
}

export function getInitiative(abilities: any, advantages: any[]): number {
	let improved = 0;
	for (const a of advantages ?? []) {
		if ((a.name ?? '').toLowerCase() === 'improved initiative') improved = a.ranks ?? 0;
	}
	return abiMod(abilities, 'agility') + improved * 4;
}

const ABI_KEYS = ['strength','stamina','agility','dexterity','fighting','intellect','awareness','presence'] as const;
const DEF_KEYS = ['dodge','parry','fortitude','toughness','will'] as const;

export function ensureDefaults(d: any): void {
	if (d.abilities == null) d.abilities = {};
	if (d.defenses == null) d.defenses = {};
	if (d.skills == null) d.skills = [];
	if (d.advantages == null) d.advantages = [];
	if (d.powers == null) d.powers = [];
	if (d.complications == null) d.complications = [];
	if (d.equipmentPool == null) d.equipmentPool = { totalEpAllowed: 0, epSpent: 0, items: [] };
	if (d.headquarters == null) d.headquarters = [];
	for (const k of ABI_KEYS) if (d.abilities[k + 'FinalValue'] == null) d.abilities[k + 'FinalValue'] = 0;
	for (const k of DEF_KEYS) if (d.defenses[k + 'FinalValue'] == null) d.defenses[k + 'FinalValue'] = 0;
}

export function initNormalizePower(p: any) {
	if ('array' in p && !('isArray' in p)) p.isArray = p.array;
	delete p.array;
	for (const e of (p.effects ?? [])) {
		if (typeof e.manualAtkBonus !== 'number') e.manualAtkBonus = 0;
		if (typeof e.manualRankBonus !== 'number') e.manualRankBonus = 0;
		if ('primary' in e && !('isPrimary' in e)) e.isPrimary = e.primary;
		delete e.primary;
		for (const m of (e.modifiers ?? [])) {
			if ('flat' in m && !('isFlat' in m)) m.isFlat = m.flat;
			delete m.flat;
		}
		if (e.summonExtension?.minionStatBlock?.powers) {
			for (const mp of e.summonExtension.minionStatBlock.powers) initNormalizePower(mp);
		}
	}
	for (const a of (p.alternateEffects ?? [])) {
		if (typeof a.currentAllocatedRank !== 'number') a.currentAllocatedRank = 0;
		if (typeof a.costPerRank !== 'number') a.costPerRank = 0;
		for (const e of (a.effects ?? [])) {
			if (typeof e.manualAtkBonus !== 'number') e.manualAtkBonus = 0;
			if (typeof e.manualRankBonus !== 'number') e.manualRankBonus = 0;
			if ('primary' in e && !('isPrimary' in e)) e.isPrimary = e.primary;
			delete e.primary;
			for (const m of (e.modifiers ?? [])) {
				if ('flat' in m && !('isFlat' in m)) m.isFlat = m.flat;
				delete m.flat;
			}
			if (e.summonExtension?.minionStatBlock?.powers) {
				for (const mp of e.summonExtension.minionStatBlock.powers) initNormalizePower(mp);
			}
		}
	}
}

export function normalizePowerForSave(p: any) {
	delete p.array;
	if (typeof p.isArray !== 'boolean') p.isArray = false;
	for (const e of (p.effects || [])) {
		delete e.primary;
		if (typeof e.isPrimary !== 'boolean') e.isPrimary = false;
		if (typeof e.isSummon !== 'boolean') e.isSummon = false;
		for (const m of (e.modifiers || [])) {
			delete m.flat;
			if (typeof m.isFlat !== 'boolean') m.isFlat = false;
		}
		if (e.summonExtension?.minionStatBlock?.powers) {
			for (const mp of e.summonExtension.minionStatBlock.powers) normalizePowerForSave(mp);
		}
	}
	for (const a of (p.alternateEffects || [])) {
		if (typeof a.currentAllocatedRank !== 'number') a.currentAllocatedRank = 0;
		if (typeof a.costPerRank !== 'number') a.costPerRank = 0;
		for (const e of (a.effects || [])) {
			delete e.primary;
			if (typeof e.isPrimary !== 'boolean') e.isPrimary = false;
			if (typeof e.isSummon !== 'boolean') e.isSummon = false;
			for (const m of (e.modifiers || [])) {
				delete m.flat;
				if (typeof m.isFlat !== 'boolean') m.isFlat = false;
			}
			if (e.summonExtension?.minionStatBlock?.powers) {
				for (const mp of e.summonExtension.minionStatBlock.powers) normalizePowerForSave(mp);
			}
		}
	}
}

export function createDefaultMinionStatblock(rank: number) {
	return {
		name: '', powerLevel: rank,
		abilities: {
			strengthBaseRank:0, strengthEnhancedRank:0, strengthFinalValue:0, strengthAbsent:false, strengthCostModifier:0,
			staminaBaseRank:0, staminaEnhancedRank:0, staminaFinalValue:0, staminaAbsent:false, staminaCostModifier:0,
			agilityBaseRank:0, agilityEnhancedRank:0, agilityFinalValue:0, agilityAbsent:false, agilityCostModifier:0,
			dexterityBaseRank:0, dexterityEnhancedRank:0, dexterityFinalValue:0, dexterityAbsent:false, dexterityCostModifier:0,
			fightingBaseRank:0, fightingEnhancedRank:0, fightingFinalValue:0, fightingAbsent:false, fightingCostModifier:0,
			intellectBaseRank:0, intellectEnhancedRank:0, intellectFinalValue:0, intellectAbsent:false, intellectCostModifier:0,
			awarenessBaseRank:0, awarenessEnhancedRank:0, awarenessFinalValue:0, awarenessAbsent:false, awarenessCostModifier:0,
			presenceBaseRank:0, presenceEnhancedRank:0, presenceFinalValue:0, presenceAbsent:false, presenceCostModifier:0,
		},
		defenses: {
			dodgeAbilityBase:'AGILITY', dodgePointsBought:0, dodgeOtherModifiers:0, dodgeFinalValue:0,
			parryAbilityBase:'FIGHTING', parryPointsBought:0, parryOtherModifiers:0, parryFinalValue:0,
			fortitudeAbilityBase:'STAMINA', fortitudePointsBought:0, fortitudeOtherModifiers:0, fortitudeFinalValue:0,
			toughnessAbilityBase:'STAMINA', toughnessPointsBought:0, toughnessOtherModifiers:0, toughnessFinalValue:0,
			willAbilityBase:'AWARENESS', willPointsBought:0, willOtherModifiers:0, willFinalValue:0,
		},
		skills: [], advantages: [], powers: [],
		combatState: { conditions: [], damage: 0, dying: 0, staggered: false, accumulatedToughnessPenalty: 0 },
		totalPpSpent: 0,
	};
}
