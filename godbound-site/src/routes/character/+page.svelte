<script lang="ts">
	import { session } from '$lib/stores/session.svelte';
	import { api } from '$lib/services/api';
	import type { GodboundCharacter } from '$lib/services/api';
	import { normalizeCharacterFromApi } from '$lib/utils/character';
	import SaveBar from '$lib/components/SaveBar.svelte';
	import CharacterSheet from '$lib/components/CharacterSheet.svelte';

	let draft = $state<GodboundCharacter | null>(null);
	let saving = $state(false);
	let saveError = $state<string | null>(null);
	let saveSuccess = $state(false);

	$effect(() => {
		// Guard on id (not just truthiness) so switching the active character on /characters
		// and coming back actually refreshes this page instead of showing the old draft —
		// SvelteKit reuses this component instance since the route itself doesn't change.
		if (session.activeCharacter && session.activeCharacter.id !== draft?.id) {
			draft = normalizeCharacterFromApi(session.activeCharacter);
		}
	});

	async function handleSave() {
		if (!draft) return;
		saving = true;
		saveError = null;
		saveSuccess = false;
		try {
			const updated = await api.character.update(draft.id, draft);
			draft = normalizeCharacterFromApi(updated);
			session.activeCharacter = updated;
			const idx = session.characters.findIndex((c) => c.id === updated.id);
			if (idx >= 0) session.characters[idx] = updated;
			saveSuccess = true;
			setTimeout(() => (saveSuccess = false), 2000);
		} catch (e) {
			saveError = (e as Error).message;
		} finally {
			saving = false;
		}
	}
</script>

<div class="page">
	{#if !session.userId}
		<div class="prompt-card"><p><a href="/auth/login">Sign in</a> to view your character.</p></div>
	{:else if !draft}
		<div class="prompt-card">
			<p>No active character. <a href="/characters">Create or select one</a>.</p>
		</div>
	{:else}
		<div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
			<SaveBar {saving} {saveError} {saveSuccess} onSave={handleSave} />
			<a href="/character/print" target="_blank" rel="noopener" class="gb-btn secondary">Export PDF</a>
		</div>

		<CharacterSheet {draft} editable={true} />
	{/if}
</div>
