import type { ArsCharacter, Ability } from '../types/character';
import type { Covenant, LibraryInventory, CovenantLaboratories, CovenantVisInventory, CovenantMagicItemInventory } from '../types/covenant';
import type { Laboratory } from '../types/laboratory';

interface LaboratoriesDocument {
  id: string;
  characterId: string;
  covenantId?: string;
  laboratoryDetails: Laboratory;
}

const TOKEN_KEY = 'nexus_token';

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
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(path, { ...options, headers });
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
    create: (data: Partial<ArsCharacter>) =>
      request<ArsCharacter>('/api/v1/ars-magica/character/create', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    get: (id: string) =>
      request<ArsCharacter>(`/api/v1/ars-magica/character/get/${id}`),
    myCharacters: () =>
      request<ArsCharacter[]>('/api/v1/ars-magica/character/my-characters'),
    patch: (id: string, field: string, value: unknown) =>
      request<{ field: string; value: unknown }>(
        `/api/v1/ars-magica/character/${id}`,
        { method: 'PATCH', body: JSON.stringify({ field, value }) },
      ),
    abilities: {
      list: (id: string) =>
        request<Record<string, Ability>>(
          `/api/v1/ars-magica/character/${id}/abilities`,
        ),
      get: (id: string, name: string) =>
        request<Ability>(`/api/v1/ars-magica/character/${id}/abilities/${name}`),
      add: (id: string, name: string, ability: Ability) =>
        request<Ability>(`/api/v1/ars-magica/character/${id}/abilities`, {
          method: 'POST',
          body: JSON.stringify(ability),
        }),
      setXp: (id: string, name: string, xp: number) =>
        request<Ability>(`/api/v1/ars-magica/character/${id}/abilities/${name}/set-xp?xp=${xp}`, {
          method: 'PATCH',
        }),
      remove: (id: string, name: string) =>
        request<Ability>(`/api/v1/ars-magica/character/${id}/abilities/${name}`, {
          method: 'DELETE',
        }),
    },
    spells: {
      list: (id: string) =>
        request<Record<string, import('../types/character').Spell>>(
          `/api/v1/ars-magica/character/${id}/spells`,
        ),
    },
    visStore: {
      get: (id: string) =>
        request<{ id: string; characterId: string; visStore: import('../types/shared').RawVisStore }>(
          `/api/v1/ars-magica/character/${id}/vis-store`,
        ),
    },
    weapons: {
      list: (id: string) =>
        request<unknown[]>(`/api/v1/ars-magica/character/${id}/weapons`),
    },
    laboratory: {
      get: (id: string) =>
        request<LaboratoriesDocument>(`/api/v1/ars-magica/character/${id}/laboratory`),
      put: (id: string, labDetails: Laboratory, covenantId?: string) => {
        const params = covenantId ? `?covenantId=${covenantId}` : '';
        return request<LaboratoriesDocument>(
          `/api/v1/ars-magica/character/${id}/laboratory${params}`,
          { method: 'PUT', body: JSON.stringify(labDetails) },
        );
      },
      delete: (id: string) =>
        request<void>(`/api/v1/ars-magica/character/${id}/laboratory`, { method: 'DELETE' }),
    },
  },

  covenant: {
    create: (name: string, tribunal: string) =>
      request<Covenant>('/api/v1/covenants', {
        method: 'POST',
        body: JSON.stringify({ name, tribunal }),
      }),
    get: (id: string) =>
      request<Covenant>(`/api/v1/covenants/${id}`),
    library: {
      get: (id: string) =>
        request<LibraryInventory>(`/api/v1/covenants/${id}/library`),
    },
    magicItems: {
      get: (id: string) =>
        request<CovenantMagicItemInventory>(`/api/v1/covenants/${id}/magic-items`),
    },
    laboratories: {
      get: (id: string) =>
        request<CovenantLaboratories>(`/api/v1/covenants/${id}/laboratories`),
    },
    vis: {
      get: (id: string) =>
        request<CovenantVisInventory>(`/api/v1/covenants/${id}/vis`),
    },
  },
};
