import type { Weapon, Gift, Word, InfluenceProject, RealmChange, Session, NPC, DivineGoal, Fact } from '$lib/services/api';

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
	};
}

export function createDefaultNpc(): NPC {
	return { id: crypto.randomUUID(), name: '', role: '', avatar: '' };
}

export function createDefaultSession(nextNumber: number): Session {
	return {
		id: crypto.randomUUID(),
		number: nextNumber,
		title: '',
		realDate: '',
		timeAgo: '',
		current: false,
		era: '',
		location: '',
		npcs: [],
		spoils: { wealth: 0, dominion: 0, items: [] },
		summary: '',
		postscripts: [],
		completedGoals: [],
	};
}

export function createDefaultDivineGoal(): DivineGoal {
	return { id: crypto.randomUUID(), description: '', difficulty: '', complete: false };
}
