<script lang="ts">
	import { session } from '$lib/stores/session.svelte';
	import { api } from '$lib/services/api';
	import type { MythrasCharacter } from '$lib/services/api';
	import { ensureDefaults, recomputeDerivedAttributes, prepareCharacterPayloadForSave } from '$lib/utils/character';
	import CharacterSheet from '$lib/components/CharacterSheet.svelte';
	import SaveBar from '$lib/components/SaveBar.svelte';

	let draft = $state<MythrasCharacter>(null!);
	let saving = $state(false);
	let saveError = $state<string | null>(null);
	let saveSuccess = $state(false);
	let autosaveDirty = $state(false);
	let originalSnapshot = $state<string | null>(null);
	let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
	let shareCopied = $state(false);

	function shareCharacter() {
		if (!draft) return;
		const url = `${window.location.origin}/share/${draft.id}`;
		navigator.clipboard.writeText(url).then(() => {
			shareCopied = true;
			setTimeout(() => (shareCopied = false), 2000);
		});
	}

	function scheduleAutosave() {
		if (autosaveTimer) clearTimeout(autosaveTimer);
		autosaveDirty = true;
		autosaveTimer = setTimeout(() => {
			if (draft && !saving) saveCharacter();
		}, 15000);
	}

	function cancelAutosave() {
		if (autosaveTimer) {
			clearTimeout(autosaveTimer);
			autosaveTimer = null;
		}
		autosaveDirty = false;
	}

	$effect(() => {
		const c = session.activeCharacter;
		if (c) {
			const d = JSON.parse(JSON.stringify(c));
			ensureDefaults(d);
			recomputeDerivedAttributes(d);
			draft = d;
			originalSnapshot = JSON.stringify(d);
			autosaveDirty = false;
		}
	});

	$effect(() => {
		if (!draft) return;
		recomputeDerivedAttributes(draft);
	});

	$effect(() => {
		if (!draft || originalSnapshot === null) return;
		const current = JSON.stringify(draft);
		if (current !== originalSnapshot) {
			scheduleAutosave();
		}
	});

	async function saveCharacter() {
		if (!draft) return;
		saving = true;
		saveError = null;
		saveSuccess = false;
		try {
			const payload = prepareCharacterPayloadForSave(draft);
			const updated = await api.character.update(draft.id, payload);
			if (session.activeCharacter) {
				Object.assign(session.activeCharacter, updated);
			}
			originalSnapshot = JSON.stringify(draft);
			cancelAutosave();
			saveSuccess = true;
			setTimeout(() => (saveSuccess = false), 2000);
		} catch (e) {
			saveError = (e as Error).message;
		} finally {
			saving = false;
		}
	}
</script>

{#if !session.userId}
	<div class="page">
		<div class="prompt-card">
			<p><a href="/auth/login">Sign in</a> to view your characters.</p>
		</div>
	</div>
{:else if !draft}
	<div class="page">
		<div class="prompt-card">
			<p>No active character. <a href="/characters">Choose or create one</a>.</p>
		</div>
	</div>
{:else}
	<div class="page">
		<CharacterSheet {draft} />

		<SaveBar
			{saving}
			{saveError}
			{saveSuccess}
			{autosaveDirty}
			{shareCopied}
			onSave={saveCharacter}
			onShare={shareCharacter}
		/>
	</div>
{/if}
