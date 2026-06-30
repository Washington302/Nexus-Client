export function abilityMod(val: number): number {
	return val;
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
		combatState: { conditions: [], damage: 0, dying: 0, staggered: false, accumulatedToughnessPenalty: 0, activeConditions: [] },
		totalPpSpent: 0,
	};
}
