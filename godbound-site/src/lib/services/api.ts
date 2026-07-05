const TOKEN_KEY = 'gb_token';
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

export interface AttributeScore {
	score: number;
	mod: number;
	check: number;
}

export interface Attributes {
	strength: AttributeScore;
	dexterity: AttributeScore;
	constitution: AttributeScore;
	wisdom: AttributeScore;
	intelligence: AttributeScore;
	charisma: AttributeScore;
}

export interface SavingThrow {
	base: number;
	mod: number;
	save: number;
}

export interface SavingThrows {
	hardiness: SavingThrow;
	evasion: SavingThrow;
	spirit: SavingThrow;
}

export interface Facts {
	origin: string;
	pastCareer: string;
	relationship: string;
}

export interface Fact {
	id: string;
	description: string;
}

export interface Weapon {
	description: string;
	attr?: string;
	atk?: string;
	dmg?: string;
}

export interface SavingThrowPenalties {
	hardiness: boolean;
	evasion: boolean;
	spirit: boolean;
}

export interface Armor {
	type: string;
	armorClass: number;
	shield: boolean;
	savingThrowPenalties: SavingThrowPenalties;
}

export interface FrayDieEntry {
	roll: string;
	dmg: number;
}

export interface HitPoints {
	current: number;
	max: number;
}

export interface ResourcePool {
	total: number;
	free: number;
}

export interface Resources {
	effort: ResourcePool;
	influence: ResourcePool;
	dominion: ResourcePool;
	wealth: ResourcePool;
}

export interface Gift {
	id: string;
	name: string;
	word?: string;
	tier: 'Lesser' | 'Greater';
	type: 'Action' | '(Smite)Action' | 'Constant' | 'On Turn' | 'Instant' | '(Smite)Instant';
	effort: 'None' | 'Scene' | 'Day' | 'Committed';
	description?: string;
	active: boolean;
}

export interface Word {
	name: string;
	icon?: string;
	description?: string;
	associatedGifts: number;
	activeGifts: number;
	gifts: Gift[];
	committedEffort: boolean;
}

export interface InfluenceProject {
	id: string;
	name: string;
	description?: string;
	tags: string[];
	cost: number;
}

export interface RealmChange {
	id: string;
	name: string;
	description?: string;
	scale: 'Point' | 'Village' | 'City' | 'Nation' | 'World';
	complexity: 'Simple' | 'Plausible' | 'Difficult' | 'Improbable' | 'Impossible';
	cost: number;
	status: 'draft' | 'ongoing' | 'complete';
	spent?: number;
}

export interface NPC {
	id: string;
	name: string;
	role?: string;
	sessionId?: string;
	avatar?: string;
}

export interface Spoils {
	wealth: number;
	dominion: number;
	items: string[];
}

export interface Session {
	id: string;
	number: number;
	title: string;
	realDate?: string;
	timeAgo?: string;
	current: boolean;
	era?: string;
	location?: string;
	npcs: NPC[];
	spoils: Spoils;
	summary?: string;
	postscripts: string[];
	completedGoals: string[];
}

export interface DivineGoal {
	id: string;
	description: string;
	difficulty?: string;
	dominionGoal?: number;
	complete: boolean;
	completedInSession?: string;
}

export interface GodboundCharacter {
	id: string;
	userId: string;
	campaignId?: string;
	name: string;
	player?: string;
	description?: string;
	portraitUrl?: string;
	isPublic?: boolean;
	gameSystem: string;
	goal: string;
	level: number;
	experience: number;
	attributes: Attributes;
	savingThrows: SavingThrows;
	facts: Facts;
	additionalFacts: Fact[];
	weapons: Weapon[];
	armor: Armor;
	frayDie: string;
	frayDieTable: FrayDieEntry[];
	hp: HitPoints;
	resources: Resources;
	earnedPerMonth: string;
	words: Word[];
	influenceProjects: InfluenceProject[];
	realmChanges: RealmChange[];
	sessions: Session[];
	divineGoals: DivineGoal[];
}

export interface CreateCharacterRequest {
	name: string;
	campaignId?: string;
}

export type CampaignRole = 'OWNER' | 'STORYTELLER' | 'PLAYER' | 'SPECTATOR';

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
	// GodboundSaga-specific field
	setting?: string;
}

export interface CreateCampaignPayload {
	name: string;
	gameSystem: 'GODBOUND';
	setting?: string;
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
			request<GodboundCharacter>('/api/v1/godbound/characters', {
				method: 'POST',
				body: JSON.stringify(data),
			}),
		get: (id: string) => request<GodboundCharacter>(`/api/v1/godbound/characters/${id}`),
		getPublic: (id: string) => request<GodboundCharacter>(`/api/v1/godbound/characters/${id}/share`),
		myCharacters: async (): Promise<GodboundCharacter[]> => {
			const characters = await request<GodboundCharacter[]>('/api/v1/godbound/characters');
			return characters.filter((c) => c.gameSystem === 'GODBOUND');
		},
		byCampaign: async (campaignId: string): Promise<GodboundCharacter[]> => {
			try {
				const characters = await request<GodboundCharacter[]>(`/api/v1/godbound/characters?campaignId=${encodeURIComponent(campaignId)}`);
				return characters.filter((c) => c.gameSystem === 'GODBOUND');
			} catch {
				return [];
			}
		},
		update: (id: string, data: GodboundCharacter) =>
			request<GodboundCharacter>(`/api/v1/godbound/characters/${id}`, {
				method: 'PUT',
				body: JSON.stringify(data),
			}),
		delete: (id: string) =>
			request<void>(`/api/v1/godbound/characters/${id}`, { method: 'DELETE' }),
	},
	campaign: {
		create: (data: CreateCampaignPayload) =>
			request<Campaign>('/api/v1/campaigns', {
				method: 'POST',
				body: JSON.stringify(data),
			}),
		myCampaigns: async (): Promise<Campaign[]> => {
			const campaigns = await request<Campaign[]>('/api/v1/campaigns');
			return campaigns.filter((c) => c.gameSystem === 'GODBOUND');
		},
		get: (id: string) => request<Campaign>(`/api/v1/campaigns/${id}`),
		delete: (id: string) =>
			request<void>(`/api/v1/campaigns/${id}`, { method: 'DELETE' }),
		join: (id: string) =>
			request<Campaign>(`/api/v1/campaigns/${id}/join`, { method: 'POST' }),
		addMember: (id: string, member: CampaignMember) =>
			request<Campaign>(`/api/v1/campaigns/${id}/members`, {
				method: 'POST',
				body: JSON.stringify(member),
			}),
		removeMember: (id: string, userId: string) =>
			request<Campaign>(`/api/v1/campaigns/${id}/members/${userId}`, { method: 'DELETE' }),
	},
	users: {
		lookupByEmail: (email: string) =>
			request<UserLookupResult>(`/api/v1/users/lookup?email=${encodeURIComponent(email)}`, {}, true),
	},
};
