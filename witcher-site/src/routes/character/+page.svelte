<script lang="ts">
	import { session } from '$lib/stores/session.svelte';
	import { api } from '$lib/services/api';
	import type { WitcherCharacter } from '$lib/services/api';
	import { ensureDefaults } from '$lib/utils/character';
	import StatsSheet from '$lib/components/StatsSheet.svelte';
	import SaveBar from '$lib/components/SaveBar.svelte';

	let draft = $state<WitcherCharacter>(null!);
	let saving = $state(false);
	let saveError = $state<string | null>(null);
	let saveSuccess = $state(false);
	let autosaveDirty = $state(false);
	let originalSnapshot = $state<string | null>(null);
	let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
	let shareCopied = $state(false);

	function shareCharacter() {
		if (!draft || !draft.public) return;
		const url = `${window.location.origin}/share/${draft.id}`;
		navigator.clipboard
			.writeText(url)
			.then(() => {
				shareCopied = true;
				setTimeout(() => (shareCopied = false), 2000);
			})
			.catch((e) => {
				saveError = `Couldn't copy the link: ${(e as Error).message}`;
			});
	}

	function scheduleAutosave() {
		if (autosaveTimer) clearTimeout(autosaveTimer);
		autosaveDirty = true;
		autosaveTimer = setTimeout(() => {
			if (!draft) return;
			if (saving) {
				// A manual save is in flight; try again shortly instead of dropping the autosave.
				scheduleAutosave();
				return;
			}
			saveCharacter();
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
		// Only rebuild the draft when switching to a different character. Without the id
		// guard, the post-save Object.assign into session.activeCharacter re-triggers this
		// effect and wipes any edits made while the save was in flight.
		if (!c || c.id === draft?.id) return;
		const d = JSON.parse(JSON.stringify(c));
		ensureDefaults(d);
		draft = d;
		originalSnapshot = JSON.stringify(d);
		autosaveDirty = false;
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
			const updated = await api.character.update(draft.id, draft);
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
	<StatsSheet {draft} />

	<div class="page">
		<SaveBar
			{saving}
			{saveError}
			{saveSuccess}
			{autosaveDirty}
			{shareCopied}
			shareEnabled={draft.public}
			onSave={saveCharacter}
			onShare={shareCharacter}
		/>
	</div>
{/if}
