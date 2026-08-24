const TOKEN_KEY = 'mythras_token';
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

/** Matches the backend's FatigueLevel enum toString values. */
export type FatigueLevel =
	| 'Fresh'
	| 'Winded'
	| 'Tired'
	| 'Wearied'
	| 'Exhausted'
	| 'Debilitated'
	| 'Incapacitated'
	| 'Semi-Conscious'
	| 'Comatose'
	| 'Dead';

export interface Characteristics {
	str: number;
	con: number;
	siz: number;
	dex: number;
	intelligence: number;
	pow: number;
	cha: number;
}

export interface ResourcePool {
	current: number;
	max: number;
	manualOverride: boolean;
}

export interface Attributes {
	actionPoints: ResourcePool;
	damageModifier: string;
	experienceModifier: number;
	healingRate: number;
	initiativeBonus: number;
	luckPoints: ResourcePool;
	magicPoints: ResourcePool;
	movementRate: number;
}

export interface Wealth {
	silverPieces: number;
	incomePerDay: number;
	incomePerWeek: number;
	incomePerSeason: number;
	incomePerYear: number;
}

export interface Skill {
	id?: string | null;
	name: string;
	specialization?: string | null;
	formula: string;
	professional: boolean;
	base: number;
	cultural: number;
	career: number;
	bonus: number;
	total: number;
}

export interface Language {
	name: string;
	percentage: number;
	nativeLanguage: boolean;
}

export interface Passion {
	name: string;
	base: number;
	cultural: number;
	career: number;
	bonus: number;
	total: number;
}

export interface CombatStyle {
	name: string;
	base: number;
	cultural: number;
	career: number;
	bonus: number;
	total: number;
	weapons: string;
}

export interface MeleeWeapon {
	name: string;
	damage: string;
	size: string;
	reach: string;
	traits: string[];
	combatEffects: string[];
	armorPoints: number;
	hitPoints: number;
	encumbrance: number;
}

export interface RangedWeapon {
	name: string;
	damage: string;
	force: string;
	damageModifierApplies: boolean;
	shortRange: number;
	mediumRange: number;
	longRange: number;
	load: number;
	combatEffects: string[];
	armorPoints: number;
	hitPoints: number;
	encumbrance: number;
}

export interface EquipmentItem {
	name: string;
	quantity: number;
	encumbrance: number;
}

/** Matches the backend's GiftEffectTag enum toString values. */
export type GiftEffectTag =
	| 'HIT_POINTS_FORMULA_EXTRA_CHARACTERISTIC'
	| 'DAMAGE_MODIFIER_FORMULA_EXTRA_CHARACTERISTIC'
	| 'HEALING_RATE_MULTIPLIER'
	| 'ACTION_POINTS_FLAT_BONUS'
	| 'MAGIC_POINTS_FLAT_BONUS'
	| 'LUCK_POINTS_FLAT_BONUS'
	| 'MOVEMENT_RATE_FLAT_BONUS'
	| 'EXPERIENCE_MODIFIER_FLAT_BONUS'
	| 'INITIATIVE_FLAT_BONUS'
	| 'SKILL_FLAT_BONUS'
	| 'DICE_FORMULA_OVERRIDE';

export interface GiftEffect {
	tag: GiftEffectTag;
	scope: string;
	formulaValue: string;
	multiplier: number;
	flatValue: number;
}

export interface Gift {
	id: string;
	name: string;
	activationType: string;
	magicPointCost: number;
	skillRequired: string;
	effect: string;
	active: boolean;
	effects: GiftEffect[];
}

export interface Cult {
	name: string;
	rank?: string | null;
	benefits: string[];
	restrictions: string[];
	gifts: Gift[];
	devotionalPoolCurrent: number;
	devotionalPoolMax: number;
}

export interface HitLocation {
	name: string;
	d20Range: string;
	maxHp: number;
	currentHp: number;
	armorPoints: number;
	armorWorn: string;
}

export interface LogNpc {
	id: string;
	name: string;
	role?: string;
	avatar?: string;
}

export interface Reward {
	label?: string;
	amount?: number;
	notes?: string;
}

export interface SessionEntry {
	id: string;
	campaignSessionId?: string | null;
	number: number;
	title: string;
	realDate?: string;
	inWorldDate?: string;
	location?: string;
	current: boolean;
	npcs: LogNpc[];
	rewards: Reward[];
	summary?: string;
	postscripts: string[];
}

export interface MythrasCharacter {
	id: string;
	userId: string;
	name: string;
	player?: string | null;
	gameSystem?: string | null;
	campaignId?: string | null;
	public: boolean;
	portraitUrl?: string | null;
	raceCulture: string;
	career: string;
	homeland: string;
	gender: string;
	frame: string;
	age: string;
	height: string;
	handedness: string;
	weight: string;
	socialClass: string;
	description?: string | null;
	backgroundNotes: string;
	woundNotes: string;
	magicAbilitiesNotes: string;
	experienceRolls: number;
	fatigueLevel: FatigueLevel;
	characteristics: Characteristics;
	attributes: Attributes;
	wealth: Wealth;
	standardSkills: Skill[];
	professionalSkills: Skill[];
	magicSkills: Skill[];
	languages: Language[];
	passions: Passion[];
	combatStyles: CombatStyle[];
	meleeWeapons: MeleeWeapon[];
	rangedWeapons: RangedWeapon[];
	equipment: EquipmentItem[];
	cults: Cult[];
	hitLocations: HitLocation[];
	sessionLog: SessionEntry[];
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateCharacterRequest {
	name: string;
	raceCulture?: string;
	career?: string;
	campaignId?: string;
}

export type CampaignRole = 'OWNER' | 'STORYTELLER' | 'PLAYER' | 'SPECTATOR';
export type CampaignVisibility = 'INVITE_ONLY' | 'LINK_JOINABLE';

export interface CampaignMember {
	userId: string;
	displayName: string;
	role: CampaignRole;
}

export interface CampaignSession {
	id: string;
	number: number;
	title: string;
	realDate?: string;
	inWorldDate?: string;
}

export interface Campaign {
	id: string;
	name: string;
	gameSystem: string;
	ownerUserId: string;
	members: CampaignMember[];
	sessions: CampaignSession[];
	visibility: CampaignVisibility;
	createdAt: string;
	updatedAt: string;
}

export interface CreateCampaignPayload {
	name: string;
	gameSystem: 'MYTHRAS';
}

export interface NewCampaignSession {
	number: number;
	title: string;
	realDate?: string;
	inWorldDate?: string;
}

export interface CampaignTimelineEntry {
	characterId: string;
	characterName: string;
	playerName: string;
	entry: SessionEntry;
}

export interface CampaignTimelineSessionBlock {
	id: string;
	number: number;
	title: string;
	realDate?: string;
	inWorldDate?: string;
	entries: CampaignTimelineEntry[];
}

export interface CampaignTimeline {
	sessions: CampaignTimelineSessionBlock[];
	unassigned: CampaignTimelineEntry[];
}

export interface UserLookupResult {
	id: string;
	username: string;
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
			request<MythrasCharacter>('/api/v1/mythras/characters', {
				method: 'POST',
				body: JSON.stringify(data)
			}),
		get: (id: string) => request<MythrasCharacter>(`/api/v1/mythras/characters/${id}`),
		getPublic: (id: string) => request<MythrasCharacter>(`/api/v1/mythras/characters/${id}/share`),
		myCharacters: () => request<MythrasCharacter[]>('/api/v1/mythras/characters'),
		update: (id: string, data: MythrasCharacter) =>
			request<MythrasCharacter>(`/api/v1/mythras/characters/${id}`, {
				method: 'PUT',
				body: JSON.stringify(data)
			}),
		delete: (id: string) => request<void>(`/api/v1/mythras/characters/${id}`, { method: 'DELETE' }),
		byCampaign: async (campaignId: string): Promise<MythrasCharacter[]> => {
			try {
				return await request<MythrasCharacter[]>(`/api/v1/mythras/characters?campaignId=${encodeURIComponent(campaignId)}`);
			} catch {
				return [];
			}
		}
	},
	campaign: {
		create: (data: CreateCampaignPayload) =>
			request<Campaign>('/api/v1/campaigns', {
				method: 'POST',
				body: JSON.stringify(data)
			}),
		myCampaigns: async (): Promise<Campaign[]> => {
			const campaigns = await request<Campaign[]>('/api/v1/campaigns');
			return campaigns.filter((c) => c.gameSystem === 'MYTHRAS');
		},
		get: (id: string) => request<Campaign>(`/api/v1/campaigns/${id}`),
		delete: (id: string) => request<void>(`/api/v1/campaigns/${id}`, { method: 'DELETE' }),
		join: (id: string) => request<Campaign>(`/api/v1/campaigns/${id}/join`, { method: 'POST' }),
		addMember: (id: string, member: CampaignMember) =>
			request<Campaign>(`/api/v1/campaigns/${id}/members`, {
				method: 'POST',
				body: JSON.stringify(member)
			}),
		removeMember: (id: string, userId: string) =>
			request<Campaign>(`/api/v1/campaigns/${id}/members/${userId}`, { method: 'DELETE' }),
		setVisibility: (campaign: Campaign, visibility: CampaignVisibility) =>
			request<Campaign>(`/api/v1/campaigns/${campaign.id}`, {
				method: 'PUT',
				body: JSON.stringify({ ...campaign, visibility })
			}),
		timeline: (id: string) => request<CampaignTimeline>(`/api/v1/campaigns/${id}/timeline`),
		createSession: (id: string, s: NewCampaignSession) =>
			request<Campaign>(`/api/v1/campaigns/${id}/sessions`, {
				method: 'POST',
				body: JSON.stringify(s)
			})
	},
	users: {
		lookupByEmail: async (email: string): Promise<UserLookupResult | null> => {
			try {
				return await request<UserLookupResult>(`/api/v1/users/lookup?email=${encodeURIComponent(email)}`);
			} catch {
				return null;
			}
		}
	}
};
