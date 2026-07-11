import type {
	Characteristics,
	CombatStyle,
	GiftEffect,
	GiftEffectTag,
	MythrasCharacter,
	Passion,
	ResourcePool,
	Skill
} from '$lib/services/api';

/**
 * Coerces a legacy flat-number attribute (pre resource-pool migration) into a ResourcePool.
 * Defaults `manualOverride` to true for anything that didn't already have it set — there's no
 * way to know whether an old value matches the current formula, so treat it as manually set
 * rather than letting the next recompute silently overwrite it.
 */
function normalizeResourcePool(value: ResourcePool | number | null | undefined): ResourcePool {
	if (typeof value === 'number') return { current: value, max: value, manualOverride: true };
	if (value == null) return { current: 0, max: 0, manualOverride: true };
	return { ...value, manualOverride: value.manualOverride ?? true };
}

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

/** Matches nexus-core's GiftEffectTag enum, in dropdown order. */
export const GIFT_EFFECT_TAG_OPTIONS: GiftEffectTag[] = [
	'HIT_POINTS_FORMULA_EXTRA_CHARACTERISTIC',
	'DAMAGE_MODIFIER_FORMULA_EXTRA_CHARACTERISTIC',
	'HEALING_RATE_MULTIPLIER',
	'ACTION_POINTS_FLAT_BONUS',
	'MAGIC_POINTS_FLAT_BONUS',
	'LUCK_POINTS_FLAT_BONUS',
	'MOVEMENT_RATE_FLAT_BONUS',
	'EXPERIENCE_MODIFIER_FLAT_BONUS',
	'INITIATIVE_FLAT_BONUS',
	'SKILL_FLAT_BONUS',
	'DICE_FORMULA_OVERRIDE'
];

export const GIFT_EFFECT_TAG_LABELS: Record<GiftEffectTag, string> = {
	HIT_POINTS_FORMULA_EXTRA_CHARACTERISTIC: 'Hit Points: extra characteristic',
	DAMAGE_MODIFIER_FORMULA_EXTRA_CHARACTERISTIC: 'Damage Modifier: extra characteristic',
	HEALING_RATE_MULTIPLIER: 'Healing Rate multiplier',
	ACTION_POINTS_FLAT_BONUS: 'Action Points bonus',
	MAGIC_POINTS_FLAT_BONUS: 'Magic Points bonus',
	LUCK_POINTS_FLAT_BONUS: 'Luck Points bonus',
	MOVEMENT_RATE_FLAT_BONUS: 'Movement Rate bonus',
	EXPERIENCE_MODIFIER_FLAT_BONUS: 'Experience Modifier bonus',
	INITIATIVE_FLAT_BONUS: 'Initiative bonus',
	SKILL_FLAT_BONUS: 'Skill bonus',
	DICE_FORMULA_OVERRIDE: 'Dice formula override'
};

/** Which GiftEffect fields are mechanically meaningful for each tag — used to hide fields that
 * would otherwise look actionable but are silently ignored by the backend's GiftEffectService. */
export const GIFT_EFFECT_TAG_FIELDS: Record<
	GiftEffectTag,
	Array<'scope' | 'formulaValue' | 'multiplier' | 'flatValue'>
> = {
	HIT_POINTS_FORMULA_EXTRA_CHARACTERISTIC: ['scope'],
	DAMAGE_MODIFIER_FORMULA_EXTRA_CHARACTERISTIC: ['scope'],
	HEALING_RATE_MULTIPLIER: ['multiplier'],
	ACTION_POINTS_FLAT_BONUS: ['flatValue'],
	MAGIC_POINTS_FLAT_BONUS: ['flatValue'],
	LUCK_POINTS_FLAT_BONUS: ['flatValue'],
	MOVEMENT_RATE_FLAT_BONUS: ['flatValue'],
	EXPERIENCE_MODIFIER_FLAT_BONUS: ['flatValue'],
	INITIATIVE_FLAT_BONUS: ['flatValue'],
	SKILL_FLAT_BONUS: ['scope', 'flatValue'],
	DICE_FORMULA_OVERRIDE: ['scope', 'formulaValue']
};

/** Comma-separated text <-> string[] for compact list fields (traits, benefits, etc.). */
export function listToText(list: string[]): string {
	return (list ?? []).join(', ');
}
export function textToList(text: string): string[] {
	return text
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
}

/** Ports nexus-core's GiftEffectService#resolveCharacteristic verbatim. */
function resolveCharacteristic(chars: Characteristics, name: string | null | undefined): number {
	if (!name) return 0;
	switch (name.trim().toLowerCase()) {
		case 'str':
			return chars.str;
		case 'con':
			return chars.con;
		case 'siz':
			return chars.siz;
		case 'dex':
			return chars.dex;
		case 'int':
		case 'intelligence':
			return chars.intelligence;
		case 'pow':
			return chars.pow;
		case 'cha':
			return chars.cha;
		default:
			return 0;
	}
}

/** Flattens cults -> active gifts -> effects, filtered by tag. Mirrors GiftEffectService#getActiveEffectsByTag. */
function getActiveGiftEffects(draft: MythrasCharacter, tag: GiftEffectTag): GiftEffect[] {
	const matches: GiftEffect[] = [];
	for (const cult of draft.cults ?? []) {
		for (const gift of cult.gifts ?? []) {
			if (!gift.active || !gift.effects) continue;
			for (const effect of gift.effects) {
				if (effect.tag === tag) matches.push(effect);
			}
		}
	}
	return matches;
}

function sumFlatValues(effects: GiftEffect[]): number {
	return effects.reduce((sum, e) => sum + (e.flatValue ?? 0), 0);
}

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
	// Cultural and career allocation are capped at 15% per skill at character creation;
	// experience (bonus) improvements accrue during play with no such cap.
	const cultural = Math.min(15, skill.cultural ?? 0);
	const career = Math.min(15, skill.career ?? 0);
	const bonus = skill.bonus ?? 0;
	skill.total = skill.base + cultural + career + bonus;
}

/** Passions have no formula — `base` is a plain player-entered starting value, not derived. */
export function recomputePassion(passion: Passion): void {
	const cultural = Math.min(15, passion.cultural ?? 0);
	const career = Math.min(15, passion.career ?? 0);
	const bonus = passion.bonus ?? 0;
	passion.total = (passion.base ?? 0) + cultural + career + bonus;
}

/** Combat Styles have no formula either — `base` is a plain player-entered starting value. */
export function recomputeCombatStyle(style: CombatStyle): void {
	const cultural = Math.min(15, style.cultural ?? 0);
	const career = Math.min(15, style.career ?? 0);
	const bonus = style.bonus ?? 0;
	style.total = (style.base ?? 0) + cultural + career + bonus;
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
	const sum = con + siz;
	const base = HIT_POINT_TABLE[location][bracketIndex(sum)];
	const extra = sum > 40 ? Math.ceil((sum - 40) / 5) : 0;
	return base + extra;
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

// STR+SIZ -> Damage Modifier. Irregular band widths per the printed rulebook table: 5-wide
// through 60, then 10-wide from 61 to 130. Must match nexus-core's MythrasFormulaTables exactly
// (including lowercase "d") since the backend validates this field with exact string equality.
const DAMAGE_MODIFIER_UPPER_BOUND = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110, 120, 130];
const DAMAGE_MODIFIER_VALUE = [
	'-1d8',
	'-1d6',
	'-1d4',
	'-1d2',
	'+0',
	'+1d2',
	'+1d4',
	'+1d6',
	'+1d8',
	'+1d10',
	'+1d12',
	'+2d6',
	'+1d8+1d6',
	'+2d8',
	'+1d10+1d8',
	'+2d10',
	'+2d10+1d2',
	'+2d10+1d4'
];

export function computeDamageModifier(str: number, siz: number): string {
	const sum = str + siz;
	for (let i = 0; i < DAMAGE_MODIFIER_UPPER_BOUND.length; i++) {
		if (sum <= DAMAGE_MODIFIER_UPPER_BOUND[i]) return DAMAGE_MODIFIER_VALUE[i];
	}
	// Beyond the book's printed range (130) it only says "Continue Progression" with no
	// further values — approximate by extending the last visible +1d2-per-10 step.
	const stepsBeyond = Math.ceil((sum - 130) / 10);
	const last = DAMAGE_MODIFIER_VALUE[DAMAGE_MODIFIER_VALUE.length - 1];
	return `${last} (+${stepsBeyond} approx. step${stepsBeyond === 1 ? '' : 's'})`;
}

export function computeExperienceModifier(cha: number): number {
	if (cha <= 6) return -1;
	if (cha <= 12) return 0;
	return 1 + Math.floor((cha - 13) / 6);
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

/** Strike Rank determines turn order in combat: ROUND((DEX+INT)/2) per the Mythras corebook. */
export function computeStrikeRank(intelligence: number, dex: number): number {
	return Math.round((intelligence + dex) / 2);
}

/** Magic Points max is a straight POW readout, per the Mythras corebook. */
export function computeMagicPointsMax(pow: number): number {
	return pow;
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
 * Recomputes the attributes that are always a pure function of characteristics + active Gift
 * effects (mirrors nexus-core's GiftEffectService#computeExpected). Action/Luck/Magic Points max
 * are included unless that pool's `manualOverride` is set — the backend validates max against
 * the same formulas on every save, skipping only overridden pools, so the frontend has to keep
 * max in sync the same way rather than treating it as untouched.
 *
 * SKILL_FLAT_BONUS and DICE_FORMULA_OVERRIDE are intentionally NOT summed here — the backend's
 * GiftEffectService never references either tag, so wiring them in would invent validation the
 * backend doesn't do and risk double-counting against a skill's own `bonus` field.
 */
export function recomputeDerivedAttributes(draft: MythrasCharacter): void {
	const c = draft.characteristics;

	const extraForHp = getActiveGiftEffects(draft, 'HIT_POINTS_FORMULA_EXTRA_CHARACTERISTIC').reduce(
		(sum, e) => sum + resolveCharacteristic(c, e.scope),
		0
	);
	const extraForDamageModifier = getActiveGiftEffects(
		draft,
		'DAMAGE_MODIFIER_FORMULA_EXTRA_CHARACTERISTIC'
	).reduce((sum, e) => sum + resolveCharacteristic(c, e.scope), 0);
	const healingMultiplier = getActiveGiftEffects(draft, 'HEALING_RATE_MULTIPLIER').reduce(
		(product, e) => product * (e.multiplier ?? 1),
		1
	);

	draft.attributes.damageModifier = computeDamageModifier(c.str + extraForDamageModifier, c.siz);
	draft.attributes.healingRate = Math.round(computeHealingRate(c.con) * healingMultiplier);
	draft.attributes.experienceModifier =
		computeExperienceModifier(c.cha) +
		sumFlatValues(getActiveGiftEffects(draft, 'EXPERIENCE_MODIFIER_FLAT_BONUS'));
	draft.attributes.initiativeBonus =
		computeStrikeRank(c.intelligence, c.dex) +
		sumFlatValues(getActiveGiftEffects(draft, 'INITIATIVE_FLAT_BONUS'));
	draft.attributes.movementRate =
		6 + sumFlatValues(getActiveGiftEffects(draft, 'MOVEMENT_RATE_FLAT_BONUS'));

	if (!draft.attributes.actionPoints.manualOverride) {
		draft.attributes.actionPoints.max =
			computeActionPoints(c.intelligence, c.dex) +
			sumFlatValues(getActiveGiftEffects(draft, 'ACTION_POINTS_FLAT_BONUS'));
	}
	if (!draft.attributes.luckPoints.manualOverride) {
		draft.attributes.luckPoints.max =
			computeLuckPoints(c.pow) + sumFlatValues(getActiveGiftEffects(draft, 'LUCK_POINTS_FLAT_BONUS'));
	}
	if (!draft.attributes.magicPoints.manualOverride) {
		draft.attributes.magicPoints.max =
			computeMagicPointsMax(c.pow) + sumFlatValues(getActiveGiftEffects(draft, 'MAGIC_POINTS_FLAT_BONUS'));
	}
	for (const loc of draft.hitLocations ?? []) {
		const def = DEFAULT_HIT_LOCATIONS.find((d) => d.name === loc.name);
		if (def) loc.maxHp = hitLocationMaxHp(def.location, c.con + extraForHp, c.siz);
	}
	for (const skill of draft.standardSkills ?? []) recomputeSkill(skill, c);
	for (const skill of draft.professionalSkills ?? []) recomputeSkill(skill, c);
	for (const skill of draft.magicSkills ?? []) recomputeSkill(skill, c);
	for (const passion of draft.passions ?? []) recomputePassion(passion);
	for (const style of draft.combatStyles ?? []) recomputeCombatStyle(style);
}

export function ensureDefaults(d: MythrasCharacter): void {
	if (d.characteristics == null) {
		d.characteristics = { str: 10, con: 10, siz: 10, dex: 10, intelligence: 10, pow: 10, cha: 10 };
	}
	if (d.attributes == null) {
		d.attributes = {
			actionPoints: { current: 2, max: 2, manualOverride: false },
			damageModifier: '+0',
			experienceModifier: 0,
			healingRate: 2,
			initiativeBonus: 10,
			luckPoints: { current: 2, max: 2, manualOverride: false },
			magicPoints: { current: 10, max: 10, manualOverride: false },
			movementRate: 6
		};
	} else {
		// Characters saved before the actionPoints/luckPoints/magicPoints resource-pool
		// migration still come back from the API as flat numbers; coerce them so the
		// rest of the app can assume the ResourcePool shape everywhere.
		d.attributes.actionPoints = normalizeResourcePool(d.attributes.actionPoints);
		d.attributes.luckPoints = normalizeResourcePool(d.attributes.luckPoints);
		d.attributes.magicPoints = normalizeResourcePool(d.attributes.magicPoints);
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
	for (const cult of d.cults) {
		cult.benefits ??= [];
		cult.restrictions ??= [];
		cult.gifts ??= [];
		for (const gift of cult.gifts) {
			gift.effects ??= [];
		}
	}
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
