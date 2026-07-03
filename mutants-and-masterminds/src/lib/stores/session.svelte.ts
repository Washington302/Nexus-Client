import { goto } from '$app/navigation';
import { api, setToken, clearToken } from '$lib/services/api';
import { getCookie, setCookie, removeCookie } from '$lib/services/cookies';
import type { MnmCharacter, UserProfile } from '$lib/services/api';

export const session = $state({
	activeCharacter: null as MnmCharacter | null,
	activeCharacterId: null as string | null,
	characters: [] as MnmCharacter[],
	userId: null as string | null,
	username: null as string | null,
	email: null as string | null,
	loading: false,
	error: null as string | null,
});

export async function loadSession() {
	session.loading = true;
	session.error = null;
	try {
		const user: UserProfile = await api.auth.me();
		session.userId = user.id;
		session.username = user.username;
		session.email = user.email;
	} catch {
		session.userId = null;
		session.username = null;
		session.email = null;
		clearToken();
	} finally {
		session.loading = false;
	}
}

export async function loadActiveCharacter() {
	session.loading = true;
	session.error = null;
	try {
		const list = await api.character.myCharacters();
		session.characters = list;
		const savedId = getCookie('characterId');
		const active = list.find((c) => c.id === savedId) ?? list[0] ?? null;
		session.activeCharacter = active;
		session.activeCharacterId = active?.id ?? null;
		syncCookies();
	} catch (e) {
		session.error = (e as Error).message;
	} finally {
		session.loading = false;
	}
}

export async function setActiveCharacterById(id: string) {
	session.activeCharacterId = id;
	setCookie('characterId', id);
	try {
		session.activeCharacter = await api.character.get(id);
		syncCookies();
	} catch {
		session.activeCharacter = null;
	}
}

function syncCookies() {
	if (session.activeCharacterId) {
		setCookie('characterId', session.activeCharacterId);
	}
}

export async function login(email: string, password: string) {
	session.loading = true;
	session.error = null;
	try {
		const res = await api.auth.login(email, password);
		if (!res.token) throw new Error(res.error ?? 'Login failed');
		setToken(res.token);
		await loadSession();
		await loadActiveCharacter();
	} catch (e) {
		session.error = (e as Error).message;
		clearToken();
		throw e;
	} finally {
		session.loading = false;
	}
}

export async function register(username: string, email: string, password: string) {
	session.loading = true;
	session.error = null;
	try {
		const res = await api.auth.register(username, email, password);
		if (!res.token) throw new Error(res.error ?? 'Registration failed');
		setToken(res.token);
		await loadSession();
		await loadActiveCharacter();
	} catch (e) {
		session.error = (e as Error).message;
		clearToken();
		throw e;
	} finally {
		session.loading = false;
	}
}

export async function logout() {
	clearToken();
	removeCookie('characterId');
	session.activeCharacter = null;
	session.activeCharacterId = null;
	session.userId = null;
	session.username = null;
	session.email = null;
	await goto('/');
}
