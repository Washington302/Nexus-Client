import type {
	Profession,
	Race,
	GameType,
	WitcherStat,
	WitcherCharacter,
	Skill,
	Statistics,
	DerivedStats,
	CriticalWound,
	StatModifier,
	RacialPerk,
	DerivedTarget,
	WoundState,
	WoundSeverity,
	WoundLocation,
	WitcherSkillName,
	ProfessionAbility,
	LifepathEvent,
	Recipe,
	AlchemyItemType,
	Material,
	AlchemicalItem,
	ActiveAlchemyEffect,
	RecipeComponent,
	MasteryTier,
	IngredientRarity,
	Substance,
	SubstanceHolding,
	RecipeType,
	OptionalRules,
	CraftedItem,
	Weapon,
	WeaponType,
	Availability,
	Concealment,
	ArmorItem,
	ArmorLocation,
	EquipmentItem,
	MagicalEffect,
	MagicType,
	MagicElement,
	GameSession,
	SessionNpc
} from '$lib/services/api';

/** Comma-separated text <-> string[] for compact list fields (racial traits, etc.). */
export function listToText(list: string[]): string {
	return (list ?? []).join(', ');
}
export function textToList(text: string): string[] {
	return text
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
}

export function createDefaultSessionNpc(): SessionNpc {
	return { id: crypto.randomUUID(), name: '', role: '', avatar: '' };
}

export function createDefaultSession(nextNumber: number): GameSession {
	return {
		id: crypto.randomUUID(),
		number: nextNumber,
		title: '',
		realDate: '',
		current: false,
		location: '',
		npcs: [],
		loot: [],
		summary: '',
		postscripts: []
	};
}

export const RACE_OPTIONS: Race[] = ['HUMAN', 'ELF', 'DWARF', 'WITCHER'];

export const PROFESSION_OPTIONS: Profession[] = [
	'BARD',
	'CRAFTSMAN',
	'CRIMINAL',
	'DOCTOR',
	'MAGE',
	'MAN_AT_ARMS',
	'MERCHANT',
	'PRIEST',
	'WITCHER'
];

export const GAME_TYPE_OPTIONS: GameType[] = ['AVERAGE', 'SKILLED', 'HEROES', 'LEGENDS'];

/** Point pools from GameType.java — the budget validateStatBudget checks against. */
export const GAME_TYPE_POOL: Record<GameType, number> = {
	AVERAGE: 60,
	SKILLED: 70,
	HEROES: 75,
	LEGENDS: 80
};

/** Order attribute cards should render in, matching the mockup's Reflex/Dexterity/Intelligence/Will/Empathy grid. */
export const STAT_ORDER: WitcherStat[] = [
	'REFLEXES',
	'DEXTERITY',
	'INTELLIGENCE',
	'BODY',
	'WILL',
	'EMPATHY',
	'CRAFT',
	'SPEED',
	'LUCK'
];

/** Stat order for the attribute table, matching the printed player sheet. */
export const STAT_TABLE_ORDER: WitcherStat[] = [
	'INTELLIGENCE',
	'REFLEXES',
	'DEXTERITY',
	'BODY',
	'SPEED',
	'EMPATHY',
	'CRAFT',
	'WILL',
	'LUCK'
];

/** Abbreviations used in the attribute table, as printed on the sheet. */
export const STAT_ABBREV: Record<WitcherStat, string> = {
	INTELLIGENCE: 'INT',
	REFLEXES: 'REF',
	DEXTERITY: 'DEX',
	BODY: 'BODY',
	SPEED: 'SPD',
	EMPATHY: 'EMP',
	CRAFT: 'CRA',
	WILL: 'WILL',
	LUCK: 'LUCK'
};

/** The max/normal stat fields on Statistics — the point-buy values. */
export type StatisticsField = Exclude<
	keyof Statistics,
	| 'gameType'
	| 'currentIntelligence'
	| 'currentReflexes'
	| 'currentDexterity'
	| 'currentBody'
	| 'currentSpeed'
	| 'currentEmpathy'
	| 'currentCraft'
	| 'currentWill'
	| 'currentLuck'
>;

/** The matching live-play field for each stat. */
export type StatisticsCurrentField = Extract<keyof Statistics, `current${string}`>;

export const STAT_TO_CURRENT_FIELD: Record<WitcherStat, StatisticsCurrentField> = {
	INTELLIGENCE: 'currentIntelligence',
	REFLEXES: 'currentReflexes',
	DEXTERITY: 'currentDexterity',
	BODY: 'currentBody',
	SPEED: 'currentSpeed',
	EMPATHY: 'currentEmpathy',
	CRAFT: 'currentCraft',
	WILL: 'currentWill',
	LUCK: 'currentLuck'
};

/**
 * Maps a WitcherStat to its settable Statistics field. `statValue()` reads via a
 * switch and so can't be a `bind:value` target; this gives edit forms a writable
 * path (`statistics[STAT_TO_STATISTICS_FIELD[stat]]`).
 */
export const STAT_TO_STATISTICS_FIELD: Record<WitcherStat, StatisticsField> = {
	INTELLIGENCE: 'intelligence',
	REFLEXES: 'reflexes',
	DEXTERITY: 'dexterity',
	BODY: 'body',
	SPEED: 'speed',
	EMPATHY: 'empathy',
	CRAFT: 'craft',
	WILL: 'will',
	LUCK: 'luck'
};

const LABELS: Record<string, string> = {
	INTELLIGENCE: 'Intelligence',
	REFLEXES: 'Reflexes',
	DEXTERITY: 'Dexterity',
	BODY: 'Body',
	SPEED: 'Speed',
	EMPATHY: 'Empathy',
	CRAFT: 'Craft',
	WILL: 'Will',
	LUCK: 'Luck',
	HUMAN: 'Human',
	ELF: 'Elf',
	DWARF: 'Dwarf',
	BARD: 'Bard',
	CRAFTSMAN: 'Craftsman',
	CRIMINAL: 'Criminal',
	DOCTOR: 'Doctor',
	MAGE: 'Mage',
	MAN_AT_ARMS: 'Man-at-Arms',
	MERCHANT: 'Merchant',
	PRIEST: 'Priest',
	WITCHER: 'Witcher',
	AVERAGE: 'Average',
	SKILLED: 'Skilled',
	HEROES: 'Heroes',
	LEGENDS: 'Legends',
	POTION: 'Potion',
	OIL: 'Oil',
	DECOCTION: 'Decoction',
	BOMB: 'Bomb',
	MUTAGEN: 'Mutagen',
	OTHER: 'Other',
	NOVICE: 'Novice',
	JOURNEYMAN: 'Journeyman',
	MASTER: 'Master',
	EVERYWHERE: 'Everywhere',
	COMMON: 'Common',
	POOR: 'Poor',
	RARE: 'Rare',
	SPELL: 'Spell',
	INVOCATION: 'Invocation',
	SIGN: 'Sign',
	RITUAL: 'Ritual',
	HEX: 'Hex',
	EARTH: 'Earth',
	AIR: 'Air',
	FIRE: 'Fire',
	WATER: 'Water',
	MIXED: 'Mixed',
	SLASHING: 'Slashing',
	PIERCING: 'Piercing',
	BLUDGEONING: 'Bludgeoning',
	TINY: 'Tiny',
	SMALL: 'Small',
	LARGE: 'Large',
	CANNOT_HIDE: 'Cannot Hide',
	HEAD: 'Head',
	UPPER_BODY: 'Upper Body',
	LOWER_BODY: 'Lower Body',
	SHIELD: 'Shield',
	VITRIOL: 'Vitriol',
	REBIS: 'Rebis',
	AETHER: 'Aether',
	QUEBRITH: 'Quebrith',
	HYDRAGENUM: 'Hydragenum',
	VERMILION: 'Vermilion',
	SOL: 'Sol',
	CAELUM: 'Caelum',
	FULGUR: 'Fulgur',
	// Fixed 44-skill list (WitcherSkillName.java) — hardcoded rather than heuristically
	// derived from the enum name, since a generic "join with /" rule can't tell
	// "Dodge/Escape" (rulebook slash) from "Human Perception" (plain two-word name).
	AWARENESS: 'Awareness',
	BUSINESS: 'Business',
	DEDUCTION: 'Deduction',
	EDUCATION: 'Education',
	LANGUAGE: 'Language',
	MONSTER_LORE: 'Monster Lore',
	SOCIAL_ETIQUETTE: 'Social Etiquette',
	STREETWISE: 'Streetwise',
	TACTICS: 'Tactics',
	TEACHING: 'Teaching',
	WILDERNESS_SURVIVAL: 'Wilderness Survival',
	BRAWLING: 'Brawling',
	DODGE_ESCAPE: 'Dodge/Escape',
	MELEE: 'Melee',
	RIDING: 'Riding',
	SAILING: 'Sailing',
	SMALL_BLADES: 'Small Blades',
	STAFF_SPEAR: 'Staff/Spear',
	SWORDSMANSHIP: 'Swordsmanship',
	ARCHERY: 'Archery',
	ATHLETICS: 'Athletics',
	CROSSBOW: 'Crossbow',
	SLEIGHT_OF_HAND: 'Sleight of Hand',
	STEALTH: 'Stealth',
	PHYSIQUE: 'Physique',
	ENDURANCE: 'Endurance',
	CHARISMA: 'Charisma',
	DECEIT: 'Deceit',
	FINE_ARTS: 'Fine Arts',
	GAMBLING: 'Gambling',
	GROOMING_AND_STYLE: 'Grooming & Style',
	HUMAN_PERCEPTION: 'Human Perception',
	LEADERSHIP: 'Leadership',
	PERSUASION: 'Persuasion',
	PERFORMANCE: 'Performance',
	SEDUCTION: 'Seduction',
	ALCHEMY: 'Alchemy',
	CRAFTING: 'Crafting',
	DISGUISE: 'Disguise',
	FIRST_AID: 'First Aid',
	FORGERY: 'Forgery',
	PICK_LOCK: 'Pick Lock',
	TRAP_CRAFTING: 'Trap Crafting',
	COURAGE: 'Courage',
	HEX_WEAVING: 'Hex Weaving',
	INTIMIDATION: 'Intimidation',
	RESIST_MAGIC: 'Resist Magic',
	RESIST_COERCION: 'Resist Coercion',
	RITUAL_CRAFTING: 'Ritual Crafting',
	SPELL_CASTING: 'Spell Casting'
};

/** Turns an UPPER_SNAKE enum value into a display label, e.g. DODGE_ESCAPE -> "Dodge/Escape". */
export function label(value: string): string {
	if (LABELS[value]) return LABELS[value];
	// Fallback for any value not in the fixed LABELS map above.
	return value
		.toLowerCase()
		.split('_')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');
}

export function skillsForStat(skills: Skill[], stat: WitcherStat): Skill[] {
	return skills.filter((s) => s.governingStat === stat);
}

/**
 * Mirrors WitcherSkillName.isSpecializable() — must be kept in sync by hand, since the
 * frontend has no way to read the backend enum's method. Trained per-subject rather
 * than as one general competency (pg.51-54): Language is skill in a SPECIFIC language;
 * Fine Arts and Performance both require naming a form each time the skill is taken.
 */
export const SPECIALIZABLE_SKILLS: readonly WitcherSkillName[] = [
	'LANGUAGE',
	'FINE_ARTS',
	'PERFORMANCE'
];

export function isSpecializable(skillName: WitcherSkillName): boolean {
	return SPECIALIZABLE_SKILLS.includes(skillName);
}

/**
 * All rows sharing a skill name, so a specializable skill's several subjects
 * (Elder Speech, Common Speech, ...) can be handled as one unit — added to, grouped,
 * counted — while an ordinary skill's group is just its single row.
 */
export function skillRows(skills: Skill[], skillName: WitcherSkillName): Skill[] {
	return skills.filter((s) => s.skillName === skillName);
}

/**
 * A new subject for a specializable skill, cloned from an existing row of the same
 * name so governingStat/packageSkill/costPerLevel — which don't vary by subject —
 * come along automatically instead of being re-entered.
 */
export function createDefaultSpecialization(template: Skill): Skill {
	return {
		...template,
		id: crypto.randomUUID(),
		specialization: '',
		points: 0,
		currentPoints: 0,
		total: 0,
		currentTotal: 0
	};
}

/**
 * Mirrors WitcherDerivedStatsService.recalculateSkills — a skill's total is its
 * governing stat's value plus the points invested. The server recomputes and
 * overwrites `skill.total` on every save, so this is a live preview of that value:
 * it keeps the sheet honest while you're typing, instead of showing a stale cached
 * total until the next round-trip.
 */
export function skillTotal(statValue: number, points: number): number {
	return (statValue || 0) + (points || 0);
}

/** A stat's live value — what you actually roll with — falling back to its max. */
export function currentStatValue(statistics: Statistics, stat: WitcherStat): number {
	const current = statistics[STAT_TO_CURRENT_FIELD[stat]];
	return current ?? statistics[STAT_TO_STATISTICS_FIELD[stat]];
}

// ─── CRITICAL WOUND / CONDITION PENALTIES ──────────────────────────────────────
//
// The server stores wounds but deliberately applies nothing, because the rulebook
// never prints a stacking order. This is where the table's ruling lives, in one
// place, so it can be pointed at and changed rather than being spread through the UI.
//
// The order implemented, from the rules as given:
//   1. Wound multipliers compound, applied sequentially and rounded down at each
//      step. Two quarterings really is a sixteenth — the Hym's nightmare states "the
//      halving of Stamina is cumulative", and the same logic governs the rest.
//   2. The state multiplier — Wound Threshold halving, or Death State thirding —
//      applies ON TOP of that already-multiplied value, not to the base ("if your
//      Stamina is already quartered by Septic Shock and you enter the Death State,
//      your Stamina would be reduced to 1/3 of that quartered value"). Death State
//      replaces the halving rather than stacking with it.
//   3. Flat wound penalties come off last, i.e. off the already-reduced value
//      ("subtracted from your new, halved base": REF 10 → 5 → Concussion -2 → 3).
//   4. Numbing Herbs lower each penalty by 2, separately, and never below 0.
//   5. A statistic can reach 0 but never goes below it.
//
// Steps 2-4 are expressed as positive reductions rather than as further multiplies,
// which is what makes step 4 work: herbs reduce each *penalty*, so they can never
// push a stat above where it started. Verified against every printed example.
//
// Integer division is used for the state rather than multiplying by 1/2 or 1/3 —
// 1/3 is not exact in binary, and 3 * (1/3) floors to 0 rather than 1.

/** Sequential reduction, rounded down at each step. floor(floor(x/a)/b) equals
 *  floor(x/ab) for positive integers, so applying them one at a time is both what
 *  the rules describe and arithmetically identical to combining them first. */
function applyMultipliers(value: number, multipliers: number[]): number {
	return multipliers.reduce((acc, m) => Math.floor(acc * m), value);
}

/** The Wound Threshold halves only these four. BODY and SPD are explicitly exempt;
 *  their penalties come from specific criticals instead. EMP/CRA/LUCK go untouched. */
const WOUND_THRESHOLD_HALVES: readonly WitcherStat[] = [
	'REFLEXES',
	'DEXTERITY',
	'INTELLIGENCE',
	'WILL'
];

/** Numbing Herbs "lower negatives from critical wounds by 2" and "lessen penalties
 *  from being near death by 2". Applied per penalty, not once overall. */
export const NUMBING_HERB_RELIEF = 2;

export type HealthCondition = 'NONE' | 'WOUNDED' | 'DEATH_STATE';

/**
 * Which whole-character condition is in force. Death State replaces the Wound
 * Threshold halving rather than stacking with it, so this is one value, not a set.
 */
export function healthCondition(derived: DerivedStats): HealthCondition {
	if (derived.currentHealthPoints <= 0) return 'DEATH_STATE';
	if (derived.woundThreshold > 0 && derived.currentHealthPoints < derived.woundThreshold)
		return 'WOUNDED';
	return 'NONE';
}

/**
 * True for a `CriticalWound` row that's really a condition — a curse, disease, or
 * hex rather than a located physical injury. Same backend object on purpose: a
 * condition IS structurally a critical wound (name, per-state modifiers, notes), and
 * the rulebook's own affliction rules ("halved/quartered Stamina until cured") reuse
 * the identical stacking math wounds already use. Requesting a second backend type for
 * something that shares every field would just be two names for one shape.
 *
 * Distinguished without a new field: `severity` (the SIMPLE/COMPLEX/DIFFICULT/DEADLY
 * bonus-damage band) and `location` (HEAD/TORSO/ARM/LEG) are both concepts specific to
 * the physical crit tables — nothing in the Nightmare Hex, Sewer Pox, or a Botchling's
 * curse is banded by severity or sited on a limb. A row with neither set reads as a
 * condition; setting either moves it back to Critical Wounds. A player who wants a
 * located, severity-less crit is the one edge this heuristic gets wrong — accepted
 * rather than asking the backend for a field whose only job is telling two UI boxes
 * apart.
 */
export function isCondition(wound: CriticalWound): boolean {
	return !wound.severity && !wound.location;
}

/** The modifier list matching a wound's current state — the tables print one column per state. */
export function activeModifiers(wound: CriticalWound): StatModifier[] {
	if (wound.state === 'TREATED') return wound.treatedModifiers ?? [];
	if (wound.state === 'STABILIZED') return wound.stabilizedModifiers ?? [];
	return wound.untreatedModifiers ?? [];
}

/**
 * Herbs are flagged per wound, so near-death relief applies if herbs are on any
 * wound. ASSUMPTION: the rule reads as one application relieving the near-death
 * penalty once, not once per treated wound — relief is never summed.
 */
function nearDeathRelief(wounds: CriticalWound[]): number {
	return wounds.some((w) => w.numbingHerbsApplied) ? NUMBING_HERB_RELIEF : 0;
}

export interface StatPenalty {
	/** The bought value before perks — what the point-buy budget counts. */
	purchased: number;
	/** Working base: the purchased value once active perks are applied. */
	base: number;
	/** What you actually roll with. */
	effective: number;
	/** Reduction from the Wound Threshold / Death State, after herb relief. Measured
	 *  against the already-multiplied value, since the state applies on top. */
	conditionPenalty: number;
	/** Reduction from wound multipliers compounding, taken off the base. */
	multiplierPenalty: number;
	/** Product of every active wound multiplier — 0.0625 when two quarterings stack. */
	multiplier: number;
	/** Reduction from flat wound penalties, after per-wound herb relief. */
	flatPenalty: number;
	/** Signed total from active racial perks, applied to the base before anything else. */
	perkModifier: number;
	condition: HealthCondition;
	/** True when anything at all is reducing the stat. */
	impaired: boolean;
}

/** Modifiers from every perk that is switched on. */
export function activePerkModifiers(perks: RacialPerk[]): StatModifier[] {
	return (perks ?? []).filter((p) => p.active).flatMap((p) => p.modifiers ?? []);
}

/**
 * The full penalty breakdown for one stat. Returns the parts as well as the total so
 * the UI can explain *why* a number dropped instead of just showing a smaller number.
 *
 * Worked against every printed example:
 *   REF 10, below threshold, Concussion -2   →  10 → 5 → -2       = 3   ✓
 *   the same with Numbing Herbs              →  10 → 7 → -0       = 7   ✓
 *   SPD 10, Heart Damage + Compound Fracture →  10 → 2 → 0        = 0   ✓
 */
export function statPenalty(
	statistics: Statistics,
	derived: DerivedStats,
	wounds: CriticalWound[],
	perks: RacialPerk[],
	stat: WitcherStat
): StatPenalty {
	const condition = healthCondition(derived);
	const list = wounds ?? [];

	// 0. Racial perks raise (or lower) the base itself. They are deliberately kept out
	//    of the stored maxima server-side, because they aren't purchased and would
	//    corrupt the chargen budgets — so the sheet is the only place they get applied.
	//    ASSUMPTION: a perk is part of your statistic, so the Wound Threshold halves the
	//    perk-boosted value rather than the purchased one.
	const perkMods = activePerkModifiers(perks).filter((m) => m.stat === stat);
	const perkModifier = perkMods.reduce((sum, m) => sum + (m.flatModifier || 0), 0);
	const purchased = currentStatValue(statistics, stat);
	const base = Math.max(0, applyMultipliers(purchased, perkMultipliers(perkMods)) + perkModifier);

	// 1. Multipliers compound. Two quarterings is a sixteenth, not a quarter.
	const multipliers: number[] = [];
	for (const wound of list) {
		for (const mod of activeModifiers(wound)) {
			if (mod.stat === stat && mod.multiplier > 0 && mod.multiplier !== 1) {
				multipliers.push(mod.multiplier);
			}
		}
	}
	const afterMultipliers = applyMultipliers(base, multipliers);
	const multiplierPenalty = base - afterMultipliers;
	const multiplier = multipliers.reduce((acc, m) => acc * m, 1);

	// 2. The state applies to the already-multiplied value, not to the base — a
	//    quartered stat entering Death State becomes a third OF THE QUARTER.
	//    Integer division, because 1/3 is inexact in binary.
	let conditionPenalty = 0;
	if (condition === 'DEATH_STATE') {
		conditionPenalty = afterMultipliers - Math.floor(afterMultipliers / 3);
	} else if (condition === 'WOUNDED' && WOUND_THRESHOLD_HALVES.includes(stat)) {
		conditionPenalty = afterMultipliers - Math.floor(afterMultipliers / 2);
	}
	conditionPenalty = Math.max(0, conditionPenalty - nearDeathRelief(list));

	// 3. Flat penalties, relieved per wound since herbs are applied to a wound.
	let flatPenalty = 0;
	for (const wound of list) {
		let woundFlat = 0;
		for (const mod of activeModifiers(wound)) {
			if (mod.stat === stat) woundFlat += Math.abs(mod.flatModifier || 0);
		}
		if (woundFlat > 0) {
			flatPenalty += Math.max(0, woundFlat - (wound.numbingHerbsApplied ? NUMBING_HERB_RELIEF : 0));
		}
	}

	// Floored at 0: a statistic can be reduced to nothing, but never past it.
	const effective = Math.max(0, afterMultipliers - conditionPenalty - flatPenalty);
	return {
		purchased,
		base,
		effective,
		conditionPenalty,
		multiplierPenalty,
		multiplier,
		flatPenalty,
		perkModifier,
		condition,
		// Compared against the purchased value, so a perk bonus reads as a change worth
		// showing rather than being hidden by having raised its own baseline.
		impaired: effective !== purchased
	};
}

/** Multipliers a perk applies (the Fiend decoction doubles ENC), excluding no-ops. */
function perkMultipliers(mods: StatModifier[]): number[] {
	return mods.filter((m) => m.multiplier > 0 && m.multiplier !== 1).map((m) => m.multiplier);
}

/**
 * Net effect of every active wound and perk on one server-computed value — what
 * `DerivedTarget` exists for. Septic Shock quartering Stamina and a Dwarf's innate
 * Stopping Power both land here rather than in free text.
 *
 * Returns the adjusted number; the caller decides what to do with it, since the
 * server's own value stays authoritative for storage.
 */
export function effectiveDerived(
	value: number,
	wounds: CriticalWound[],
	perks: RacialPerk[],
	target: DerivedTarget
): number {
	const woundMods = (wounds ?? []).flatMap((w) =>
		activeModifiers(w).filter((m) => m.derivedTarget === target)
	);
	const perkMods = activePerkModifiers(perks).filter((m) => m.derivedTarget === target);
	const all = [...perkMods, ...woundMods];
	const multiplied = applyMultipliers(value, perkMultipliers(all));
	const flat = all.reduce((sum, m) => sum + (m.flatModifier || 0), 0);
	return Math.max(0, multiplied + flat);
}

/** What you roll with, after every wound and condition penalty. */
export function effectiveStat(
	statistics: Statistics,
	derived: DerivedStats,
	wounds: CriticalWound[],
	perks: RacialPerk[],
	stat: WitcherStat
): number {
	return statPenalty(statistics, derived, wounds, perks, stat).effective;
}

/**
 * Net effect on one skill's own points, from wounds (Compound Leg Fracture quarters
 * Dodge/Escape) and perks (an Elf's Marksman adds +2 Archery) alike. Separate from the
 * stat path: this hits the skill's points, not its governing statistic.
 *
 * `flat` is signed here, unlike the stat path — a perk bonus and a wound penalty both
 * land in it, and the wound half is herb-relieved before they're combined.
 */
export function skillModifiers(
	wounds: CriticalWound[],
	perks: RacialPerk[],
	skill: WitcherSkillName
): { multipliers: number[]; flat: number } {
	const list = wounds ?? [];
	const multipliers: number[] = [];
	let flat = 0;

	const perkMods = activePerkModifiers(perks).filter((m) => m.skill === skill);
	multipliers.push(...perkMultipliers(perkMods));
	flat += perkMods.reduce((sum, m) => sum + (m.flatModifier || 0), 0);

	for (const wound of list) {
		let woundFlat = 0;
		for (const mod of activeModifiers(wound)) {
			if (mod.skill !== skill) continue;
			// Compound, as on stats — a Leg Fracture and a second quartering is a sixteenth.
			if (mod.multiplier > 0 && mod.multiplier !== 1) multipliers.push(mod.multiplier);
			woundFlat += Math.abs(mod.flatModifier || 0);
		}
		if (woundFlat > 0) {
			flat -= Math.max(0, woundFlat - (wound.numbingHerbsApplied ? NUMBING_HERB_RELIEF : 0));
		}
	}
	return { multipliers, flat };
}

/**
 * A skill's live total: its governing stat after every penalty, plus its points after
 * any wound that targets the skill itself. The multiplier hits the points rather than
 * the total, matching the backend's note that a Compound Leg Fracture quarters current
 * Dodge/Escape without touching the purchased value.
 */
export function effectiveSkillTotal(
	statistics: Statistics,
	derived: DerivedStats,
	wounds: CriticalWound[],
	perks: RacialPerk[],
	skill: Skill
): number {
	const stat = effectiveStat(statistics, derived, wounds, perks, skill.governingStat);
	const { multipliers, flat } = skillModifiers(wounds, perks, skill.skillName);
	const points = Math.max(0, applyMultipliers(skill.points || 0, multipliers) + flat);
	return stat + points;
}

/** A skill's points after perks and wounds — the stat half is added separately. */
export function effectiveSkillPoints(
	wounds: CriticalWound[],
	perks: RacialPerk[],
	skill: Skill
): number {
	const { multipliers, flat } = skillModifiers(wounds, perks, skill.skillName);
	return Math.max(0, applyMultipliers(skill.points || 0, multipliers) + flat);
}

export const WOUND_SEVERITY_OPTIONS: WoundSeverity[] = ['SIMPLE', 'COMPLEX', 'DIFFICULT', 'DEADLY'];
export const WOUND_STATE_OPTIONS: WoundState[] = ['UNTREATED', 'STABILIZED', 'TREATED'];
export const WOUND_LOCATION_OPTIONS: WoundLocation[] = ['HEAD', 'TORSO', 'ARM', 'LEG'];

/** "Lowers Stamina by a third" (Environmental Stress, pg. exposure rules) means a
 *  third is LOST, i.e. two-thirds remain — distinct from "Quartered", where
 *  three-quarters are lost. Named as a constant rather than a literal 2 / 3 so every
 *  comparison against it (modifierText below, any future one) uses the identical
 *  float rather than risking a second hand-typed approximation that fails ===. */
export const REDUCED_BY_A_THIRD = 2 / 3;

/** As StatModifier.multiplier expects. Doubling exists for perks and decoctions —
 *  the Fiend decoction doubles Encumbrance — so this isn't penalties-only. */
export const MULTIPLIER_OPTIONS: { value: number; label: string }[] = [
	{ value: 1, label: 'None' },
	{ value: REDUCED_BY_A_THIRD, label: 'Reduced by a Third (×2/3)' },
	{ value: 0.5, label: 'Halved' },
	{ value: 0.25, label: 'Quartered' },
	{ value: 2, label: 'Doubled' }
];

export const DERIVED_TARGET_OPTIONS: DerivedTarget[] = [
	'STAMINA',
	'HEALTH_POINTS',
	'RECOVERY',
	'STUN',
	'VIGOR_THRESHOLD',
	'ENCUMBRANCE',
	'RUN',
	'LEAP',
	'MELEE_DAMAGE_BONUS',
	'STOPPING_POWER'
];

export function createDefaultStatModifier(): StatModifier {
	return {
		id: crypto.randomUUID(),
		stat: null,
		skill: null,
		derivedTarget: null,
		otherTarget: '',
		flatModifier: 0,
		multiplier: 1,
		notes: ''
	};
}

function gcd(a: number, b: number): number {
	return b === 0 ? a : gcd(b, a % b);
}

/**
 * A multiplier as a small fraction — "1/16" for two stacked quarterings, "2/3" for
 * Reduced by a Third, "1/6" for a quartering stacked on a thirding. Finds the
 * simplest fraction within a hair of the value rather than assuming every multiplier
 * is a power of two: the old `1/round(1/x)` version rendered 2/3 as "1/2", silently
 * wrong, the moment REDUCED_BY_A_THIRD entered the mix.
 */
export function fractionLabel(multiplier: number): string {
	if (multiplier <= 0) return '0';
	if (multiplier >= 1) return '1';
	let bestNum = 1;
	let bestDen = 1;
	let bestError = Infinity;
	for (let den = 1; den <= 64; den++) {
		const num = Math.round(multiplier * den);
		if (num <= 0) continue;
		const error = Math.abs(multiplier - num / den);
		if (error < bestError - 1e-9) {
			bestError = error;
			bestNum = num;
			bestDen = den;
		}
	}
	const g = gcd(bestNum, bestDen);
	return `${bestNum / g}/${bestDen / g}`;
}

/** One modifier as a readable line — "REF −2", "Archery +2", "Stamina quartered". */
export function modifierText(mod: StatModifier): string {
	const target = mod.stat
		? label(mod.stat)
		: mod.skill
			? label(mod.skill)
			: mod.derivedTarget
				? label(mod.derivedTarget)
				: mod.otherTarget || 'Unspecified';
	const bits: string[] = [];
	if (mod.multiplier === REDUCED_BY_A_THIRD) bits.push('reduced by a third');
	else if (mod.multiplier === 0.5) bits.push('halved');
	else if (mod.multiplier === 0.25) bits.push('quartered');
	else if (mod.multiplier === 2) bits.push('doubled');
	if (mod.flatModifier)
		bits.push(`${mod.flatModifier > 0 ? '+' : '−'}${Math.abs(mod.flatModifier)}`);
	return bits.length ? `${target} ${bits.join(', ')}` : target;
}

export function createDefaultRacialPerk(): RacialPerk {
	return {
		id: crypto.randomUUID(),
		name: '',
		description: '',
		modifiers: [],
		active: true
	};
}

export function createDefaultCriticalWound(): CriticalWound {
	return {
		id: crypto.randomUUID(),
		name: '',
		severity: null,
		location: null,
		state: 'UNTREATED',
		bleeding: false,
		untreatedModifiers: [],
		stabilizedModifiers: [],
		treatedModifiers: [],
		effectText: '',
		stabilizedText: '',
		treatedText: '',
		numbingHerbsApplied: false,
		notes: ''
	};
}

/** Raw sum of the nine maximum stats — the printed sheet's STAT TOTAL. validateStatBudget
 * compares this minus the baseline (1 per stat) against the game type's point pool. */
export function statPointsSpent(statistics: Statistics): number {
	return STAT_TABLE_ORDER.reduce(
		(sum, stat) => sum + (statistics[STAT_TO_STATISTICS_FIELD[stat]] || 0),
		0
	);
}

/* ── Background / lifepath ──────────────────────────────────────────────────
   Everything flavor-side is stored as LifepathEvent {category, description}.
   Fixed background boxes each own one entry under a known category; relations
   and decade rolls are repeatable entries under theirs. */

export const STYLE_CATEGORIES = [
	'Clothing',
	'Personality',
	'Hair Style',
	'Affectations',
	'Valued Person',
	'Value',
	'Feelings On People'
] as const;

export const EARLY_LIFE_CATEGORIES = [
	'Homeland',
	'Family',
	'Parents',
	'Status',
	'Influential Friend'
] as const;

export const RELATION_OPTIONS = ['Sibling', 'Rival', 'Friend'] as const;

export const LIFE_EVENT_CATEGORY = 'Life Event';

export function lifepathValue(events: LifepathEvent[], category: string): string {
	return events.find((e) => e.category === category)?.description ?? '';
}

/** Writes a single-entry category, creating its LifepathEvent on first input. */
export function setLifepathValue(c: WitcherCharacter, category: string, description: string): void {
	const found = c.lifepathEvents.find((e) => e.category === category);
	if (found) {
		found.description = description;
	} else {
		c.lifepathEvents.push({ id: crypto.randomUUID(), category, description });
	}
}

export function createLifepathEvent(category: string): LifepathEvent {
	return { id: crypto.randomUUID(), category, description: '' };
}

export function removeLifepathEvent(c: WitcherCharacter, id: string): void {
	c.lifepathEvents = c.lifepathEvents.filter((e) => e.id !== id);
}

/* ── Magic ────────────────────────────────────────────────────────────────── */

export const MAGIC_TYPE_OPTIONS: MagicType[] = ['SPELL', 'INVOCATION', 'SIGN', 'RITUAL', 'HEX'];

/** Section headings — spelled out rather than appending "s", which gives "Hexs". */
export const MAGIC_TYPE_PLURAL: Record<MagicType, string> = {
	SPELL: 'Spells',
	INVOCATION: 'Invocations',
	SIGN: 'Signs',
	RITUAL: 'Rituals',
	HEX: 'Hexes'
};
export const MAGIC_ELEMENT_OPTIONS: MagicElement[] = ['EARTH', 'AIR', 'FIRE', 'WATER', 'MIXED'];

export function createDefaultMagicalEffect(type: MagicType = 'SPELL'): MagicalEffect {
	return {
		id: crypto.randomUUID(),
		name: '',
		type,
		tier: 'NOVICE',
		element: null,
		staCost: 0,
		variableStaCost: false,
		effect: '',
		range: '',
		duration: '',
		defense: '',
		active: false,
		vigorUpkeep: 0,
		staUpkeep: 0,
		components: '',
		preparationTime: '',
		difficultyCheck: 0,
		variableDifficultyCheck: false,
		requirementToLift: '',
		danger: '',
		notes: ''
	};
}

/**
 * Vigor tied up by maintained effects. Mirrors the server's committedVigor so the
 * number moves the moment an effect is toggled, rather than waiting for a save.
 */
export function committedVigor(effects: MagicalEffect[]): number {
	return effects.reduce((sum, e) => sum + (e.active ? e.vigorUpkeep || 0 : 0), 0);
}

/** Stamina drained per round by everything currently maintained. */
export function staminaUpkeep(effects: MagicalEffect[]): number {
	return effects.reduce((sum, e) => sum + (e.active ? e.staUpkeep || 0 : 0), 0);
}

/* ── Gear ─────────────────────────────────────────────────────────────────── */

export const WEAPON_TYPE_OPTIONS: WeaponType[] = ['SLASHING', 'PIERCING', 'BLUDGEONING'];
export const AVAILABILITY_OPTIONS: Availability[] = ['EVERYWHERE', 'COMMON', 'POOR', 'RARE'];
export const CONCEALMENT_OPTIONS: Concealment[] = ['TINY', 'SMALL', 'LARGE', 'CANNOT_HIDE'];
export const ARMOR_LOCATION_OPTIONS: ArmorLocation[] = [
	'HEAD',
	'UPPER_BODY',
	'LOWER_BODY',
	'SHIELD'
];

export function createDefaultWeapon(): Weapon {
	return {
		id: crypto.randomUUID(),
		name: '',
		weaponTypes: [],
		weaponAccuracy: 0,
		availability: null,
		damage: '',
		maxReliability: 0,
		currentReliability: 0,
		hands: 1,
		range: '',
		effect: '',
		concealment: null,
		enhancementSlots: 0,
		weight: 0,
		quantity: 1,
		cost: 0,
		notes: ''
	};
}

export function createDefaultArmor(): ArmorItem {
	return {
		id: crypto.randomUUID(),
		name: '',
		location: null,
		coverage: '',
		maxStoppingPower: 0,
		currentStoppingPower: 0,
		availability: null,
		enhancementSlots: 0,
		effect: '',
		encumbranceValue: 0,
		weight: 0,
		equipped: false,
		cost: 0,
		notes: ''
	};
}

export function createDefaultEquipment(): EquipmentItem {
	return { id: crypto.randomUUID(), name: '', quantity: 1, weight: 0, notes: '' };
}

/** Crafting materials are `Material` rows with no substance — alchemical ones live on Alchemy. */
export function craftingMaterials(materials: Material[]): Material[] {
	return materials.filter((m) => !m.yieldsSubstance);
}

/** Diagrams are the crafting half of the unified recipe list. */
export function diagrams(recipes: Recipe[]): Recipe[] {
	return recipes.filter((r) => r.type === 'DIAGRAM');
}

/* ── Alchemy ──────────────────────────────────────────────────────────────── */

export const ALCHEMY_TYPE_OPTIONS: AlchemyItemType[] = [
	'POTION',
	'OIL',
	'DECOCTION',
	'BOMB',
	'MUTAGEN',
	'OTHER'
];

export const MASTERY_TIER_OPTIONS: MasteryTier[] = ['NOVICE', 'JOURNEYMAN', 'MASTER'];

export const RARITY_OPTIONS: IngredientRarity[] = ['EVERYWHERE', 'COMMON', 'POOR', 'RARE'];

/** Canonical substance order — the server seeds these nine rows at creation. */
export const SUBSTANCE_ORDER: Substance[] = [
	'VITRIOL',
	'REBIS',
	'AETHER',
	'QUEBRITH',
	'HYDRAGENUM',
	'VERMILION',
	'SOL',
	'CAELUM',
	'FULGUR'
];

/**
 * Characters created before the alchemy module have an empty `substanceStore`,
 * since seeding only runs at creation. Rather than depend on a backfill, the sheet
 * always renders the canonical nine and merges whatever the server sent by
 * substance — so it's correct for seeded, empty, partial or reordered stores, and
 * the rows persist on the next save.
 */
export function normalizeSubstanceStore(rows: SubstanceHolding[]): SubstanceHolding[] {
	return SUBSTANCE_ORDER.map(
		(substance) =>
			rows.find((r) => r.substance === substance) ?? {
				id: crypto.randomUUID(),
				substance,
				quantity: 0
			}
	);
}

/**
 * How many recipes can be held in memory at once. One pool spanning diagrams AND
 * formulae — the rulebook's cap reads "recipes (diagrams or formulae)", not one
 * allowance per system.
 *
 * Uses the character's normal (max) INT rather than the drained current value, so a
 * head injury doesn't retroactively invalidate recipes already memorised.
 *
 * ⚠️ ASSUMPTION: cap = INT exactly. The backend describes the cap as "INT-bounded"
 * but doesn't state a multiplier and has no constant for it yet (`memorized` is
 * unvalidated server-side). If the real rule is INT×2 or similar, change it here —
 * this is the only place the number is defined.
 */
export function memorizedCap(statistics: Statistics): number {
	return statistics.intelligence || 0;
}

export function memorizedCount(recipes: Recipe[]): number {
	return recipes.filter((r) => r.memorized).length;
}

/** Defaults to a formula; the Gear tab will pass 'DIAGRAM' for crafting recipes. */
export function createDefaultRecipe(type: RecipeType = 'FORMULA'): Recipe {
	return {
		id: crypto.randomUUID(),
		name: '',
		type,
		alchemyType: type === 'FORMULA' ? 'POTION' : null,
		craftedType: '',
		tier: 'NOVICE',
		craftingDc: 0,
		craftingTime: '',
		components: [],
		toxicityPercent: 0,
		requiresForge: false,
		writtenCopy: false,
		memorized: false,
		cost: 0,
		effectText: '',
		ingredientsText: ''
	};
}

/** Fungible by default (any material yielding the substance works, per alchemy). */
export function createDefaultComponent(): RecipeComponent {
	return { id: crypto.randomUUID(), substance: 'VITRIOL', materialName: '', quantity: 1 };
}

/** Alchemy always supplies the group's substance; Gear will pass null for crafting materials. */
export function createDefaultMaterial(substance: Substance | null = null): Material {
	return {
		id: crypto.randomUUID(),
		name: '',
		yieldsSubstance: substance,
		rarity: null,
		location: '',
		yieldQuantity: '',
		forageDc: 0,
		weight: 0,
		cost: 0,
		quantityHeld: 0,
		notes: ''
	};
}

export function createDefaultAlchemicalItem(): AlchemicalItem {
	return {
		id: crypto.randomUUID(),
		name: '',
		type: 'POTION',
		quantity: 1,
		toxicityPercent: 0,
		duration: '',
		weight: 0,
		effectText: ''
	};
}

/** Taking a dose: carries its own toxicity over to the active list. */
export function createEffectFromItem(item: AlchemicalItem): ActiveAlchemyEffect {
	return {
		id: crypto.randomUUID(),
		name: item.name,
		type: item.type,
		toxicityPercent: item.toxicityPercent,
		durationRemaining: item.duration,
		effectText: item.effectText
	};
}

export function createDefaultEffect(): ActiveAlchemyEffect {
	return {
		id: crypto.randomUUID(),
		name: '',
		type: 'POTION',
		toxicityPercent: 0,
		durationRemaining: '',
		effectText: ''
	};
}

export function createDefaultCraftedItem(): CraftedItem {
	return { id: crypto.randomUUID(), name: '', type: '', qualityNotes: '' };
}

export function createDefaultAbility(branch: number, tier: number): ProfessionAbility {
	return {
		id: crypto.randomUUID(),
		name: '',
		governingStat: null,
		description: '',
		level: 0,
		currentLevel: 0,
		branch,
		tier,
		definingSkill: false
	};
}

/** The trunk of the tree — Java's int fields default branch/tier to 0, same as the
 *  grid's first slot, so `definingSkill` is what actually distinguishes it. */
export function createDefaultDefiningSkill(): ProfessionAbility {
	return { ...createDefaultAbility(0, 0), definingSkill: true };
}

/**
 * The one ability row flagged as the trunk, mirroring the backend's
 * `ProfessionInfo.getDefiningSkillAbility()`. Per the rulebook (pg.61) it sits beneath
 * all three branches rather than occupying a grid slot, so this is a lookup, not a
 * grid position.
 */
export function definingSkillAbility(abilities: ProfessionAbility[]): ProfessionAbility | null {
	return abilities.find((a) => a.definingSkill) ?? null;
}

/** The 3x3 ability tree, filled out from whatever is stored so every slot renders. */
/**
 * The 3x3 branch/tier grid, EXCLUDING the Defining Skill trunk row. Without this
 * exclusion the trunk (branch=0, tier=0 — Java's int default, same as the grid's own
 * first slot) would collide with a real ability placed in that slot.
 */
export function abilityGrid(abilities: ProfessionAbility[]): ProfessionAbility[][] {
	const gridAbilities = abilities.filter((a) => !a.definingSkill);
	return [0, 1, 2].map((branch) =>
		[0, 1, 2].map(
			(tier) =>
				gridAbilities.find((a) => a.branch === branch && a.tier === tier) ??
				createDefaultAbility(branch, tier)
		)
	);
}

export function statValue(character: WitcherCharacter, stat: WitcherStat): number {
	switch (stat) {
		case 'INTELLIGENCE':
			return character.statistics.intelligence;
		case 'REFLEXES':
			return character.statistics.reflexes;
		case 'DEXTERITY':
			return character.statistics.dexterity;
		case 'BODY':
			return character.statistics.body;
		case 'SPEED':
			return character.statistics.speed;
		case 'EMPATHY':
			return character.statistics.empathy;
		case 'CRAFT':
			return character.statistics.craft;
		case 'WILL':
			return character.statistics.will;
		case 'LUCK':
			return character.statistics.luck;
	}
}

/**
 * Deep-copies a character straight off the API and puts it in the shape the sheet
 * renders. Both the owner's route and the public share route go through here so
 * they can never drift.
 */
export function normalizeCharacterFromApi(raw: WitcherCharacter): WitcherCharacter {
	const c = JSON.parse(JSON.stringify(raw)) as WitcherCharacter;
	ensureDefaults(c);
	return c;
}

/** Ensures older/incomplete drafts have every array/object field the sheet reads from. */
export function ensureDefaults(c: WitcherCharacter): void {
	c.professionInfo ??= {
		profession: null,
		magicalPerksNotes: '',
		gearPackageNotes: '',
		abilities: []
	};
	c.professionInfo.abilities ??= [];
	c.statistics ??= {
		intelligence: 1,
		reflexes: 1,
		dexterity: 1,
		body: 1,
		speed: 1,
		empathy: 1,
		craft: 1,
		will: 1,
		luck: 1,
		gameType: 'AVERAGE'
	};
	c.derivedStats ??= {
		maxVigor: 0,
		committedVigor: 0,
		availableVigor: 0,
		maxStun: 0,
		currentStun: 0,
		maxHealthPoints: 0,
		currentHealthPoints: 0,
		maxStamina: 0,
		currentStamina: 0,
		woundThreshold: 0,
		currentToxicity: 0,
		toxicityThreshold: 0,
		totalWeight: 0,
		encumbrancePenalty: 0,
		deadliftCapacity: 0,
		armorEncumbranceValue: 0,
		recovery: 0,
		encumbrance: 0,
		run: 0,
		leap: 0,
		meleeDamageBonus: 0,
		punchDamage: '',
		kickDamage: ''
	};
	c.skills ??= [];
	c.levelingInfo ??= {
		level: 1,
		reputation: 0,
		creationComplete: false,
		improvementPointsEarned: 0,
		improvementPointsAvailable: 0
	};
	c.lifepathEvents ??= [];
	c.weapons ??= [];
	c.wealth ??= { crowns: 0, notes: '' };
	c.armor ??= [];
	c.equipment ??= [];
	c.recipes ??= [];
	c.craftedItems ??= [];
	c.materials ??= [];
	c.alchemicalItems ??= [];
	c.activeAlchemyEffects ??= [];
	// Always the canonical nine, whatever the server sent (see normalizeSubstanceStore).
	c.substanceStore = normalizeSubstanceStore(c.substanceStore ?? []);
	c.magicalEffects ??= [];
	// Absent on any effect saved before variable STA/DC existed.
	for (const effect of c.magicalEffects) {
		effect.variableStaCost ??= false;
		effect.variableDifficultyCheck ??= false;
	}
	// `perks` replaced the old free-text `racialTraits`. Any character written before
	// that rename comes back with traits and no perks; a perk with no modifiers *is* a
	// narrative trait, so they convert losslessly rather than being dropped.
	c.raceInfo ??= { race: null, socialStanding: '', perks: [] };
	c.raceInfo.socialStanding ??= '';
	c.raceInfo.perks ??= [];
	const legacyTraits = (c.raceInfo as unknown as { racialTraits?: string[] }).racialTraits;
	if (c.raceInfo.perks.length === 0 && Array.isArray(legacyTraits)) {
		c.raceInfo.perks = legacyTraits
			.filter((t) => t.trim().length > 0)
			.map((t) => ({ ...createDefaultRacialPerk(), name: t.trim() }));
	}
	for (const perk of c.raceInfo.perks) {
		perk.modifiers ??= [];
	}

	// Absent on every character made before the critical-wound build-out. The three
	// per-state modifier lists are normalized too, since the editor pushes into them.
	c.criticalWounds ??= [];
	for (const wound of c.criticalWounds) {
		wound.untreatedModifiers ??= [];
		wound.stabilizedModifiers ??= [];
		wound.treatedModifiers ??= [];
	}
	c.optionalRules ??= { encumbranceEnabled: false };
	c.sessions ??= [];
}
