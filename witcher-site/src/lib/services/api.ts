const TOKEN_KEY = 'witcher_token';
// In dev the Vite proxy forwards /api to the backend; in production builds there is
// no proxy, so requests must target the backend origin directly.
const API_BASE = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE || '';

function getToken(): string | null {
	if (typeof localStorage === 'undefined') return null;
	return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
	if (typeof localStorage === 'undefined') return;
	if (token) localStorage.setItem(TOKEN_KEY, token);
	else localStorage.removeItem(TOKEN_KEY);
}

export function clearToken(): void {
	setToken(null);
}

/** A failed validation (422) returns a JSON array of messages — render those as prose. */
function readableError(body: string): string {
	try {
		const parsed = JSON.parse(body);
		if (Array.isArray(parsed) && parsed.every((m) => typeof m === 'string')) {
			return parsed.join(', ');
		}
	} catch {
		/* not JSON — fall through to the raw body */
	}
	return body;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
	const token = getToken();
	const headers: Record<string, string> = {
		...(options.headers as Record<string, string>)
	};
	if (token) headers['Authorization'] = `Bearer ${token}`;
	if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
		headers['Content-Type'] = 'application/json';
	}
	let res: Response;
	try {
		res = await fetch(`${API_BASE}${path}`, { ...options, headers });
	} catch {
		throw new Error('API currently down, please wait.');
	}
	if (!res.ok) {
		const body = await res.text().catch(() => '');
		throw new Error(readableError(body) || `Request failed: ${res.status}`);
	}
	if (res.status === 204) return undefined as T;
	return res.json();
}

export interface LoginResponse {
	token?: string;
	error?: string;
}

export interface UserProfile {
	id: string;
	username: string;
	email: string;
	createdAt: string;
	updatedAt: string;
}

/** Matches nexus-core's Witcher/Models/Enums/Race.java. */
export type Race = 'HUMAN' | 'ELF' | 'DWARF' | 'WITCHER';

/** Matches nexus-core's Witcher/Models/Enums/Profession.java. */
export type Profession =
	| 'BARD'
	| 'CRAFTSMAN'
	| 'CRIMINAL'
	| 'DOCTOR'
	| 'MAGE'
	| 'MAN_AT_ARMS'
	| 'MERCHANT'
	| 'PRIEST'
	| 'WITCHER';

/** Matches nexus-core's Witcher/Models/Enums/GameType.java (point-buy pool for Statistics). */
export type GameType = 'AVERAGE' | 'SKILLED' | 'HEROES' | 'LEGENDS';

/** Matches nexus-core's Witcher/Models/Enums/WitcherStat.java. */
export type WitcherStat =
	| 'INTELLIGENCE'
	| 'REFLEXES'
	| 'DEXTERITY'
	| 'BODY'
	| 'SPEED'
	| 'EMPATHY'
	| 'CRAFT'
	| 'WILL'
	| 'LUCK';

/** Matches nexus-core's Witcher/Models/Enums/WitcherSkillName.java — the fixed 44-skill list. */
export type WitcherSkillName =
	| 'AWARENESS'
	| 'BUSINESS'
	| 'DEDUCTION'
	| 'EDUCATION'
	| 'LANGUAGE'
	| 'MONSTER_LORE'
	| 'SOCIAL_ETIQUETTE'
	| 'STREETWISE'
	| 'TACTICS'
	| 'TEACHING'
	| 'WILDERNESS_SURVIVAL'
	| 'BRAWLING'
	| 'DODGE_ESCAPE'
	| 'MELEE'
	| 'RIDING'
	| 'SAILING'
	| 'SMALL_BLADES'
	| 'STAFF_SPEAR'
	| 'SWORDSMANSHIP'
	| 'ARCHERY'
	| 'ATHLETICS'
	| 'CROSSBOW'
	| 'SLEIGHT_OF_HAND'
	| 'STEALTH'
	| 'PHYSIQUE'
	| 'ENDURANCE'
	| 'CHARISMA'
	| 'DECEIT'
	| 'FINE_ARTS'
	| 'GAMBLING'
	| 'GROOMING_AND_STYLE'
	| 'HUMAN_PERCEPTION'
	| 'LEADERSHIP'
	| 'PERSUASION'
	| 'PERFORMANCE'
	| 'SEDUCTION'
	| 'ALCHEMY'
	| 'CRAFTING'
	| 'DISGUISE'
	| 'FIRST_AID'
	| 'FORGERY'
	| 'PICK_LOCK'
	| 'TRAP_CRAFTING'
	| 'COURAGE'
	| 'HEX_WEAVING'
	| 'INTIMIDATION'
	| 'RESIST_MAGIC'
	| 'RESIST_COERCION'
	| 'RITUAL_CRAFTING'
	| 'SPELL_CASTING';

export interface RaceInfo {
	race: Race | null;
	/** Free text on the backend, not an enum — Feared, Hated, Equal and whatever a
	 *  table invents. The numbers it implies are entered as perk modifiers. */
	socialStanding: string;
	perks: RacialPerk[];
}

/**
 * One node of a profession's ability tree. Free-form: the player types the name,
 * picks a governing stat (null = N/A, an ability that is never rolled), writes the
 * description and sets the level. `branch`/`tier` are its slot in the 3x3 tree.
 *
 * NOT YET ON THE BACKEND — ProfessionInfo.java has no `abilities` field, so these are
 * accepted (200) but silently dropped on save until it's added. Verified against the
 * deployed API: it ignores unknown properties rather than rejecting them.
 */
/**
 * One node of a profession's ability tree — including the Defining Skill, which is no
 * longer a separate concept. Per the rulebook (pg.61) the Defining Skill sits beneath
 * all three branches as the trunk, so it's just an ability row flagged
 * `definingSkill: true`; `branch`/`tier` carry no meaning on that row.
 */
export interface ProfessionAbility {
	id: string;
	name: string;
	governingStat: WitcherStat | null;
	description: string;
	/** Purchased level — monotonic, what Improvement Points buy. */
	level: number;
	/** Live level; drops when drained by a critical wound. Always send it: the
	 *  deployed backend types it as a primitive int and rejects the whole save
	 *  if it's absent (fixed locally in 1a736c7, not yet deployed). */
	currentLevel: number;
	branch: number;
	tier: number;
	/** True for exactly one row: the trunk of the tree, seeded at creation from the
	 *  profession's reference skill. Found via `definingSkillAbility()`. */
	definingSkill: boolean;
}

export interface ProfessionInfo {
	profession: Profession | null;
	magicalPerksNotes: string;
	gearPackageNotes: string;
	abilities: ProfessionAbility[];
}

/**
 * The nine core stats. The unprefixed fields are the character's NORMAL (maximum)
 * values — the ones chargen point-buy validation and every derived-stat formula
 * already read server-side. The optional `current*` fields are live-play values that
 * drop when a stat is drained; they fall back to the max when absent.
 *
 * Keeping max on the existing field names is deliberate: it means the backend change
 * is purely additive (no data migration, no validation rewrite) and it leaves the
 * "should drained stats lower max HP?" question parked, since recalculateDerivedStats
 * keeps reading the max values.
 *
 * The `current*` fields are NOT YET ON THE BACKEND — accepted (200) but dropped on
 * save until Statistics.java gains them.
 */
export interface Statistics {
	intelligence: number;
	reflexes: number;
	dexterity: number;
	body: number;
	speed: number;
	empathy: number;
	craft: number;
	will: number;
	luck: number;
	currentIntelligence?: number;
	currentReflexes?: number;
	currentDexterity?: number;
	currentBody?: number;
	currentSpeed?: number;
	currentEmpathy?: number;
	currentCraft?: number;
	currentWill?: number;
	currentLuck?: number;
	gameType: GameType;
}

/**
 * WitcherDerivedStatsService.recalculateAll re-derives every `max*` field and the
 * movement/damage values on each PUT, so client-submitted values for those are not
 * trusted. The `current*` pools are the exception: they're the player's live-play
 * state (damage taken, Vigor spent, Stun lost), never recalculated — only clamped
 * down if a stat change lowers the corresponding max.
 */
export interface DerivedStats {
	/**
	 * Vigor Threshold — how much Chaos can be channelled at once without self-harm.
	 * Capacity, NOT a reserve: it is never spent and recovered, and the rules have no
	 * Vigor recovery mechanic. Set by profession and raised by abilities, so it is
	 * player-owned and never recomputed.
	 */
	maxVigor: number;
	/** Vigor tied up by maintained effects — computed from active magicalEffects,
	 *  exactly like currentToxicity. Frees automatically when an effect ends. */
	committedVigor: number;
	/** maxVigor − committedVigor, floored at 0. This, not maxVigor, is the headroom a
	 *  spell's cost must fit inside to avoid overexertion. */
	availableVigor: number;
	maxStun: number;
	currentStun: number;
	maxHealthPoints: number;
	currentHealthPoints: number;
	maxStamina: number;
	currentStamina: number;
	/** maxHP / 5. Below this, crit penalties apply — the server exposes the number
	 *  but deliberately does not auto-apply the halving, since penalties vary. */
	woundThreshold: number;
	/** COMPUTED server-side as the sum of activeAlchemyEffects' toxicityPercent —
	 *  whatever the client sends here is discarded. */
	currentToxicity: number;
	toxicityThreshold: number;
	/** All computed. Carried weight over `encumbrance` costs −1 REF/DEX/SPD per 5 over;
	 *  `armorEncumbranceValue` is separate and hits REF/DEX only, for worn armor. */
	totalWeight: number;
	encumbrancePenalty: number;
	deadliftCapacity: number;
	armorEncumbranceValue: number;
	recovery: number;
	encumbrance: number;
	run: number;
	leap: number;
	meleeDamageBonus: number;
	punchDamage: string;
	kickDamage: string;
}

export interface Skill {
	id?: string;
	skillName: WitcherSkillName;
	/** Blank for every ordinary skill. Freely settable for the three specializable
	 *  skills (Language, Fine Arts, Performance) so a character can hold several rows
	 *  of the same skillName, each a distinct subject — "Elder Speech" vs "Common
	 *  Speech" for Language. The server rejects a duplicate or blank-duplicate
	 *  specialization, and rejects more than one row of a non-specializable skill. */
	specialization: string;
	governingStat: WitcherStat;
	/** Purchased points — monotonic, what creation budgets and Improvement Points buy. */
	points: number;
	/** Live points; a critical wound can drop these without touching the purchased value. */
	currentPoints: number;
	packageSkill: boolean;
	costPerLevel: number;
	/** Server-computed max total (governing stat + points). */
	total: number;
	/** Server-computed live total — what you actually roll. */
	currentTotal: number;
}

/**
 * One flavor entry from the lifepath / background — matches LifepathEvent.java.
 * `category` is free-form by design: fixed background boxes use known categories
 * ("Clothing", "Homeland", …), relations use "Sibling"/"Rival"/"Friend", and
 * decade rolls use "Life Event".
 */
export interface LifepathEvent {
	id: string;
	category: string;
	description: string;
}

/**
 * Character level, reputation, and the Improvement Point economy.
 *
 * `improvementPointsEarned`/`Available` are SERVER-OWNED — restored from the
 * persisted record on every PUT and changeable only via
 * `POST /{id}/improvement-points`. Sending them in a character save is ignored.
 * `creationComplete` likewise flips the server between the chargen budgets and
 * the IP economy, and is read from the persisted record during validation.
 */
export interface LevelingInfo {
	level: number;
	reputation: number;
	creationComplete: boolean;
	improvementPointsEarned: number;
	improvementPointsAvailable: number;
}

/** POST /{id}/improvement-points. `amount` may be negative to correct a bad award. */
export interface ImprovementPointAdjustmentRequest {
	amount: number;
	reason?: string;
}

export type WeaponType = 'SLASHING' | 'PIERCING' | 'BLUDGEONING';
export type Availability = 'EVERYWHERE' | 'COMMON' | 'POOR' | 'RARE';
export type Concealment = 'TINY' | 'SMALL' | 'LARGE' | 'CANNOT_HIDE';
export type ArmorLocation = 'HEAD' | 'UPPER_BODY' | 'LOWER_BODY' | 'SHIELD';

/**
 * One model for melee and ranged alike — the rulebook prints a single weapon table,
 * and a thrown weapon is both. `range` blank means melee in practice.
 * Reliability is current/max because weapons degrade with use.
 */
export interface Weapon {
	id: string;
	name: string;
	weaponTypes: WeaponType[];
	/** WA — added to the attack roll. */
	weaponAccuracy: number;
	availability: Availability | null;
	damage: string;
	maxReliability: number;
	currentReliability: number;
	hands: number;
	range: string;
	effect: string;
	concealment: Concealment | null;
	/** AE — slots for runes/enhancements. */
	enhancementSlots: number;
	weight: number;
	quantity: number;
	cost: number;
	notes: string;
}

/**
 * Stopping Power is current/max because armor degrades as it takes hits.
 * `encumbranceValue` (EV) is separate from `weight`: EV is stiffness, applies only
 * while worn, and hits REF/DEX — carried-but-unworn armor still weighs but has no EV.
 */
export interface ArmorItem {
	id: string;
	name: string;
	location: ArmorLocation | null;
	coverage: string;
	maxStoppingPower: number;
	currentStoppingPower: number;
	availability: Availability | null;
	enhancementSlots: number;
	effect: string;
	encumbranceValue: number;
	weight: number;
	equipped: boolean;
	cost: number;
	notes: string;
}

export interface EquipmentItem {
	id: string;
	name: string;
	quantity: number;
	weight: number;
	notes: string;
}

export interface Wealth {
	crowns: number;
	notes: string;
}

export type AlchemyItemType = 'POTION' | 'OIL' | 'DECOCTION' | 'BOMB' | 'MUTAGEN' | 'OTHER';
/** Shared by Recipe and MagicalEffect — a Mage's package is literally "5 Novice Spells". */
export type MasteryTier = 'NOVICE' | 'JOURNEYMAN' | 'MASTER';
export type IngredientRarity = 'EVERYWHERE' | 'COMMON' | 'POOR' | 'RARE';
export type RecipeType = 'DIAGRAM' | 'FORMULA';
export type MagicType = 'SPELL' | 'INVOCATION' | 'SIGN' | 'RITUAL' | 'HEX';
export type MagicElement = 'EARTH' | 'AIR' | 'FIRE' | 'WATER' | 'MIXED';

/** The nine alchemical substances the store tracks. */
export type Substance =
	| 'VITRIOL'
	| 'REBIS'
	| 'AETHER'
	| 'QUEBRITH'
	| 'HYDRAGENUM'
	| 'VERMILION'
	| 'SOL'
	| 'CAELUM'
	| 'FULGUR';

/**
 * One component line of a recipe. The two discriminators are mutually exclusive:
 * `substance` means fungible (any material yielding it satisfies the cost — alchemy),
 * `materialName` means a specific named material, because diagrams don't allow
 * substitution.
 */
export interface RecipeComponent {
	id: string;
	substance: Substance | null;
	materialName: string;
	quantity: number;
}

/** Non-alchemy crafted goods — output of a diagram, not a recipe. */
export interface CraftedItem {
	id: string;
	name: string;
	type: string;
	qualityNotes: string;
	weight?: number;
	quantity?: number;
}

/**
 * A diagram or a formula — the rulebook treats them as one category (same three-step
 * process, same +2 for the physical copy, and the memorization cap spans both), so
 * they share a model. `type` picks the branch; `alchemyType` applies to formulae and
 * `craftedType` to diagrams.
 */
export interface Recipe {
	id: string;
	name: string;
	type: RecipeType | null;
	alchemyType: AlchemyItemType | null;
	craftedType: string;
	tier: MasteryTier | null;
	craftingDc: number;
	craftingTime: string;
	components: RecipeComponent[];
	toxicityPercent: number;
	requiresForge: boolean;
	/** Written down rather than memorised — worth +2 when crafting from it. */
	writtenCopy: boolean;
	/** Counts against an INT-bounded pool spanning diagrams AND formulae.
	 *  Not yet validated server-side. */
	memorized: boolean;
	cost: number;
	effectText: string;
	ingredientsText: string;
}

/**
 * A raw material, and where to find more of it. One list covers both of the
 * rulebook's raw-goods tables: alchemical ingredients carry a `yieldsSubstance`,
 * while crafting components (timber, silk, hides) leave it null. Null is also valid
 * for a material whose substance hasn't been looked up yet. Either way it counts
 * toward carried weight — it just can't roll up into a substance row, so the Alchemy
 * tab shows only those with a substance and Gear owns the rest.
 */
export interface Material {
	id: string;
	name: string;
	yieldsSubstance: Substance | null;
	rarity: IngredientRarity | null;
	location: string;
	/** Free text like "1d10 Units" — descriptive, never rolled by the app. */
	yieldQuantity: string;
	forageDc: number;
	weight: number;
	cost: number;
	quantityHeld: number;
	notes: string;
}

/** Refined substance on hand. The server seeds all nine rows at creation. */
export interface SubstanceHolding {
	id: string;
	substance: Substance;
	quantity: number;
}

/**
 * One stat block covering all five magic branches, mirroring how the rulebook prints
 * them. `type` selects the branch; ritual fields (components, preparationTime) and
 * hex fields (requirementToLift, danger) sit blank on the others.
 *
 * `staCost` is the load-bearing one: it's checked against Vigor threshold to decide
 * whether the caster harms themselves, and subtracted from Stamina.
 */
export interface MagicalEffect {
	id: string;
	name: string;
	type: MagicType | null;
	tier: MasteryTier | null;
	element: MagicElement | null;
	staCost: number;
	effect: string;
	range: string;
	duration: string;
	defense: string;
	/** Currently maintained — this is what feeds committedVigor. */
	active: boolean;
	/** Vigor held while this effect is maintained. */
	vigorUpkeep: number;
	/** Stamina drained per round while maintained. */
	staUpkeep: number;
	components: string;
	preparationTime: string;
	difficultyCheck: number;
	requirementToLift: string;
	danger: string;
	notes: string;
}

/**
 * Table-level rule toggles. These do NOT gate computation — the server always
 * calculates weight and penalty; the flag only says whether this table plays with
 * the rule, same as woundThreshold.
 */
export interface OptionalRules {
	encumbranceEnabled: boolean;
}

/** A finished dose being carried. */
export interface AlchemicalItem {
	id: string;
	name: string;
	type: AlchemyItemType | null;
	quantity: number;
	toxicityPercent: number;
	duration: string;
	weight: number;
	effectText: string;
}

/**
 * A dose currently running. These drive toxicity: the server sums their
 * `toxicityPercent` into `derivedStats.currentToxicity` on every save. The only way
 * to bring toxicity down is to remove the effect carrying it — which is exactly what
 * the rulebook does when an effect expires or White Honey clears everything.
 */
export interface ActiveAlchemyEffect {
	id: string;
	name: string;
	type: AlchemyItemType | null;
	toxicityPercent: number;
	durationRemaining: string;
	effectText: string;
}

export interface SessionNpc {
	id: string;
	name: string;
	role?: string;
	avatar?: string;
}

export interface GameSession {
	id: string;
	number: number;
	title: string;
	realDate?: string;
	current: boolean;
	location?: string;
	npcs: SessionNpc[];
	loot: string[];
	summary?: string;
	postscripts: string[];
}

/** Crit severity bands. The backend enum also carries bonus damage (+5/+10/+15/+20),
 *  which is applied at the moment of injury and so never reaches the sheet. */
export type WoundSeverity = 'SIMPLE' | 'COMPLEX' | 'DIFFICULT' | 'DEADLY';

/** How far a wound has been dealt with. Each state has its own modifier list, because
 *  the tables print a different column per state — treating a wound is a state change,
 *  not a re-entry of every penalty. */
export type WoundState = 'UNTREATED' | 'STABILIZED' | 'TREATED';

/** Broader than ArmorLocation: the crit tables call out limbs individually. */
export type WoundLocation = 'HEAD' | 'TORSO' | 'ARM' | 'LEG';

/** A server-computed value a modifier can target, so effects like Septic Shock's
 *  quartered Stamina resolve numerically instead of sitting in free text. */
export type DerivedTarget =
	| 'STAMINA'
	| 'HEALTH_POINTS'
	| 'RECOVERY'
	| 'STUN'
	| 'VIGOR_THRESHOLD'
	| 'ENCUMBRANCE'
	| 'RUN'
	| 'LEAP'
	| 'MELEE_DAMAGE_BONUS'
	| 'STOPPING_POWER';

/**
 * One adjustment to a value, shared by every system that makes them — critical wounds
 * and racial perks today, decoctions and Places of Power later. Nullable-discriminator,
 * same as RecipeComponent and Material: whichever target field is set says what it hits.
 *
 * A single source can carry several at once — Septic Shock quarters Stamina *and*
 * applies -3 to four stats, which is five rows.
 */
export interface StatModifier {
	id: string;
	/** A core statistic, e.g. Concussion's -2 to INT/REF/DEX. */
	stat: WitcherStat | null;
	/** A skill, e.g. Compound Leg Fracture quartering Dodge/Escape and Athletics. */
	skill: WitcherSkillName | null;
	/** A derived value, e.g. Septic Shock's quartered Stamina. */
	derivedTarget: DerivedTarget | null;
	/** Anything not numeric at all — "quadruple damage from head wounds". Not computed. */
	otherTarget: string;
	/** Signed: negative for a wound penalty, positive for a perk. Applied after the multiplier. */
	flatModifier: number;
	/** 1.0 none, 0.5 halved, 0.25 quartered, 2.0 doubled. */
	multiplier: number;
	notes: string;
}

/**
 * A racial or narrative perk. A perk with no modifiers is simply a narrative trait,
 * which is what replaced the old free-text `racialTraits`.
 *
 * Deliberately not folded into the stored maxima server-side: perks aren't purchased,
 * so counting them would break the chargen point budgets. The client applies them.
 */
export interface RacialPerk {
	id: string;
	name: string;
	description: string;
	modifiers: StatModifier[];
	active: boolean;
}

export interface CriticalWound {
	id: string;
	name: string;
	severity: WoundSeverity | null;
	location: WoundLocation | null;
	state: WoundState;
	bleeding: boolean;
	untreatedModifiers: StatModifier[];
	stabilizedModifiers: StatModifier[];
	treatedModifiers: StatModifier[];
	effectText: string;
	stabilizedText: string;
	treatedText: string;
	/** Numbing Herbs lower this wound's negatives by 2 and near-death penalties by 2,
	 *  for 2d10 rounds. The duration is the player's to track. */
	numbingHerbsApplied: boolean;
	notes: string;
}

export interface WitcherCharacter {
	id: string;
	userId: string;
	gameSystem?: string;
	name: string;
	player?: string | null;
	description?: string | null;
	portraitUrl?: string | null;
	/**
	 * NOT YET ON THE BACKEND — the shared `Character` base class has no `age`/`gender`,
	 * so these are accepted (200) and silently dropped on save until it does. See §8 of
	 * BACKEND-REQUESTS.md. The editor says so rather than pretending they persist.
	 *
	 * Free text for gender, deliberately: an enum would need a backend change every time
	 * a table wants something not on the list, the same reasoning applied to
	 * `raceInfo.socialStanding`.
	 */
	age?: number | null;
	gender?: string | null;
	public: boolean;
	campaignId?: string | null;
	raceInfo: RaceInfo;
	professionInfo: ProfessionInfo;
	backgroundNotes: string;
	statistics: Statistics;
	derivedStats: DerivedStats;
	criticalWounds: CriticalWound[];
	skills: Skill[];
	lifepathEvents: LifepathEvent[];
	levelingInfo: LevelingInfo;
	weapons: Weapon[];
	armor: ArmorItem[];
	equipment: EquipmentItem[];
	wealth: Wealth;
	recipes: Recipe[];
	craftedItems: CraftedItem[];
	materials: Material[];
	substanceStore: SubstanceHolding[];
	alchemicalItems: AlchemicalItem[];
	activeAlchemyEffects: ActiveAlchemyEffect[];
	magicalEffects: MagicalEffect[];
	optionalRules: OptionalRules;
	sessions: GameSession[];
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateCharacterRequest {
	name: string;
	campaignId?: string;
	profession?: Profession;
	race?: Race;
	gameType?: GameType;
}

export const api = {
	auth: {
		login: (email: string, password: string) =>
			request<LoginResponse>('/api/v1/auth/login', {
				method: 'POST',
				body: JSON.stringify({ email, password })
			}),
		register: (username: string, email: string, password: string) =>
			request<LoginResponse>('/api/v1/auth/register', {
				method: 'POST',
				body: JSON.stringify({ username, email, password })
			}),
		me: () => request<UserProfile>('/api/v1/auth/me')
	},
	character: {
		create: (data: CreateCharacterRequest) =>
			request<WitcherCharacter>('/api/v1/witcher/characters', {
				method: 'POST',
				body: JSON.stringify(data)
			}),
		get: (id: string) => request<WitcherCharacter>(`/api/v1/witcher/characters/${id}`),
		getPublic: (id: string) => request<WitcherCharacter>(`/api/v1/witcher/characters/${id}/share`),
		myCharacters: () => request<WitcherCharacter[]>('/api/v1/witcher/characters'),
		update: (id: string, data: WitcherCharacter) =>
			request<WitcherCharacter>(`/api/v1/witcher/characters/${id}`, {
				method: 'PUT',
				body: JSON.stringify(data)
			}),
		delete: (id: string) => request<void>(`/api/v1/witcher/characters/${id}`, { method: 'DELETE' }),
		/**
		 * The only way to change the I.P. balance — it's server-owned and stripped from
		 * ordinary saves. Persists immediately against the stored record and returns the
		 * whole updated character.
		 */
		adjustImprovementPoints: (id: string, data: ImprovementPointAdjustmentRequest) =>
			request<WitcherCharacter>(`/api/v1/witcher/characters/${id}/improvement-points`, {
				method: 'POST',
				body: JSON.stringify(data)
			})
	}
};
