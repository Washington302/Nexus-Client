import type {
	Profession,
	Race,
	GameType,
	WitcherStat,
	WitcherCharacter,
	Skill
} from '$lib/services/api';

export const RACE_OPTIONS: Race[] = ['HUMAN', 'ELF', 'DWARF', 'HALFLING'];

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
	HALFLING: 'Halfling',
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

/** Ensures older/incomplete drafts have every array/object field the sheet reads from. */
export function ensureDefaults(c: WitcherCharacter): void {
	c.raceInfo ??= { race: null, racialTraits: [] };
	c.raceInfo.racialTraits ??= [];
	c.professionInfo ??= {
		profession: null,
		definingSkillName: '',
		definingSkillNotes: '',
		definingSkillPoints: 0,
		magicalPerksNotes: '',
		gearPackageNotes: ''
	};
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
		vigor: 0,
		stun: 0,
		healthPoints: 0,
		stamina: 0,
		recovery: 0,
		encumbrance: 0,
		run: 0,
		leap: 0,
		meleeDamageBonus: 0,
		punchDamage: '',
		kickDamage: ''
	};
	c.skills ??= [];
	c.lifepathEvents ??= [];
	c.meleeWeapons ??= [];
	c.rangedWeapons ??= [];
	c.armor ??= [];
	c.equipment ??= [];
	c.knownFormulae ??= [];
	c.craftedItems ??= [];
	c.knownSigns ??= [];
	c.knownSpells ??= [];
	c.knownInvocations ??= [];
	c.knownRituals ??= [];
	c.knownHexes ??= [];
}
