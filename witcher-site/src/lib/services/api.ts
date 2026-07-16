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
		throw new Error(body || `Request failed: ${res.status}`);
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
export type Race = 'HUMAN' | 'ELF' | 'DWARF' | 'HALFLING';

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
	racialTraits: string[];
}

export interface ProfessionInfo {
	profession: Profession | null;
	definingSkillName: string;
	definingSkillNotes: string;
	definingSkillPoints: number;
	magicalPerksNotes: string;
	gearPackageNotes: string;
}

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
	gameType: GameType;
}

/**
 * Server-computed display cache (WitcherDerivedStatsService.recalculateAll re-derives
 * these on every PUT — client-submitted values for the max fields are not trusted).
 * currentHealthPoints/currentStamina/currentVigor are anticipated additions for
 * live-play damage tracking, not yet present on the backend — optional and default
 * to the corresponding max value until the backend adds them.
 */
export interface DerivedStats {
	vigor: number;
	stun: number;
	healthPoints: number;
	stamina: number;
	recovery: number;
	encumbrance: number;
	run: number;
	leap: number;
	meleeDamageBonus: number;
	punchDamage: string;
	kickDamage: string;
	currentHealthPoints?: number;
	currentStamina?: number;
	currentVigor?: number;
}

export interface Skill {
	id?: string;
	skillName: WitcherSkillName;
	governingStat: WitcherStat;
	points: number;
	packageSkill: boolean;
	costPerLevel: number;
	total: number;
}

export interface LifepathEvent {
	[key: string]: unknown;
}

export interface LevelingInfo {
	[key: string]: unknown;
}

export interface MeleeWeapon {
	[key: string]: unknown;
}

export interface RangedWeapon {
	[key: string]: unknown;
}

export interface ArmorItem {
	[key: string]: unknown;
}

export interface EquipmentItem {
	[key: string]: unknown;
}

export interface Wealth {
	[key: string]: unknown;
}

export interface AlchemyFormula {
	[key: string]: unknown;
}

export interface CraftedItem {
	[key: string]: unknown;
}

export interface KnownSign {
	[key: string]: unknown;
}

export interface KnownSpell {
	[key: string]: unknown;
}

export interface KnownInvocation {
	[key: string]: unknown;
}

export interface KnownRitual {
	[key: string]: unknown;
}

export interface KnownHex {
	[key: string]: unknown;
}

export interface WitcherCharacter {
	id: string;
	userId: string;
	gameSystem?: string;
	name: string;
	player?: string | null;
	description?: string | null;
	portraitUrl?: string | null;
	public: boolean;
	campaignId?: string | null;
	raceInfo: RaceInfo;
	professionInfo: ProfessionInfo;
	backgroundNotes: string;
	statistics: Statistics;
	derivedStats: DerivedStats;
	skills: Skill[];
	lifepathEvents: LifepathEvent[];
	levelingInfo: LevelingInfo;
	meleeWeapons: MeleeWeapon[];
	rangedWeapons: RangedWeapon[];
	armor: ArmorItem[];
	equipment: EquipmentItem[];
	wealth: Wealth;
	knownFormulae: AlchemyFormula[];
	craftedItems: CraftedItem[];
	knownSigns: KnownSign[];
	knownSpells: KnownSpell[];
	knownInvocations: KnownInvocation[];
	knownRituals: KnownRitual[];
	knownHexes: KnownHex[];
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
		delete: (id: string) => request<void>(`/api/v1/witcher/characters/${id}`, { method: 'DELETE' })
	}
};
