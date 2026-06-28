import { browser } from '$app/environment';
import { loadSession, loadActiveCharacter } from '$lib/stores/session.svelte';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
	if (browser) {
		await loadSession();
		await loadActiveCharacter();
	}
};
