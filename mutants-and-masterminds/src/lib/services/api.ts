const TOKEN_KEY = 'mnm_token';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';


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

async function request<T>(path: string, options?: RequestInit): Promise<T>;
async function request<T>(path: string, options: RequestInit, allow404: true): Promise<T | null>;
async function request<T>(path: string, options: RequestInit = {}, allow404 = false): Promise<T | null> {
	const token = getToken();
	const fullUrl = path.startsWith('http') ? path : `${API_BASE}${path}`;

	const headers: Record<string, string> = {
		...(options.headers as Record<string, string>),
	};
	if (token) headers['Authorization'] = `Bearer ${token}`;
	if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
		headers['Content-Type'] = 'application/json';
	}
	let res: Response;
	try {
		res = await fetch(fullUrl, { ...options, headers });
	} catch (err) {
		const reason = err instanceof Error ? err.message : String(err);
		throw new Error(`API currently down, please wait. (${reason})`);
	}
	if (allow404 && res.status === 404) return null;
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

export type IdentityType = 'SECRET' | 'PUBLIC' | 'DUAL';
export type AbilityType = 'STRENGTH' | 'STAMINA' | 'AGILITY' | 'DEXTERITY' | 'FIGHTING' | 'INTELLECT' | 'AWARENESS' | 'PRESENCE';
export type DefenseType = 'DODGE' | 'PARRY' | 'FORTITUDE' | 'WILL' | 'TOUGHNESS';
export type ModifierType = 'EXTRA' | 'FLAW';
export type ArrayType = 'ALTERNATE' | 'DYNAMIC';
export type DeviceType = 'REMOVABLE' | 'EASILY_REMOVABLE';
export type ResistanceType = 'TOUGHNESS' | 'DODGE' | 'FORTITUDE' | 'WILL' | 'WILL_FORTITUDE' | 'STRENGTH_DODGE' | 'PARRY' | 'NONE';

export interface AbilitiesBlock {
	strengthBaseRank: number;
	strengthEnhancedRank: number;
	strengthFinalValue: number;
	strengthAbsent: boolean;
	strengthCostModifier: number;
	staminaBaseRank: number;
	staminaEnhancedRank: number;
	staminaFinalValue: number;
	staminaAbsent: boolean;
	staminaCostModifier: number;
	agilityBaseRank: number;
	agilityEnhancedRank: number;
	agilityFinalValue: number;
	agilityAbsent: boolean;
	agilityCostModifier: number;
	dexterityBaseRank: number;
	dexterityEnhancedRank: number;
	dexterityFinalValue: number;
	dexterityAbsent: boolean;
	dexterityCostModifier: number;
	fightingBaseRank: number;
	fightingEnhancedRank: number;
	fightingFinalValue: number;
	fightingAbsent: boolean;
	fightingCostModifier: number;
	intellectBaseRank: number;
	intellectEnhancedRank: number;
	intellectFinalValue: number;
	intellectAbsent: boolean;
	intellectCostModifier: number;
	awarenessBaseRank: number;
	awarenessEnhancedRank: number;
	awarenessFinalValue: number;
	awarenessAbsent: boolean;
	awarenessCostModifier: number;
	presenceBaseRank: number;
	presenceEnhancedRank: number;
	presenceFinalValue: number;
	presenceAbsent: boolean;
	presenceCostModifier: number;
}

export interface DefensesBlock {
	dodgeAbilityBase: AbilityType;
	dodgePointsBought: number;
	dodgeOtherModifiers: number;
	dodgeFinalValue: number;
	parryAbilityBase: AbilityType;
	parryPointsBought: number;
	parryOtherModifiers: number;
	parryFinalValue: number;
	fortitudeAbilityBase: AbilityType;
	fortitudePointsBought: number;
	fortitudeOtherModifiers: number;
	fortitudeFinalValue: number;
	toughnessAbilityBase: AbilityType;
	toughnessPointsBought: number;
	toughnessOtherModifiers: number;
	toughnessFinalValue: number;
	willAbilityBase: AbilityType;
	willPointsBought: number;
	willOtherModifiers: number;
	willFinalValue: number;
}

export interface Skill {
	skillName: string;
	keyAbility: AbilityType;
	ranks: number;
	modifier: number;
	finalBonus: number;
	ppCost: number;
}

export interface Advantage {
	name: string;
	ranks: number;
	description?: string;
}

export interface PowerModifier {
	name: string;
	type: ModifierType;
	costModifier: number;
	flat: boolean;
	description?: string;
}

export interface SummonExtension {
	summonRank: number;
	minionPpBudget: number;
	minionStatBlock?: MinionStatBlock;
}

export interface MinionStatBlock {
	name: string;
	powerLevel: number;
	abilities: AbilitiesBlock;
	defenses: DefensesBlock;
	skills: Skill[];
	advantages: Advantage[];
	powers: Power[];
	combatState: MinionCombatState;
	totalPpSpent: number;
}

export interface PowerEffect {
	effectName: string;
	effectType?: string;
	rank: number;
	baseCostPerRank: number;
	modifiers: PowerModifier[];
	calculatedCost: number;
	primary: boolean;
	summon: boolean;
	baseEffect?: string;
	summonExtension?: SummonExtension;
	resistance?: ResistanceType;

	// Active state flags
	_showInCombat?: boolean;
	_isThrownWeapon?: boolean;
	manualAtkBonus?: number;
	manualRankBonus?: number;
}

export interface MinionCombatState {
	conditions: string[];
	damage: number;
	dying: number;
	staggered: boolean;
	accumulatedToughnessPenalty: number;
}

export interface AlternateEffect {
	powerId: string;
	name: string;
	description: string;
	descriptors: string[];
	arrayType: ArrayType;
	costPerRank: number;
	currentAllocatedRank: number;
	effects: PowerEffect[];
}

export interface Power {
	powerId: string;
	name: string;
	description: string;
	descriptors: string[];
	array: boolean;
	maxPpPool: number;
	effects: PowerEffect[];
	alternateEffects: AlternateEffect[];
	totalPowerCost: number;
	_deviceType?: DeviceType;
	_embeddedPowers?: Power[];
}

export interface Device {
	deviceId: string;
	name: string;
	deviceType: DeviceType;
	embeddedPowers: Power[];
	rawCombinedCost: number;
	pointDiscount: number;
	finalDeviceCost: number;
}

export interface EquipmentItem {
	itemName: string;
	epCost: number;
	description?: string;
	embeddedEffects?: PowerEffect[];
}

export interface EquipmentPool {
	totalEpAllowed: number;
	epSpent: number;
	items: EquipmentItem[];
}

export interface Headquarters {
	name: string;
	location: string;
	description: string;
	sizeCategory: string;
	sizeCost: number;
	toughnessValue: number;
	toughnessCost: number;
	features: string[];
	defenseSystems: Power[];
	totalEpCost: number;
	sharedTeamBase: boolean;
}

export interface Condition {
	conditionName: string;
	appliesModifier: boolean;
}

export interface CombatState {
	accumulatedToughnessPenalty: number;
	activeConditions: Condition[];
}

export interface Complication {
	type: string;
	description: string;
}

export interface MnmCharacter {
	id: string;
	userId: string;
	campaignId?: string;
	name: string;
	powerLevel: number;
	identity: IdentityType;
	gender: string;
	age: string;
	height: string;
	weight: string;
	eyes: string;
	hair: string;
	groupAffiliation: string;
	baseOfOperations: string;
	totalAllowed: number;
	spentAbilities: number;
	spentPowers: number;
	spentAdvantages: number;
	spentSkills: number;
	spentDefenses: number;
	totalSpent: number;
	abilities: AbilitiesBlock;
	defenses: DefensesBlock;
	equipmentPool: EquipmentPool;
	combatState: CombatState;
	skills: Skill[];
	advantages: Advantage[];
	powers: Power[];
	devices: Device[];
	complications: Complication[];
	headquarters: Headquarters[];
}

export interface CreateCharacterRequest {
	name: string;
	powerLevel: number;
	description?: string;
	campaignId?: string;
}

export type CampaignRole = 'OWNER' | 'GM' | 'PLAYER' | 'SPECTATOR';

export interface CampaignMember {
	userId: string;
	displayName: string;
	role: CampaignRole;
}

export interface Campaign {
	id: string;
	name: string;
	gameSystem: string;
	ownerUserId: string;
	members: CampaignMember[];
	createdAt: string;
	updatedAt: string;
	// MUTANTS_AND_MASTERMINDS-specific fields (present when gameSystem === 'MUTANTS_AND_MASTERMINDS')
	powerLevel?: number;
	setting?: string;
}

export interface CreateCampaignPayload {
	name: string;
	gameSystem: 'MUTANTS_AND_MASTERMINDS';
	powerLevel: number;
	setting?: string;
}

export interface CampaignNpc {
	id: string;
	campaignId: string;
	name: string;
	statBlock: MinionStatBlock;
	createdAt: string;
	updatedAt: string;
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
				body: JSON.stringify({ email, password }),
			}),
		register: (username: string, email: string, password: string) =>
			request<LoginResponse>('/api/v1/auth/register', {
				method: 'POST',
				body: JSON.stringify({ username, email, password }),
			}),
		me: () => request<UserProfile>('/api/v1/auth/me'),
	},
	character: {
		create: (data: CreateCharacterRequest) =>
			request<MnmCharacter>('/api/v1/mnm/characters', {
				method: 'POST',
				body: JSON.stringify(data),
			}),
		get: (id: string) => request<MnmCharacter>(`/api/v1/mnm/characters/${id}`),
		getPublic: (id: string) => request<MnmCharacter>(`/api/v1/mnm/characters/${id}/share`),
		myCharacters: () => request<MnmCharacter[]>('/api/v1/mnm/characters'),
		byCampaign: async (campaignId: string): Promise<MnmCharacter[]> => {
			try {
				return await request<MnmCharacter[]>(`/api/v1/mnm/characters?campaignId=${encodeURIComponent(campaignId)}`);
			} catch {
				return [];
			}
		},
		update: (id: string, data: MnmCharacter) =>
			request<MnmCharacter>(`/api/v1/mnm/characters/${id}`, {
				method: 'PUT',
				body: JSON.stringify(data),
			}),
		delete: (id: string) =>
			request<void>(`/api/v1/mnm/characters/${id}`, { method: 'DELETE' }),
	},
	campaign: {
		create: (data: CreateCampaignPayload) =>
			request<Campaign>('/api/v1/campaigns', {
				method: 'POST',
				body: JSON.stringify(data),
			}),
		myCampaigns: async (): Promise<Campaign[]> => {
			const campaigns = await request<Campaign[]>('/api/v1/campaigns');
			return campaigns.filter((c) => c.gameSystem === 'MUTANTS_AND_MASTERMINDS');
		},
		get: (id: string) => request<Campaign>(`/api/v1/campaigns/${id}`),
		delete: (id: string) =>
			request<void>(`/api/v1/campaigns/${id}`, { method: 'DELETE' }),
		addMember: (id: string, member: CampaignMember) =>
			request<Campaign>(`/api/v1/campaigns/${id}/members`, {
				method: 'POST',
				body: JSON.stringify(member),
			}),
		removeMember: (id: string, userId: string) =>
			request<Campaign>(`/api/v1/campaigns/${id}/members/${userId}`, { method: 'DELETE' }),
	},
	npc: {
		list: (campaignId: string) => request<CampaignNpc[]>(`/api/v1/campaigns/${campaignId}/npcs`),
		create: (campaignId: string, data: { name: string; statBlock: MinionStatBlock }) =>
			request<CampaignNpc>(`/api/v1/campaigns/${campaignId}/npcs`, {
				method: 'POST',
				body: JSON.stringify(data),
			}),
		update: (campaignId: string, npcId: string, data: { name: string; statBlock: MinionStatBlock }) =>
			request<CampaignNpc>(`/api/v1/campaigns/${campaignId}/npcs/${npcId}`, {
				method: 'PUT',
				body: JSON.stringify(data),
			}),
		delete: (campaignId: string, npcId: string) =>
			request<void>(`/api/v1/campaigns/${campaignId}/npcs/${npcId}`, { method: 'DELETE' }),
	},
	users: {
		lookupByEmail: (email: string) =>
			request<UserLookupResult>(`/api/v1/users/lookup?email=${encodeURIComponent(email)}`, {}, true),
	},
};
