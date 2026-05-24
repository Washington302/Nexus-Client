// session.svelte.ts

import type { Character } from '../types/character.old';

export const session = $state({
  activeCharacter: null as Character | null,
  activeCharacterId: null as string | null,
  userId: null as string | null,
  displayName: null as string | null,
  role: null as 'OWNER' | 'STORYTELLER' | 'PLAYER' | 'SPECTATOR' | null,
  sagaId: null as string | null,
  loading: false,
  error: null as string | null,
});

export async function loadSession() {
  session.loading = true;
  session.error = null;
  try {
    const res = await fetch('/api/me');
    if (!res.ok) throw new Error('Not authenticated');
    const data = await res.json();
    session.userId = data.userId;
    session.displayName = data.displayName;
    session.role = data.role;
    session.sagaId = data.sagaId;
    await loadActiveCharacter();
  } catch (e) {
    session.error = (e as Error).message;
  } finally {
    session.loading = false;
  }
}

export async function loadActiveCharacter() {
  session.loading = true;
  session.error = null;
  try {
    const res = await fetch('/api/me/character');
    if (!res.ok) throw new Error('Failed to load character');
    session.activeCharacter = await res.json();
    session.activeCharacterId = session.activeCharacter?.id ?? null;
  } catch (e) {
    session.error = (e as Error).message;
  } finally {
    session.loading = false;
  }
}

export async function setActiveCharacter(characterId: string) {
  session.loading = true;
  session.error = null;
  try {
    const res = await fetch('/api/me/active-character', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterId })
    });
    if (!res.ok) throw new Error('Failed to set active character');
    await loadActiveCharacter();
  } catch (e) {
    session.error = (e as Error).message;
  } finally {
    session.loading = false;
  }
}

export async function login(username: string, password: string) {
  session.loading = true;
  session.error = null;
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    session.userId = data.userId;
    session.displayName = data.displayName;
    session.role = data.role;
    session.sagaId = data.sagaId;
  } catch (e) {
    session.error = (e as Error).message;
  } finally {
    session.loading = false;
  }
}

export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  session.activeCharacter = null;
  session.activeCharacterId = null;
  session.userId = null;
  session.displayName = null;
  session.role = null;
  session.sagaId = null;
}