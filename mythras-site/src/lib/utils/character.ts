import type { Characteristics, MythrasCharacter, Skill } from '$lib/services/api';

const CHAR_KEY_MAP: Record<string, keyof Characteristics> = {
	STR: 'str',
	CON: 'con',
	SIZ: 'siz',
	DEX: 'dex',
	INT: 'intelligence',
	POW: 'pow',
	CHA: 'cha'
};

/** Parses formulas like "STR+DEX", "INT x2", "STR+SIZ" against a characteristics block. */
export function computeBasePercent(formula: string, chars: Characteristics): number {
	const doubled = formula.match(/^(\w+)\s*x\s*2$/i);
	if (doubled) {
		const key = CHAR_KEY_MAP[doubled[1].toUpperCase()];
		return (chars[key] ?? 0) * 2;
	}
	const summed = formula.match(/^(\w+)\s*\+\s*(\w+)$/);
	if (summed) {
		const a = chars[CHAR_KEY_MAP[summed[1].toUpperCase()]] ?? 0;
		const b = chars[CHAR_KEY_MAP[summed[2].toUpperCase()]] ?? 0;
		return a + b;
	}
	return 0;
}

/** The seven characteristic abbreviations used in skill formulas, for dropdown editors. */
export const CHARACTERISTIC_OPTIONS = ['STR', 'CON', 'SIZ', 'DEX', 'INT', 'POW', 'CHA'] as const;

/** The four Mythras cultures, per the corebook's Culture Bonuses table. */
export const CULTURE_OPTIONS = ['Barbarian', 'Civilised', 'Nomadic', 'Primitive'] as const;

/** Splits a formula string ("STR+DEX" or "INT x2") into its two characteristic tokens. */
export function parseFormula(formula: string): [string, string] {
	const doubled = formula.match(/^(\w+)\s*x\s*2$/i);
	if (doubled) {
		const c = doubled[1].toUpperCase();
		return [c, c];
	}
	const summed = formula.match(/^(\w+)\s*\+\s*(\w+)$/);
	if (summed) {
		return [summed[1].toUpperCase(), summed[2].toUpperCase()];
	}
	return ['STR', 'STR'];
}

/** Builds a formula string from two characteristic tokens picked via dropdowns. */
export function buildFormula(char1: string, char2: string): string {
	if (char1 === char2) return `${char1} x2`;
	return `${char1}+${char2}`;
}

export interface SkillDefinition {
	name: string;
	professional: boolean;
	formula: string;
}

/** Standard skills, including the four resistance skills (Brawn/Endurance/Evade/Willpower). */
export const STANDARD_SKILLS: SkillDefinition[] = [
	{ name: 'Athletics', professional: false, formula: 'STR+DEX' },
	{ name: 'Boating', professional: false, formula: 'STR+CON' },
	{ name: 'Brawn', professional: false, formula: 'STR+SIZ' },
	{ name: 'Conceal', professional: false, formula: 'DEX+POW' },
	{ name: 'Customs', professional: false, formula: 'INT x2' },
	{ name: 'Dance', professional: false, formula: 'DEX+CHA' },
	{ name: 'Deceit', professional: false, formula: 'INT+CHA' },
	{ name: 'Drive', professional: false, formula: 'DEX+POW' },
	{ name: 'Endurance', professional: false, formula: 'CON x2' },
	{ name: 'Evade', professional: false, formula: 'DEX x2' },
	{ name: 'First Aid', professional: false, formula: 'INT+DEX' },
	{ name: 'Influence', professional: false, formula: 'CHA x2' },
	{ name: 'Insight', professional: false, formula: 'INT+POW' },
	{ name: 'Locale', professional: false, formula: 'INT x2' },
	{ name: 'Perception', professional: false, formula: 'INT+POW' },
	{ name: 'Ride', professional: false, formula: 'DEX+POW' },
	{ name: 'Sing', professional: false, formula: 'CHA+POW' },
	{ name: 'Stealth', professional: false, formula: 'DEX+INT' },
	{ name: 'Swim', professional: false, formula: 'STR+CON' },
	{ name: 'Unarmed', professional: false, formula: 'STR+DEX' },
	{ name: 'Willpower', professional: false, formula: 'POW x2' }
];

export const PROFESSIONAL_SKILLS: SkillDefinition[] = [
	{ name: 'Acting', professional: true, formula: 'CHA x2' },
	{ name: 'Acrobatics', professional: true, formula: 'STR+DEX' },
	{ name: 'Art', professional: true, formula: 'CHA+POW' },
	{ name: 'Bureaucracy', professional: true, formula: 'INT x2' },
	{ name: 'Commerce', professional: true, formula: 'INT+CHA' },
	{ name: 'Courtesy', professional: true, formula: 'INT+CHA' },
	{ name: 'Craft', professional: true, formula: 'DEX+INT' },
	{ name: 'Culture', professional: true, formula: 'INT x2' },
	{ name: 'Disguise', professional: true, formula: 'INT+CHA' },
	{ name: 'Engineering', professional: true, formula: 'INT x2' },
	{ name: 'Gambling', professional: true, formula: 'INT+POW' },
	{ name: 'Healing', professional: true, formula: 'INT+POW' },
	{ name: 'Language', professional: true, formula: 'INT+CHA' },
	{ name: 'Literacy', professional: true, formula: 'INT x2' },
	{ name: 'Lockpicking', professional: true, formula: 'DEX x2' },
	{ name: 'Lore', professional: true, formula: 'INT x2' },
	{ name: 'Mechanisms', professional: true, formula: 'DEX+INT' },
	{ name: 'Musicianship', professional: true, formula: 'DEX+CHA' },
	{ name: 'Navigation', professional: true, formula: 'INT+POW' },
	{ name: 'Oratory', professional: true, formula: 'POW+CHA' },
	{ name: 'Seamanship', professional: true, formula: 'INT+CON' },
	{ name: 'Seduction', professional: true, formula: 'INT+CHA' },
	{ name: 'Sleight', professional: true, formula: 'DEX+CHA' },
	{ name: 'Streetwise', professional: true, formula: 'POW+CHA' },
	{ name: 'Survival', professional: true, formula: 'CON+POW' },
	{ name: 'Teach', professional: true, formula: 'INT+CHA' },
	{ name: 'Track', professional: true, formula: 'INT+CON' }
];

export const MAGICAL_SKILLS: SkillDefinition[] = [
	{ name: 'Binding', professional: false, formula: 'CHA+POW' },
	{ name: 'Devotion', professional: false, formula: 'CHA+POW' },
	{ name: 'Exhort', professional: false, formula: 'INT+CHA' },
	{ name: 'Folk Magic', professional: false, formula: 'CHA+POW' },
	{ name: 'Invocation', professional: false, formula: 'INT x2' },
	{ name: 'Meditation', professional: false, formula: 'INT+CON' },
	{ name: 'Mysticism', professional: false, formula: 'POW+CON' },
	{ name: 'Shaping', professional: false, formula: 'INT+POW' },
	{ name: 'Trance', professional: false, formula: 'POW+CON' }
];

/** Recomputes a skill's total from its formula + allocated points, capping each source at 15. */
export function recomputeSkill(skill: Skill, chars: Characteristics): void {
	skill.base = computeBasePercent(skill.formula, chars);
	const cultural = Math.min(15, skill.cultural ?? 0);
	const career = Math.min(15, skill.career ?? 0);
	const bonus = Math.min(15, skill.bonus ?? 0);
	skill.total = skill.base + cultural + career + bonus;
}

function bracketIndex(sum: number, maxIndex = 7): number {
	return Math.max(0, Math.min(maxIndex, Math.floor((sum - 1) / 5)));
}

const HIT_POINT_TABLE = {
	head: [1, 2, 3, 4, 5, 6, 7, 8],
	chest: [3, 4, 5, 6, 7, 8, 9, 10],
	abdomen: [2, 3, 4, 5, 6, 7, 8, 9],
	arm: [1, 1, 2, 3, 4, 5, 6, 7],
	leg: [1, 2, 3, 4, 5, 6, 7, 8]
};

export function hitLocationMaxHp(
	location: 'head' | 'chest' | 'abdomen' | 'arm' | 'leg',
	con: number,
	siz: number
): number {
	return HIT_POINT_TABLE[location][bracketIndex(con + siz)];
}

export const DEFAULT_HIT_LOCATIONS: Array<{
	d20Range: string;
	name: string;
	location: keyof typeof HIT_POINT_TABLE;
}> = [
	{ d20Range: '1-3', name: 'Right Leg', location: 'leg' },
	{ d20Range: '4-6', name: 'Left Leg', location: 'leg' },
	{ d20Range: '7-9', name: 'Abdomen', location: 'abdomen' },
	{ d20Range: '10-12', name: 'Chest', location: 'chest' },
	{ d20Range: '13-15', name: 'Right Arm', location: 'arm' },
	{ d20Range: '16-18', name: 'Left Arm', location: 'arm' },
	{ d20Range: '19-20', name: 'Head', location: 'head' }
];

export function computeActionPoints(intelligence: number, dex: number): number {
	const sum = intelligence + dex;
	if (sum <= 12) return 1;
	if (sum <= 24) return 2;
	if (sum <= 36) return 3;
	return 3 + Math.ceil((sum - 36) / 12);
}

const DAMAGE_MODIFIERS = [
	'-1d8',
	'-1d6',
	'-1D4',
	'-1D2',
	'+0',
	'+1D2',
	'+1D4',
	'+1D6',
	'+1D8',
	'+1D10',
	'+1D12',
	'+2D6'
];

export function computeDamageModifier(str: number, siz: number): string {
	const sum = str + siz;
	if (sum > 60) return `+2D6 + ${Math.ceil((sum - 60) / 5)}D2`;
	return DAMAGE_MODIFIERS[bracketIndex(sum, 11)];
}

export function computeExperienceModifier(con: number): number {
	if (con <= 6) return -1;
	if (con <= 12) return 0;
	return 1 + Math.floor((con - 13) / 6);
}

export function computeHealingRate(con: number): number {
	if (con <= 6) return 1;
	if (con <= 12) return 2;
	return 3 + Math.floor((con - 13) / 6);
}

export function computeLuckPoints(pow: number): number {
	if (pow <= 6) return 1;
	if (pow <= 12) return 2;
	return 3 + Math.floor((pow - 13) / 6);
}

/** Strike Rank determines turn order in combat: FLOOR((DEX+INT)/2) per the Mythras corebook. */
export function computeStrikeRank(intelligence: number, dex: number): number {
	return Math.floor((intelligence + dex) / 2);
}

/** ENC a character can carry before incurring a skill penalty: STR+CON. Display-only —
 * the backend has no field for this, so it's always recomputed rather than stored. */
export function computeEncMax(str: number, con: number): number {
	return str + con;
}

/** Points of ENC over the max, each costing -20% to relevant skills per the corebook. */
export function computeEncPenalty(current: number, max: number): number {
	return Math.max(0, Math.ceil(current - max));
}

/**
 * Recomputes the attributes that have no "spend during play" concept (always a pure
 * function of characteristics). actionPoints/luckPoints/magicPoints are intentionally
 * NOT touched here — the backend only stores a single current value for each (no
 * separate max), so overwriting them on every edit would erase manual adjustments
 * made while playing (e.g. spending a luck point).
 */
export function recomputeDerivedAttributes(draft: MythrasCharacter): void {
	const c = draft.characteristics;
	draft.attributes.damageModifier = computeDamageModifier(c.str, c.siz);
	draft.attributes.experienceModifier = computeExperienceModifier(c.con);
	draft.attributes.healingRate = computeHealingRate(c.con);
	draft.attributes.initiativeBonus = computeStrikeRank(c.intelligence, c.dex);
	for (const loc of draft.hitLocations ?? []) {
		const def = DEFAULT_HIT_LOCATIONS.find((d) => d.name === loc.name);
		if (def) loc.maxHp = hitLocationMaxHp(def.location, c.con, c.siz);
	}
	for (const skill of draft.standardSkills ?? []) recomputeSkill(skill, c);
	for (const skill of draft.professionalSkills ?? []) recomputeSkill(skill, c);
	for (const skill of draft.magicSkills ?? []) recomputeSkill(skill, c);
}

export function ensureDefaults(d: MythrasCharacter): void {
	if (d.characteristics == null) {
		d.characteristics = { str: 10, con: 10, siz: 10, dex: 10, intelligence: 10, pow: 10, cha: 10 };
	}
	if (d.attributes == null) {
		d.attributes = {
			actionPoints: 2,
			damageModifier: '+0',
			experienceModifier: 0,
			healingRate: 2,
			initiativeBonus: 10,
			luckPoints: 2,
			magicPoints: 10,
			movementRate: 6
		};
	}
	if (d.wealth == null) {
		d.wealth = { silverPieces: 0, incomePerDay: 0, incomePerWeek: 0, incomePerSeason: 0, incomePerYear: 0 };
	}
	if (d.standardSkills == null || d.standardSkills.length === 0) {
		d.standardSkills = STANDARD_SKILLS.map((def) => createSkill(def, d.characteristics));
	}
	if (d.professionalSkills == null) d.professionalSkills = [];
	if (d.magicSkills == null) d.magicSkills = [];
	d.languages ??= [];
	d.passions ??= [];
	d.combatStyles ??= [];
	d.meleeWeapons ??= [];
	d.rangedWeapons ??= [];
	d.equipment ??= [];
	d.cults ??= [];
	if (d.hitLocations == null || d.hitLocations.length === 0) {
		d.hitLocations = DEFAULT_HIT_LOCATIONS.map((loc) => ({
			d20Range: loc.d20Range,
			name: loc.name,
			maxHp: hitLocationMaxHp(loc.location, d.characteristics.con, d.characteristics.siz),
			currentHp: hitLocationMaxHp(loc.location, d.characteristics.con, d.characteristics.siz),
			armorPoints: 0,
			armorWorn: ''
		}));
	}
	d.fatigueLevel ??= 'Fresh';
	d.backgroundNotes ??= '';
	d.woundNotes ??= '';
	d.magicAbilitiesNotes ??= '';
}

export function createSkill(def: SkillDefinition, chars: Characteristics): Skill {
	const skill: Skill = {
		name: def.name,
		formula: def.formula,
		professional: def.professional,
		base: 0,
		cultural: 0,
		career: 0,
		bonus: 0,
		total: 0
	};
	recomputeSkill(skill, chars);
	return skill;
}

export function prepareCharacterPayloadForSave(draft: MythrasCharacter): MythrasCharacter {
	const payload = JSON.parse(JSON.stringify(draft));
	recomputeDerivedAttributes(payload);
	return payload;
}
