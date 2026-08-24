import type { Weapon, Gift, Word, InfluenceProject, RealmChange, SessionEntry, LogNpc, DivineGoal, Fact, GodboundCharacter } from '$lib/services/api';

const ATTR_KEYS = ['strength', 'dexterity', 'constitution', 'wisdom', 'intelligence', 'charisma'] as const;
const SAVE_KEYS = ['hardiness', 'evasion', 'spirit'] as const;
const RESOURCE_KEYS = ['effort', 'influence', 'dominion', 'wealth'] as const;

/** Ensures older/incomplete characters have every field the sheet reads from. */
export function ensureDefaults(d: any): void {
	d.attributes ??= {};
	for (const k of ATTR_KEYS) d.attributes[k] ??= { score: 10, mod: 0, check: 11 };
	d.savingThrows ??= {};
	for (const k of SAVE_KEYS) d.savingThrows[k] ??= { base: 15, mod: 0, save: 15 };
	d.facts ??= { origin: '', pastCareer: '', relationship: '' };
	d.additionalFacts ??= [];
	d.weapons ??= [];
	d.armor ??= { type: '', armorClass: 10, shield: false, savingThrowPenalties: {} };
	d.armor.savingThrowPenalties ??= {};
	for (const k of SAVE_KEYS) d.armor.savingThrowPenalties[k] ??= false;
	d.frayDie ??= '1d6';
	d.frayDieTable ??= [];
	d.hp ??= { current: 0, max: 0 };
	d.resources ??= {};
	for (const k of RESOURCE_KEYS) d.resources[k] ??= { total: 0, free: 0 };
	d.words ??= [];
	for (const w of d.words) w.gifts ??= [];
}

/**
 * Deep-copies a character straight off the API and puts it in the shape the sheet
 * renders. Both the owner's route and the public share route go through here so
 * they can never drift.
 */
export function normalizeCharacterFromApi(raw: GodboundCharacter): GodboundCharacter {
	const d = JSON.parse(JSON.stringify(raw));
	ensureDefaults(d);
	return d as GodboundCharacter;
}

const REALM_SCALE_COST: Record<string, number> = { Point: 1, Village: 2, City: 6, Nation: 12, World: 24 };
const REALM_COMPLEXITY_MULT: Record<string, number> = { Simple: 1, Plausible: 2, Difficult: 4, Improbable: 8, Impossible: 16 };

export function attributeModifier(score: number): number {
	if (score <= 3) return -3;
	if (score <= 5) return -2;
	if (score <= 8) return -1;
	if (score <= 12) return 0;
	if (score <= 15) return 1;
	if (score <= 17) return 2;
	return 3;
}

export function attributeCheck(score: number): number {
	return 21 - score;
}

export function realmChangeCost(scale: string, complexity: string): number {
	return (REALM_SCALE_COST[scale] ?? 0) * (REALM_COMPLEXITY_MULT[complexity] ?? 0);
}

export function createDefaultWeapon(): Weapon {
	return { description: '', attr: '', atk: '', dmg: '' };
}

export function createDefaultFact(): Fact {
	return { id: crypto.randomUUID(), description: '' };
}

export function createDefaultGift(wordName?: string): Gift {
	return {
		id: crypto.randomUUID(),
		name: '',
		word: wordName,
		tier: 'Lesser',
		type: 'Action',
		effort: 'None',
		description: '',
		active: false,
	};
}

export function createDefaultWord(): Word {
	return {
		name: '',
		icon: '',
		description: '',
		associatedGifts: 0,
		activeGifts: 0,
		gifts: [],
		committedEffort: false,
	};
}

export function createDefaultInfluenceProject(): InfluenceProject {
	return { id: crypto.randomUUID(), name: '', description: '', tags: [], cost: 0 };
}

export function createDefaultRealmChange(): RealmChange {
	return {
		id: crypto.randomUUID(),
		name: '',
		description: '',
		scale: 'Point',
		complexity: 'Simple',
		cost: 0,
		status: 'draft',
		spent: 0,
	};
}

export function createDefaultNpc(): LogNpc {
	return { id: crypto.randomUUID(), name: '', role: '', avatar: '' };
}

export function createDefaultSessionEntry(nextNumber: number): SessionEntry {
	return {
		id: crypto.randomUUID(),
		campaignSessionId: null,
		number: nextNumber,
		title: '',
		realDate: '',
		current: false,
		inWorldDate: '',
		location: '',
		npcs: [],
		rewards: [],
		summary: '',
		postscripts: [],
	};
}

export function createDefaultDivineGoal(): DivineGoal {
	return { id: crypto.randomUUID(), description: '', difficulty: '', complete: false };
}
